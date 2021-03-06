<?php

$dbconn = pg_connect("host=localhost dbname=payback user=postgres password=pingpong")
	or die('Could not connect: ' . pg_last_error());

$debtsTable = 'debts';
$historyTable = 'history';
$usersTable = 'users';

function returnTable() {
	global $debtsTable,$historyTable,$usersTable;
	
	if ($_POST['action'] == 'getHistory') {
		$query = "SELECT * FROM $historyTable ORDER BY BETDATE DESC, WINNER, LOSER;";
		$history = true;
	}
	else {
		$query = "SELECT * FROM $debtsTable ORDER BY BETDATE DESC, WINNER, LOSER;";
		$history = false;
	}
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	echo json_encode(pg_fetch_all($result));
	pg_free_result($result);
}
function removeEntry($id) {
	global $debtsTable,$historyTable,$usersTable;
	$query = "INSERT INTO $historyTable (betdate,winner,loser,item,quantity,description) SELECT now() at time zone 'America/Los_Angeles',winner,loser,item,quantity,description FROM $debtsTable where id=$id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	
	$query = "DELETE FROM $debtsTable WHERE ID=$id";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	$resultarray = pg_fetch_array($result, null, PGSQL_ASSOC);
	pg_free_result($result);
	returnTable();
}

if ($_POST['action'] == 'getDebts' or $_POST['action'] == 'getHistory') {
	returnTable();
}

elseif($_POST['action'] == 'remove') {
	removeEntry($_POST['id']);
}

elseif ($_POST['action'] == 'updateQuantity') {
	$id = $_POST['id'];
	$newQuantity = $_POST['quantity'];
	$query = "INSERT INTO $historyTable (betdate,winner,loser,item,quantity,description) SELECT now() at time zone 'America/Los_Angeles',winner,loser,item,quantity,description||' [Quantity changed to $newQuantity]' FROM $debtsTable where id=$id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	
	$query = "UPDATE $debtsTable SET QUANTITY = $newQuantity WHERE ID = $id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	returnTable();
}

elseif ($_POST['action'] == 'upload') {
	$winner=$_POST['winner'];
	$loser=$_POST['loser'];
	$item=$_POST['item'];
	$quantity=$_POST['quantity'];
	$description=$_POST['description'];
	
	$query = "INSERT INTO $debtsTable (BETDATE,WINNER,LOSER,ITEM,QUANTITY,DESCRIPTION) VALUES (now() at time zone 'America/Los_Angeles','$winner','$loser','$item','$quantity','$description')";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	pg_free_result($result);
	returnTable();
}
elseif ($_POST['action'] == 'getDropdown') {

	$query = "SELECT * FROM $usersTable ORDER BY NAME";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	
	if ($_POST['dropdownLocation'] == 'navbar') {
		while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
			$name = $line['name'];
			echo "<li><a role=\"button\" onclick=\"displayUser('$name')\">$name</a></li>\n";
		}
	}
	elseif ($_POST['dropdownLocation'] == 'betForm') {
		while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
			$name = $line['name'];
			echo "<option>$name</option>\n";
		}
	}
	pg_free_result($result);
}
elseif ($_POST['action'] == 'tryAddUser') {
	$name = $_POST['name'];
	$query = "SELECT * FROM $usersTable WHERE NAME='$name';";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	if (pg_num_rows($result) == 0) {
		$query = "INSERT INTO $usersTable (NAME) VALUES ('$name');";
		$result = pg_query($query) or die('Query failed: ' . pg_last_error());
		pg_free_result($result);
		echo "success";
	}
	else {
		echo "fail";
	}
}
elseif ($_POST['action'] == 'deleteUser') {
	$name = $_POST['name'];
	$query = "SELECT * FROM $debtsTable WHERE WINNER='$name' OR LOSER='$name';";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	$resultArray = pg_fetch_all($result);
	foreach ($resultArray as $bet) {
		removeEntry($bet['id']);
	}
	
	$query = "DELETE FROM $usersTable * WHERE NAME='$name';";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
}
elseif ($_POST['action'] == 'getUserTable') {
	$name = $_POST['name'];
	$query = "SELECT * FROM $debtsTable WHERE WINNER='$name' OR LOSER='$name';";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	$userTable = pg_fetch_all($result);
	echo json_encode($userTable);
	
}
else {
	echo "Error: no POST action specified.";
}

pg_close($dbconn);
?>