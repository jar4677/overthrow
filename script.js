/**
 * Created by jar4677 on 5/3/16.
 */

//DOCUMENT READY FOR EVENT HANDLERS
$(document).ready(function () {
    var settings = getSettings();

    if(!settings){
        $("#load-game").hide();
    }
    
    $('#settingsModal').modal('show');

    $("#load-game").click(function () {
        $("#settingsModal").modal("hide");
        var size = settings.number;
        var toWin = settings.win;
        gameBoard = new TicTacToe(size, toWin);
        gameBoard.buildBoard();
        gameBoard.valueArray = settings.valueArray;
        gameBoard.player1 = settings.player1;
        gameBoard.player2 = settings.player2;
        gameBoard.currentPlayer = settings.currentPlayer;
        displayName(gameBoard.currentPlayer.name);
    
        //sets cursor type based on player value
        gameBoard.setMark(gameBoard.currentPlayer.value);
    
        //sets image background for squares with a value
        for (var i = 0; i < gameBoard.valueArray.length; i++){
            var markClass = null;
            if (gameBoard.valueArray[i] != null){
                if (gameBoard.valueArray[i] == 'x'){
                    markClass = 'X-square';
                } else {
                    markClass = 'O-square';
                }
            
                var id = gameBoard.sqArray[i];
            
                //TODO this is really clunky not sure why I did it this way. Find a better way
                $(".square").each(function () {
                    if ($(this).attr("square") == id){
                        $(this).addClass(markClass);
                    }
                })
            }
        }
    });
 
    //saves settings when window closes
    $(window).unload(saveSettings);
    
    //click handler for new game
    $("#new-game").click(function () {
        $("#settingsModal").modal("hide");
        if($("#player-1").val() == ''){
            var p1Name = 'Player 1';
        } else {
            var p1Name = $("#player-1").val();
        }
        if($("#player-2").val() == ''){
            var p2Name = 'Player 2';
        } else {
            var p2Name = $("#player-2").val();
        }
        var size = $("input[name = game-size]:checked").val();
        var toWin = $("input[name = to-win]:checked").val();
    
        gameBoard = new TicTacToe(size, toWin);
        gameBoard.buildBoard();
        gameBoard.player1 = new Player(p1Name, "x");
        gameBoard.player2 = new Player(p2Name, "o");
        gameBoard.currentPlayer = gameBoard.player1;
        gameBoard.setMark(gameBoard.currentPlayer.value);
        displayName(gameBoard.currentPlayer.name);
        setTimeout( function () {
            $("#load-game").show();
        }, 1000);
    });

    $("#play-again").click(function () {
        $("#winModal").modal("hide");
        $('#load-game').hide();
        $("#game-area").html('');
        $('#settingsModal').modal('show');
    });

    $("#reset").click(function () {
        $('#load-game').hide();
        $('#settingsModal').modal('show');
        $("#game-area").html('');
    });

    //click handlers for changing mark
    $("#X").click(function () {
       //current player value becomes 'x'
        gameBoard.currentPlayer.value = 'x';
        gameBoard.setMark(gameBoard.currentPlayer.value);
    });

    $("#O").click(function () {
        //current player value becomes 'o'
        gameBoard.currentPlayer.value = 'o';
        gameBoard.setMark(gameBoard.currentPlayer.value);
    });

    //handlers for game board sizes
    $("#game-three").change(function () {
        $("#win-four, #win-five, #win-six").attr('disabled', true);
        $("#win-three").attr('checked', true);
    });

    $("#game-four").change(function () {
        $("#win-five, #win-six").attr('disabled', true);
        $("#win-four").attr('disabled', false).attr('checked', true);
    });

    $("#game-five").change(function () {
        $("#win-six").attr('disabled', true);
        $("#win-four, #win-five").attr('disabled', false);
        $("#win-five").attr("checked", true);
    });

    $("#game-six").change(function () {
        $("#win-four, #win-five, #win-six").attr('disabled', false);
        $("#win-six").attr("checked", true);
    });

    //click handler for squares
    $("#game-area").on("click", "div.square", function () {
        var id = $(this).attr("square");
        var value = gameBoard.currentPlayer.value;

        //set value to square
        if (gameBoard.currentPlayer.value == 'x'){
            $(this).addClass('X-square').removeClass('O-square');
        } else {
            $(this).addClass('O-square').removeClass('X-square');
        }

        //call clicked method
        gameBoard.clicked(id, value);
    });
});

