const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
	const token = req.header('x-auth-token');
	//const token = req.header('x-auth-token');
	//console.log('TOKEN IS:');
	//console.log(req.header);
	//console.log('');
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		// console.log("DECODED IS: ", decoded);
		req.id = decoded.id;

		// call the next function of middleware
		next();
	} catch (e) {
		console.log(e.message);
		res.status(500).send(e.message);
	}
};
