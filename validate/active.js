const User = require('../models/User');
const { Validator } = require('node-input-validator');
const errors = require('../errors/errors');

module.exports.checkIfValidUser = async function(id) {
	const user = await User.findOne({ _id: id });

	// if (user.activated === null || user.activated === false)
	// throw new errors.UserNotActiveError("User not activated");
	// if (user.zipcode === null || user.zipcode === '') throw new errors.NoLocationError('User has no zipcode');
	if (user.visible === null || user.visible === false) throw new errors.UserNotVisible('User not visible');
	if (user.verified === null || user.verified === false) throw new errors.UserNotVerified('User not visible');
};
