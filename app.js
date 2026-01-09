const express = require('express');
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const { Chess } = require('chess.js');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const chess = new Chess();
let players = {};
let currentPlayer = "w";
let gameStats = {
    moves: 0,
    whiteCaptures: 0,
    blackCaptures: 0,
    startTime: Date.now()
};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "ChessMaster - Play Chess Online" });
});

// Helper function to count captured pieces
const getCaptureCounts = () => {
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
    let whiteCaptures = 0, blackCaptures = 0;

    Object.keys(startPieces).forEach(type => {
        if (type === 'k') return;
        whiteCaptures += startPieces[type] - (onBoard['b'][type] || 0);
        blackCaptures += startPieces[type] - (onBoard['w'][type] || 0);
    });

    return { whiteCaptures, blackCaptures };
};

io.on("connection", (uniquesocket) => {
    console.log("New connection:", uniquesocket.id);

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
        console.log("White player assigned");
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
        console.log("Black player assigned");
    } else {
        uniquesocket.emit("spectatorRole");
        console.log("Spectator assigned");
    }

    // Send current board state to newly connected player
    uniquesocket.emit("boardState", chess.fen());

    // Notify all clients about player count
    io.emit("playerUpdate", {
        white: !!players.white,
        black: !!players.black,
        gameStats: gameStats
    });

    uniquesocket.on("disconnect", () => {
        if (uniquesocket.id === players.white) {
            delete players.white;
            console.log("White player disconnected");
        } else if (uniquesocket.id === players.black) {
            delete players.black;
            console.log("Black player disconnected");
        }

        // Notify remaining players
        io.emit("playerUpdate", {
            white: !!players.white,
            black: !!players.black
        });
    });

    uniquesocket.on("move", (move) => {
        try {
            // Validate it's the player's turn
            if (chess.turn() === 'w' && uniquesocket.id !== players.white) {
                uniquesocket.emit("invalidMove", move);
                return;
            }
            if (chess.turn() === 'b' && uniquesocket.id !== players.black) {
                uniquesocket.emit("invalidMove", move);
                return;
            }

            const result = chess.move(move);

            if (result) {
                currentPlayer = chess.turn();
                gameStats.moves++;

                // Update capture counts
                const captures = getCaptureCounts();
                gameStats.whiteCaptures = captures.whiteCaptures;
                gameStats.blackCaptures = captures.blackCaptures;

                // Broadcast move to all clients
                io.emit("move", move);
                io.emit("boardState", chess.fen());
                io.emit("gameStats", gameStats);

                // Check for game over conditions
                if (chess.game_over()) {
                    let gameOverData = { reason: "gameOver" };

                    if (chess.in_checkmate()) {
                        gameOverData = {
                            reason: "checkmate",
                            winner: chess.turn() === 'w' ? 'black' : 'white'
                        };
                    } else if (chess.in_draw()) {
                        gameOverData = { reason: "draw" };
                    } else if (chess.in_stalemate()) {
                        gameOverData = { reason: "stalemate" };
                    }

                    io.emit("gameOver", gameOverData);
                    console.log("Game Over:", gameOverData);
                }
            } else {
                console.log("Invalid move:", move);
                uniquesocket.emit("invalidMove", move);
            }
        } catch (err) {
            console.log("Move error:", err);
            uniquesocket.emit("invalidMove", move);
        }
    });

    uniquesocket.on("resetGame", () => {
        chess.reset();
        currentPlayer = "w";
        gameStats = {
            moves: 0,
            whiteCaptures: 0,
            blackCaptures: 0,
            startTime: Date.now()
        };

        io.emit("boardState", chess.fen());
        io.emit("gameReset");
        io.emit("gameStats", gameStats);
        console.log("Game Reset");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 ChessMaster server running on port ${PORT}`);
    console.log(`📍 Open http://localhost:${PORT} in your browser`);
});