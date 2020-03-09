const express = require('express');
const bodyParser = require('body-parser');

const program = require('commander');
const { setConfig, conf } = require('./config/config');
//const conf = require('./config/config');
const database = require('./DB/db');
require('dotenv').config();

const app = express();
// connectDB();

program.option('-t, --test', 'test').option('-d, --dev', 'Development').option('-p, --port <type>', 'port number');
console.log('Reading in flags');

program.parse(process.argv);

setConfig(program);

app.use(express.json({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(
	bodyParser.urlencoded({
		limit: '5mb',
		extended: true,
		parameterLimit: 50000
	})
);

app.use('/api/user', require('./routes/api/user'));
app.use('/api/images', require('./routes/api/images'));
app.use('/api/location', require('./routes/api/location'));

const db = database.openConnection();
const PORT = conf.PORT;

app.listen(PORT, () => console.log(`Server started on port ${conf.PORT}`));
