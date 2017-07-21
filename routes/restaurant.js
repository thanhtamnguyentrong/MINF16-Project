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
	var collection = db.get().collection('Restaurant');
	countRestaurant(function(err, count){
		if(err)
			callback(err,null);
		else{
			var id = count+1;
			body._id = id;
			collection.insertOne(body,function(err,result){
				if(err){
					console.log(err);
					callback(err,null);
				} else{
					callback(null,result.insertedId)
				}
				// collection.find().toArray(function(err,docs){
				// 	if(err){
				// 		console.log(err);
				// 		callback(err,null);
				// 	}
			 //    	else {
			 //    		callback(null,docs);
			 //    	}
				// })
			})
		}
	})
	
}

function countRestaurant(callback){
	var collection = db.get().collection('Restaurant');
	collection.find().count(function(e,count){
		if(e)
			callback(e,-1);
		else
			callback(null,count);
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
    		res.json(docs);
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
    addRestaurant(body,function(err,insertedId){
    	if(err)
    		//res.status(400).json(err);
    		console.log(err);
    	else
    		res.json({status: "success",
    					restaurant_id: insertedId});
    });

});

//get restaurant count
router.get('/count', function(req,res){
	countRestaurant(function(err, count){
		if(err)
			res.status(400).json(err);
		else
			res.json(count);
	})
	
});

//Return router
module.exports = router;