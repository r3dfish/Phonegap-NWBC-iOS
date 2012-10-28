// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// Check Login Status
//
// variable to hold if the user is logged in or not
var isAuthenticated = localStorage.getItem("isAuthenticated");
// check if the user is authenticated
$(document).ready(function() {
	// make sure the user is authenticated
	if (isAuthenticated != "1") {
		// redirect to login.html
		window.location.href="login.html";
	}
});

// crawls db created variable
var crawlsdbCreated = localStorage.getItem("crawlsdbCreated");

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (crawlsdbCreated != 1) {
        db.transaction(populateDB, errorCB, successCB);
    } else {
    	db.transaction(queryDB, errorCB, null);
    }
}

// Populate the database 
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS crawls');
    tx.executeSql('CREATE TABLE IF NOT EXISTS crawls(id, destination, description, creator, title, date, type, attending)');
	$.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/crawls/", function(response) {
          var parsed_data = $.parseJSON(response);
          for(var i=0;i<parsed_data.length;i++){
              var crawl = parsed_data[i];
              tx.executeSql('INSERT INTO crawls (id, destination, description, creator, title, date, type, attending) VALUES ("' + crawl['pk'] + '", "' + crawl['destination'] + '", "' + crawl['description'] + '", "' + crawl['creator'] + '", "' + crawl['title'] + '", "' + crawl['date'] + '", "' + crawl['type'] + '", "' + crawl['attending'] + '")');
          }
          localStorage.setItem("crawlsdbCreated", "1");
    });
}

// Query the database
//
function queryDB(tx) {
	alert('queryDB called');
    tx.executeSql('SELECT * FROM crawls', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
	alert('querySuccess called');
	var len = results.rows.length;
    for (var i=0; i<len; i++){
        var crawl = results.rows.item(i);
		$('#mobile_crawls_ul').append('<li><p class="crawls_list_name">' + crawl.title + '</p><p class="crawls_list_date">' + crawl.date + '</p></li>');
	}
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
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
	db.transaction(queryDB, errorCB);
}