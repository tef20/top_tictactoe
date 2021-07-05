const Game = (function() {
    const piece1 = 'X';
    const piece2 = 'O';

    const gameboard = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    function resetGame () {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gameboard[i][j] = null;
            }
        }
    }

    const currentState = function () {
        return gameboard;
    };

    const playerToMove = function () {
        // Returns next player to take a turn ('X' or 'O')
        // 'X' to start, so 'X' always 0 or 1 moves ahead of X
        let p1Moves = 0;
        let p2Moves = 0;

        for (let i = 0; i < gameboard.length; i++) {
            for (let j = 0; j < gameboard[i].length; j++) {
                if (gameboard[i][j] === 1) {
                    p1Moves++;
                } else if (gameboard[i][j] === 2) {
                    p2Moves++;
                }
            }
        }

        return p2Moves < p1Moves ? 2 : 1;
    };

    const makeMove = function (i, j) {
        // i, j correspond to row column on board
        // N.B. make a copy if running AI
        if (!winner() && tileFree(i, j)) {
            const currentPlayer = playerToMove();
            gameboard[i][j] = currentPlayer;
            
            console.log(`Player ${currentPlayer} chose row ${i} column ${j}`);
            return true;
        } else {
            console.log('Illegal move attempted');
            return false;
        }
    };

    const tileFree = function (i, j) {
        return !gameboard[i][j];
    }

    const availableMoves = function () {
        // returns array of form [i, j] 
        // corresponding to row, column coordinates of gameboard
        let available = [];

        for (let i = 0; i < gameboard.length; i++) {
            for (let j = 0; j < gameboard[i].length; j++) {
                if (gameboard[i][j] === null) {
                    // available.push([i, j]);
                    available.push({i, j});
                }
            }
        }

        return available;
    };

    const winner = function () {
        for (let i = 0; i < 3; i++) {
            // Check none empty horizontals
            if (gameboard[i][0] && 
                gameboard[i][0] === gameboard[i][1] &&
                gameboard[i][0] === gameboard[i][2]) {
                    return gameboard[i][0];
                }

            // Check none empty verticals
            if (gameboard[0][i] && 
                gameboard[0][i] === gameboard[1][i] &&
                gameboard[0][i] === gameboard[2][i]) {
                    return gameboard[0][i];
                }

            // Check none empty diagonals
            if (gameboard[1][1]) {
                // Top L-R diagonal
                if (gameboard[1][1] === gameboard[0][0] &&
                    gameboard[1][1] === gameboard[2][2]) {
                    return gameboard[1][1];
                }
                // Top R-L diagonal
                if (gameboard[1][1] === gameboard[0][2] && 
                    gameboard[1][1] === gameboard[2][0]) {
                    return gameboard[1][1];
                }
            }
        }
    };

    const gameOver = function () {
        return (winner() || !availableMoves().length) ? true : false;
    };
    
    return {currentState, playerToMove, makeMove, availableMoves, winner, gameOver, resetGame};

})();

const DOM = (function () {
    const message = document.getElementById('message');

    const board = document.getElementById('board');
    
    const tiles = [];
    for (let i = 0; i < Game.currentState().length; i++) {
        for (let j = 0; j < Game.currentState()[i].length; j++) {
            newTile = document.createElement('div');
            newTile.className = 'tile';
            newTile.id = `${i},${j}`;
            board.appendChild(newTile); 
            tiles.push(newTile);
        }
    }

    const resetButton = document.getElementById('resetButton'); 
    
    return {message, board, tiles, resetButton};
})()

Player = (function () {
    const players = {
        // default settings
        1: {
            name: 'player 1',
            piece: 'X',
            type: 'manual'
        }, 

        2: {
            name: 'player 2',
            piece: 'O',
            type: 'manual'
        }, 
    }; 

    const getPlayerByNum = function (num) {
        if ([1, 2].includes(num)) {
            return {
                'name': players[num].name, 
                'piece': players[num].piece,
                'type': players[num].type
            }; 
        }     
    }

    const setName = function (playerNum, proposedName) {
        const newName = (""+proposedName).trim();
        // maintain unique names
        if (newName && !players.some(player => player.name === newName)) {
            players[playerNum].name = newName;
        } else {
            console.log('Invalid name entered.')
        }
    }

    const setPiece = function (playerNum, proposedPiece) {
        const newPiece = (""+proposedPiece).trim();
        // maintain unique pieces
        if (newPiece && !players.some(player => player.name === newName)) {
            players[playerNum].piece = newPiece;
        } else {
            console.log('Invalid piece entered.')
        }
    }

    const setType = function (playerNum, newType) {
        if (['manual', 'computer'].includes(newType)) {
            players[playerNum].type = newType;
        } else {
            console.log('Invalid type entered.')
        }
        
    }

    return {getPlayerByNum, setName, setPiece, setType};
})();

const DisplayControl = (function () {
    // add tile bindings
    DOM.tiles.forEach(tile => tile.addEventListener('click', selectTile));

    // add reset binding
    DOM.resetButton.onclick = () => {
        Game.resetGame();
        render();
    };

    render(); // better to return in object?
    
    function render() {
        updateBoard();
        updateMessage();
    } 
    
    function selectTile (event) {
        // Only play if human
        if (Player.getPlayerByNum(Game.playerToMove()).type === 'manual') {
            const selectedTile = event.target;
            let i, j;
            [i, j] = parseCoordinatesFromCSV(selectedTile.id);
            if (Game.makeMove(i, j)) {
                render();
            }
        }
        
    }
    
    function parseCoordinatesFromCSV(tileID) {
        let i, j;
        [i, j] = tileID.split(',');
        return [+i, +j];
    }

    function updateBoard () {
        for (const tile of DOM.tiles) {
            let i, j;
            [i, j] = parseCoordinatesFromCSV(tile.id);
            
            const tileMark = Player.getPlayerByNum(Game.currentState()[i][j]);

            tile.textContent = tileMark ? tileMark.piece : null;
        }
    }

    function updateMessage() {
        if (Game.winner()) {
            const winningPlayer = Player.getPlayerByNum(Game.winner());
            DOM.message.textContent = `${winningPlayer.name} wins!`;
        } else if (Game.gameOver()) {
            DOM.message.textContent = "It's a tie!";
        } else {
            const nextPlayer = Player.getPlayerByNum(Game.playerToMove());
            DOM.message.textContent = `${nextPlayer.name} to move...`;
        }
    }
})();


// pubSub
// Template borrowed from LearnCode.academy:
// https://www.youtube.com/watch?v=nQRXi1SVOow&list=PLoYCgNOIyGABs-wDaaxChu82q_xQgUb4f&index=5 
// const events = {
//     events: {},

//     on: function (eventName, fn) {
//         this.events[eventName] = this.events[eventName] || [];
//         this.events[eventName].push(fn);
//     },

//     off: function (eventName, fn) {
//         if (this.events[eventName]) {
//             for (var i = 0; i < this.events[eventName].length; i++) {
//                 if (this.events[eventName][i] === fn) {
//                     this.events[eventName].splice(i, 1);
//                     break;
//                 }
//             }
//         }
//     },

//     emit: function (eventName, data) {
//         if (this.events[eventName]) {
//             this.events[eventName].forEach(function(fn) {
//                 fn(data);
//             });
//         }
//     }
// };