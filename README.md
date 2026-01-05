# Connect Four – Real-Time Multiplayer Game

A real-time Connect Four ("4 in a Row") game with:

- Multiplayer over WebSockets
- Single-player vs a simple bot
- Automatic matchmaking
- In-memory leaderboard

The backend is built with Node.js and `ws`, and the frontend is built with React + Vite.

---

## Features

- **Real-time gameplay**  
  Players communicate with the server over WebSockets at `ws://localhost:8080`. Moves are broadcast to both players immediately.

- **Automatic matchmaking**  
  - The first player to join waits in a queue.  
  - If a second player joins within 10 seconds, a **player vs player** game starts.  
  - If no one joins within 10 seconds, a **player vs bot** game starts automatically.

- **Single-player vs Bot**  
  The bot uses a simple strategy:
  - Try to **win immediately** if possible.
  - Otherwise, **block the opponent’s winning move**.
  - Prefer the **center column** to maximize future options.
  - Otherwise, choose the first available column.

- **Reconnect support**  
  If a player disconnects, they have **30 seconds** to reconnect before the opponent wins by default.

- **Leaderboard**  
  - After each win (except when the bot wins), the winner’s score is incremented.  
  - Leaderboard is exposed as `GET http://localhost:3001/leaderboard`.  
  - The frontend fetches and displays the leaderboard.

> Note: Leaderboard data is kept **in memory only** and is reset whenever the backend process restarts.

---

## Tech Stack

- **Frontend**
  - React (via Vite)
  - JavaScript (ES modules)

- **Backend**
  - Node.js
  - `ws` for WebSockets
  - `uuid` for game IDs

---

## Project Structure


├── backend
│   ├── index.js          # WebSocket server, matchmaking, reconnect logic, leaderboard API
│   ├── bot
│   │   └── bot.js        # Bot move decision logic
│   └── game
│       └── game.js       # Pure game rules (board, drop disc, win check)
├── frontend
│   ├── index.html
│   ├── package.json      # Frontend dependencies and scripts
│   └── src
│       ├── App.jsx       # UI, WebSocket client, leaderboard rendering
│       └── main.jsx      # React entry point
├── package.json          # Backend root dependencies and scripts
└── README.md             # Project documentation


## Getting Started

### 1. Prerequisites

- **Node.js** v18+ (or compatible)
- **npm** (comes with Node)

### 2. Install Dependencies

From the project root (for backend dependencies):

```bash
npm install
```

Then install frontend dependencies:

```bash
cd frontend
npm install
```

---

## Running the App in Development

You need **two terminals**: one for the backend and one for the frontend.

### Backend (WebSocket server + Leaderboard API)

From the project root:

```bash
npm start
```

This runs `node backend/index.js` and starts:

- **WebSocket server** at `ws://localhost:8080`
- **Leaderboard HTTP API** at `http://localhost:3001/leaderboard`

You can also run the backend directly with:

```bash
node backend/index.js
```

### Frontend (React + Vite)

In a separate terminal:

```bash
cd frontend
npm run dev
```

Vite will print a local URL, usually something like:

- `http://localhost:5173/`

Open that URL in your browser.

> Make sure the backend is running before joining a game, otherwise the WebSocket connection will fail.

---

## How to Play

1. Open the frontend in your browser (e.g. `http://localhost:5173/`).
2. Enter a **username** in the text input.
3. Click **"Join Game"**.
4. You will either:
   - Be matched with another human player, or
   - Be matched with the **bot** after ~10 seconds if no one else joins.
5. Click on any cell in a column to **drop your disc** in that column.
6. The game ends when:
   - A player connects 4 in a row (horizontal, vertical, or diagonal), or
   - The board is full.

After the game, a **result message** is shown and the **leaderboard** updates.

---

## Implementation Details

- **Game rules** (in `backend/game/game.js`)
  - `createBoard()` creates a 6×7 board (0 = empty, 1 = player 1, 2 = player 2 / bot).
  - `dropDisc(board, column, player)` drops a disc into the lowest available row in the given column.
  - `checkWin(board, player)` checks horizontal, vertical, and both diagonal directions for 4 in a row.

- **Bot logic** (in `backend/bot/bot.js`)
  - Simulates moves on a copy of the board.
  - First tries a winning move for the bot.
  - Then checks if the opponent has a winning move next turn and blocks it.
  - Prefers the center column (`column 3`) if available.
  - Otherwise picks the first non-full column.

- **Matchmaking & reconnects** (in `backend/index.js`)
  - Keeps at most one `waitingPlayer` in memory.
  - Stores active games in a `games` object keyed by game ID.
  - On disconnect, starts a 30-second timer; if the player does not reconnect in time, the opponent wins.

---

## Known Limitations / Notes

- **In-memory storage**  
  All games and leaderboard data are stored **in memory only**. Restarting the backend clears them.

- **CORS for leaderboard**  
  The frontend runs on a different port (Vite, usually `5173`), while the leaderboard API runs on `3001`. The backend enables CORS for the `/leaderboard` endpoint so the frontend can fetch it from another origin.

- **No authentication**  
  Any user can join with any username. The leaderboard is keyed by raw username strings.

---

## Possible Improvements

- Persist the leaderboard in a real database instead of memory.
- Add authentication or session handling.
- Improve the UI/UX (turn indicator, highlight winning four discs, rematch button, etc.).
- Add tests for game logic and bot behavior.

