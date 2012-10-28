// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set if the profile table has already been created
var profiledbCreated = localStorage.getItem("profiledbCreated")

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variable to hold if the user is logged in or not
var isAuthenticated = localStorage.getItem("isAuthenticated");

// check if the user is authenticated
//
$(document).ready(function() {
	// make sure the user is authenticated
	if (isAuthenticated != "1") {
		// redirect to login.html
		window.location.href="login.html";
	}
});

// Cordova is ready
//
function onDeviceReady() {
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
	// open the database
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (profiledbCreated != 1) {
        db.transaction(populateDB, errorCB, successCB);
    } else {
    	db.transaction(queryDB, errorCB, function(){});
    }
}

// Populate the database 
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS profile');
    tx.executeSql('CREATE TABLE IF NOT EXISTS profile(id INTEGER, username, favdest, favdestpk, favbar, favbarpk, favbeer, favbeerpk, favdrink, favdrinkpk, imageurl, imagename, modified, favbeers, favdrinks)');
	$.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/profile/", function(response) {
          var user = $.parseJSON(response);
          var imagename = user['image'];
          imagename = imagename.substring(imagename.lastIndexOf('/')+1);
          tx.executeSql('INSERT INTO profile (id, username, favdest, favdestpk, favbar, favbarpk, favbeer, favbeerpk, favdrink, favdrinkpk, imageurl, imagename, modified, favbeers, favdrinks) VALUES (' + user['pk'] + ', "' + user['username'] + '", "' + user['favdest'] + '", "' + user['favdestpk'] + '", "' + user['favbar'] + '", "' + user['favbarpk'] + '", "' + user['favbeer'] + '", "' + user['favbeerpk'] + '", "' + user['favdrink'] + '", "' + user['favdrinkpk'] + '", "' + user['image'] + '", "' + imagename + '", "' + user['modified'] + '", "' + user['favbeers'] + '", "' + user['favdrinks'] + '")');
          localStorage.setItem("profiledbCreated", "1");
    });
}

// populateDB success callback
//
function successCB() {
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryDB, errorCB, function(){});
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT * FROM profile', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
	var user = results.rows.item(0);
	
	// add user favorite destination info to template
    $('#profile_info').append('<p>Crawl Destination: ' + user['favdest'] + '</p><p><a href="./profilechangedest.html" rel="external">Change Destination</a></p>');
	// add user favorite beer info to template
    $('#profile_info').append('<p>Favorite Beer: ' + user['favbeer'] + '</p><p><a href="./profilechangebeer.html" rel="external">Change Favorite Beer</a></p>');
    // add user favorite drink info to template
    $('#profile_info').append('<p>Favorite Drink: ' + user['favdrink'] + '</p><p><a href="./profilechangedrink.html" rel="external">Change Favorite Drink</a></p>');
    // add user favorite bar info to template
    $('#profile_info').append('<p>Favorite Bar: ' + user['favbar'] + '</p><p><a href="./profilechangebar.html" rel="external">Change Favorite Bar</a></p>');
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