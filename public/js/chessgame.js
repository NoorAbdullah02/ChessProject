const socket = io();
let chess;
let chessReady = false;
let playerRole = null;
let moveHistory = [];
let gameStartTime = null;
let soundEnabled = true;

const boardElement = document.querySelector(".chessboard");
const statusElement = document.querySelector(".game-status");
const playerRoleElement = document.querySelector(".player-role");
const capturedWhiteElement = document.querySelector(".captured-white");
const capturedBlackElement = document.querySelector(".captured-black");
const resetButton = document.querySelector(".reset-btn");
const soundToggle = document.querySelector("#soundToggle");
const themeToggle = document.querySelector("#themeToggle");
const timerElement = document.querySelector(".timer");
const moveCountElement = document.querySelector(".move-count");
const capturedCountElement = document.querySelector(".captured-count");
const moveListElement = document.querySelector(".move-list");

let draggedPiece = null;
let sourceSquare = null;

function initChess() {
    if (typeof Chess !== 'undefined') {
        chess = new Chess();
        chessReady = true;
        renderBoard();
        startTimer();
    } else {
        setTimeout(initChess, 100);
    }
}

const renderBoard = () => {
    if (!chessReady) return;
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + colIndex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: colIndex };
                        e.dataTransfer.effectAllowed = "move";
                        pieceElement.classList.add("dragging");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    pieceElement.classList.remove("dragging");
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if (playerRole === 'b') {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }

    updateStatus();
    updateCapturedPieces();
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: { w: "♙", b: "♟" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" },
    };
    return unicodePieces[piece.type][piece.color];
};

const updateStatus = () => {
    let status = "";
    if (chess.in_checkmate()) {
        status = `♔ Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins! ♚`;
        statusElement.classList.add("game-over");
        statusElement.classList.remove("check");
    } else if (chess.in_draw()) {
        status = "🤝 Game Over - Draw!";
        statusElement.classList.add("game-over");
        statusElement.classList.remove("check");
    } else if (chess.in_stalemate()) {
        status = "🤝 Game Over - Stalemate!";
        statusElement.classList.add("game-over");
        statusElement.classList.remove("check");
    } else if (chess.in_check()) {
        status = `⚠️ Check! ${chess.turn() === 'w' ? 'White' : 'Black'} to move`;
        statusElement.classList.add("check");
        statusElement.classList.remove("game-over");
    } else {
        status = `${chess.turn() === 'w' ? '⚪ White' : '⚫ Black'} to move`;
        statusElement.classList.remove("check", "game-over");
    }
    statusElement.textContent = status;
};

const updateCapturedPieces = () => {
    const pieces = { white: [], black: [] };
    const board = chess.board().flat();
    const onBoard = { w: {}, b: {} };
    
    board.forEach(square => {
        if (square) {
            const color = square.color;
            const type = square.type;
            onBoard[color][type] = (onBoard[color][type] || 0) + 1;
        }
    });

    const startPieces = { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 };
    ['w', 'b'].forEach(color => {
        Object.keys(startPieces).forEach(type => {
            if (type === 'k') return;
            const captured = startPieces[type] - (onBoard[color][type] || 0);
            for (let i = 0; i < captured; i++) {
                if (color === 'w') {
                    pieces.black.push(getPieceUnicode({ type, color }));
                } else {
                    pieces.white.push(getPieceUnicode({ type, color }));
                }
            }
        });
    });

    capturedWhiteElement.innerHTML = pieces.white.length > 0 ? pieces.white.join(' ') : '—';
    capturedBlackElement.innerHTML = pieces.black.length > 0 ? pieces.black.join(' ') : '—';
    capturedCountElement.textContent = pieces.white.length + pieces.black.length;
};

const addToMoveHistory = (move) => {
    const moveDisplay = move.from && move.to ? `${move.from}→${move.to}` : move;
    moveListElement.innerHTML = '';
    moveHistory.push(moveDisplay);
    moveCountElement.textContent = moveHistory.length;

    moveHistory.forEach((m, idx) => {
        const item = document.createElement("span");
        item.classList.add("move-item");
        if (idx % 2 === 0) {
            item.textContent = `${Math.floor(idx / 2) + 1}. ${m}`;
        } else {
            item.textContent = m;
        }
        moveListElement.appendChild(item);
    });

    const historyContainer = document.querySelector(".move-history");
    historyContainer.scrollTop = historyContainer.scrollHeight;
};

const startTimer = () => {
    gameStartTime = Date.now();
    setInterval(() => {
        if (gameStartTime) {
            const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;

            timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
};

const playSound = (soundType = 'move') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (soundType === 'move') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (soundType === 'capture') {
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }
};

const toggleSound = () => {
    soundEnabled = !soundEnabled;
    soundToggle.innerHTML = soundEnabled
        ? '<i class="fas fa-volume-up"></i>'
        : '<i class="fas fa-volume-mute"></i>';
    localStorage.setItem('chessSoundEnabled', soundEnabled);
};

const toggleTheme = () => {
    document.body.style.filter = document.body.style.filter ? '' : 'hue-rotate(45deg)';
};

socket.on('playerRole', (role) => {
    playerRole = role;
    const roleText = role === 'w' ? '⚪ White Player' : '⚫ Black Player';
    playerRoleElement.textContent = roleText;
    renderBoard();
});

socket.on('spectatorRole', () => {
    playerRole = null;
    playerRoleElement.textContent = '👁️ Spectating';
    renderBoard();
});

socket.on("boardState", (fen) => {
    if (chessReady) {
        chess.load(fen);
        renderBoard();
    }
});

socket.on("move", (move) => {
    if (chessReady) {
        const moveBefore = chess.fen();
        chess.move(move);

        const boardBefore = new Chess(moveBefore).board().flat();
        const targetSquare = move.to;
        const wasCapture = boardBefore.some(p => p && p.square === targetSquare);

        playSound(wasCapture ? 'capture' : 'move');
        addToMoveHistory(move);
        renderBoard();
    }
});

socket.on("invalidMove", (move) => {
    console.log("Invalid move attempted:", move);
});

socket.on("gameOver", () => {
    updateStatus();
});

socket.on("gameReset", () => {
    moveHistory = [];
    moveCountElement.textContent = '0';
    moveListElement.innerHTML = '<p class="empty-state">No moves yet...</p>';
    statusElement.classList.remove("check", "game-over");
    gameStartTime = Date.now();
    renderBoard();
});

resetButton?.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the game?")) {
        socket.emit("resetGame");
    }
});

soundToggle?.addEventListener("click", toggleSound);
themeToggle?.addEventListener("click", toggleTheme);

window.addEventListener("load", () => {
    const savedSound = localStorage.getItem('chessSoundEnabled') !== 'false';
    soundEnabled = savedSound;
    if (!soundEnabled) {
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    initChess();
});