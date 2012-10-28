// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = localStorage.getItem("dbCreated");
var barsDbCreated = localStorage.getItem("barsDbCreated");
var barVarString;
var selectedstate = window.localStorage.getItem("chosenstate");
selectedstate = String(selectedstate);
var barsDbs = localStorage.getItem("barsDbs");
barsDbs = String(barsDbs);

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDBV4", "1.0", "Beers Database", 500000);
    // check if barsDbs is empty
    if (barsDbs && barsDbs != "") {
    	if (barsDbs.search(selectedstate)!=-1) {
    		db.transaction(queryDB, errorCB, function(){});
    	} else {
    		$.mobile.loading( 'show', { theme: "a", text: "Loading Bars Database", textVisible: true});
    		db.transaction(populateDB, errorCB, successCB);
    	}
    } else {
    	$.mobile.loading( 'show', { theme: "a", text: "Loading Bars Database", textVisible: true});
    	db.transaction(populateDB, errorCB, successCB);
    }
}

// Populate the database 
//
function populateDB(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS bars');
    tx.executeSql('CREATE TABLE IF NOT EXISTS bars(id INTEGER, name, slug, location, address, destination, destination_slug, phone, city, state, statekey, website)');
	$.ajaxSetup({async: false});
    $.get("http://nationwidebarcrawl.com/mobilenative/barstatelist/" + selectedstate + "/", function(response) {
          var parsed_data = $.parseJSON(response);
          var len = parsed_data.length
          var remaining_length = parsed_data.length;
          var begin_counter = 0;
          while (remaining_length > 0) {
          	addRowsToTable(parsed_data.slice(begin_counter, begin_counter+500), tx);
          	begin_counter += 500;
          	remaining_length -= 500;
                 //tx.executeSql('INSERT INTO bars (id, name, slug, location, address, destination, destination_slug, phone, city, state) VALUES (' + bar['pk'] + ', "' + bar['name'] + '", "' + bar['slug'] + '", "' + beer['location'] + '", "' + beer['brewery_pk'] + '", "' + beer['type'] + '", "' + beer['locality'] + '")');
          }
          localStorage.setItem("dbCreated", "1");
          localStorage.setItem("barsDbCreated", "1");
		  var donedbs = localStorage.getItem("barsDbs");
		  donedbs += ", " + selectedstate;
		  localStorage.setItem("barsDbs", donedbs);
    });
}

// Add rows to the table
//
function addRowsToTable(bars, tx) {
	for(var i=0;i<bars.length;i++){
		var bar = bars[i];
		barVarString = [bar['pk'], bar['name'], bar['slug'], bar['location'], bar['address'], bar['destination'], bar['destination_slug'], bar['phone'], bar['city'], bar['state'], bar['statekey'], bar['website']];
		tx.executeSql('INSERT INTO bars (id, name, slug, location, address, destination, destination_slug, phone, city, state, statekey, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', barVarString);
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
	$.mobile.loading( 'hide' );
}

// Query the database
//
function queryDB(tx) {
    tx.executeSql('SELECT DISTINCT destination, city, destination_slug FROM bars WHERE statekey = ?', [selectedstate], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        var bar = results.rows.item(i);
        $('#state_list_ul').append('<li><a href="./crawlspublicdest.html" data-transition="slide" rel="external" onClick="destClicked(\'' + bar.destination_slug + '\')">' + bar.destination + ' - ' + bar.city + '</a></li>');
    }
    $('#state_list_ul').append().trigger('create');
	$('#state_list_ul').listview('refresh');
}