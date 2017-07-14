//Dependencies

var express = require('express');
var router = express.Router();
var request  = require('request');
var CacheControl = require("express-cache-control");
var cache = new CacheControl().middleware;
var _ = require("underscore");
var async = require('async');
var db = require('../db')

function addRestaurant(body){
	console.log(body);
	var collection = db.get().collection('Restaurant');
	collection.insertOne(body).then(function(result){
		console.log(result);
		collection.find().toArray(function(err,docs){
			if(err){
			console.log(err)
			}
	    	else {
	    		console.log(docs);
	    		res.json(docs);
	    	}
		})
	})
}

//Routes
router.get('/', function(req,res){
	var collection = db.get().collection('Restaurant');

	collection.find().toArray(function(err, docs) {
		if(err){
			console.log(err)
		}
    	else {
    		console.log(docs);
    		res.status(200).json(docs);
    	}
  	})
});

router.post('/', cache('seconds', 0), function(req, res) {
	var body = req.body;
    // var clientId = req.headers['movideo-auth'];
    // var productId = req.params.id;
    // var episodeId = req.body.episode_id;
    // getStreams(clientId, productId, episodeId, res);
    addRestaurant(body);

});
//Return router
module.exports = router;