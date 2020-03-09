var assert = require('assert');
const axios = require('axios');
const User = require('../models/User');
const Location = require('../models/Location');
require('dotenv').config();
const { setConfig, conf } = require('../config/config');
const database = require('../DB/db');
const fs = require('fs');
const path = require('path');

const createUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/create`;
const likeProfileURL = `http://localhost:${process.env.TEST_PORT}/api/location/requestBooking`;
const createMatchURL = `http://localhost:${process.env.TEST_PORT}/api/location/createLocation`;
const deleteMatchURL = `http://localhost:${process.env.TEST_PORT}/api/location/deleteLocation`;
const addMessageURL = `http://localhost:${process.env.TEST_PORT}/api/location/addMessage`;

afterEach(async function() {
	await User.remove({});
	await Match.remove({});
});

async function createUser(userData) {
	let res = await axios.post(createUserURL, userData);
	assert.ok(res.data.token, 'No token returned');
	const userAJWT = res.data.token;
	const user = await User.findOne({ email: userData.email });
	assert.ok(user, 'no user found');
	return {
		JWT: userAJWT,
		user: user
	};
}

describe('match functionality', () => {
	it('create and delete a location', async () => {
		try {
			let userAData = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let userBData = {
				email: 'testUserEight@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserEight'
			};

			const userAPkg = await createUser(userAData);
			const userBPkg = await createUser(userBData);

			let payload = {
				userA_ID: userAPkg.user._id,
				userB_ID: userBPkg.user._id
			};

			// okay now create the match
			let result = await axios.post(createMatchURL, payload);
			assert.ok(result);
			let matchesA = JSON.parse(result.data.msg.userA.matches);

			assert.equal(matchesA.length, 1, 'incorrect num matches for A');
			let matchesB = JSON.parse(result.data.msg.userB.matches);

			assert.equal(matchesB.length, 1, 'incorrect num matches for B');
			const matchID = result.data.msg.match._id;

			payload = {
				matchID: matchID
			};
			result = await axios.post(deleteMatchURL, payload);
			let foundMatch = await User.findOne({ _id: matchID });
			if (foundMatch) assert.fail();
			assert.ok(result.data.result, 'error thrown');

			const userA = await User.findOne({ _id: userAPkg.user._id });
			const userB = await User.findOne({ _id: userBPkg.user._id });
			const userAMatches = JSON.parse(userA.matches);
			const userBMatches = JSON.parse(userB.matches);
			assert.equal(userAMatches.length, 0, 'did not delete match');
			assert.equal(userBMatches.length, 0, 'did not delete match');

			foundMatch = await User.findOne({ _id: matchID });
			assert.ok(!foundMatch, 'could not find the match');
		} catch (e) {
			console.log(e.message);
			assert.fail();
		}
	});

	it('create, add messages', async () => {
		try {
			let userAData = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let userBData = {
				email: 'testUserEight@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserEight'
			};

			const userAPkg = await createUser(userAData);
			const userBPkg = await createUser(userBData);

			let payload = {
				userA_ID: userAPkg.user._id,
				userB_ID: userBPkg.user._id
			};

			// okay now create the match
			let result = await axios.post(createMatchURL, payload);
			assert.ok(result);
			let matchesA = JSON.parse(result.data.msg.userA.matches);

			assert.equal(matchesA.length, 1, 'incorrect num matches for A');
			let matchesB = JSON.parse(result.data.msg.userB.matches);

			assert.equal(matchesB.length, 1, 'incorrect num matches for B');
			const matchID = result.data.msg.match._id;

			payload = {
				messageContent: "Hey, what's up?",
				sender: userAPkg.user._id,
				matchID: matchID
				//matchID: matchID
			};

			result = await axios.post(addMessageURL, payload);

			assert.ok(result, 'no result returned');
			assert.ok(result.data.result, 'error was thrown');

			let msgs = JSON.parse(result.data.msg.messages);
			assert.equal(msgs.length, 1, 'issue adding a message');

			payload = {
				messageContent: "Everything's great.  Thanks for asking.",
				sender: userBPkg.user._id,
				matchID: matchID
			};

			result = await axios.post(addMessageURL, payload);

			assert.ok(result, 'no result returned');
			assert.ok(result.data.result, 'error was thrown');

			msgs = JSON.parse(result.data.msg.messages);
			assert.equal(msgs.length, 2, 'issue adding a message');
		} catch (e) {
			console.log(e.messages);
			assert.fail();
		}
	});

	// TODO
	// get only a certain atmount of messages at a time
	// so give a number to each message
	it('create, add, get', async () => {
		try {
			let userAData = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let userBData = {
				email: 'testUserEight@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserEight'
			};
			const userAPkg = await createUser(userAData);
			const userBPkg = await createUser(userBData);

			let payload = {
				userA_ID: userAPkg.user._id,
				userB_ID: userBPkg.user._id
			};
			let result = await axios.post(createMatchURL, payload);
			assert.ok(result);

			const matchID = result.data.msg.match._id;
			// add messages
			payload = {
				messageContent: "Hey, what's up?",
				sender: userAPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'Everything is good.  How are you?',
				sender: userBPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: "Great! Thanks for asking.  How's your mom?",
				sender: userAPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: "She's doing well.  Got pulled over for speeding.",
				sender: userBPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'Fucking cops.',
				sender: userAPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'I know bruh.',
				sender: userBPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'They prob thought she was carrying',
				sender: userAPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'Like guns?  Drugs?',
				sender: userBPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'Donuts.',
				sender: userAPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			payload = {
				messageContent: 'Truth bruh',
				sender: userBPkg.user._id,
				matchID: matchID
			};
			await axios.post(addMessageURL, payload);

			// should have 10 messages at this point.
			const match = await Match.findOne({ _id: matchID });
			const msgs = JSON.parse(match.messages);
			assert.equal(msgs.length, 10, 'problem with adding msgs');
			msgs.sort(sortAscending);

			// TODO – probably should find a way to sort the messages
			// also add a rank to each emssages so you can send the right
			// amount

			//assert.ok()
			//console.log(msgs);
			msgs.sort(sortDescending);
			//	console.log(msgs);
		} catch (e) {
			console.log(e.message);
			assert.fail();
		}
	});

	it('Test create messages', async () => {
		try {
			let userAData = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let userBData = {
				email: 'testUserEight@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserEight'
			};
			const userAPkg = await createUser(userAData);
			const userBPkg = await createUser(userBData);

			// userA likes userB
			let config = {
				headers: {
					'x-auth-token': userAPkg.JWT
				}
			};
			let payload = {
				likedID: userBPkg.user._id
			};

			let result = await axios.post(likeProfileURL, payload, config);

			assert.ok(result.data.result, 'problem liking user');

			let userALikes = JSON.parse(result.data.msg.userA.liked);
			let userBLikes = JSON.parse(result.data.msg.userB.liked);

			assert.equal(userALikes.length, 1, 'problem liking user');
			assert.equal(userBLikes.length, 0, 'problem liking user');

			// okay so now have user B like user A back
			config = {
				headers: {
					'x-auth-token': userBPkg.JWT
				}
			};
			payload = {
				likedID: userAPkg.user._id
			};
			result = await axios.post(likeProfileURL, payload, config);

			assert.ok(result.data.result);
			let userA = await User.findOne({ _id: userAPkg.user._id });
			let userB = await User.findOne({ _id: userBPkg.user._id });
			userALikes = JSON.parse(userA.liked);
			userBLikes = JSON.parse(userB.liked);

			assert.equal(userALikes.length, 0, 'problem liking user');
			assert.equal(userBLikes.length, 0, 'problem liking user');

			let userAMatches = JSON.parse(userA.matches);
			let userBMatches = JSON.parse(userB.matches);

			assert.equal(userAMatches.length, 1, 'problem liking user');
			assert.equal(userBMatches.length, 1, 'problem liking user');

			const matchID = userAMatches[0];
			payload = {
				matchID: matchID
			};

			// okay now delete it
			result = await axios.post(deleteMatchURL, payload);
			let matchFound = await Match.findOne({ _id: matchID });
			assert.ok(!matchFound, 'Found deleted match');

			userA = await User.findOne({ _id: userAPkg.user._id });
			userB = await User.findOne({ _id: userBPkg.user._id });
			userAMatches = JSON.parse(userA.matches);
			userBMatches = JSON.parse(userB.matches);

			assert.equal(userAMatches.length, 0, 'problem deleting match');
			assert.equal(userBMatches.length, 0, 'problem deleting match');
		} catch (e) {
			console.log(e.message);
			assert.fail();
		}
	});
});

// sort by date
function sortAscending(a, b) {
	return new Date(a.date).getTime() - new Date(b.date).getTime();
}
function sortDescending(a, b) {
	return new Date(b.date).getTime() - new Date(a.date).getTime();
}
