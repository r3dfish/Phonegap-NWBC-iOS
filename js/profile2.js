// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variable to pass favorite beers and drinks from db to filesystem
var BEERPKS;
var DRINKPKS;

// variable to hold filesystem directory for beers and drinks
var BEERSDATADIR;
var DRINKSDATADIR;

// variable to hold if the user is logged in or not
var isAuthenticated = localStorage.getItem("isAuthenticated");

// Cordova is ready
//
function onDeviceReady() {
	// make sure the user is authenticated
	if (isAuthenticated != "1") {
		// redirect to login.html
		window.location.href="login.html";
	}

	// make sure the beers database has been created first, if not redirect to beersmain.html to create it
	if (dbCreated != 1) {
		alert('Beers database must be created before viewing the profile page.  Redirecting you to create the beers database');
		window.location.href="beersmain.html";
	}
	
	// make sure the drinks database has been created first, if not redirect to drinksmain.html to create it
	if (drinksdbCreated != 1) {
		alert('Drinks database must be created before viewing the profile page.  Redirecting you to create the drinks database');
		window.location.href="drinksmain.html";
	}
	
	// get the profile data from the server, append to the template, pass the favoritebeer and favoritedrink pks along for filesystem access
	$.get("http://nationwidebarcrawl.com/mobilenative/profile/", function(response) {
		var parsed_data = $.parseJSON(response);
		$('#profile_info').append('<p id="profile_name">' + parsed_data['username'] + '</p><p>Crawl Destination: ' + parsed_data['favdest'] + '</p><p>Favorite Beer: ' + parsed_data['favbeer'] + '</p><p>Favorite Drink: ' + parsed_data['favdrink'] + '</p><p>Favorite Bar: ' + parsed_data['favbar'] + '</p>');
		$('#profile_image_holder').append('<img id="profile_user_avatar" src="http://nationwidebarcrawl.com' + parsed_data['image'] + '" />');
		$('#beer_score').append(parsed_data['beerscore']);
		$('#drink_score').append(parsed_data['drinkscore']);
		$('#total_score').append(parsed_data['memberscore']);
		fillInProfile(parsed_data['favbeers'], parsed_data['favdrinks']);
	});
	
	// open the database
	//var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    //if (profiledbCreated != 1) {
    //    db.transaction(populateDB, errorCB, successCB);
    //} else {
    //	db.transaction(queryDB, errorCB, function(){});
    //}
}

// Query the success callback
//
function fillInProfile(favbeerpks, favdrinkpks) {

	// get users top 5 beers
	var beertagsstring = '(' + favbeerpks;
	// remove last comma from string
	beertagsstring = beertagsstring.slice(0,beertagsstring.length-1);
	// add final right parenthesis to string
	beertagsstring += ')';
	BEERPKS = beertagsstring;
	
	// if there are beers, add them to the template
	if(BEERPKS != ")") {
		// get filesystem access for beer images
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onBeerFSSuccess, errorHandler);
	}
	
	// fill in empty beers if beers count is less than 5
	if (BEERPKS.split(/,/g).length - 1 < 5) {
		var x = 0;
		if (BEERPKS == ")"){
			x=0;
		} else {
			x=BEERPKS.split(/,/g).length;
		}
		for (x; x<5; x++) {
			$('#mobile_profile_beers_ul').append('<li><a href="./profileaddbeer.html" rel="external"><img src="./images/mobile/BeerEmpty.png" /></a></li>');
		}
	}
	
	// get users top 3 drinks
	var drinktagsstring = '(' + favdrinkpks;
	// remove last comma from string
	drinktagsstring = drinktagsstring.slice(0,drinktagsstring.length-1);
	// add final right parenthesis to string
	drinktagsstring += ')';
	DRINKPKS = drinktagsstring;
	
	// if favorite drinks, add them to template
	if(DRINKPKS != ")") {
		// get filesystem access for beer images
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onDrinkFSSuccess, errorHandler);
	}
	// fill in empty drinks if drinks count is less than 3
	if (DRINKPKS.split(/,/g).length - 1 < 3) {
		var y = 0;
		if (DRINKPKS == ")"){
			y=0;
		} else {
			y=DRINKPKS.split(/,/g).length;
		}
		for (y; y<3; y++) {
			$('#mobile_profile_drinks_ul').append('<li><a href="./profileadddrink.html" rel="external"><img src="./images/mobile/DrinkEmpty.png" /></a></li>');
		}
	}
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
function gotDrinksDir(d){
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
        addFavoriteBeer(beer.imagename, beer.imageurl, beer.id);
	}
}

// drinks database query success callback
//
function queryDrinksSuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var drink = results.rows.item(i);
        addFavoriteDrink(drink.imagename, drink.imageurl, drink.id);
	}
}

// add a beer to the template
//
function addFavoriteBeer(imagename, imageurl, id) {
	// get beer files
	BEERSDATADIR.getFile(imagename, {create: false}, gotBeerFile,function(){noBeerFile(imageurl);});
}

// add a drink to the template
//
function addFavoriteDrink(imagename, imageurl, id) {
	// get drink files
	DRINKSDATADIR.getFile(imagename, {create: false}, gotDrinkFile,function(){noDrinkFile(imageurl);});
}

// add a beer to the favorite beer list in the template
//
function gotBeerFile(fileEntry, id) {
	$('#mobile_profile_beers_ul').append('<li><img src="' + fileEntry.fullPath + '" /></li>');
}

// add a drink to the favorite drink list in the template
//
function gotDrinkFile(fileEntry, id) {
	$('#mobile_profile_drinks_ul').append('<li><img src="' + fileEntry.fullPath + '" /></li>');
}

// get thumbnail for a beer
//
function noBeerFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = BEERSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#mobile_profile_beers_ul').append('<li><img src="' + fileEntry.fullPath + '" /></li>');}, null);
}

// get thumbnail for a drink
//
function noDrinkFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DRINKSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#mobile_profile_drinks_ul').append('<li><img src="' + fileEntry.fullPath + '" /></li>');}, null);
}











// Transaction error callback
//
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
    alert("Error is: "+err.message);
}

// filesystem error callback
//
function onError(e) {
	alert('error: ' + e.message);
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