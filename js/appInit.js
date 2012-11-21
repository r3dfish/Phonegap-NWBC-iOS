// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variable to pass favorite beers and drinks from db to filesystem
var BEERPK;
var DRINKPK;

// variable to hold filesystem directory for beers and drinks
var BEERSDATADIR;
var DRINKSDATADIR;

// Cordova is ready
//
function onDeviceReady() {
	// make sure the beers database has been created first, if not redirect to beersmain.html to create it
	if (dbCreated != 1) {
		alert('Beers database must be created before using the app, click OK to create the Beers Database');
		window.location.href="beersmain.html";
	} else {
	
		// make sure the drinks database has been created first, if not redirect to drinksmain.html to create it
		if (drinksdbCreated != 1) {
			alert('Drinks database must be created before using the app, click OK to create the Drinks Database');
			window.location.href="drinksmain.html";
		}
	}
	
	// get the app init info from the server
	$.get("http://nationwidebarcrawl.com/mobilenative/appinit/", function(response) {
		var parsed_data = $.parseJSON(response);
			
		// If the user is not authenticated
		if (parsed_data[0].status == "0") {
			localStorage.setItem("isAuthenticated", "0");
		}
		
		// User is authenticated - store profile information in browser
		if (parsed_data[0].status == "1") {
			localStorage.setItem("isAuthenticated", "1");
			localStorage.setItem("profileUsername", parsed_data[0].username);
			localStorage.setItem("profilePk", parsed_data[0].pk);
			localStorage.setItem("profileFavBeer", parsed_data[0].favbeer);
			localStorage.setItem("profileFavBeerPk", parsed_data[0].favbeerpk);
			localStorage.setItem("profileFavBeers", parsed_data[0].favbeers);
			localStorage.setItem("profileFavDrink", parsed_data[0].favdrink);
			localStorage.setItem("profileFavDrinkPk", parsed_data[0].favdrinkpk);
			localStorage.setItem("profileFavDrinks", parsed_data[0].favdrinks);
			localStorage.setItem("profileFavBar", parsed_data[0].favbar);
			localStorage.setItem("profileFavBarPk", parsed_data[0].favbarpk);
			localStorage.setItem("profileFavDest", parsed_data[0].favdest);
			localStorage.setItem("profileFavDestPk", parsed_data[0].favdestpk);
			localStorage.setItem("profileFavDestSlug", parsed_data[0].favdestslug);
			localStorage.setItem("profileImage", parsed_data[0].image);
			
			// if not set, set initial slot machine values
			if (localStorage.getItem("slotdest") == null) {
				localStorage.setItem("slotdest", parsed_data[0].favdest);
				localStorage.setItem("slotdestslug", parsed_data[0].favdestslug);
			}
			
			// if not set, set initial drink specials values
			if (localStorage.getItem("specialsdest") == null) {
				localStorage.setItem("specialsdest", parsed_data[0].favdest);
				localStorage.setItem("specialsdestslug", parsed_data[0].favdestslug);
			}
			
			// if not set, set initial chosen destination
			if (localStorage.getItem("chosendest") == null) {
				localStorage.setItem("chosendest", parsed_data[0].favdest);
			}
			if (localStorage.getItem("chosendestslug") == null) {
				localStorage.setItem("chosendestslug", parsed_data[0].favdestslug);
			}
		}
					
		// fill in slot machine info
		if (localStorage.getItem("slotdest") == null) {
			$('#slot_title').append('<p><a href="./slotstates.html">Choose Destination to Spin for</a></p>');
		} else {
			$('#slot_title').append('<p>Spinning for <a href="./slotstates.html">' + localStorage.getItem("slotdest") + '</a></p>');
		}
		
		// fill in specials info
		if (localStorage.getItem("specialsdest") == null) {
			$('#specials_title').append('<p><a href="./specialsstates.html">Choose a Destination for Specials</a></p>');
		} else {
			$('#specials_title').append('<p>Specials for <a href="./specialsstates.html">' + localStorage.getItem("specialsdest") + '</a></p>');
		}
	});
}

