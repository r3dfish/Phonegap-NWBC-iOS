// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the beers database has been created
var dbCreated = window.localStorage.getItem("dbCreated");

// Cordova is ready
//
function onDeviceReady() {
	$.mobile.loading( 'show', { theme: "a", text: "Loading Beers Database", textVisible: true});
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('Beers database not found, redirecting to the beers page to create the database.');
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
    tx.executeSql('SELECT * FROM beers WHERE locality=?', ['Domestic'], querySuccess, errorCB);
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
	$.mobile.loading( 'hide' );
}