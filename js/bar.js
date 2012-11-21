// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the bars database has been created
var selectedbar = window.localStorage.getItem("chosenbar");

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable for bar beers list
var barbeerslistcreated = window.localStorage.getItem("barbeerslistcreated");

// variable to hold the file system path to save the images
var DATADIR;

var tapBeersAdded = false;
var bottleBeersAdded = false;

// Cordova is ready
//
function onDeviceReady() {
	// make sure the beers database has been created first, if not redirect to beersmain.html to create it
	if (dbCreated != 1) {
		alert('Beers database must be created before viewing a bar page.  Redirecting you to create the beers database');
		window.location.href="beersmain.html";
	}
	// get file system access
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, errorHandler);
	// fire ajax requests at the same time, no db, no need to wait
	getFavoritesAndPhotos();
}

function onFSSuccess(fileSystem) {
	// get beers directory
	fileSystem.root.getDirectory("NWBC",{create:false},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/beers",{create:false},gotDir,onError);
}

function onError(e) {
	alert('error: ' + e.message);
}

function gotDir(d){
	DATADIR = d;
	// got beers directory for images, get database
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	if (!barbeerslistcreated || barbeerslistcreated == "") {
		db.transaction(populateDB, errorCB, function(){successCB();});
	} else {
    	if (barbeerslistcreated.search(selectedbar) == "-1") {
    		db.transaction(populateDB, errorCB, function(){successCB();});
    	} else {
    		db.transaction(queryDB, errorCB, function(){});
    	}
    }
}

// Transaction error callback
//
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
    alert("Error is: "+err.message);
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM bars WHERE id = ?', [selectedbar], querySuccess, errorCB);
    tx.executeSql('SELECT imagename, imageurl, id, isTap FROM beers INNER JOIN barbeerslist ON beers.id=barbeerslist.beerid WHERE barbeerslist.barid = ?', [selectedbar], beerslistquerySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var bar = results.rows.item(0);
	$('#bar_info').append('<p id="bar_detail_name">' + bar.name + '</p>');
	//$('#bar_info').append('<p id="bar_detail_description">' + bar.description + '</p>');
	$('#bar_info').append('<p id="bar_detail_address">' + bar.address + '</p>');
	$('#bar_info').append('<p id="bar_detail_phone"><a href="tel:' + bar.phone + '">' + bar.phone + '</a></p>');
	$('#bar_info').append('<p id="bar_detail_website"><a href="' + bar.website + '">' + bar.website + '</a></p>');
}

// Query the beers list success callback
//
function beerslistquerySuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        if (beer.isTap == "true") {
        	if (tapBeersAdded == false) {$('#bar_tap_info_holder').append('<div class="mobile_hr"></div><h1 id="bar_tap_title">Beers on Tap:</h1>'); tapBeersAdded=true;}
        	addTapBeer(beer.imagename, beer.imageurl, beer.id);
		} else {
			if (bottleBeersAdded == false) {$('#bar_bottle_info_holder').append('<div class="mobile_hr"></div><h1 id="bar_bottle_title">Beers in Bottle:</h1>'); bottleBeersAdded=true;}
			addBottleBeer(beer.imagename, beer.imageurl, beer.id);
		}
    }
}

// add a beer to the bars tap beer list
//
function addTapBeer(imagename, imageurl, id) {
	DATADIR.getFile(imagename,{create: false},function(fileEntry){gotFile(fileEntry, id);},function(){noFile(imageurl);});
}

// add a beer to the bars bottle beer list
//
function addBottleBeer(imagename, imageurl, id) {
	DATADIR.getFile(imagename,{create: false},function(fileEntry){gotBottleFile(fileEntry, id);},function(){noBottleFile(imageurl);});
}

// error handler for filesystem access
//
function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Filesystem Unknown Error';
      break;
  };
  alert('Error: ' + msg);
}

// add a beer to the tap list in the template
function gotFile(fileEntry, id) {
	$('#bar_beerlist_ul').append('<li><a href="./beer.html" data-transition="slide" rel="external" onClick="beerClicked(' + id + ')"><img src="' + fileEntry.fullPath + '" /></a></li>');
}

// add a beer to the bottle list in the template
function gotBottleFile(fileEntry, id) {
	$('#bar_bottlelist_ul').append('<li><a href="./beer.html" data-transition="slide" rel="external" onClick="beerClicked(' + id + ')"><img src="' + fileEntry.fullPath + '" /></a></li>');
}

// get thumbnail for a tap beer
function noFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(entry) {$('#bar_beerlist_ul').append('<li><img src="' + entry.fullPath + '" /></li>');}, null);
}

// get thumbnail for a bottle beer
function noBottleFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(entry) {$('#bar_bottlelist_ul').append('<li><img src="' + entry.fullPath + '" /></li>');}, null);
}

// Populate the database 
//
function populateDB(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS barbeerslist');
    tx.executeSql('CREATE TABLE IF NOT EXISTS barbeerslist(barid, beerid, isTap)');
    $.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/barbeerlist/" + selectedbar + "/", function(response) {
          var parsed_data = $.parseJSON(response);
          var len = parsed_data.length
		  for(var i=0;i<parsed_data.length;i++){
			  var beer = parsed_data[i];
			  beerVarString = [selectedbar, beer['beerpk'], beer['isTap']];
			  tx.executeSql('INSERT INTO barbeerslist (barid, beerid, isTap) VALUES (?, ?, ?)', beerVarString);
		  }
		  var donedbs = localStorage.getItem("barbeerslistcreated");
		  donedbs += ", " + selectedbar;
		  localStorage.setItem("barbeerslistcreated", donedbs);
    });
}

// Transaction success callback
//
function successCB() {
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryDB, errorCB, function(){});
}

//
// Functions to get favorite people and recent images
//
function getFavoritesAndPhotos() {
	$.get("http://nationwidebarcrawl.com/mobilenative/bar/pk/" + selectedbar + "/", function(response) {
		var parsed_data = $.parseJSON(response);
		if(parsed_data['barphotos'].length > 0) {
			$('#bar_photos_holder').append('<div class="mobile_hr"></div><h1>Recently Tagged Photos:</h1>');
		}
		$.each(parsed_data['barphotos'], function() {
			$('#bar_photos').append('<li><img src="http://nationwidebarcrawl.com' + this['imageurl'] + '" /></li>');
		});
		if(parsed_data['members'].length > 0) {
			$('#bar_members_holder').append('<div class="mobile_hr"></div><h1>Favorite Bar for:</h1>');
		}
		$.each(parsed_data['members'], function() {
			$('#bar_members').append('<li><img src="http://nationwidebarcrawl.com' + this['profileimage'] + '" /></li>');
		});
	});
}
