function updateBoard(htmlData) {
	var board = document.getElementById('boardDiv');
	board.innerHTML = htmlData;
	}
function initializeBoard(boardName) {
	if (boardName == "history") {
		var actionToPost = "getHistory";
	}
	else {
		var actionToPost = "null";
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

jQuery(document).ready(function () {
	jQuery('form[name=betForm]').submit(function(event) {
		event.preventDefault(); //prevents the default form submission routine
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
				document.getElementById("betForm").reset();
			});
	});		
});