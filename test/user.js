var assert = require('assert');
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();
const { setConfig, conf } = require('../config/config');
const database = require('../DB/db');
const fs = require('fs');
const path = require('path');

const createUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/create`;
const updateUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/updateInfo`;
const deleteUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/delete`;
const loginUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/login`;
const testUserURL = `http://localhost:${process.env.TEST_PORT}/api/user/test`;
const testTokenURL = `http://localhost:${process.env.TEST_PORT}/api/user/testauth`;
const validateURL = `http://localhost:${process.env.TEST_PORT}/api/user/validate`;
const toggleVisibilityURL = `http://localhost:${process.env.TEST_PORT}/api/user/toggleVisibility`;
const uploadImageURL = `http://localhost:${process.env.TEST_PORT}/api/images/uploadImage`;
const deleteImageURL = `http://localhost:${process.env.TEST_PORT}/api/images/deleteImage`;

/*
let db = null;
before(async function() {
	db = await database.openConnection();
});

after(async function() {
	await database.closeConnection(db);
});
*/

afterEach(async function() {
	await User.remove({});
});

describe('User operations', () => {
	it('Create and delete user', async () => {
		let db = null;
		try {
			const data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			const res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');

			const JWT = res.data.token;

			let user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};
			const headers = {
				'x-auth-token': JWT
			};
			await axios.delete(deleteUserURL, config);
			user = await User.findOne({ email: 'testUserSeven@example.com' });
			if (user === null) user = false;
			assert.equal(user, false, 'User not deleted');
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it('Create and update a user', async () => {
		try {
			const data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');
			const JWT = res.data.token;

			const user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};
			const updateData = {
				name: 'Johnny'
			};
			res = await axios.post(updateUserURL, updateData, config);
			let returnedUser = res.data.user;
			assert.equal(returnedUser.name, 'Johnny', 'Name was not updated');
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it('Login user', async () => {
		try {
			const data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');
			let JWT = res.data.token;
			let user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};

			let payload = {
				email: 'testUserSeven@example.com',
				password: 'test123'
			};

			res = await axios.post(loginUserURL, payload, config);
			let token = res.data.msg;
			assert.ok(token, 'No token returned');
			assert.ok(res.data.result);

			payload = {
				email: 'testUserSeven@example.com',
				password: 'test1123'
			};

			res = await axios.post(loginUserURL, payload, config);
			assert.equal(res.data.result, false);

			payload = {
				email: 'testUsesrSeven@example.com',
				password: 'test123'
			};

			res = await axios.post(loginUserURL, payload, config);
			assert.equal(res.data.result, false);
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it('validate a user', async () => {
		try {
			let data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');
			let JWT = res.data.token;
			let user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};

			let payload = {
				preference: 'men',
				gender: 'woman',
				articles: [ 'article1', 'article2', 'article3' ],
				university: 'Columbia University'
			};

			res = await axios.post(validateURL, payload, config);

			assert.equal(res.data.result, true, 'Could not validate');
			assert.equal(res.data.msg.university, 'Columbia University', 'University not updated');
			assert.equal(res.data.msg.articles.length, 3, 'Articles not updated');
			assert.equal(res.data.msg.gender, 'WOMAN', 'gender not updated');
			assert.equal(res.data.msg.preference, 'MEN', 'preference not updated');

			payload = {
				preference: 'men',
				gender: 'man',
				articles: [ 'article1', 'article2', 'article3' ],
				university: 'American University'
			};

			res = await axios.post(validateURL, payload, config);

			assert.equal(res.data.result, true, 'Could not validate');
			assert.equal(res.data.msg.university, 'American University', 'University not updated');
			assert.equal(res.data.msg.articles.length, 3, 'Articles not updated');
			assert.equal(res.data.msg.gender, 'MAN', 'gender not updated');
			assert.equal(res.data.msg.preference, 'MEN', 'preference not updated');

			payload = {
				preference: 'men',
				gender: 'man',
				articles: [ 'article1', 'article2' ],
				university: 'American University'
			};

			res = await axios.post(validateURL, payload, config);

			assert.equal(res.data.result, false, 'Should not have validated');
		} catch (e) {
			console.log(e.message);
			assert.fail();
		}
	});

	it('Toggle visibility of user', async () => {
		try {
			let data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');
			let JWT = res.data.token;
			let user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};

			let payload = {
				toggle: false
			};

			res = await axios.post(toggleVisibilityURL, payload, config);
			user = res.data.msg;
			assert.equal(res.data.result, true, 'visibility operation not performed well');
			assert.equal(user.visible, false, 'visibility nto set to false');

			payload = {
				toggle: true
			};

			res = await axios.post(toggleVisibilityURL, payload, config);
			user = res.data.msg;
			assert.equal(res.data.result, true, 'visibility operation not performed well');
			assert.equal(user.visible, true, 'visibility not set to true');
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});

	it('Add picture of user & delete', async () => {
		try {
			let data = {
				email: 'testUserSeven@example.com',
				password: 'test123',
				age: 24,
				name: 'testUserSeven'
			};
			let res = await axios.post(createUserURL, data);
			assert.ok(res.data.token, 'No token returned');
			let JWT = res.data.token;
			let user = await User.findOne({ email: 'testUserSeven@example.com' });
			assert.ok(user, 'no user found');

			let config = {
				headers: {
					'x-auth-token': JWT
				}
			};

			// read in the file
			let filePath = path.resolve(__dirname, 'images/image.txt');
			var content = fs.readFileSync(filePath, 'utf8');
			let payload = {
				base64: content,
				rank: 0
			};

			res = await axios.post(uploadImageURL, payload, config);
			user = await User.findOne({ email: 'testUserSeven@example.com' });
			let pictures = JSON.parse(user.pictures);

			assert.notEqual(pictures[0], '', 'something went wrong with picture upload');

			filePath = path.resolve(__dirname, 'images/image1.txt');
			content = fs.readFileSync(filePath, 'utf8');
			payload = {
				base64: content,
				rank: 2
			};

			res = await axios.post(uploadImageURL, payload, config);

			user = await User.findOne({ email: 'testUserSeven@example.com' });

			pictures = JSON.parse(user.pictures);

			assert.notEqual(pictures[2], '', 'something went wrong with picture upload');

			// okay now delete

			/*
			config = {
				headers: {
					'x-auth-token': JWT
				}
			};
			*/

			let key = user.pictures[0].key;
			payload = {
				rank: 0
			};

			res = await axios.delete(deleteImageURL, {
				headers: {
					'x-auth-token': JWT
				},
				data: {
					rank: 0
				}
			});

			//res = await axios.delete(deleteImageURL, payload, config);
			user = await User.findOne({ email: 'testUserSeven@example.com' });
			pictures = JSON.parse(user.pictures);

			assert.equal(pictures[0], '', 'something went wrong with picture upload');

			res = await axios.delete(deleteImageURL, {
				headers: {
					'x-auth-token': JWT
				},
				data: {
					rank: 2
				}
			});
			user = await User.findOne({ email: 'testUserSeven@example.com' });
			pictures = JSON.parse(user.pictures);

			assert.equal(pictures[2], '', 'something went wrong with picture upload');
		} catch (e) {
			console.log(e);
			assert.fail();
		}
	});
});

// TODO
// test validate DONE
// test login DONE
// test adding pictures
// test set visibility DONE
