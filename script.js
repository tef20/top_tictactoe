const Game = (function() {
    const piece1 = 'X';
    const piece2 = 'O';

    const _gameboard = [
        // tiles of gameboard will be assigned the number 
        // of the player who chose them
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    function resetGame () {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                _gameboard[i][j] = null;
            }
        }
    }

    const currentState = function () {
        return _gameboard;
    };

    const playerToMove = function () {
        // Returns next player to take a turn (1 or 2)
        // Player 1 starts, so must always be 0 or 1 moves ahead of 2
        let p1Moves = 0;
        let p2Moves = 0;

        for (let i = 0; i < _gameboard.length; i++) {
            for (let j = 0; j < _gameboard[i].length; j++) {
                if (_gameboard[i][j] === 1) {
                    p1Moves++;
                } else if (_gameboard[i][j] === 2) {
                    p2Moves++;
                }
            }
        }

        return p2Moves < p1Moves ? 2 : 1;
    };

    const makeMove = function (i, j) {
        // i, j correspond to row, column coordinates on board
        // N.B. make a copy if running AI
        if (!winner() && tileFree(i, j)) {
            const currentPlayer = playerToMove();
            _gameboard[i][j] = currentPlayer;
            
            console.log(`Player ${currentPlayer} chose row ${i} column ${j}`);
            return true;
        } else {
            console.log('Illegal move attempted');
            return false;
        }
    };

    const tileFree = function (i, j) {
        return !_gameboard[i][j];
    }

    const availableMoves = function () {
        // returns array of objects of form {i, j} 
        // i, j correspond to row, column coordinates of gameboard
        let available = [];

        for (let i = 0; i < _gameboard.length; i++) {
            for (let j = 0; j < _gameboard[i].length; j++) {
                if (_gameboard[i][j] === null) {
                    available.push({i, j});
                }
            }
        }

        return available;
    };

    const winner = function () {
        // checks for 3 consecutive tiles of same marking
        // returns array of form [winner, [...coordinates]] if winner exists
        for (let i = 0; i < 3; i++) {
            // Check none empty horizontals
            if (_gameboard[i][0] && 
                _gameboard[i][0] === _gameboard[i][1] &&
                _gameboard[i][0] === _gameboard[i][2]) {
                    return [_gameboard[i][0], [[i, 0], [i, 1], [i, 2]]];
                }

            // Check none empty verticals
            if (_gameboard[0][i] && 
                _gameboard[0][i] === _gameboard[1][i] &&
                _gameboard[0][i] === _gameboard[2][i]) {
                    return [_gameboard[0][i], [[0, i], [1, i], [2, i]]];
                }

            // Check none empty diagonals
            if (_gameboard[1][1]) {
                // Top L-R diagonal
                if (_gameboard[1][1] === _gameboard[0][0] &&
                    _gameboard[1][1] === _gameboard[2][2]) {
                    return [_gameboard[0][0], [[0, 0], [1, 1], [2, 2]]];
                }
                // Top R-L diagonal
                if (_gameboard[1][1] === _gameboard[0][2] && 
                    _gameboard[1][1] === _gameboard[2][0]) {
                    return [_gameboard[0][2], [[0, 2], [1, 1], [2, 0]]];
                }
            }
        }
    };

    const gameOver = function () {
        return (winner() || !availableMoves().length) ? true : false;
    };
    
    return {currentState, playerToMove, makeMove, availableMoves, winner, gameOver, resetGame};

})();


const Player = (function () {
    // capacity for future features:
    //  - change player name
    //  - allow for ai player
    const _players = {
        // default settings
        1: {
            name: 'Player 1',
            piece: 'X',
            type: 'manual'
        }, 

        2: {
            name: 'Player 2',
            piece: 'O',
            type: 'manual'
        }, 
    }; 

    const getPlayerByNum = function (num) {
        if ([1, 2].includes(num)) {
            return {
                'name': _players[num].name, 
                'piece': _players[num].piece,
                'type': _players[num].type
            }; 
        }     
    }

    const setName = function (playerNum, proposedName) {
        const newName = (""+proposedName).trim();
        // maintain unique names
        if (newName && !_players.some(player => player.name === newName)) {
            _players[playerNum].name = newName;
        } else {
            console.log('Invalid name entered.')
        }
    }

    const setPiece = function (playerNum, proposedPiece) {
        const newPiece = (""+proposedPiece).trim();
        // maintain unique pieces
        if (newPiece && !_players.some(player => player.name === newName)) {
            _players[playerNum].piece = newPiece;
        } else {
            console.log('Invalid piece entered.')
        }
    }

    const setType = function (playerNum, newType) {
        if (['manual', 'computer'].includes(newType)) {
            _players[playerNum].type = newType;
        } else {
            console.log('Invalid type entered.')
        }
        
    }

    return {getPlayerByNum, setName, setPiece, setType};
})();

const DOM = (function () {
    // assign DOM elements from page
    // generate elements for board
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

const DisplayControl = (function () {
    // Manage interactions between user interface and game logic
    // Future features: 
    //  - Pub Sub pattern to reduce dependencies

    // add tile bindings
    DOM.tiles.forEach(tile => tile.addEventListener('click', selectTile));

    // add reset binding
    DOM.resetButton.onclick = () => {
        Game.resetGame();
        // remove any highlighting from previous round
        DOM.tiles.forEach(tile => tile.style.color = '')
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
        // take comma separated values from tileID and return coordinates as nums
        let i, j;
        [i, j] = tileID.split(',');
        return [+i, +j];
    }

    function updateBoard () {
        // loop tiles in DOM, adjust text to match gameboard
        for (const tile of DOM.tiles) {
            let i, j;
            [i, j] = parseCoordinatesFromCSV(tile.id);
            
            const tileMark = Player.getPlayerByNum(Game.currentState()[i][j]);

            tile.textContent = tileMark ? tileMark.piece : null;
        }

        if (Game.winner()) {
            highlightWinner();
        }
    }

    function highlightWinner () {
        // highlight winning 3-in-a-row marks
        for (coordinates of Game.winner()[1]) {
            let i, j;
            [i, j] = coordinates;
            const winningTile = document.getElementById(`${i},${j}`);
            winningTile.style.color = '#d2691e';
        }
    }    
            
    function updateMessage() {
        if (Game.winner()) {
            const winningPlayer = Player.getPlayerByNum(Game.winner()[0]);
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