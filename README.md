# ♔ ChessMaster - Modern Multiplayer Chess Game

A sophisticated, real-time multiplayer chess application with a beautiful modern white design, innovative features, and seamless gameplay.

## ✨ Features

### Core Game Features
- **Real-time Multiplayer**: Play chess with friends using WebSocket connections
- **Smart Move Validation**: Automatic validation of chess moves using chess.js library
- **Game End Detection**: Automatic checkmate, stalemate, and draw detection
- **Board Orientation**: Auto-flips board based on player color (white on bottom, black on top)

### Innovative UI/UX Features
- **Modern Design**: Clean white background with gradient accents and glass-morphism effects
- **Dark Theme Toggle**: Switch between light and dark themes with persistent storage
- **Sound Effects**: Audio feedback for moves (enabled/disabled via toggle button)
- **Game Timer**: Real-time game duration tracking with HH:MM:SS format
- **Move History**: Complete move notation display that auto-scrolls with each move
- **Game Statistics**: 
  - Total moves counter
  - Captured pieces counter
  - Captured pieces visual display

### Player Management
- **Multi-role Support**: White player, Black player, or Spectator modes
- **Automatic Role Assignment**: First connection = white, second = black, rest = spectators
- **Real-time Player Status**: Displays which players are connected
- **Graceful Disconnection**: Handles player disconnects and notifies remaining clients

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NoorAbdullah02/ChessProject.git
cd ChessProject
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start        # Production mode
npm run dev      # Development mode with auto-reload (requires nodemon)
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📋 Project Structure

```
ChessProject/
├── app.js                    # Express server & Socket.IO backend
├── package.json              # Project dependencies
├── public/
│   ├── css/
│   │   └── style.css        # Modern design with Tailwind utilities
│   └── js/
│       └── chessgame.js     # Client-side game logic
└── views/
    └── index.ejs            # HTML template with responsive layout
```

## 🎮 How to Play

1. **Start the Server**: Run `npm start`
2. **Connect Players**: 
   - Open the game in your browser
   - Share the link with a friend
   - First person = White, Second person = Black
3. **Make Moves**: Drag pieces to valid squares
4. **Monitor Game**: Watch the move history, timer, and captured pieces
5. **Reset Game**: Click the reset button to start over

## 🛠️ Technology Stack

### Frontend
- **HTML5 + EJS**: Template-based rendering
- **CSS3 + Tailwind CSS**: Modern styling with utility-first approach
- **Vanilla JavaScript**: Game logic without frameworks
- **Socket.IO Client**: Real-time communication

### Backend
- **Express.js**: Web server framework
- **Node.js**: Runtime environment
- **Socket.IO**: WebSocket server for real-time features
- **chess.js**: Chess move validation and game logic

## 🎨 Design Features

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Glass-morphism Effects**: Modern frosted glass UI elements
- **Smooth Animations**: Transitions and pulse effects for better UX
- **Accessibility**: Semantic HTML and proper color contrast
- **Theme Support**: Dark mode for comfortable viewing

## 🔊 Sound System

The game uses the Web Audio API to generate:
- **Move Sound**: 800Hz beep for standard moves
- **Capture Sound**: 600Hz beep for piece captures
- **Toggle**: Easy on/off switch in the header

## 📊 Game Statistics Tracked

- **Total Moves**: Number of moves made in the current game
- **Captured Pieces**: Visual display and count of captured pieces
- **Game Duration**: Timer showing how long the game has been active
- **Move History**: Complete PGN-style notation (e.g., "1. e4→e5")

## ⌨️ Quick Tips

- **Dragging**: Click and drag pieces to move them
- **Piece Highlighting**: Draggable pieces show a grab cursor
- **Status Indicator**: Check status, turn indicator, and game-over messages
- **Multiplayer**: All game actions broadcast to all connected clients in real-time

## 🔧 Configuration

### Port
- Default: `3000`
- Override: `PORT` environment variable

### Themes
- Preferences stored in `localStorage`
- Auto-loaded on page refresh

## 🐛 Known Limitations

- Move undo not yet implemented
- No time controls (classical/blitz/bullet)
- No user authentication or accounts
- No game persistence (games reset on server restart)

## 🎯 Future Enhancements

- [ ] Move undo/redo functionality
- [ ] Time controls with countdown timers
- [ ] User authentication and game history
- [ ] ELO rating system
- [ ] Chat functionality
- [ ] Game replay and analysis
- [ ] Mobile app version
- [ ] AI opponent (stockfish.js)

## 📝 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Enjoy playing ChessMaster!** ♔

For support or questions, please open an issue on the repository.
