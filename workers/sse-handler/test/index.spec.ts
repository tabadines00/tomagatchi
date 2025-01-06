// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// Updated tests to reflect the API in src/index.ts
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('SSE Worker', () => {
	it('responds with SSE data (unit style)', async () => {
		const request = new IncomingRequest('http://localhost:8787/sse/Tom');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.headers.get('Content-Type')).toBe('text/event-stream');
		expect(response.status).toBe(200);
	});

	it('handles SSE stream correctly (integration style)', async () => {
		const response = await SELF.fetch('http://localhost:8787/sse/Tom');
		expect(response.headers.get('Content-Type')).toBe('text/event-stream');
		expect(response.status).toBe(200);

		if (response.body) {
			const reader = response.body.getReader();
			expect(reader).toBeDefined(); // Optionally ensure reader is defined before proceeding
			const { done, value } = await reader.read();
			const data = new TextDecoder().decode(value);
			expect(data).toContain('Tom');
		}
	});
});
