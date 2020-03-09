require('dotenv').config();
const { setConfig } = require('../config/config');
const database = require('../DB/db');

setConfig({ test: true });

let db = null;
before(async function() {
	db = await database.openConnection();
});

after(async function() {
	await database.closeConnection(db);
});
