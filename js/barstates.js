// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = localStorage.getItem("dbCreated");
var barsDbCreated = localStorage.getItem("barsDbCreated");
var barVarString;

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    if (dbCreated != 1 || barsDbCreated != 1) {
        db.transaction(populateDB, errorCB, successCB);
    }
}

// Populate the database 
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS bars');
    tx.executeSql('CREATE TABLE IF NOT EXISTS bars(id INTEGER, name, slug, location, address, destination, destination_slug, phone, city, state)');
	$.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/BarsFinalList/", function(response) {
          var parsed_data = $.parseJSON(response);
          var len = parsed_data.length
          alert(parsed_data.length + ' objects parsed');
          var remaining_length = parsed_data.length;
          var begin_counter = 0;
          while (remaining_length > 0) {
          	addRowsToTable(parsed_data.slice(begin_counter, begin_counter+500), tx);
          	begin_counter += 500;
          	remaining_length -= 500;
                 //tx.executeSql('INSERT INTO bars (id, name, slug, location, address, destination, destination_slug, phone, city, state) VALUES (' + bar['pk'] + ', "' + bar['name'] + '", "' + bar['slug'] + '", "' + beer['location'] + '", "' + beer['brewery_pk'] + '", "' + beer['type'] + '", "' + beer['locality'] + '")');
          }
          localStorage.setItem("barsDbCreated", "1");
    });
}

// Add rows to the table
//
function addRowsToTable(bars, tx) {
	alert('addRowsToTable called with ' + bars.length);
	for(var i=0;i<bars.length;i++){
		var bar = bars[i];
		barVarString = [bar['pk'], bar['name'], bar['slug'], bar['location'], bar['address'], bar['destination'], bar['destination_slug'], bar['phone'], bar['city'], bar['state']];
		tx.executeSql('INSERT INTO bars (id, name, slug, location, address, destination, destination_slug, phone, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', barVarString);
		delete bar;
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
	alert('database created successfully');
	db.transaction(queryDB, errorCB);
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT DISTINCT state, FROM bars', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    alert('querydb called with ' + len);
    for (var i=0; i<len; i++){
        var bar = results.rows.item(i);
        $('#state_list_ul').append('<li><a href="./barstate.html" data-transition="slide" rel="external" onClick="stateClicked(\'' + bar.statekey + '\')">' + bar.state + '</a></li>');
    }
    $('#state_list_ul').append().trigger('create');
	$('#state_list_ul').listview('refresh');
}