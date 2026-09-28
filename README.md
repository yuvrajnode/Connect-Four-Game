# Connect Four – Real-Time Multiplayer Game

A real-time implementation of the classic **Connect Four (4 in a Row)** game, built with a backend-driven architecture.  
Players can compete against each other in real time or play against a **competitive bot** when no opponent is available.

![Connect Four](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/backend-Node.js-green.svg)
![WebSockets](https://img.shields.io/badge/realtime-WebSockets-orange.svg)

---
**Live demo →** [connect-four-game-sable.vercel.app](https://connect-four-game-sable.vercel.app)

---

## ✨ Features

- **Real-Time Multiplayer**  
  Play against another player using WebSockets with instant board updates.

- **Automatic Matchmaking**  
  - Players are matched automatically.
  - If no opponent joins within **10 seconds**, the game starts against a bot.

- **Single-Player vs Bot**  
  The bot uses a priority-based strategy:
  - Win if possible
  - Block opponent’s winning move
  - Prefer the center column
  - Choose the first valid column otherwise

- **Reconnect Support**  
  Players can reconnect within **30 seconds** after disconnecting.  
  If they don’t, the opponent wins by default.

- **Leaderboard**  
  - Tracks total wins per player.
  - Exposed via a backend API.
  - Displayed on the frontend after games finish.

- **Simple Frontend UI**  
  Minimal React-based interface focused on functionality rather than styling.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm**

---

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yuvrajnode/Connect-Four-Game.git
```
2.	Navigate to the project directory:
```bash
cd Connect-Four-Game
```
3.	Install backend dependencies:
```bash
npm install
```
4.	Install frontend dependencies:
```bash
cd frontend
npm install
```

---
## ▶️ Running the App

### Backend (WebSocket Server + Leaderboard API)
From the project root:
```bash
npm start
```
### Frontend (React + Vite)
In a second terminal:
```bash
cd frontend
npm run dev
```

🎮 How to Play
```bash
	1.	Open the frontend in your browser.
	2.	Enter a username.
	3.	Click Join Game.
	4.	You will be matched with:
	    •	another player, or
	    •	the bot after ~10 seconds.
	5.	Click on a column to drop your disc.
	6.	The game ends when:
	    •	a player connects four discs in a row, or
	    •	the board is full.
```

📁 Project Structure
---
```bash
Connect-Four-Game/
├── backend
│   ├── index.js          # WebSocket server, matchmaking, reconnect logic
│   ├── bot
│   │   └── bot.js        # Bot decision logic
│   └── game
│       └── game.js       # Core game rules and win checks
├── frontend
│   ├── index.html
│   ├── package.json
│   └── src
│       ├── App.jsx       # UI and WebSocket client
│       └── main.jsx      # React entry point
├── package.json          # Backend dependencies
└── README.md
```
