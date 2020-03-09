const User = require('../../models/User');
const errors = require('../../errors/errors');
const express = require('express');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const { Validator } = require('node-input-validator');
const images = require('../../aws/s3/images');
const types = require('../../types/types');
const tokenAuthorizer = require('../../middleware/auth');
const aws = require('aws-sdk');
const mongoose = require('mongoose');
const { conf } = require('../../config/config');
const database = require('../../DB/db');

var salt = bcrypt.genSaltSync(10);
require('dotenv').config();
const router = express.Router();

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// @route   POST api/user/updateInfo
// @desc    Update a user's account
// access   Private
// TODO – make a separate update function for
// profile pics, articles,
router.post('/updateInfo', tokenAuthorizer, async (req, res) => {
	let { name, email, password, age, university, ageMin, ageMax, preference, gender } = req.body;

	try {
		//const db = await database.openConnection();
		const id = req.id;
		const user = await User.findOne({ _id: id });

		const v = new Validator(req.body, {
			email: 'email',
			ageMin: 'numeric',
			ageMax: 'numeric'
		});

		if (ageMax != null && ageMin != null && ageMin > ageMax) throw new Error('ageMin cannot be more than ageMax');

		const matched = await v.check();
		if (!matched) {
			// res.status(500).json({ error: v.errors });
			// return;
			throw new Error('Validation error');
		}

		if (name != null) {
			user.name = name;
		}
		if (email != null) user.email = email;
		if (password != null) user.password = password;
		if (age != null) user.age = age;
		if (university != null) user.university = university;
		if (ageMin != null) user.ageMin = ageMin;
		if (ageMax != null) user.ageMax = ageMax;
		if (preference != null) {
			preference = preference.toUpperCase();

			if (preference != types.MEN && preference != types.WOMEN && preference != types.BOTH)
				throw new Error('Preference type not allowed');
			user.preference = preference;
		}
		if (gender != null) {
			gender = gender.toUpperCase();
			if (gender != types.MAN && gender != types.WOMAN) throw new Error('Gender type not allowed');
			user.gender = gender;
		}

		await user.save();
		res.json({ user: user });
		//await database.closeConnection(db);
	} catch (e) {
		console.log(e.message);
		res.status(500).json({ error: e.message });
		//await database.closeConnection(db);
	}
});

// validate through email or text
// this should also be a protected route
router.post('/validate', tokenAuthorizer, async (req, res) => {
	let {
		/* profilePictures*/
		articles,
		university,
		gender,
		preference
	} = req.body;

	try {
		//	const db = await database.openConnection();
		gender = gender.toUpperCase();
		preference = preference.toUpperCase();

		const id = req.id;
		const v = new Validator(req.body, {
			university: 'required',
			gender: 'required',
			preference: 'required'
		});

		const matched = await v.check();
		if (!matched) {
			throw new Error('Validation error');
		}

		// const db = await database.openConnection();
		if (articles.length != 3) throw new Error('Only 3 articles allowed');
		//if (profilePictures.length != 5) throw new Error("Only 5 pictures allowed");
		if (gender != types.MAN && gender != types.WOMAN) throw new Error('Gender type not allowed');

		if (preference != types.MEN && preference != types.WOMEN && prference != types.BOTH)
			throw new Error('Preference type not allowed');

		const user = await User.findOne({ _id: id }).select('-password');
		if (!user) {
			throw new Error("Couldn't find this user");
		}

		// public/id/pictureID

		// you should make uploading pictures its own thing
		user.articles = articles;
		user.university = university; // TODO – change to profression
		user.gender = gender;
		user.preference = preference;

		// await user.save();

		user.verified = true;
		user.visible = true;
		await user.save();
		res.json({ msg: user, result: true });
		//	await database.closeConnection(db);
	} catch (e) {
		console.log(e.message);
		res.json({ error: e.message, result: false });
		//	await database.closeConnection(db);
	}
});

// this is just logging in
// you can create middleware to make sure
// that they are validated
// so do first auth to put the user in the req
// and then do validate to check whether the user is validated or not
router.post('/login', async (req, res) => {
	const { password, email } = req.body;

	try {
		//	const db = await database.openConnection();
		const v = new Validator(req.body, {
			email: 'required|email',
			password: 'required'
		});
		let matched = await v.check();
		if (!matched) {
			//res.status(500).json(v.errors);
			throw new Error('Problem with validation');
		}

		const user = await User.findOne({ email: email });
		if (!user) {
			//res.json({ msg: "couldn't find your email" });
			throw new Error("Couldn't find your email");
		}

		// now check the password
		matched = await bcrypt.compare(password, user.password);
		if (!matched) {
			//res.json({ msg: 'wrong password' });
			throw new Error('Wrong password');
		}

		const payload = {
			id: user.id
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 300000000
		});
		res.json({ msg: token, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

router.post('/create', async (req, res) => {
	const { password, email, name, age } = req.body;

	//const db = await database.openConnection();
	try {
		const v = new Validator(req.body, {
			email: 'required|email',
			password: 'required',
			age: 'required|numeric',
			name: 'required|alpha'
		});
		const matched = await v.check();
		if (!matched) {
			res.status(500).json(v.errors);
			throw new Error('validation error');
		}
		var hashedPassword = bcrypt.hashSync(password, salt);
		const user = new User({
			email: email,
			password: hashedPassword,
			name: name,
			age: age
		});
		await user.save();

		const payload = {
			id: user.id
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: 300000000
		});
		res.json({ token: token });
		//await database.closeConnection(db);
	} catch (e) {
		console.log(e.message);
		res.status(500).json({ error: e.message });
		//	await database.closeConnection(db);
	}
	//await database.closeConnection(db);
});

router.delete('/delete', tokenAuthorizer, async (req, res) => {
	const userID = req.id;

	try {
		//let db = await database.openConnection();
		await User.deleteOne({ _id: userID });
		res.json({ msg: true });
		//await database.closeConnection();
	} catch (e) {
		console.log(e.message);
		//await database.closeConnection(db);
		res.json({ error: e.message });
	}
});

router.post('/toggleVisibility', tokenAuthorizer, async (req, res) => {
	const userID = req.id;
	const { toggle } = req.body;
	try {
		const user = await User.findOne({ _id: userID });
		if (!toggle) {
			user.visible = false;
		} else {
			user.visible = true;
		}
		await user.save();
		res.json({ msg: user, result: true });
	} catch (e) {
		res.json({ result: false });
	}
});

// block a user
router.post('/block', tokenAuthorizer, async (req, res) => {
	await checkIfValidUser(userID);
	const { blockedID } = req.body;
	const userID = req.id;

	try {
		// front end should offer a warning that this is permenant

		const user = await User.findOne({ _id: userID });
		if (!user) throw new Error('No user found');

		const blocked = await User.findOne({ _id: blockedID });
		if (!blocked) throw new Error('No user found');

		const blockedUsers = JSON.parse(blockedUsers);
		blockedUsers.push(blockedID);
		user.blockedUsers = JSON.stringify(blockedUsers);

		await user.save();

		res.json({ msg: user, result: true });
	} catch (e) {
		console.log(e.message);
		res.json({ msg: e.message, result: false });
	}
});

router.post('/testauth', tokenAuthorizer, async (req, res) => {
	res.json(true);
});
router.get('/test', async (req, res) => {
	res.json({ msg: 'reached test' });
});

module.exports = router;

// make a route for getting all users profile pictures
