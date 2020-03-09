const mongoose = require('mongoose');
// require('dotenv').config();
const { conf } = require('../config/config');

// TODO – change to use the mongo client
// for reliable reconnection

// this is basically a dict
//const db = process.env.MONGO_URI;

const openConnection = async () => {
	try {
		console.log('Opening connection to MongoDB...');
		const db = await mongoose.connect(conf.MONGO_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});
		console.log('Connection is green');
		return db;
	} catch (e) {
		console.log(e.message);
		process.exit(1);
		// return new Error('Could not connect to database');
	}
};

const closeConnection = async (db) => {
	try {
		console.log('Closing connection to MongoDB...');
		db.disconnect(() => console.log('Disconnected from MongoDB'));
	} catch (e) {
		console.log(e.message);
		process.exit(1);
		// return new Error('Could not disconnect from database');
	}
};

/*
const connectDB = async () => {
	try {
		console.log('Connecting...');
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});

		console.log('MongoDB connected');
	} catch (err) {
		console.error(err.message);

		// Exit with code 1
		process.exit(1);
	}
};
*/

module.exports = {
	openConnection,
	closeConnection
};
// module.exports = connectDB;
