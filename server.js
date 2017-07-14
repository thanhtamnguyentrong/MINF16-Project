require('dotenv').load();
//var nr = require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var auth = require('./auth');

//Express
var app =express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGO_URL, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Routes
app.use('/restaurant', require('./routes/restaurant'));


app.get('/',function(req,res){
	res.send('MINF16 Project APIs <br>Version: 1.0 - UAT');
});


// globalTunnel.initialize({
//   host: '10.0.0.10',
//   port: 8080,
//   sockets: 50 // optional pool size for each http and https
// });

app.listen(process.env.PORT || 3000);
console.log('API is running on port ' + ( process.env.PORT || 3000));
