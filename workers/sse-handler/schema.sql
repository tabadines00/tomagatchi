DROP TABLE IF EXISTS Customers;

CREATE TABLE IF NOT EXISTS Tomas (
    tomaId INTEGER PRIMARY KEY,
    tomaName TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT current_timestamp
    updatedAt TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS Events (
    eventId INTEGER PRIMARY KEY,
    ownerId INTEGER NOT NULL,
    eventType TEXT NOT NULL,
    eventValue INTEGER NOT NULL,
    eventRate INTEGER NOT NULL,
    updatedAt TIMESTAMP NOT NULL DEFAULT current_timestamp
);

INSERT INTO Tomas (tomaId, tomaName) VALUES (NULL, "Thomas");

