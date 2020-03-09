const conf = {
	MONGO_URI: null
};
const setConfig = (config) => {
	if (config.test) {
		conf.MONGO_URI = process.env.MONGO_TEST_URI;
		conf.PORT = process.env.TEST_PORT;
	} else if (config.dev) {
		conf.MONGO_URI = process.env.MONGO_DEV_URI;
		conf.PORT = process.env.PORT;
	}
};

module.exports = {
	setConfig: setConfig,
	conf
};

// so HERE you can decide what variables should be what
/**
 * s
 * 
 

 const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  endpoint: process.env.API_URL,
  masterKey: process.env.API_KEY,
  port: process.env.PORT
};

and then import like this
const { port } = require('./config');
console.log(`Your port is ${port}`); // 8626

 */
