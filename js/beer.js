// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var selectedbeer = window.localStorage.getItem("chosenbeer");

// variable to hold the file system path to save the images
var DATADIR;

var beerimagename;
var beerimageurl;

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    db.transaction(queryDB, errorCB, function(){});
    getFavoritesAndPhotos();
}

function onFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:false},function(){},function(){});
	fileSystem.root.getDirectory("NWBC/beers",{create:false},gotDir,onError);
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
	d.getFile(beerimagename, {create: false}, gotFile, noFile);
}

function gotFile(fileEntry) {
	$('#beer_image_img').attr("src", fileEntry.fullPath);
	
}

function noFile() {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DATADIR.fullPath + "/" + beerimageurl.substring(beerimageurl.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + beerimageurl, dlPath, function(entry) {$('#beer_image_img').attr("src", entry.fullPath);}, null);
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
    tx.executeSql('SELECT * FROM beers WHERE id = ?', [selectedbeer], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
	var beer = results.rows.item(0);
	// add the selected beer name to the page title
	$('#page_title').append(beer.name.toUpperCase());
	beerimagename = beer.imagename;
	beerimageurl = beer.imageurl;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, errorHandler);
    $('#singleDrink_float_left').append('<p class="drink_glass_title">Name:</p><p class="drink_name">' + beer.name + '</p>');
	$('#singleDrink_float_left').append('<p class="drink_glass_title">Brewery:</p><p class="drink_name"><a href="./beersbrewery.html" data-transition="slide" rel="external" onClick="breweryClicked(\'' + beer.brewerypk + '\')">' + beer.brewery + '</a></p>');
	$('#singleDrink_float_left').append('<p class="drink_glass_title">Locality:</p><p class="drink_name">');
	if (beer.locality == "Domestic") {
		$('#singleDrink_float_left').append('<a href="./beersdomestics.html" data-transition="slide" rel="external">' + beer.locality + '</a></p>');
	} else {
		$('#singleDrink_float_left').append('<a href="./beersimports.html" data-transition="slide" rel="external">' + beer.locality + '</a></p>');
	}
	$('#singleDrink_float_left').append('<p class="drink_glass_title">Type:</p><p class="drink_name"><a href="./beerstype.html" data-transition="slide" rel="external" onClick="beerstypeClicked(\'' + beer.type + '\')">' + beer.type + '</a></p>');
}

//
// Functions to get favorite people and recent images
//
function getFavoritesAndPhotos() {
	$.get("http://nationwidebarcrawl.com/mobilenative/beers/pk/" + selectedbeer + "/", function(response) {
		var parsed_data = $.parseJSON(response);
		if(parsed_data['taggedphotos'].length > 0) {
			$('#tagged_photos_holder').append('<div class="mobile_hr"></div><h1>Recently Tagged Photos:</h1>');
		}
		$.each(parsed_data['taggedphotos'], function() {
			$('#beer_photos').append('<li><img src="http://nationwidebarcrawl.com' + this['imageurl'] + '" /></li>');
		});
		if(parsed_data['members'].length > 0) {
			$('#favorite_members_holder').append('<div class="mobile_hr"></div><h1>Favorite Beer For:</h1>');
		}
		$.each(parsed_data['members'], function() {
			$('#beer_members').append('<li><img src="http://nationwidebarcrawl.com' + this['profileimage'] + '" /></li>');
		});
	});
}