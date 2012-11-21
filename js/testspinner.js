// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to hold the filesystem for global access
var fs = null;

// variable to hold the file system path to save the images
var DATADIR;

// Cordova is ready
//
function onDeviceReady() {
	//get the filesystem for writing images
	$.mobile.loading( 'show', { theme: "a", text: "Loading Beers Database", textVisible: true});
}
