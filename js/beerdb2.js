// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = window.localStorage.getItem("dbCreated");

function onGetDirectoryFail(error) { 
	alert("Error creating directory "+error.code); 
} 

// Cordova is ready
//
function onDeviceReady() {
    var db = window.openDatabase("BEERSDB", "1.0", "Beers Database", 500000);
    if (dbCreated == 1) {
    	db.transaction(populateDB, errorCB, successCB);
    	//db.transaction(queryDB, errorCB);
    } else {
	    db.transaction(populateDB, errorCB, successCB);
	}
}

// Populate the database 
//
function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS beers');
    tx.executeSql('CREATE TABLE IF NOT EXISTS beers(id INTEGER, name, slug, brewery, type, locality)');
    $.get("http://nationwidebarcrawl.com/mobilenative/BeersFinalList/", function(response) {
          var parsed_data = $.parseJSON(response);
          alert('parsed_data length: ' + parsed_data.length);
          for(var i=0;i<parsed_data.length;i++){
                 var beer = parsed_data[i];
                 //downloadPhoto('http://nationwidebarcrawl.com' + beer['image']);
                 tx.executeSql('INSERT INTO beers (id, name, slug, brewery, type, locality) VALUES (?, ?, ?, ?, ?, ?);', [beer['pk'], beer['name'], beer['slug'], beer['brewery'], beer['type'], beer['locality']]);
          }
          window.localStorage.setItem("dbCreated", 1);
    });
}

// Download a Photo and save it to the file system
//
function downloadPhoto(photoURL) {
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(photoURL);
	// filesystem access for images
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onRequestFileSystemSuccess(fileSystem) { 
		alert('requestFileSystem success');
	}, null);
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
        $('#beers_abc_ul').append('<li><a href="./beer.html" rel="external">' + beer.name + '</a></li>');
    }
    $('#beers_abc_ul').append().trigger('create');
	$('#beers_abc_ul').listview('refresh');
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
    var db = window.openDatabase("BEERSDB", "1.0", "Beers Database", 500000);
    db.transaction(queryDB, errorCB);
}

