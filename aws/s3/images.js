// Upload a profile picture to S3
const aws = require("aws-sdk");
const s3 = new aws.S3({ apiVersion: "2006-03-01", region: "us-east-1" });

exports.deleteProfilePictureFromS3 = async function(params) {
  try {
    const data = await s3.deleteObject(params).promise();
    return data;
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
  }
};

exports.uploadProfilePictureToS3 = async function(params) {
  try {
    const data = await s3.putObject(params).promise();
    return data;
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
  }
};

exports.test2 = function() {
  console.log("Test again");
};
