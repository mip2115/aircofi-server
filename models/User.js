const mongoose = require('mongoose');
const types = require('../types/types');
const Match = require('./Match');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	age: {
		type: Number
	},
	shortBio: {
		type: String
	},
	hobbies: {
		type: String,
		default: `[]`
	},
	dateCreated: {
		type: Date,
		default: Date.now()
	},
	// maybe use this for social media? make this
	// easier to gain trust
	university: {
		type: String
	},
	work: {
		type: String
	},
	profilePicture: {
		type: String
	},
	visible: {
		type: Boolean,
		default: false
	},
	verified: {
		type: Boolean,
		default: false
	},
	pastBookings: {
		type: String,
		default: `[]`
	},
	pendingBookings: {
		type: String,
		default: `[]`
	},
	rating: {
		type: Number,
		defalt: 5
	},
	blockedUsers: {
		type: String,
		default: `[]`
	},
	bookingRequests: {
		type: String,

		default: `[]`
	},
	communications: {
		type: String,
		default: `[]`
	}
});

module.exports = User = mongoose.model('users', UserSchema);
