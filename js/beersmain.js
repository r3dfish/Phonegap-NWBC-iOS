// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to hold the filesystem for global access
var fs = null;

// variable to hold the file system path to save the images
var DATADIR;

// Cordova is ready
//
function onDeviceReady() {
	//get the filesystem for writing images
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, errorHandler);
}

function onFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},null,null);
	fileSystem.root.getDirectory("NWBC/beers",{create:true},gotDir,onError);
}

function onError(e) {
	alert('error: ' + e.message);
}

function gotDir(d){
	DATADIR = d;
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated != 1) {
    	$.mobile.loading( 'show', { theme: "a", text: "Loading Beers Database", textVisible: true});
        db.transaction(populateDB, errorCB, successCB);
    }
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

// Populate the database 
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS beers');
    tx.executeSql('CREATE TABLE IF NOT EXISTS beers(id INTEGER, name, slug, brewery, brewerypk, type, locality, imagename, imageurl, isPopular)');
    $.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/BeersFinalList/", function(response) {
          var parsed_data = $.parseJSON(response);
          for(var i=0;i<parsed_data.length;i++){
                 var beer = parsed_data[i];
                 var imagename = beer['image'];
                 imagename = imagename.substring(imagename.lastIndexOf('/')+1);
                 if (beer['isPopular']) {downloadThumbnail(beer['image']);}
                 //tx.executeSql('INSERT INTO beers (id, name, slug, brewery, brewerypk, type, locality, imagename, imageurl, isPopular) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [beer['pk'], beer['name'], beer['slug'], beer['brewery'], beer['brewery_pk'], beer['type'], beer['locality'], imagename, beer['image'], beer['isPopular']]);
                 tx.executeSql('INSERT INTO beers (id, name, slug, brewery, brewerypk, type, locality, imagename, imageurl, isPopular) VALUES (' + beer['pk'] + ', "' + beer['name'] + '", "' + beer['slug'] + '", "' + beer['brewery'] + '", "' + beer['brewery_pk'] + '", "' + beer['type'] + '", "' + beer['locality'] + '", "' + imagename + '", "' + beer['image'] + '", "' + beer['isPopular'] + '")');
          }
          localStorage.setItem("dbCreated", "1");
    });
}

// Transaction error callback
//
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
    alert("Error is: "+err.message);
}

// Transaction success callback
//
function successCB() {
	//$.mobile.hidePageLoadingMsg();
	$.mobile.loading( 'hide' );
}

// Download the thumbnail for an image
//
function downloadThumbnail(imageURL) {
	// create fileTransfer object
	var ft = new FileTransfer();
	var dlPath = DATADIR.fullPath + "/" + imageURL.substring(imageURL.lastIndexOf('/')+1);
	ft.download("http://nationwidebarcrawl.com" + imageURL, dlPath, function(){}, function(){});
}