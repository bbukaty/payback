
function updateBoard(htmlData) {
	var board = document.getElementById('boardDiv');
	board.innerHTML = htmlData;
}

function getBoard(boardName) {
	if (boardName == 'history') {
		var actionToPost = "getHistory";
		document.getElementById("homeNavbar").className = "";
		document.getElementById("usersNavbar").className = "";
		document.getElementById("historyNavbar").className += " active";
	}
	else {
		var actionToPost = "getDebts";
	}
	jQuery.post('betTables.php',{action: actionToPost},function (data) {
		updateBoard(data);
	});
}

function removeBet(betId,currentUser) {
	jQuery.post('betTables.php',{action: 'remove', id:betId},function (data) {
		if (currentUser == "none") {
			updateBoard(data);
		}
		else {
			displayUser(currentUser);
		}
	});
}

var none = "none";
function changeQuantity(betId,originalQuantity,currentUser) {
	quantity = document.getElementById("quantity"+betId);
	quantityNum = parseInt(quantity.innerHTML);
	quantityNum--;
	quantity.className = "bg-danger";
	quantity.innerHTML = quantityNum+"     <button class=\"btn btn-primary btn-xs\" onclick=\"changeQuantity("+betId+","+originalQuantity+",'"+currentUser+"')\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></button>";
	quantity.innerHTML += "   <button class=\"btn btn-primary btn-xs\" onclick=\"uploadQuantity("+betId+","+quantityNum+",'"+currentUser+"')\"><span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\"></span>  Save</button>";
	quantity.innerHTML += "   <button class=\"btn btn-primary btn-xs\" onclick=\"cancelQuantity("+betId+","+originalQuantity+",'"+currentUser+"')\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>  Cancel</button>";
}
function cancelQuantity(betId,originalQuantity,currentUser) {
	quantity = document.getElementById("quantity"+betId);
	quantity.innerHTML = originalQuantity+"     <button class=\"btn btn-primary btn-xs\" onclick=\"changeQuantity("+betId+","+originalQuantity+",'"+currentUser+"')\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></button>";
	quantity.className = "";
}
function uploadQuantity(betId,newQuantity,currentUser) {
	jQuery.post('betTables.php',{action: 'updateQuantity', id:betId, quantity: newQuantity}, function (data) {
		if (currentUser == "none") {
			updateBoard(data);
		}
		else {
			displayUser(currentUser);
		}
	});
}

function getUsersDropdowns() {
	jQuery.post('betTables.php',{action: "getDropdown",dropdownLocation: "navbar"},function (data) {
		var navbarUsersDropdown = document.getElementById('navbarUsersDropdown');
		navbarUsersDropdown.innerHTML = data;
	});
	jQuery.post('betTables.php',{action: "getDropdown",dropdownLocation: "betForm"},function (data) {
		var winnerEntryUsersDropdown = document.getElementById('winnerEntry');
		var loserEntryUsersDropdown = document.getElementById('loserEntry');
		var deleteUserEntryDropdown = document.getElementById('deleteUserEntry');
		winnerEntryUsersDropdown.innerHTML = data;
		loserEntryUsersDropdown.innerHTML = data;
		deleteUserEntryDropdown.innerHTML = data;
	});
}

