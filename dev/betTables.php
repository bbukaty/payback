<?php

$dbconn = pg_connect("host=localhost dbname=payback user=postgres password=pingpong")
	or die('Could not connect: ' . pg_last_error());

$debtsTable = 'testdebts';
$historyTable = 'testhistory';
$usersTable = 'testusers';

function returnTable() {
	global $debtsTable,$historyTable,$usersTable;
	
	if ($_POST['action'] == 'getHistory') {
		$query = "SELECT * FROM $historyTable ORDER BY BETDATE, WINNER, LOSER";
		$history = true;
	}
	else {
		$query = "SELECT * FROM $debtsTable ORDER BY WINNER, BETDATE, LOSER";
		$history = false;
	}
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());

	echo "<table class='table'>",
		"<thead>\n";
		if ($history) {
			echo "<tr><th>Date Removed</th><th>Winner</th><th>Loser</th><th>Item</th><th>Quantity</th><th>Description</th>\n</tr>";
		}
		else {
			echo "<tr><th>Date</th><th>Winner</th><th>Loser</th><th>Item</th><th>Quantity</th><th>Description</th><th>Remove</th>\n</tr>";
		}
		echo "\n</thead>",
			"\n<tbody>";
	while ($line = pg_fetch_array($result, null, PGSQL_ASSOC)) {
		echo "\t<tr>\n";
		$col_num = 0;
		foreach ($line as $col_value) {
			if ($col_num == 0) {}
			elseif ($col_num == 1) {
				$year = substr($col_value,0,4);
				$date = substr($col_value,5,5);
				$time = substr($col_value,11,5);
				$timestamp = $time . " " . $date . "-" . $year;
				echo "\t\t<td>$timestamp</td>\n";
			}
			elseif ($col_num == 5) {
				if ($history) {
					echo "\t\t<td>$col_value</td>\n";
				}
				else {
					echo "\t\t<td>$col_value   ",
					"<div class=\"btn-group\" role=\"group\">",
					"<button class=\"btn btn-primary btn-xs\" onclick=\"alterBet($line[id],'increment')\"><span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span></button>",
					"<button class=\"btn btn-primary btn-xs\" onclick=\"alterBet($line[id],'decrement')\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></button>",
					"</div></td>\n";
				}
			}
			elseif ($col_num == 6 and !$history) {
				echo "\t\t<td>$col_value</td>\n";
				echo "\t\t<td><button class=\"btn btn-danger btn-xs\" onclick=\"alterBet($line[id],'remove')\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"/></button></td>\n";
				
			}
			else {
				echo "\t\t<td>$col_value</td>\n";
			}
			$col_num++;
		}
		echo "\t</tr>\n";
		}
	echo "</tbody>\n</table>\n";
		
	pg_free_result($result);
}

if ($_POST['action'] == 'getDebts' or $_POST['action'] == 'getHistory') {
	returnTable();
}
elseif ($_POST['action'] == 'increment') {
	$id = $_POST['id'];
	$query = "UPDATE $debtsTable SET QUANTITY = QUANTITY + 1 WHERE ID = $id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	returnTable();
}

elseif ($_POST['action'] == 'decrement') {
	$id = $_POST['id'];
	$query = "UPDATE $debtsTable SET QUANTITY = QUANTITY - 1 WHERE ID = $id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	returnTable();
}

elseif($_POST['action'] == 'remove') {
	$id = $_POST['id'];
	
	$query = "INSERT INTO $historyTable (betdate,winner,loser,item,quantity,description) SELECT now(),winner,loser,item,quantity,description FROM $debtsTable where id=$id";
	pg_query($query) or die('Query failed: ' . pg_last_error());
	
	$query = "DELETE FROM $debtsTable WHERE ID=$id";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	$resultarray = pg_fetch_array($result, null, PGSQL_ASSOC);
	pg_free_result($result);
	returnTable();
}

elseif ($_POST['action'] == 'upload') {
	$winner=$_POST['winner'];
	$loser=$_POST['loser'];
	$item=$_POST['item'];
	$quantity=$_POST['quantity'];
	$description=$_POST['description'];
	
	$query = "INSERT INTO $debtsTable (BETDATE,WINNER,LOSER,ITEM,QUANTITY,DESCRIPTION) VALUES (NOW(),'$winner','$loser','$item','$quantity','$description')";
	$result = pg_query($query) or die('Query failed: ' . pg_last_error());
	pg_free_result($result);
	returnTable();
}
elseif ($_POST['action'] == 'getDropdown') {
	echo "<li><a role=\"button\" data-toggle=\"modal\" data-target=\"#newUserModal\">Add User</a></li>\n",
		"<li role=\"separator\" class=\"divider\"></li>";
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