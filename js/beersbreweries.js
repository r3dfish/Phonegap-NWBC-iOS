// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = window.localStorage.getItem("dbCreated");

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('beersbreweries: database not found, please click the Beers button on the main screen to create the database.');
    	window.localStorage.setItem("dbCreated", 0);
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
    tx.executeSql('SELECT DISTINCT brewery, brewerypk FROM beers', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        $('#beers_breweries_ul').append('<li><a href="./beersbrewery.html" data-transition="slide" rel="external" onClick="breweryClicked(\'' + beer.brewerypk + '\')">' + beer.brewery + '</a></li>');
    }
    $('#beers_breweries_ul').append().trigger('create');
	$('#beers_breweries_ul').listview('refresh');
}