//CONSTRUCTOR FOR GAME
function TicTacToe(number, win) {
    this.number = number;
    this.win = win;
    this.sqArray = [];
    this.valueArray = [];
    this.squaresFilled = 0;
    this.player1 = null;
    this.player2 = null;
    this.currentPlayer = null;

    //Method To Build Board
    this.buildBoard = function () {
        for (var i = 0; i < this.number; i++) {
            for (var j = 0; j < this.number; j++) {
                this.sqArray.push('' + i + j);
            }
        }

        for (var n = 0; n < this.sqArray.length; n++) {
            this.valueArray.push(null);
        }

        for (var k = 0; k < this.sqArray.length; k++){
            this.domObj(this.sqArray[k]);
        }

    };

    //Method To Call on Click
    this.clicked = function (id, value) {
        //takes the string id and set an x and y variable from it
        var x = parseInt(id[0]);
        var y = parseInt(id[1]);

        //checks to see if there is a value in that position already, if not, increment squaresFilled
        if (this.valueArray[this.sqArray.indexOf(id)] == null) {
            this.squaresFilled++;
        }

        //sets the value in the value array
        this.valueArray[this.sqArray.indexOf(id)] = value;

        //if enough squares are filled, check for win
        if (this.squaresFilled >= this.win) {
            //calls the checkWin method for each win condition
            if (this.checkWin(this.rowWin(x), value) ||
                this.checkWin(this.colWin(y), value) ||
                this.checkWin(this.leftDWin(x, y), value) ||
                this.checkWin(this.rightDWin(x, y), value)
            ) {
                //calls win modal if it is a win
                winModal(this.currentPlayer.name + " Wins!");
            } else if (this.valueArray.indexOf(null) == -1){
                //calls win modal if it is a draw
                winModal('Draw!');
            }
        }

        //switch players
        if(this.currentPlayer == this.player1){
           this.currentPlayer = this.player2;
        } else {
            this.currentPlayer = this.player1;
        }

        //display current player's name
        displayName(this.currentPlayer.name);

        //set cursor based on player value
        this.setMark(this.currentPlayer.value);
    };

    //Method To Generate Row Win Condition
    this.rowWin = function (x) {
        var row = [];
        for (var r = 0; r < this.number; r++) {
            row.push('' + x + r);
        }
        return row;
    };

    //Method To Generate Column Win Condition
    this.colWin = function (y) {
        var col = [];
        for (var c = 0; c < this.number; c++) {
            col.push('' + c + y);
        }
        return col;
    };

    //Method To Generate Left Diagonal Win Condition
    this.leftDWin = function (x, y) {
        var leftWin = [];
        //find top left square
        if (x - y >= 0) {
            x = x - y;
            y = 0;
        } else {
            y = Math.abs(x - y);
            x = 0;
        }
        //staring there, loop until bottom right while both x and y are less than the number of rows
        while (x < this.number && y < this.number) {
            leftWin.push('' + x + y);
            x++;
            y++;
        }
        return leftWin;
    };

    //Method To Generate Right Diagonal Win Condition
    this.rightDWin = function (x, y) {
        var rightWin = [];
        //finds the top right corner
        while (x - 1 >= 0 && y + 1 < this.number - 1) {
            x--;
            y++;
        }
        //fills the temporary array going down and to the left
        while (x < this.number && y >= 0) {
            rightWin.push('' + x + y);
            x++;
            y--;
        }
        return rightWin;
    };

    //Method To Check Win Conditions
    this.checkWin = function (array, value) {
        var match = 0;
        //loop through win condition array checking for matches
        for (var i = 0; i < array.length; i++) {
            if (match != this.win) {
                //checks value array at same position in reference array
                if (this.valueArray[this.sqArray.indexOf(array[i])] == value) {
                    match++;
                } else {
                    match = 0;
                }
            }
        }
        //returns true if the number of continuous matches equals the total to win
        return (match == this.win);
    };

    this.setMark = function (mark) {
        if(mark == 'x'){
            $("#container").addClass('x').removeClass('o');
        } else {
            $("#container").addClass('o').removeClass('x');
        }
    }
}

TicTacToe.prototype.domObj = function (id) {
    var square = $("<div>").addClass('square').css({
        'width': (100 / this.number) + "%",
        'height': (100 / this.number) + "%"
    }).attr("square", id);
    $(".game_board").append(square);
};

function winModal(winner) {                //win modal function, passed one parameter
    $('#winModal h3').html(winner);
    $("#winModal").modal("show");
}

function saveSettings() {
    var settings = {
        'player1': player1,
        'player2': player2,
        'currentPlayer': gameBoard.currentPlayer,
        'valueArray': gameBoard.valueArray,
        'number': gameBoard.number,
        'win': gameBoard.win,
        'exists': true
    };
    
    var storage = JSON.stringify(settings);
    window.localStorage.setItem('settings', storage);
}

function getSettings() {
    return JSON.parse(window.localStorage.getItem('settings'));
}

//CONSTRUCTOR FOR PLAYER
function Player(name, value) {
    this.name = name;
    this.value = value;
}

//Function to display name
function displayName(name) {
    $("#current_player").html(name);
}