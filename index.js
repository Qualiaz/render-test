require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

// CUSTOM MIDDLEWARES
const requestLogger = (req, res, next) => {
	console.log('Method:', req.method)
	console.log('Path:', req.path)
	console.log('Body:', req.body)
	console.log('---')
	next()
}

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}

	if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}
	next(error)
}

// RUN MIDDLEWARES
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(morgan('dev'))


app.post('/api/persons', (req, res, next) => {
	const body = req.body

	const person = new Person({
		name: body.name,
		number: body.number,
	})

	person
		.save()
		.then((savedPerson) => {
			res.json(savedPerson)
		})
		.catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
	const { name, number } = req.body
	const updatedPerson = {
		name,
		number,
	}
	Person.findByIdAndUpdate(req.params.id, updatedPerson, {
		new: true,
		runValidators: true,
		context: 'query',
	})
		.then((result) => res.json(result))
		.catch((error) => next(error))
})

app.get('/info', (req, res, next) => {
	Person.find({})
		.then((people) => {
			res.send(`<p>The phonebook has info for ${people.length} people</p>
    <p>${new Date()}</p>`)
		})
		.catch((error) => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then((person) => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).end()
			}
		})
		.catch((error) => next(error))
})

app.get('/api/persons', (req, res) => {
	Person.find({}).then((people) => {
		res.json(people)
	})
})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).end()
		})
		.catch((error) => next(error))
})

// invoke after routes so it only works if is no valid request
app.use(unknownEndpoint)
app.use(errorHandler)
//
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
