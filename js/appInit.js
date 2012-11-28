// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, true);

// variable to set once the beers database has been created
var dbCreated = localStorage.getItem("dbCreated");

// variable to set once the drinks database has been created
var drinksdbCreated = localStorage.getItem("drinksdbCreated");

// variable to pass favorite beers and drinks from db to filesystem
var BEERPK;
var DRINKPK;

// variable to hold filesystem directory for beers and drinks
var BEERSDATADIR;
var DRINKSDATADIR;

// Cordova is ready
//
function onDeviceReady() {
	// make sure the beers database has been created first, if not redirect to beersmain.html to create it
	if (dbCreated != 1) {
		alert('Beers database must be created before using the app, click OK to create the Beers Database');
		window.location.href="beersmain.html";
	} else {
	
		// make sure the drinks database has been created first, if not redirect to drinksmain.html to create it
		if (drinksdbCreated != 1) {
			alert('Drinks database must be created before using the app, click OK to create the Drinks Database');
			window.location.href="drinksmain.html";
		}
	}
	
	// get the app init info from the server
	$.get("http://nationwidebarcrawl.com/mobilenative/appinit/", function(response) {
		var parsed_data = $.parseJSON(response);
			
		// If the user is not authenticated
		if (parsed_data[0].status == "0") {
			localStorage.setItem("isAuthenticated", "0");
		}
		
		// User is authenticated - store profile information in browser
		if (parsed_data[0].status == "1") {
			localStorage.setItem("isAuthenticated", "1");
			localStorage.setItem("profileUsername", parsed_data[0].username);
			localStorage.setItem("profilePk", parsed_data[0].pk);
			localStorage.setItem("profileFavBeer", parsed_data[0].favbeer);
			localStorage.setItem("profileFavBeerPk", parsed_data[0].favbeerpk);
			localStorage.setItem("profileFavBeers", parsed_data[0].favbeers);
			localStorage.setItem("profileFavDrink", parsed_data[0].favdrink);
			localStorage.setItem("profileFavDrinkPk", parsed_data[0].favdrinkpk);
			localStorage.setItem("profileFavDrinks", parsed_data[0].favdrinks);
			localStorage.setItem("profileFavBar", parsed_data[0].favbar);
			localStorage.setItem("profileFavBarPk", parsed_data[0].favbarpk);
			localStorage.setItem("profileFavDest", parsed_data[0].favdest);
			localStorage.setItem("profileFavDestPk", parsed_data[0].favdestpk);
			localStorage.setItem("profileFavDestSlug", parsed_data[0].favdestslug);
			localStorage.setItem("profileImage", parsed_data[0].image);
			
			// if not set, set initial slot machine values
			if (localStorage.getItem("slotdest") == null) {
				localStorage.setItem("slotdest", parsed_data[0].favdest);
				localStorage.setItem("slotdestslug", parsed_data[0].favdestslug);
			}
			
			// if not set, set initial drink specials values
			if (localStorage.getItem("specialsdest") == null) {
				localStorage.setItem("specialsdest", parsed_data[0].favdest);
				localStorage.setItem("specialsdestslug", parsed_data[0].favdestslug);
			}
			
			// if not set, set initial chosen destination
			if (localStorage.getItem("chosendest") == null) {
				localStorage.setItem("chosendest", parsed_data[0].favdest);
			}
			if (localStorage.getItem("chosendestslug") == null) {
				localStorage.setItem("chosendestslug", parsed_data[0].favdestslug);
			}
		}
	});
}













// Transaction error callback
//
function errorCB(err) {
    alert("Error processing SQL: "+err.code);
    alert("Error is: "+err.message);
}

// filesystem error callback
//
function onError(e) {
	alert('error: ' + e.message);
}

// error handler for filesystem access
//
function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  alert('Error: ' + msg);
}