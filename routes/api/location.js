// this should be the API to handle all searches

const express = require('express');
const { checkIfValidUser } = require('../../validate/active');
const { matchServices } = require('../../services/chatMessage');
const errors = require('../../errors/errors');
const User = require('../../models/User');
const Location = require('../../models/Location');
const tokenAuthorizer = require('../../middleware/auth');
const _ = require('lodash');
const axios = require('axios');
const { Validator } = require('node-input-validator');

const router = express.Router();

router.get('/test', tokenAuthorizer, async (req, res) => {
	res.json('SUCCESS');
});

router.get('/getLocations', tokenAuthorizer, async (req, res) => {
	const userID = req.id;

	try {
		await checkIfValidUser(userID);

		const locations = [];
		// make a call to the DB to get all locations that match
		// prefs and send back to user.

		res.json({ msg: locations, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

function sortAscending(a, b) {
	return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
}

// dates is an object.
router.post('/requestBooking', tokenAuthorizer, async (req, res) => {
	const { locationID, dates } = req.body;
	const userID = req.id;

	try {
		const dateStart = dates.start;
		const dateEnd = dates.end;

		const v = new Validator(req.body, {
			locationID: 'string',
			dateStart: 'date',
			dateEnd: 'date'
		});
		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		// sort all the dates in ascending order
		// get all bookings of the location
		const location = await Location.findOne({ _id: locationID });
		const bookings = JSON.parse(location.bookings);
		bookings.sort(sortAscending);

		for (booking of bookings) {
			if (booking.dateStart > dateStart && bookingdateEnd < dateEnd) throw new Error("Can't book these dates");
			if (booking.dateStart < dateStart && booking.dateStart < dateEnd) throw new Error("Can't book these dates");
		}

		const user = await User.findOne({ _id: userID });
		const pastBookings = JSON.parse(user.pendingBookings);

		const alreadyBooked = _.includes(pendingBookings, locationID);
		if (alreadyBooked) throw new Error('Already requested this location');
		pendingBookings.push(locationID);
		user.pendingBookings = JSON.stringify(pendingBookings);

		// call API route to let user know that th

		await user.save();
		res.json({ msg: { user: user }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

// sending request to owning ID of location
router.post('/sendBookingRequest', tokenAuthorizer, async (req, res) => {
	const { locationID } = req.body;
	const ownerID = req.id;

	try {
		const v = new Validator(req.body, {
			locationID: 'string'
		});
		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		const owner = await User.findOne({ _id: ownerID });
		const bookingRequests = JSON.parse(owner.bookingRequests);

		const alreadyBooked = _.includes(bookingRequests, locationID);
		if (alreadyBooked) throw new Error('Already requested this location');
		bookingRequests.push(locationID);
		owner.bookingRequests = JSON.stringify(bookingRequests);

		// have frontend check contiously for new requests
		// start a cron job to keep track of time
		// send email to host.

		await owner.save();
		res.json({ msg: { user: owner }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

router.post('/denyBookingRequest', tokenAuthorizer, async (req, res) => {
	const { locationID } = req.body;
	const ownerID = req.id;

	try {
		const v = new Validator(req.body, {
			locationID: 'string'
		});
		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		const owner = await User.findOne({ _id: ownerID });
		const bookingRequests = JSON.parse(owner.bookingRequests);

		const alreadyBooked = _.includes(bookingRequests, locationID);
		if (alreadyBooked) throw new Error('This location is not here');
		bookingRequests.splice(locationID, 1);
		owner.bookingRequests = JSON.stringify(bookingRequests);

		// have frontend check contiously for new deletions
		// start a cron job to keep track of time
		// send email to host.

		await owner.save();
		res.json({ msg: { user: owner }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

router.post('/acceptBookingRequest', tokenAuthorizer, async (req, res) => {
	const { locationID, bookingReqInfo } = req.body;
	const ownerID = req.id;

	try {
		const v = new Validator(req.body, {
			locationID: 'string',
			bookingReqInfo: 'string'
		});
		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		const owner = await User.findOne({ _id: ownerID });
		const bookings = JSON.parse(owner.bookings);

		bookings.push(bookingReqInfo);
		owner.bookings = JSON.stringify(bookings);

		await owner.save();
		res.json({ msg: { user: owner }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

// TODO - implement;
function getZipcode(long, lat) {
	return '';
}

router.post('/createLocation', async (req, res) => {
	const { userID, pictures, long, lat, keywords, amenities, maxPeople } = req.body;

	try {
		const v = new Validator(req.body, {
			userID: 'string',
			pictures: 'string',
			long: 'string',
			lat: 'string',
			keywords: 'string',
			amenities: 'string',
			maxPeople: 'numeric'
		});
		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		const locationFields = {};
		const user = await User.findOne({ _id: userID });
		const zip = getZipcode(long, lat);

		locationFields.ownerID = userID;
		locationFields.pictures = JSON.stringify(pictures);
		locationFields.longitude = long;
		locationFields.latitude = lat;
		locationFields.zipcode = zip;
		locationFields.keywords = JSON.stringify(keywords);
		locationFields.amenities = JSON.stringify(amenities);
		locationFields.maxPeople = maxPeople;

		matchFields.userA = userA_ID;
		matchFields.userB = userB_ID;

		const location = new Location(locationFields);

		await location.save();

		res.json({ msg: { user: user, location: location }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ result: false, error: e.message });
	}
});

router.post('/deleteLocation', async (req, res) => {
	const { userID, locationID } = req.body;

	try {
		const user = await User.findOne({ _id: userID });
		const locations = JSON.parse(user.locations);
		const findLocation = _.includes(locations, locationID);
		if (!findLocation) throw new Error('This location is not here');

		await Location.deleteOne({ _id: locationID });

		locations.splice(locationID, 1);
		user.locations = JSON.stringify(locations);
		await user.save();

		res.json({ msg: { user: user }, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ result: false, error: e.message });
	}
});

router.get('getMessages', async (req, res) => {});
router.post('/addMessage', async (req, res) => {
	const { messageContent, sender, locationID } = req.body;

	try {
		const location = await Location.findOne({ _id: locationID });
		const user = await User.findOne({ _id: location.ownerID });

		if (!location) throw new Error('Location not found');
		if (!user) throw new Error('User not found');
		const communications = JSON.parse(user.communications);

		// TODO – you need to use an interface here
		// msgs are organized based on location ID
		let index = -1;
		for (var i = 0; i < communications.length; i++) {
			var com = communications[i];
			if (com.location == locationID) {
				index = i;
				break;
			}
		}

		var messages = [];
		if (index == -1) {
			var newComObject = {};
			newComObject.location = locationID;
			messages = [];
			communications.push(newComObject);
			index = communications.length - 1;
		} else {
			messages = communications[index].messages;
		}

		const message = {
			content: messageContent,
			sender: sender,
			date: Date.now()
		};
		messages.push(message);
		communications[index].messages = messages;
		user.communications = JSON.stringify(communications);
		await user.save();
		res.json({ msg: user, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ error: e.message, result: false });
	}
});

module.exports = router;
