const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log(`connection to ${url}`)

mongoose
	.connect(url)
	.then(() => {
		console.log('connect to db')
	})
	.catch((error) => {
		`error connecting to db: ${error.message}`
	})

mongoose.connect(url)

const numberValidateValidator = (number) => {
	if (number.includes('-')) {
		const [first] = number.split('-')
		return first.length === 2 || first.length === 3
	}
	// only  "-" and numbers
	return /^(\d|-)+$/.test(number)
}

const numberValidateMessage = (props) => {
	if (props.value.includes('-')) {
		return `${props.value} the first part must contain only 2 or 3 figures`
	}
	if (!/^(\d|-)+$/.test(props.value)) {
		return `${props.value} contains invalid figures. Only use numbers and "-"`
	}
}

const personSchema = new mongoose.Schema({
	name: { type: String, minLength: 2, required: true },
	number: {
		type: String,
		minLength: 8,
		required: [true, 'Person phone number required'],
		validate: {
			validator: (n) => numberValidateValidator(n),
			message: (props) => numberValidateMessage(props),
		},
	},
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	},
})

module.exports = mongoose.model('Person', personSchema, 'people')