// fill in the beer image for the slot machine
//
function fillInSlotBeer(beerpk) {
	// set global var to hold beer pk to get image from filesystem
	BEERPK = beerpk;
		
	// get filesystem access for beer images
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSlotBeerFSSuccess, errorHandler);
}

// fill in the drink image for the slot machine
//
function fillInSlotDrink(drinkpk) {
	// set global var to hold drink pk to get image from filesystem
	DRINKPK = drinkpk;
	
	// get filesystem access for beer images
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSlotDrinkFSSuccess, errorHandler);
}

// got filesystem access for beer images
//
function onSlotBeerFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/beers",{create:true},gotSlotBeersDir,onError);
}

// got filesystem access for drink images
//
function onSlotDrinkFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/drinks",{create:true},gotSlotDrinksDir,onError);
}

// got filesystem directory for beer images
//
function gotSlotBeersDir(d){
	BEERSDATADIR = d;
	// query the database to get beer image names
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(querySlotBeersDB, errorCB, function(){});
}

// got filesystem directory for drink images
//
function gotSlotDrinksDir(d){
	DRINKSDATADIR = d;
	// query the database to get drink image names
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(querySlotDrinksDB, errorCB, function(){});
}

// Query the beers database
//
function querySlotBeersDB(tx) {
    tx.executeSql('SELECT * FROM beers WHERE id = ' + BEERPK, [], querySlotBeersSuccess, errorCB);
}

// Query the drinks database
//
function querySlotDrinksDB(tx) {
    tx.executeSql('SELECT * FROM drinks WHERE id = ' + DRINKPK, [], querySlotDrinksSuccess, errorCB);
}

// beers database query success callback
//
function querySlotBeersSuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        addSlotFavoriteBeer(beer.imagename, beer.imageurl, beer.id);
	}
}

// drinks database query success callback
//
function querySlotDrinksSuccess(tx, results) {
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var drink = results.rows.item(i);
        addSlotFavoriteDrink(drink.imagename, drink.imageurl, drink.id);
	}
}

// add a beer to the template
//
function addSlotFavoriteBeer(imagename, imageurl, id) {
	// get beer files
	BEERSDATADIR.getFile(imagename, {create: false}, function(fileEntry){gotSlotBeerFile(fileEntry, id);}, function(){noSlotBeerFile(imageurl, id);});
}

// add a drink to the template
//
function addSlotFavoriteDrink(imagename, imageurl, id) {
	// get drink files
	DRINKSDATADIR.getFile(imagename, {create: false}, function(fileEntry){gotSlotDrinkFile(fileEntry, id);}, function(){noSlotDrinkFile(imageurl, id);});
}

// add a beer to the favorite beer list in the template
//
function gotSlotBeerFile(fileEntry, id) {
	$('#slot_beer_image').attr("src", fileEntry.fullPath);
	// if beer is already linked, remove link
	if($('#beerlink').length) {
		$('#slot_beer_image').unwrap();
	}
	// add beer link to beer image
	$('#slot_beer_image').wrap('<a id="beerlink" href="./beer.html" onClick="beerClicked(' + id + ')"></a>');
}

// add a drink to the favorite drink list in the template
//
function gotSlotDrinkFile(fileEntry, id) {
	$('#slot_drink_image').attr("src", fileEntry.fullPath);
	// if drink is already linked, remove link
	if($('#drinklink').length) {
		$('#slot_drink_image').unwrap();
	}
	// add drink link to drink image
	$('#slot_drink_image').wrap('<a id="drinklink" href="./drink.html" onClick="drinkClicked(' + id + ')"></a>');
}

// get thumbnail for a beer
//
function noSlotBeerFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = BEERSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#slot_beer_image').attr("src", fileEntry.fullPath);}, null);
	$('#slot_beer_image').wrap('<a id="beerlink" href="./beer.html" onClick="beerClicked(' + id + ')"></a>');
}

// get thumbnail for a drink
//
function noSlotDrinkFile(imageurl) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DRINKSDATADIR.fullPath + "/" + imageurl.substring(imageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageurl, dlPath, function(fileEntry) {$('#slot_drink_image').attr("src", fileEntry.fullPath);}, null);
	$('#slot_drink_image').wrap('<a id="drinklink" href="./drink.html" onClick="drinkClicked(' + id + ')"></a>');
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