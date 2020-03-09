// all functionality related to images goes here

const User = require('../../models/User');
const express = require('express');
const uuidv4 = require('uuid/v4');
const types = require('../../types/types');
const { uploadProfilePictureToS3, deleteProfilePictureFromS3 } = require('../../aws/s3/images');
const tokenAuthorizer = require('../../middleware/auth');

require('dotenv').config();

const router = express.Router();

// @route   DELETE api/images/replace
// @desc    Replace image
// access   Private
router.post('/replaceImage', tokenAuthorizer, async (req, res) => {
	// imageID to delete
	// rank the image needs to be
	// base64 of image to upload
	const { imageID, base64 } = req.body;
	const userID = req.id;
	try {
		const user = await User.findOne({ _id: userID });

		const pictures = [];
		let image = null;

		user.pictures.map((img) => {
			if (img.imageID !== imageID) pictures.push(img);
			else image = img;
		});
		if (image === null) throw new Error('Could not find image');

		const rank = image.rank;
		const deleteParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: image.key
		};
		await deleteProfilePictureFromS3(deleteParams);

		user.pictures = pictures;
		await user.save();

		const newImageID = uuidv4();
		let buff = new Buffer(base64, 'base64');
		const key = `public/${userID}/${newImageID}.jpg`;
		var uploadParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: key,
			Body: buff,
			ContentType: 'image/jpeg'
		};

		const link = `${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;
		await uploadProfilePictureToS3(uploadParams);

		const profilePicture = {
			imageID: newImageID,
			rank: rank,
			link: link,
			key: key
		};
		user.pictures.push(profilePicture);

		await user.save();
		res.json(user);
	} catch (e) {
		console.log(e.message);
		res.status(500).json({ msg: e.message });
	}
});

// @route   DELETE api/images/deleteImage
// @desc    Delete image from user's account
// access   Private
router.delete('/deleteImage', tokenAuthorizer, async (req, res) => {
	let { rank } = req.body;
	const userID = req.id;

	try {
		rank = Number(rank);
		const user = await User.findOne({ _id: userID });
		let images = JSON.parse(user.pictures);
		const containsRank = images.some((image) => image.rank == rank);
		if (!containsRank) throw new Error("Image doesn't exist");

		let image = images[rank];
		const params = {
			Bucket: process.env.BUCKET_NAME,
			Key: image.key
		};

		const result = await deleteProfilePictureFromS3(params);
		images[rank] = '';
		//simages.splice(rank, 1);
		user.pictures = JSON.stringify(images);

		await user.save();
		res.json({ msg: user, result: true });
	} catch (e) {
		console.log(e.message);
		res.status(500).json({ error: e.message, result: false });
	}
});

// @route   POST api/user/uploadImage
// @desc    Upload image to user's account
// access   Private
router.post('/uploadImage', tokenAuthorizer, async (req, res) => {
	let { rank, base64 } = req.body;
	const userID = req.id;

	// TODO - convert images to JPG if not already
	try {
		rank = Number(rank);
		const imageID = uuidv4();
		let buff = new Buffer(base64, 'base64');
		const key = `public/${userID}/${imageID}.jpg`;

		let user = await User.findOne({ _id: userID });
		if (!user) throw new Error('Could not find user');

		let images = JSON.parse(user.pictures);

		// TODO – verify it actuall is a jpeg
		var params = {
			Bucket: process.env.BUCKET_NAME,
			Key: key,
			Body: buff,
			ContentType: 'image/jpeg'
		};

		const link = `${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`;
		const result = await uploadProfilePictureToS3(params);
		//const profilePicture = new types.Picture(imageID, rank, link, key);

		const profilePicture = {
			imageID: imageID,
			rank: rank,
			link: link,
			key: key
		};
		//images[rank] = profilePicture;
		images[rank] = profilePicture;
		//user.pictures[rank] = JSON.stringify(profilePicture);
		user.pictures = JSON.stringify(images);
		await user.save();

		res.json({ msg: profilePicture, result: true });
	} catch (e) {
		console.log(e.message);
		res.status(500).json({ msg: e.message });
	}
});

module.exports = router;

// TODO
// convert image to JPEG
