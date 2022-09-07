// DOMContentLoaded - all html files have loaded before reading javascript
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid");
    const bombAmountMonitor = document.getElementById("bombAmountMonitor");
    const btnStatus = document.getElementById("btnStatus");
    let width = 10;
    let bombAmount = 20;
    let flags = 0;
    let squares = [];
    let isGameOver = false;
    let kickOff = true;

    const minutesTimer = document.getElementById("minutesTimer");
    const secondsTimer = document.getElementById("secondsTimer");
    let totalSeconds = 0;
    let timeId;

    // create Board
    function createBoard() {
        // get shuffled game array with random bombs
        // Array(..) create array by specific size
        const bombsArray = Array(bombAmount).fill('bomb');
        const emptyArray = Array((width * width) - bombAmount).fill('valid');
        // join arrays
        const gameArray = emptyArray.concat(bombsArray);
        // shuffled array by use built-in array sort function with Math random function
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < width * width; i++) {
            const square = document.createElement("div");
            square.setAttribute("id", i);
            square.classList.add(shuffledArray[i]);
            grid.appendChild(square);
            squares.push(square);

            // normal click
            square.addEventListener('click', (e) => {
                startTrigger();
                click(square);
            });

            // control and left click
            // add function at build-in 'oncontextmenu'
            square.oncontextmenu = function (e) {
                e.preventDefault();
                startTrigger();
                checkFlag(square);
            }

            // double click
            square.addEventListener('dblclick', (e) => {
                e.preventDefault();
                startTrigger();
                doubleClick(square);
                clearSelection();
            });
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
                if (i >= 10 && squares[i - width].classList.contains("bomb")) total++;
                // check bomb above-left
                if (i >= 11 && !isLeftEdge && squares[i - 1 - width].classList.contains("bomb")) total++;
                // check bomb right
                if (i <= 98 && !isRightEdge && squares[i + 1].classList.contains("bomb")) total++;
                // check bomb bottom-left
                if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom-right
                if (i <= 88 && !isRightEdge && squares[i + 1 + width].classList.contains("bomb")) total++;
                // check bomb bottom
                if (i <= 89 && squares[i + width].classList.contains("bomb")) total++;

                squares[i].setAttribute('data', total);
                // console.log(squares[i]);
            }
        }

        btnStatus.addEventListener('click', () => {
            location.reload();
        });

        // Set display flag count
        setBombMonitor();
    }

    createBoard();

    function startTrigger() {
        // check if click off
        if (kickOff) {
            // start Timer
            timeId = setInterval(startTimer, 1000);
            kickOff = false;
        }
    }

    function startTimer() {
        ++totalSeconds;
        secondsTimer.innerHTML = String(totalSeconds % 60).padStart(2, '0');
        minutesTimer.innerHTML = String(parseInt(totalSeconds / 60)).padStart(2, '0');
    }

    function stopTimer() {
        clearInterval(timeId);
    }

    // for clear text selection
    function clearSelection() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }

    // for set display remain marked flags
    function setBombMonitor() {
        // set default display bomb amount monitor
        bombAmountMonitor.innerHTML = String(bombAmount - flags).padStart(3, '0');
    }

    // function for add Flag
    function addFlag(square) {
        square.classList.add('flag');
        square.innerHTML = '🚩';
        flags++;
        setBombMonitor();
    }

    // function for remove Flag
    function removeFlag(square) {
        square.classList.remove('flag');
        square.innerHTML = '';
        flags--;
        setBombMonitor();
    }

    // Add flag with right click
    function checkFlag(square) {
        // Case 'Game Over', do nothing
        if (isGameOver) return;
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if (!square.classList.contains('flag')) {
                addFlag(square);
                checkForWin();
            } else {
                removeFlag(square);
            }
        } else if (flags === bombAmount) {  // case marked flags equal to bomb amount, but not all matches
            if (square.classList.contains('flag')) {
                removeFlag(square);
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
        // if (square.classList.contains('checked')) return;

        // if square has flag, then remove
        // if (square.classList.contains('flag')) {
        //     removeFlag(square);
        // }

        // if square has bome, then game over
        if (square.classList.contains("bomb")) {
            gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (total != 0) {
                square.classList.add('checked');
                square.classList.add('block-number');
                square.classList.add('color' + total);
                square.innerHTML = total;
                return; // for break loop;
            }

            checkSquare(square, currentId);

        }
        square.classList.add('checked');
    }

    function doubleClick(square) {
        // check game over do nothing
        if (isGameOver) return;

        const data = parseInt(square.getAttribute('data'));
        // if square has checked
        if (square.classList.contains('checked') && data > 0) {
            let totalMarkedFlag = 0;
            const currentId = parseInt(square.getAttribute('id'));

            // check left edge square,
            const isLeftEdge = (currentId % width === 0);
            // check right edge square,
            const isRightEdge = (currentId % width === width - 1);

            // check marked flag left
            if (currentId > 0 && !isLeftEdge && squares[currentId - 1].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above-right
            if (currentId > 9 && !isRightEdge && squares[currentId + 1 - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above
            if (currentId >= 10 && squares[currentId - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag above-left
            if (currentId >= 11 && !isLeftEdge && squares[currentId - 1 - width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag right
            if (currentId <= 98 && !isRightEdge && squares[currentId + 1].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom-left
            if (currentId < 90 && !isLeftEdge && squares[currentId - 1 + width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom-right
            if (currentId <= 88 && !isRightEdge && squares[currentId + 1 + width].classList.contains("flag")) totalMarkedFlag++;
            // check marked flag bottom
            if (currentId <= 89 && squares[currentId + width].classList.contains("flag")) totalMarkedFlag++;

            console.log("totalMarkedFlag: ", totalMarkedFlag);
            // if square data equal to summary around marked flags
            if (totalMarkedFlag === data) {
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
                    if (currentId >= 10) {
                        // get new square from above
                        const newId = squares[parseInt(currentId) - width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId >= 11 && !isLeftEdge) {
                        // get new square from above-left
                        const newId = squares[parseInt(currentId) - 1 - width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId <= 98 && !isRightEdge) {
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
                    if (currentId <= 88 && !isRightEdge) {
                        // get new square from bottom-right
                        const newId = squares[parseInt(currentId) + 1 + width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                    if (currentId <= 89) {
                        // get new square from bottom
                        const newId = squares[parseInt(currentId) + width].id;
                        const newSquare = document.getElementById(newId);
                        click(newSquare);
                    }
                }, 10);
            }
        }
    }

    // check neighbouring squares once square is clicked
    function checkSquare(square, currentId) {
        // check left edge square,
        const isLeftEdge = (currentId % width === 0);
        // check right edge square,
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
            if (currentId <= 98 && !isRightEdge) {
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
            if (currentId <= 88 && !isRightEdge) {
                // get new square from bottom-right
                const newId = squares[parseInt(currentId) + 1 + width].id;
                const newSquare = document.getElementById(newId);
                click(newSquare);
            }
            if (currentId <= 89) {
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
        stopTimer();
        isGameOver = true;

        // show ALL the bombs
        squares.forEach(square => {
            // if (square.classList.contains('bomb')) {
            if (square.classList.contains('bomb') && !square.classList.contains('flag')) {
                square.classList.add('checked');
                square.classList.add('block-bomb');
                square.innerHTML = '💣';
            } else if (!square.classList.contains('bomb') && square.classList.contains('flag')) {
                square.classList.add('false-flag');
            }
        });

        // mark current square bomb
        square.classList.add('boom');
        btnStatus.innerHTML = '😟';
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
                stopTimer();
                btnStatus.innerHTML = '😄';
                gameOver = true;
            }
        }
    }
});