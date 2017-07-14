//Dependencies

var express = require('express');
var router = express.Router();
var request  = require('request');
var CacheControl = require("express-cache-control");
var cache = new CacheControl().middleware;
var _ = require("underscore");
var async = require('async');
var db = require('../db')

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

router.get('/list/:id',  function(req,res){

	requestPlaylistById(req.params.id,function(result){
		console.log(result);
		//console.log(result.length);
		if(result.length>0){
			res.json(JSON.parse(result));
		}
		else{
			utils.getErrorBody('Playlist is missing', 404, 2021, "Middleware : Get Playlist", 
				function(error){                  
					res.status(error.error.status).json(error);
				});	
		}
	});
});
// list hidden playlist
var idsPlaylistRemove =[89, 91,101,96,95,94,93,100,99,98,97];	
router.get('/:type',  function(req,res){
	requestPackageType(req.params.type,function(listType){
		if(listType.length>0)
			res.json(listType);
		else
			utils.getErrorBody('Playlist is missing', 404, 2021, "Middleware : Get Playlist", 
				function(error){                  
					res.status(error.error.status).json(error);
				});	
	});	
});

var getExtendsPlaylists = function(callback){
	request("http://download.danet.vn/extend-playlist.json", function(err,response){
		if(err){
			callback(null,err);
		}	
		else{
			callback(response,null);
		}
	});
};

var requestPackageType = function(type,callback){
	request(constants.swiftCMSURL+'/playlist/list?package_type='+type,function(err,response,body){
		if(err){
			callback([]);	
		}
		else{


			var allPlaylists = _.indexBy(JSON.parse(body),'id');
			for (var i = 0; i < idsPlaylistRemove.length; i++) {
				if(allPlaylists[ idsPlaylistRemove[i] ])
					delete allPlaylists[ idsPlaylistRemove[i] ];
			};
			var playlists = [];
			getExtendsPlaylists(function(result,err){
				if(err){
					console.log(err);
				}
				else{
					try{
						result=JSON.parse(result.body);
						var extendPlaylists = _.indexBy(result.list,'playlist_id');
						for (var i in allPlaylists){
						//console.log(i);
							var playlist = allPlaylists[i];
							//playlist = JSON.stringify(playlist);
							//playlist = '{ "type" : "playlist", ' + playlist.substring(1,playlist.length-1) + '}';
							playlist["type"] = "playlist";
							if(extendPlaylists[i]){
							 	playlist["extend"] = extendPlaylists[i].extend;
							}
							playlists.push(playlist);
						}

						if(playlists.length>=1)
							callback(playlists);
						else
							callback([]);
						
					} catch(e){
						console.error(e);
						console.error("download extend fail");
						console.error(body);
						callback(JSON.parse(body));
					}
				}
			});


			
		}
	}).auth(constants.username,constants.password,true);
};

var requestPlaylistById= function(id,callback){
	var playlist = {};
	async.parallel([
		function(callback){
			request(constants.swiftCMSURL+'/playlist/list', function(err,response){
				if(err){
					callback(err);
				}
				else{
					var listPlaylists = _.indexBy(JSON.parse(response.body),'id');
					if(listPlaylists[id]){
						playlist["playlist_name"] = listPlaylists[id].name;
						callback();
					}
					else{
						utils.getErrorBody('Playlist is missing', 404, 2021, "Middleware : Get Playlist", 
							function(error){                  
						//res.status(error.error.status).json(error);
						callback(error);
					});        
					}
				}
			}).auth(constants.username,constants.password,true);
		},
		function(callback){
			request(constants.swiftCMSURL+'/product/list/by_playlist?playlist_id='+ id +'&page_size=100',function(error,resp,body){
				if(error){
					callback(error);
				}
				else{
					var products = JSON.parse(body);
					if(products.error_code){
						callback();
					}
					else{
						var listMovie = products["list"];

						//shuffle list product in playlist
						shuffleArray(listMovie,function(new_list){
							listMovie=new_list;
						})

						//create new list movie with selected parameter
						var newListMovie = [];
						if(listMovie.length>0){
							var newMovie;
							for (var i = 0; i < listMovie.length; i++) {
								movie = listMovie[i];

								createSlug(movie["name"],function(result){
									movie["slug"] = result;
								})
								if(movie["category"]==1)
									movie["type"] ="movie";
								else
									movie["type"]="series";

								newMovie = {
									"id" : movie["id"],
									"title" : movie["name"],
									"slug" : movie["slug"],
									"category" : movie["category"],
									"poster" : movie["thumbnail_path"],
									"background" : movie["hero_shot_path"],
									"type" : movie["type"],
									"content_type" : movie["content_type"]	
								}

								newListMovie.push(newMovie);
							}
						}

						playlist["id"] = parseInt(id);
						playlist["type"] = "playlist";
						playlist["list"]=newListMovie;
						callback();
					}
				}
			}).auth(constants.username,constants.password,true);
		},
		function(callback){
			getExtendsPlaylists(function(data,err){
				if(err){
					console.log(err);
					callback();
				}
				else{
					try{
						data=JSON.parse(data.body);
						var extendPlaylists = _.indexBy(data.list,'playlist_id');

						if(extendPlaylists[id]){
							console.log(extendPlaylists[id]);
							playlist["extend"] = extendPlaylists[id].extend;
							playlist["extend_name"] = extendPlaylists[id].extend_name;
							playlist["extend_slug"] = extendPlaylists[id].slug;
						}
						callback();
					} catch(e){
						console.error("download extend fail");
						callback();
					}
				}
			});
		}],
		function(err){
			if(err){
				callback([]);
			}
			else{
				callback(JSON.stringify(playlist));
			}
		});

	
};

router.getPackageType = function(type,callback){
	requestPackageType(type,callback);
}
var shuffleArray = function(array,callback){
	var index;
	var new_array =[];
	while(array.length>0){
		index = Math.floor(Math.random()*array.length);
		new_array.push(array[index]);
		array.splice(index,1);
	}
	callback(new_array);
}

var createSlug = function(str,callback) {
	str = str.toLowerCase();
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	str = str.replace(/đ/g, "d");
	str = str.replace(/\(|\)| |\.|\,|\\|\"|\'|\_|\:|\;|\!|\@|\#|\$|\%|\^|\&|\*|\”|\“|\‘|\’|\<|\>|\?|\/|\+|\=|\|/g,"-");
	removeUnderScore(str,function(result){
		callback(result);
	})
}

var removeUnderScore = function(str,callback){
	var index =0;
	while(index < str.length-1){
		if(str.charAt(index)=='-'){
			if(str.charAt(index+1)=='-'){
				str = str.slice(0,index)+ str.slice(index+1);
			}
			else
				index+=2;
		}
		else 
			index++;
	}
	if(str.charAt(str.length-1)=='-')
		str = str.slice(0,str.length-1);
	callback(str);
}
//Return router
module.exports = router;