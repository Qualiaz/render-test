const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

//middleware -> function that can be used for handling request and response objects
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("build"));

const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", req.body);
  console.log("---");
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(requestLogger);

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

const generateId = () => {
  return Math.floor(Math.random() * (10000 - 1) + 1);
};

app.get("/", (req, res) => {
  console.log("HELLO");
  res.send("<h1>Hello</h1>");
});

app.get("/info", (req, res) => {
  res.send(`
        <p>The phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    `);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.get("/api/persons", (req, res) => {
  console.log("got persons");
  res.json(persons);
});

app.delete("/api/persons/:id", (request, res) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  console.log(persons);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  console.log(body.content);

  const isExistingPerson = persons.find((person) => person.name === body.name);
  console.log(isExistingPerson);

  if (isExistingPerson) {
    return res.status(400).json({ error: "name already exists" });
  }
  if (!body.number) {
    return res.status(400).json({ error: "number missing" });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  const newPersons = persons.concat(person);
  console.log(newPersons);
  res.json(newPersons);
});

//
// delclare after routes so it doesn't use them
app.use(unknownEndpoint);
//
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
