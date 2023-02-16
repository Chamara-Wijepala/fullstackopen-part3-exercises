const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

morgan.token("body", (request, response) => JSON.stringify(request.body));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => Math.floor(Math.random() * 999999);

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const entries = `<p>Phonebook has info for ${persons.length} people <p/>`;
  const date = `<p>${new Date()}<p/>`;

  response.send(entries + date);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  person ? response.json(person) : response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "missing name or number" });
  }

  const duplicatePerson = persons.find((person) => person.name === body.name);

  if (duplicatePerson) {
    return response.status(409).json({ error: "name must be unique" });
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
