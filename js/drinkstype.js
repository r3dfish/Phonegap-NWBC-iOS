// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var drinksdbCreated = window.localStorage.getItem("drinksdbCreated");

// variable to hold the chosen drink type
var chosendrinktype = window.localStorage.getItem("chosendrinktype");

// Cordova is ready
//
function onDeviceReady() {
	// add the selected beer name to the page title
	$('#page_title').append(chosendrinktype.toUpperCase() + "S");
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (drinksdbCreated == 1) {
    	db.transaction(queryDB, errorCB);
    } else {
    	alert('drinkstype: database not found, please click the Drinks button on the main screen to create the database.');
    	window.localStorage.setItem("drinksdbCreated", 0);
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
    tx.executeSql('SELECT * FROM drinks WHERE type=?', [chosendrinktype], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var beer = results.rows.item(i);
        $('#beers_brewery_beer_ul').append('<li><a href="./drink.html" data-transition="slide" rel="external" onClick="drinkClicked(\'' + beer.id + '\')">' + beer.name + '</a></li>');
    }
    $('#beers_brewery_beer_ul').append().trigger('create');
	$('#beers_brewery_beer_ul').listview('refresh');
}