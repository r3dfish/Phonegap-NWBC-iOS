// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the drinks database has been created
var drinksdbCreated = window.localStorage.getItem("dbCreated");

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (drinksdbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('Drinks database not found, redirecting to the drinks page to create the database.');
    	window.location.href="drinksmain.html";
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
    tx.executeSql('SELECT * FROM drinks', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        $('#beers_abc_ul').append('<li><a href="#" data-transition="slide" onClick="drinkClicked(\'' + beer.id + '\')">' + beer.name + '</a></li>');
    }
    $('#beers_abc_ul').append().trigger('create');
	$('#beers_abc_ul').listview('refresh');
}