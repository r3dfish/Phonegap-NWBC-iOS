// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = window.localStorage.getItem("dbCreated");

// variable that holds what type of beer is selected
var chosentype = window.localStorage.getItem("chosentype");

// Cordova is ready
//
function onDeviceReady() {
	// add the selected beer type to the page title
	$('#page_title').append(chosentype.toUpperCase());
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('beerstype: database not found, please click the Beers button on the main screen to create the database.');
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
    tx.executeSql('SELECT * FROM beers WHERE type=?', [chosentype], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        $('#beers_brewery_beer_ul').append('<li><a href="./beer.html" data-transition="slide" rel="external" onClick="beerClicked(\'' + beer.id + '\')">' + beer.name + '</a></li>');
    }
    $('#beers_brewery_beer_ul').append().trigger('create');
	$('#beers_brewery_beer_ul').listview('refresh');
}