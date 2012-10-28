// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variable to hold the file system path to save the images
var DATADIR;

var drinkimagename;
var drinkimageurl;

// Cordova is ready
//
function onDeviceReady() {
	// make sure the drinks database has been created first, if not redirect to drinksmain.html to create it
	if (drinksdbCreated != 1) {
		alert('Drinks database must be created before viewing a drink page.  Redirecting you to create the drinks database');
		window.location.href="drinksmain.html";
	}
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    db.transaction(queryDB, errorCB, function(){});
}

function onFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/drinks",{create:true},gotDir,onError);
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

function onError(e) {
	alert('error: ' + e.message);
}

function gotDir(d){
	DATADIR = d;
	d.getFile(drinkimagename, {create: false}, gotFile, noFile);
}

function gotFile(fileEntry) {
	$('#beer_image_img').attr("src", fileEntry.fullPath);
	
}

function noFile() {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DATADIR.fullPath + "/" + drinkimageurl.substring(drinkimageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + drinkimageurl, dlPath, function(entry) {$('#beer_image_img').attr("src", entry.fullPath);}, null);
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
    tx.executeSql('SELECT * FROM drinks', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
	var len = results.rows.length;
	var randomid = Math.floor(Math.random() * len) + 1;
	var drink = results.rows.item(randomid);
	// add the selected drink name to the page title
	$('#page_title').append(drink.name.toUpperCase());
	getFavoritesAndPhotos(drink.id);
	drinkimagename = drink.imagename;
	drinkimageurl = drink.imageurl;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, errorHandler);
    $('#singleDrink_float_left').append('<p class="drink_glass_title">Name:</p><p class="drink_name">' + drink.name + '</p>');
	$('#singleDrink_float_left').append('<p class="drink_glass_title">Glass:</p><p class="drink_name">' + drink.glass + '</p>');
	$('#singleDrink_float_left').append('<p class="drink_glass_title">Type:</p><p class="drink_name">' + drink.type + '</p>');
}

//
// Functions to get favorite people and recent images
//
function getFavoritesAndPhotos(selecteddrink) {
	$.get("http://nationwidebarcrawl.com/mobilenative/drinks/pk/" + selecteddrink + "/", function(response) {
		var parsed_data = $.parseJSON(response);
		if(parsed_data['drinkphotos'].length > 0) {
			$('#drink_photos_holder').append('<div class="mobile_hr"></div><h1>Recently Tagged Photos:</h1>');
		}
		$.each(parsed_data['drinkphotos'], function() {
			$('#drink_photos').append('<li><img src="http://nationwidebarcrawl.com' + this['imageurl'] + '" /></li>');
		});
		if(parsed_data['members'].length > 0) {
			$('#drink_members_holder').append('<div class="mobile_hr"></div><h1>Favorite Drink For:</h1>');
		}
		$.each(parsed_data['members'], function() {
			$('#drink_members').append('<li><img src="http://nationwidebarcrawl.com' + this['profileimage'] + '" /></li>');
		});
	});
}