
npm run server 
You can run this for development.  It uses nodemon so any change you make
will automatically restart the server (which is what you want)

** Testing ** 
npm run testServer
Use this for when you run your tests
The --test flag is already in there so the configuration will
handle setting the port and mongo URI to the testing port and database

On another shell run
npm run test

This will execute all tests against your testServer

** Bugs in the code **
There's a bug somewhere such that if you end your tests early or force quit
The database connection is still live.  Probably until you shut your computer off.
If this happens just switch testing port in .env file until its fixed.
