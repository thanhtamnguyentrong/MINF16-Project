//Dependencies

var express = require('express');
var router = express.Router();
var request  = require('request');
var CacheControl = require("express-cache-control");
var cache = new CacheControl().middleware;
var _ = require("underscore");
var async = require('async');
var db = require('../db')

function addRestaurant(body,callback){
	console.log(body);
	var collection = db.get().collection('Restaurant');
	var restaurantIndex = countRestaurant() + 1 ;
	body._id = restaurantIndex;
	collection.insertOne(body).then(function(result){
		collection.find().toArray(function(err,docs){
			if(err){
				console.log(err);
				res.status(401).json(err);
			}
	    	else {
	    		console.log(docs);
	    		callback(docs);
	    	}
		})
	})
}

function countRestaurant(){
	var collection = db.get().collection('Restaurant');
	collection.find().count(function(e,count){
		if(err)
			return -1;
		else
			return count;
	});
}
//Routes
//get all restaurant info
router.get('/', function(req,res){
	var collection = db.get().collection('Restaurant');

	collection.find().toArray(function(err, docs) {
		if(err){
			console.log(err)
		}
    	else {
    		//console.log(docs);
    		res.status(200).json(docs);
    	}
  	})
});

// add new restaurant
router.post('/', cache('seconds', 0), function(req, res) {
	var body = req.body;
    // var clientId = req.headers['movideo-auth'];
    // var productId = req.params.id;
    // var episodeId = req.body.episode_id;
    // getStreams(clientId, productId, episodeId, res);
    addRestaurant(body,function(docs){
    	res.json(docs);
    });

});

router.get('/count', function(req,res){
	res.json(countRestaurant());
	
});
//Return router
module.exports = router;