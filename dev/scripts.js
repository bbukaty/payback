function updateBoard(htmlData) {
	var board = document.getElementById('boardDiv');
	board.innerHTML = htmlData;
	}
function getBoard(boardName) {
	if (boardName == 'history') {
		var actionToPost = "getHistory";
		document.getElementById("homeNavbar").className = "";
		document.getElementById("historyNavbar").className += " active";
	}
	else {
		var actionToPost = "getDebts";
	}
	jQuery.post('betTables.php',{action: actionToPost},function (data) {
		updateBoard(data);
	});
}
function alterBet(betId,alteration) {
	jQuery.post('betTables.php',{id: betId, action: alteration},function (data) {
		updateBoard(data);
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
		winnerEntryUsersDropdown.innerHTML = data;
		loserEntryUsersDropdown.innerHTML = data;
	});
}

function displayUser(userName) {
	var boardDiv = document.getElementById('boardDiv');
	boardDiv.innerHTML = "Loading user page...";
	jQuery.post('betTables.php',{action: "getUserTable",name: userName},function (data) {
		document.getElementById("homeNavbar").className = "";
		document.getElementById("historyNavbar").className = "";
		document.getElementById("usersNavbar").className += " active";
		
		var userTable = JSON.parse(data);
		console.log(userTable);
		
		var others = [];
		for (var i=0;i<userTable.length;i++) {
			if (userTable[i].winner != userName) {
				others.push(userTable[i].winner);
			}
			else if (userTable[i].loser != userName) {
				others.push(userTable[i].loser);
			}
		}
		others.sort();
		console.log(others);

		boardDiv.innerHTML = "<div class=\"page-header\">\n\t<h2>User: "+userName+"</h2>\n</div>";
		
		var debtsToCurrOther = [];
		var debtsFromCurrOther = [];
		for (var i=0;i<others.length;i++) {
			console.log(others[i] + ":");
			boardDiv.innerHTML += "<div class=\"row nameRow\">\n\t<div class=\"col-md-12\">\n\t<h3>"+others[i]+"</h3>\n</div>\n</div>\n<div class=\"row spacedRow\">";
			for (var j=0;j<userTable.length;j++) {
				if (userTable[j].winner == others[i]) {
					debtsToCurrOther.push(userTable[j]);
				}
				else if (userTable[j].loser == others[i]) {
					debtsFromCurrOther.push(userTable[j]);
				}
			}
			console.log("debts from: ", debtsFromCurrOther);
			console.log("debts to: ", debtsToCurrOther);
			
		}	
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
			});
	});
	jQuery('form[id=userForm]').submit(function(nameFormSubmit) {
		nameFormSubmit.preventDefault();
		var nameInput = document.getElementById("newUserEntry").value;
		jQuery.post('betTables.php',{action: "tryAddUser", name: nameInput}, function (data) {
			console.log(data);
			if (data == "success") {
				jQuery('#newUserModal').modal('hide');
				document.getElementById("userForm").reset();
				getUsersDropdowns();
			}
			else {
				alert("This person is already listed as a user. Please try again.");
			}
		});
	});
});