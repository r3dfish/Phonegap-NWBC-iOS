// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// Cordova is ready
//
function onDeviceReady() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, errorHandler);
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (drinksdbCreated != 1) {
    	$.mobile.loading( 'show', { theme: "a", text: "Loading Drinks Database", textVisible: true});
        db.transaction(populateDB, errorCB, successCB);
    }
}

function onFSSuccess(fileSystem) {
	fileSystem.root.getDirectory("NWBC",{create:true},null,null);
	fileSystem.root.getDirectory("NWBC/drinks",{create:true},null,errorHandler);
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
    tx.executeSql('DROP TABLE IF EXISTS drinks');
    tx.executeSql('CREATE TABLE IF NOT EXISTS drinks(id INTEGER, name, glass, type, slug, imageurl, imagename)');
	$.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/DrinksFinalList/", function(response) {
          var parsed_data = $.parseJSON(response);
          for(var i=0;i<parsed_data.length;i++){
                 var drink = parsed_data[i];
                 var imagename = drink['image'];
                 imagename = imagename.substring(imagename.lastIndexOf('/')+1);
                 tx.executeSql('INSERT INTO drinks (id, name, glass, type, slug, imageurl, imagename) VALUES (' + drink['pk'] + ', "' + drink['name'] + '", "' + drink['glass'] + '", "' + drink['type'] + '", "' + drink['slug'] + '", "' + drink['image'] + '", "' + imagename + '")');
          }
          localStorage.setItem("drinksdbCreated", "1");
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
	$.mobile.loading( 'hide' );
}