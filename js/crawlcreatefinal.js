// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the bars database has been created
var crawlfirststop = window.localStorage.getItem("crawlfirststop");

// Cordova is ready
//
function onDeviceReady() {
	var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    db.transaction(queryDB, errorCB, function(){});
}

function onError(e) {
	alert('error: ' + e.message);
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
    tx.executeSql('SELECT * FROM bars WHERE id = ?', [crawlfirststop], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var bar = results.rows.item(0);
	$('#crawl_destination').append(bar.destination);
	$('#crawl_first_stop').append(bar.name);
	$("#id_barpk").val(bar.id);
}
