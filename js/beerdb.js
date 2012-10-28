var db;
var dbCreated = false;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    db = window.openDatabase("BeerDB", "1.0", "Beer Database", 500000);
    if (dbCreated)
    	db.transaction(getBeers, transaction_error);
    else
    	db.transaction(populateDB, transaction_error);
}

function transaction_error(tx, error) {
    alert("Database Error: " + error);
}

function populateDB_success() {
	alert('populateDB_success called');
	//dbCreated = true;
    //db.transaction(getBeers, transaction_error);
}

function getBeers(tx) {
	alert('getBeers called');
	var sql = "select * from beers";
	tx.executeSql(sql, [], getBeers_success);
}

function getBeers_success(tx, results) {
	$('#busy').hide();
    var len = results.rows.length;
    $('#record_count').append('<p>Record Count: ' + len + '</p>');
    for (var i=0; i<len; i++) {
    	var beer = results.rows.item(i);
		$('#beers_abc_ul').append('<li><a href="./beer.html" rel="external">' + beer.name + '</a></li>');
    }
	setTimeout(function(){
		$('#beers_abc_ul').listview('refresh');
	},100);
	db = null;
}

function populateDB(tx) {
	alert('populateDB called');
	$('#busy').show();
	tx.executeSql('DROP TABLE IF EXISTS beers');
	var sql = 
		"CREATE TABLE IF NOT EXISTS beers (" +
		"id INTEGER PRIMARY KEY, " +
		"name VARCHAR(200), " +
		"slug VARCHAR(50), " +
		"brewery VARCHAR(50), " +
		"type VARCHAR(25), " +
		"locality VARCHAR(10))";
    tx.executeSql(sql);
	$.get("http://nationwidebarcrawl.com/mobilenative/BeersFinalList/", function(response) {
		var parsed_data = $.parseJSON(response);
		$.each(parsed_data, function() {
			alert('beer: ' + this['name']);
			saveBeer(this); 
		});
	});
    alert('dbCreated: ' + dbCreated);
	dbCreated = true;
    db.transaction(getBeers, transaction_error);
}

function saveBeer(tx, beer) {
	var pk = beer['pk'] + '';
	var name = beer['name'] + '';
	alert('saveBeer called: ' + beer['name']);
	var slug = beer['slug'] + '';
	var brewery = beer['brewery'] + '';
	var type = beer['type'] + '';
	var locality = beer['locality'] + '';
	var sqlstatement = 
		"INSERT INTO beers (id,name,slug,brewery,type,locality) VALUES (" +
		pk + ", " + name + ", " + slug + ", " + brewery + ", " + type + ", " + locality + ")";
		//tx.executeSql('"INSERT INTO beers (id,name,slug,brewery,type,locality) VALUES (?, ?, ?, ?, ?, ?)", [ ' + pk + ', ' + name + ', ' + slug + ', ' + brewery + ', ' + type + ', ' + locality + ']');
		alert('sqlstatement: ' + sqlstatement);
		tx.executeSql(sqlstatement);
}