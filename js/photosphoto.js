// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variables to pass beers and drinks pks from json response to database to get images
var BEERPKS;
var DRINKPKS;

// variables to hold filesystem access
var BEERSDATADIR;
var DRINKSDATADIR;

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// Cordova is ready
//
function onDeviceReady() {
	// make sure the beers database has been created first, if not redirect to beersmain.html to create it
	if (dbCreated != 1) {
		alert('Beers database must be created before viewing a photo.  Redirecting you to create the beers database');
		window.location.href="beersmain.html";
	}
	
	// make sure the drinks database has been created first, if not redirect to drinksmain.html to create it
	if (drinksdbCreated != 1) {
		alert('Drinks database must be created before viewing the profile page.  Redirecting you to create the drinks database');
		window.location.href="drinksmain.html";
	}
	
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryDB, errorCB, function(){});
}

// get the ajax and query the database
function queryDB(tx) {
	var selectedphoto = localStorage.getItem("chosenphoto");
	$.ajaxSetup({async: false});
	$.get("http://nationwidebarcrawl.com/mobilenative/photos/pk/" + selectedphoto + '/', function(response) {
		var parsed_data = $.parseJSON(response);
		
		// add photo to template
		$('#photos_photo_holder').append('<img src="http://nationwidebarcrawl.com' + parsed_data['imageurl'] + '" />');

		// add tagged bar to template
		var taggedbar = parsed_data['taggedbar'];
		if (taggedbar['name'] != null && taggedbar['name'] != "undefined") {
			$('#photo_tagged_bar').append('<div class="mobile_hr"></div><p>Bar Tag: <a href="./bar.html" rel="external" onClick="barClicked(\'' + taggedbar['pk'] + '\')">' + taggedbar['name'] + '</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onClick="removeBarTag(\'' + selectedphoto + '\')"><img src="./images/mobile/deleteicon.gif" /></a></p>');
		} else {
			$('#photo_tagged_bar').append('<div class="mobile_hr"></div><p><a href="./phototagbar.html" rel="external">Tag a Bar!</a></p>');
		}

		// add tagged beers to template
		if(parsed_data['beerstags'].length > 0) {
			var beertagsstring = '(';
			$.each(parsed_data['beerstags'], function() {
				beertagsstring += this['beerpk'] + ',';
			});
			// remove last comma from string
			beertagsstring = beertagsstring.slice(0,beertagsstring.length-1);
			// add final right parenthesis to string
			beertagsstring += ')';
			$('#photo_beers_holder').append('<div class="mobile_hr"></div><p>Beer Tags:</p>');
			BEERPKS = beertagsstring;
			// get filesystem access for beer images
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onBeerFSSuccess, errorHandler);
		} else {
			$('#photo_beers_holder').append('<div class="mobile_hr"></div><p><a href="./phototagbeer.html" rel="external">Tag a Beer!</a></p>');
		}

		// add tagged drinks to template
		if(parsed_data['drinkstags'].length > 0) {
			var drinktagsstring = '(';
			$.each(parsed_data['drinkstags'], function() {
				drinktagsstring += this['drinkpk'] + ',';
			});
			// remove last comma from string
			drinktagsstring = drinktagsstring.slice(0,drinktagsstring.length-1);
			// add final right parenthesis to string
			drinktagsstring += ')';
			$('#photo_drinks_holder').append('<div class="mobile_hr"></div><p>Drink Tags:</p>');
			DRINKPKS = drinktagsstring;
			// get filesystem access for drink images
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onDrinkFSSuccess, errorHandler);
		} else {
			$('#photo_drinks_holder').append('<div class="mobile_hr"></div><p><a href="./phototagdrink.html" rel="external">Tag a Drink!</a></p>');
		}
	});
}

// got filesystem access for beer images
//
function onBeerFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/beers",{create:true},gotBeersDir,onError);
}

// got filesystem access for drink images
//
function onDrinkFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/drinks",{create:true},gotDrinksDir,onError);
}

// got filesystem directory for beer images
//
function gotBeersDir(d){
	BEERSDATADIR = d;
	// query the database to get beer image names
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryBeersDB, errorCB, function(){});
}

// got filesystem directory for drink images
//
function gotDrinksDir(d) {
	DRINKSDATADIR = d;
	// query the database to get drink image names
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryDrinksDB, errorCB, function(){});
}

// Query the beers database
//
function queryBeersDB(tx) {
    tx.executeSql('SELECT * FROM beers WHERE id IN ' + BEERPKS, [], queryBeersSuccess, errorCB);
}

// Query the drinks database
//
function queryDrinksDB(tx) {
    tx.executeSql('SELECT * FROM drinks WHERE id IN ' + DRINKPKS, [], queryDrinksSuccess, errorCB);
}

// beers database query success callback
//
function queryBeersSuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        addTaggedBeer(beer.imagename, beer.imageurl, beer.id);
	}
}

// drinks database query success callback
//
function queryDrinksSuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var drink = results.rows.item(i);
        addTaggedDrink(drink.imagename, drink.imageurl, drink.id);
	}
}

// add a beer to the template
//
function addTaggedBeer(imagename, imageurl, id) {
	// get beer files
	BEERSDATADIR.getFile(imagename, {create: false}, function(file){gotBeerFile(file, id);},function(){noBeerFile(imageurl, id);});
}

// add a drink to the template
//
function addTaggedDrink(imagename, imageurl, id) {
	// get drink files
	DRINKSDATADIR.getFile(imagename, {create: false}, function(file){gotDrinkFile(file, id);},function(){noDrinkFile(imageurl, id);});
}

// add a beer to the tagged beer list in the template
//
function gotBeerFile(fileEntry, id) {
	$('#photo_beers_tags_ul').append('<li><img src="' + fileEntry.fullPath + '" /><p><a href="#" onClick="removeBeerTag(\'' + id + '\')"><img src="./images/mobile/deleteicon.gif" /></a></p></li>');
}

// add a drink to the tagged drink list in the template
//
function gotDrinkFile(fileEntry, id) {
	$('#photo_drinks_tags_ul').append('<li><img src="' + fileEntry.fullPath + '" /><p><a href="#" onClick="removeDrinkTag(\'' + id + '\')"><img src="./images/mobile/deleteicon.gif" /></a></p></li>');
}

// get thumbnail for a beer
//
function noBeerFile(imageurl, id) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = BEERSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#photo_beers_tags_ul').append('<li><img src="' + fileEntry.fullPath + '" /><p><a href="#" onClick="removeBeerTag(\'' + id + '\')"><img src="./images/mobile/deleteicon.gif" /></a></p></li>');}, null);
}

// get thumbnail for a drink
//
function noDrinkFile(imageurl, id) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DRINKSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#photo_drinks_tags_ul').append('<li><img src="' + fileEntry.fullPath + '" /><p><a href="#" onClick="removeDrinkTag(\'' + id + '\')"><img src="./images/mobile/deleteicon.gif" /></a></p></li>');}, null);
}



function onError(e) {
	alert('error: ' + e.message);
}

// Transaction error callback
//
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
    alert("Error is: "+err.message);
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
      msg = 'Unknown Error';
      break;
  };
  alert('Error: ' + msg);
}