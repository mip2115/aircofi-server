const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
	dateCreated: {
		type: Date,
		default: Date.now()
	},
	ownerID: {
		type: String,
		required: true
	},
	chats: {
		type: String,
		default: `[]`
	},
	pictures: {
		type: String,
		default: `[]`
	},
	longitude: {
		type: String
	},
	latitude: {
		type: String
	},
	zipcode: {
		type: String
	},
	keywords: {
		type: String,
		default: `[]`
	},
	amenities: {
		type: String,
		default: `[]`
	},
	maxPeople: {
		type: Number
	},
	curPeople: {
		type: Number,
		default: 0
	},
	bookings: {
		type: String,
		default: `[]`
	}
});

module.exports = Location = mongoose.model('matches', LocationSchema);
