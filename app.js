// DOMContentLoaded - all html files have loaded before reading javascript
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid");
    let width = 10;
    let bombAmount = 20;
    let flags = 0;
    let squares = [];
    let isGameOver = false;

    // create Board
    function createBoard() {
        // get shuffled game array with random bombs
        // Array(..) create array by specific size
        const bombsArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array((width * width) - bombAmount).fill('valid');
        // join arrays
        const gameArray = emptyArray.concat(bombsArray);
        // shuffled array by use 
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("id", i);
            square.classList.add(shuffledArray[i]);
            grid.appendChild(square);
            squares.push(square);

            // normal click
            square.addEventListener('click', (e) => {
                click(square);
            });

            // control and left click
            // add function at build-in 'oncontextmenu'
            square.oncontextmenu = function (e) {
                e.preventDefault();
                addFlag(square);
            }
        }

        // Add number (count around bombs) in each square
        for (let i = 0; i < squares.length; i++) {
            // total count bombs around each square
            let total = 0;
            // check left edge square,
            const isLeftEdge = (i % width === 0);
            // check right edge square,
            const isRightEdge = (i % width === width - 1);

            if (squares[i].classList.contains('valid')) {
                // check bomb left
                if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains("bomb")) total++;
                // check bomb above-right
                if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains("bomb")) total++;
                // check bomb above
                if (i > 10 && squares[i - width].classList.contains("bomb")) total++;
                // check bomb above-left
                if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains("bomb")) total++;
                // check bomb right
                if (i < 98 && !isRightEdge && squares[i + 1].classList.contains("bomb")) total++;
                // check bomb bottom-left
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom-right
                if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom
                if (i < 89 && squares[i + width].classList.contains("bomb")) total++;

                squares[i].setAttribute('data', total);
                // console.log(squares[i]);
            }
        }
    }

    createBoard();

    // Add flag with right click
    function addFlag(square) {
        if (isGameOver) return;
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if (!square.classList.contains('flag')) {
                square.classList.add('flag');
                square.innerHTML = '🚩';
                flags++;
                checkForWin();
            } else {
                square.classList.remove('flag');
                square.innerHTML = '';
                flags--;
            }
        }
    }

    // click on square actions
    function click(square) {
        let currentId = square.id;
        // check game over do nothing
        if (isGameOver) return;
        // check if square is checked or flagged, do nothing
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;

        if (square.classList.contains("bomb")) {
            gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                square.innerHTML = total;
                return; // for break loop;
            }

            checkSquare(square, currentId);

        }
        square.classList.add('checked');
    }

    // check neighbouring squares once square is clicked
    function checkSquare(square, currentId) {
        const isLeftEdge = (currentId % width === 0);
        const isRightEdge = (currentId % width === width - 1);

        setTimeout(() => {
            if (currentId > 0 && !isLeftEdge) {
                // get new square from left
                const newId = squares[parseInt(currentId) - 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 9 && !isRightEdge) {
                // get new square from above-right
                const newId = squares[parseInt(currentId) + 1 - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 10) {
                // get new square from above
                const newId = squares[parseInt(currentId) - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId > 11 && !isLeftEdge) {
                // get new square from above-left
                const newId = squares[parseInt(currentId) - 1 - width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 98 && !isRightEdge) {
                // get new square from above-left
                const newId = squares[parseInt(currentId) + 1].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 90 && !isLeftEdge) {
                // get new square from bottom-left
                const newId = squares[parseInt(currentId) - 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 88 && !isRightEdge) {
                // get new square from bottom-right
                const newId = squares[parseInt(currentId) + 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId < 89) {
                // get new square from bottom
                const newId = squares[parseInt(currentId) + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
        }, 10);
    }

    // game over
    function gameOver(square) {
        console.log('BOOM! Game Over!');
        isGameOver = true;

        // show ALL the bombs
        squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣';
            }
        });
    }

    // check for win
    function checkForWin() {
        let matches = 0;
        for (let i = 0; i < squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
                matches++;
            }
            if (matches == bombAmount) {
                console.log("You WIN!");
                gameOver = true;
            }
        }
    }
})