function displayUser(userName) {
	var boardDiv = document.getElementById('boardDiv');
	boardDiv.innerHTML = "Loading user page...";
	jQuery.post('betTables.php',{action: "getUserTable",name: userName},function (data) {
		document.getElementById("homeNavbar").className = "";
		document.getElementById("historyNavbar").className = "";
		document.getElementById("usersNavbar").className += " active";
		
		boardDiv.innerHTML = "<div class=\"page-header\"><h2>User: "+userName+"</h2></div>";
		
		var userTable = JSON.parse(data);
		if (!userTable.length > 0) {
			boardDiv.innerHTML += "<h4>No bets found for this user.</h4>";
			return;
		}
		
		var others = [];
		userTable.forEach(function (bet) {
			if (bet.winner !=userName && (jQuery.inArray(bet.winner,others) == -1)) {
				others.push(bet.winner);
			}
			else if (bet.loser != userName && (jQuery.inArray(bet.loser,others) == -1)) {
				others.push(bet.loser);
			}
		});
		others.sort();
		
		var currChunk = "";
		var debtsToOther = [];
		var debtsFromOther = [];
		others.forEach(function (other) {
			currChunk = "";
			debtsToOther = [];
			debtsFromOther = [];
			currChunk += "<div class=\"row nameRow\"><div class=\"col-md-12\"><h3>"+other+"</h3></div></div>";
			currChunk += "<div class=\"row spacedRow\">";
			userTable.forEach(function (bet) {
				if (bet.winner == other) {
					debtsToOther.push(bet);
				}
				else if (bet.loser == other) {
					debtsFromOther.push(bet);
				}
			});
			currChunk += "<div class=\"col-md-6\">";
			currChunk += "<h4>"+other+" owes "+userName+":</h4>";
			if (debtsFromOther.length > 0) {
				currChunk += "<table class=\"table\"><thead><tr><th>Date</th><th>Item</th><th>#</th><th>Description</th><th>Remove</th></thead>";
				currChunk += "<tbody>";
				debtsFromOther.forEach(function (debt) {
					currChunk += "<tr><td>"+debt['betdate']+"</td><td>"+debt['item']+"</td><td id=\"quantity"+debt['id']+"\">";
					currChunk += debt['quantity']+"     <button class=\"btn btn-primary btn-xs\" onclick=\"changeQuantity("+debt['id']+","+debt['quantity']+",'"+userName+"')\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></button>";
					currChunk += "</td><td>"+debt['description']+"</td>";
					currChunk += "<td><button class=\"btn btn-danger btn-xs\" onclick=\"removeBet("+debt['id']+",'"+userName+"')\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"/></button></td></tr>";
				});
				currChunk += "</tbody></table>";
			}
			currChunk += "</div>";
			
			currChunk += "<div class=\"col-md-6\">";
			currChunk += "<h4>"+userName+" owes "+other+":</h4>";
			if (debtsToOther.length > 0) {
				currChunk += "<table class=\"table\"><thead><tr><th>Date</th><th>Item</th><th>#</th><th>Description</th><th>Remove</th></thead>";
				currChunk += "<tbody>";
				debtsToOther.forEach(function (debt) {
					currChunk += "<tr><td>"+debt['betdate']+"</td><td>"+debt['item']+"</td><td id=\"quantity"+debt['id']+"\">";
					currChunk += debt['quantity']+"     <button class=\"btn btn-primary btn-xs\" onclick=\"changeQuantity("+debt['id']+","+debt['quantity']+",'"+userName+"')\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></button>";
					currChunk += "</td><td>"+debt['description']+"</td>";
					currChunk += "<td><button class=\"btn btn-danger btn-xs\" onclick=\"removeBet("+debt['id']+",'"+userName+"')\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"/></button></td></tr>";
				
				});
				currChunk += "</tbody></table>";
				
			}
			currChunk += "</div></div>";
			
			
			boardDiv.innerHTML += currChunk;
			
		});
	});
}

jQuery(document).ready(function () {
	jQuery('form[id=betForm]').submit(function(betFormSubmit) {
		betFormSubmit.preventDefault(); //prevents the default form submission routine
		var winnerInput = document.getElementById("winnerEntry").value;
		var loserInput = document.getElementById("loserEntry").value;
		var itemInput = document.getElementById("itemEntry").value;
		var quantityInput = document.getElementById("quantityEntry").value;
		var descriptionInput = document.getElementById("descriptionEntry").value;
		
		if (!(Number.isInteger(parseInt(quantityInput)))) {
			alert("Quantity must be an integer. Please try again.");
			return;
		}
		else if (winnerInput == loserInput) {
			alert("Bet winner and loser must be different people. Please try again.");
			return;
		}
		
		jQuery.post('betTables.php',{
			action: "upload",
			winner: winnerInput,
			loser: loserInput,
			item: itemInput,
			quantity: quantityInput,
			description: descriptionInput
			},
			function (data) {
				updateBoard(data);
				jQuery('#collapseForm').collapse("hide");
				document.getElementById("betForm").reset();
				document.getElementById("historyNavbar").className = "";
				document.getElementById("usersNavbar").className = "dropdown";
				document.getElementById("homeNavbar").className = "active";
			});
	});
	jQuery('form[id=newUserForm]').submit(function(nameFormSubmit) {
		nameFormSubmit.preventDefault();
		var nameInput = document.getElementById("newUserEntry").value;
		jQuery.post('betTables.php',{action: "tryAddUser", name: nameInput}, function (data) {
			if (data == "success") {
				jQuery('#newUserModal').modal('hide');
				document.getElementById("newUserForm").reset();
				getUsersDropdowns();
			}
			else {
				document.getElementById("newUserForm").reset();
				alert("This person is already listed as a user. Please try again.");
			}
		});
	});
	jQuery('form[id=deleteUserForm]').submit(function(deleteUserFormSubmit) {
		deleteUserFormSubmit.preventDefault();
		if (window.confirm("This will delete all existing bets involving this user and remove them from the user list. Are you sure you want to continue?")) {
			var nameInput = document.getElementById("deleteUserEntry").value;
			jQuery.post('betTables.php',{action: "deleteUser", name: nameInput}, function (data) {
				getBoard("debts");
				jQuery('#deleteUserModal').modal('hide');
				document.getElementById("deleteUserForm").reset();
				getUsersDropdowns();
				document.getElementById("historyNavbar").className = "";
				document.getElementById("usersNavbar").className = "dropdown";
				document.getElementById("homeNavbar").className = "active";
		});
		}
	});
});