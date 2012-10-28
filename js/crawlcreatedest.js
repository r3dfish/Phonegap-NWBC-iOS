// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the bars database has been created
var barsDbCreated = localStorage.getItem("barsDbCreated");


var barVarString;
var selecteddest = window.localStorage.getItem("chosendest");

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    db.transaction(queryDB, errorCB, function(){});
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
    tx.executeSql('SELECT name, id FROM bars WHERE destination = ?', [selecteddest], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var bar = results.rows.item(i);
        $('#state_list_ul').append('<li><a href="./crawlcreatefinal.html" data-transition="slide" rel="external" onClick="barClicked(\'' + bar.id + '\')">' + bar.name + '</a></li>');
    }
    $('#state_list_ul').append().trigger('create');
	$('#state_list_ul').listview('refresh');
}