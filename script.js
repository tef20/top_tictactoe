const Game = (function() {
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
        let xTiles = 0;
        let oTiles = 0;

        for (let i = 0; i < gameboard.length; i++) {
            for (let j = 0; j < gameboard[i].length; j++) {
                if (gameboard[i][j] === 'X') {
                    xTiles++;
                } else if (gameboard[i][j] === 'O') {
                    oTiles++;
                }
            }
        }

        return oTiles < xTiles ? 'O' : 'X';
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

const DisplayControl = (function () {
    // DOM cache
    const message = document.getElementById('message');
    const resetButton = document.getElementById('resetButton'); 
    resetButton.onclick = () => {
        Game.resetGame();
        renderBoard();
    }

    const board = document.getElementById('board');
    const tiles = [];

    // initialize board
    for (let i = 0; i < Game.currentState().length; i++) {
        for (let j = 0; j < Game.currentState()[i].length; j++) {
            const newTile = document.createElement('div');
            newTile.className = 'tile';
            newTile.id = `${i},${j}`;
            newTile.addEventListener('click', selectTile);
            board.appendChild(newTile); 
            tiles.push(newTile);
        }
    }

    renderBoard();
    
    function selectTile (event) {
        const selectedTile = event.target;
        let i, j;
        [i, j] = parseCoordinatesFromCSV(selectedTile.id);
        if (Game.makeMove(i, j)) {
            renderBoard();
        }
    }
    
    function parseCoordinatesFromCSV(tileID) {
        let i, j;
        [i, j] = tileID.split(',');
        return [+i, +j];
    }

    function renderBoard () {
        for (const tile of tiles) {
            let i, j;
            [i, j] = parseCoordinatesFromCSV(tile.id);
            tile.textContent = Game.currentState()[i][j];
        }

        updateMessage();
    }

    function updateMessage() {
        if (Game.winner()) {
            message.textContent = `Player ${Game.winner()} wins!`;
        } else if (Game.gameOver()) {
            message.textContent = "It's a tie!";
        } else {
            message.textContent = `Player ${Game.playerToMove()} to move...`
        }
    }

    return {
        renderBoard
    }

})();

function playerFactory (name, piece, isAI) {
    return {
        name, piece, type: isAI ? 'human' : 'computer'
    };
}

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