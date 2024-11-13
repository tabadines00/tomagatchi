export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

interface Toma {
	tomaId: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface Event {
    eventId: number;
    ownerId: number;
    eventType: string;
    eventValue: number;
    eventRate: number;
    updatedAt: string;
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { stream, streamSSE } from 'hono/streaming'
import { html, raw } from 'hono/html'


const app = new Hono<{ Bindings: Env }>();

app.use('*', cors(
    {
        origin: '*',
        allowMethods: ['GET'],
        allowHeaders: ['Content-Type'],
    }
))

app.get('/', (c) => c.html(
html`<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>SSE Example</title>
</head>

<body>
    <h1>SSE Example</h1>
    <ul id="sse-data"></ul>

    <script>
        const baseURL = "http://localhost:8787";
        const sseData = document.getElementById('sse-data');
		console.log("init")

        const eventSource = new EventSource("/sse/stream", { withCredentials: true });

        eventSource.addEventListener("int-update", (event) => {
			console.log("added another line", event)
			const data = JSON.parse(event.data);
  			console.log('Updated integer:', data.value);
            //sseData.innerHTML += event.data + '<br>';

			const newElement = document.createElement("li");

			newElement.textContent = "" +data.name+ " has hunger: "+data.hunger+" and ID is "+event.lastEventId;
			sseData.appendChild(newElement);
		});

        eventSource.addEventListener("close", (event) => {
            console.log('Received "close" event. Closing connection...');
            eventSource.close();
        });

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
        };
    </script>
</body>

</html>	`))

app.use('/sse/*', async (c, next) => {
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');
    await next();
});

let id = 0

app.get('/sse/:toma', async (c) => {
  	return streamSSE(c, async (stream) => {
	
	console.log("Opening Stream")
	// const { toma } = c.req.param()
	// const { results } = await c.env.DB.prepare(
	// 	"SELECT * FROM Tomas WHERE tomaName = ?",
	// ).bind(toma).all();

	// const data: Toma = results[0] as unknown as Toma

	// const events = await c.env.DB.prepare(
	// 	"SELECT * FROM Events WHERE ownerId = ?",
	// ).bind(data.tomaId).all().then((r)=>r.results)

	let data = {name: "Tom", hunger: 10}

		while (true) {
			if (c.req.raw.signal.aborted) {
				console.log('Aborted')
				break
			}
			data.hunger -= 1
			await stream.writeSSE({
				data: JSON.stringify(data),
				event: 'int-update',
				id: String(id++),
			})
			console.log("Wrote to stream!", id)
			await stream.sleep(1000)
		}
	// console.log("closing stream!")
	// await stream.writeSSE({data: "", event:"close"})
	// await stream.close()
	// id = 0
	},
	async (err, stream) => {
		stream.writeln('An error occurred!')
		console.error(err)
	}
)
	// const stream = c.res.writeableStream();
    // const writer = stream.getWriter();


    // async function sendMessage() {
	// 	console.log("Opening stream")
    //     while (id < 10) {
    //         const message = `It is ${new Date().toISOString()}`;
    //         const data = `id: ${id}\nevent: time-update\ndata: ${message}\n\n`;
    //         writer.write(new TextEncoder().encode(data));
    //         id++;
	// 		console.log("wrote to stream!")
    //         await new Promise((resolve) => setTimeout(resolve, 1000));
    //     }
    //     writer.close();
	// 	console.log("closed stream")
    //     id = 0;
    // }

    // sendMessage().catch((error) => console.error(error));
    // return c.newResponse(stream);
})

export default app;
  
//   export default {
// 	async fetch(request, env): Promise<Response> {
// 	  const { pathname } = new URL(request.url);
  
// 	  if (pathname === "/api/beverages") {
// 		// If you did not use `DB` as your binding name, change it here
// 		const { results } = await env.DB.prepare(
// 		  "SELECT * FROM Customers WHERE CompanyName = ?",
// 		)
// 		  .bind("Bs Beverages")
// 		  .all();
// 		return Response.json(results);
// 	  }
  
// 	  return new Response(
// 		"Call /api/beverages to see everyone who works at Bs Beverages",
// 	  );
// 	},
//   } satisfies ExportedHandler<Env>;