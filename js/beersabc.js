// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = window.localStorage.getItem("dbCreated");

// Cordova is ready
//
function onDeviceReady() {
	$.mobile.loading( 'show', { theme: "a", text: "Loading Beers", textVisible: true});
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('beersabc: database not found');
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
    tx.executeSql('SELECT * FROM beers', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        $('#beers_abc_ul').append('<li><a href="./beer.html" data-transition="slide" rel="external" onClick="beerClicked(\'' + beer.id + '\')">' + beer.name + '</a></li>');
    }
    $('#beers_abc_ul').append().trigger('create');
	$('#beers_abc_ul').listview('refresh');
	$.mobile.loading( 'hide' );
}