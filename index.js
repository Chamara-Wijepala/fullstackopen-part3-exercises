require('dotenv').config();
const express = require('express');

const app = express();
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

app.use(express.json());
app.use(express.static('build'));
app.use(cors());

morgan.token('body', (request) => JSON.stringify(request.body));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

app.get('/api/persons', (request, response) => {
  Person.find({}).then((results) => {
    response.json(results);
  });
});

app.get('/info', (request, response) => {
  Person.find({}).then((results) => {
    const entries = `<p>Phonebook has info for ${results.length} people <p/>`;
    const date = `<p>${new Date()}<p/>`;

    response.send(entries + date);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'missing name or number' });
  }

  const newPerson = Person({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  const person = {
    name,
    number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: 'true',
    runValidators: 'true',
    context: 'query',
  })
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
