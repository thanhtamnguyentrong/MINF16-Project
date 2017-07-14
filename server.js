require('dotenv').load();
//var nr = require('newrelic');
var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

//Express
var app =express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db = require('./db');

// Connect to the database before starting the application server.
db.connect("mongodb://"+process.env.MONGO_USERNAME +":" + process.env.MONGO_PASSWORD+ "@" +process.env.MONGO_URL, function (err) {
  console.log("Databse URL is : mongodb://"+process.env.MONGO_USERNAME +":" + process.env.MONGO_PASSWORD+ "@" +process.env.MONGO_URL);
  if (err) {
    console.error(err);
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else{
    console.log("Database connection ready");
    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log("App now running on port", port);
      
    });
  }

  // Save database object from the callback for reuse.
  
});

// Routes
app.use('/restaurant', require('./routes/restaurant'));


app.get('/',function(req,res){
	res.send('MINF16 Project APIs <br>Version: 1.0 <br> Author : <ul> <li>Thanh Tam</li> <li> Didier Joomun </li> <li> Trang </li></ul>');
});


// globalTunnel.initialize({
//   host: '10.0.0.10',
//   port: 8080,
//   sockets: 50 // optional pool size for each http and https
// });

//app.listen(process.env.PORT || 3000);
console.log('API is running on port ' + ( process.env.PORT || 3000));
