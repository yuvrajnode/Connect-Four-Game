import { useEffect, useRef, useState } from "react";
import "./App.css";

//board size as per assignment 
const ROWS = 6;
const COLS = 7;

function App() {
  const [username, setUsername] = useState("");
  const [board, setBoard] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [gameMessage, setGameMessage] = useState("");//for game win or loss result 
  const [leaderboard, setLeaderboard] = useState({});
  const [statusMessage, setStatusMessage] = useState("Enter a username to join a game.");//mainly for connection 

  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);//so that websocket should not re-renders 

  const fetchLeaderboard = () => {
    fetch("http://localhost:3001/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch(() => {});
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const joinGame = () => {
    if (!username || socketRef.current) return;

    setGameMessage("");
    setStatusMessage("Connecting to server...");

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          username: username,
        })
      );

      setIsConnected(true);
      setStatusMessage("Connected. Waiting for an opponent or bot...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.board) {
        setBoard(data.board);
        if (!data.result) {
          setStatusMessage("Game in progress...");
        }
      }

      if (data.result) {
        setGameMessage(data.result);
        fetchLeaderboard();
        setStatusMessage(data.result);
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
      setIsConnected(false);
      setStatusMessage("Disconnected from server. You can join a new game.");
    };

    socketRef.current = ws;
  };

  const makeMove = (columnIndex) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "move",
        column: columnIndex,
      })
    );
  };

  return (
    <div className="app">
      <h1>4 in a Row</h1>
      <div className="top-bar">
        <div className="status-panel">
          <p className="status-label">{statusMessage}</p>
          {gameMessage && <h3 className="result-message">{gameMessage}</h3>}
        </div>

        {!isConnected && (
          <div className="join-section">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="button" onClick={joinGame}>Join Game</button>
          </div>
        )}
      </div>

      <div className="main-layout">
        <div className="board-wrapper">
          <div className="board">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`r${rowIndex}-c${colIndex}`}
                  className={`cell player${cell}`}
                  type="button"
                  onClick={() => makeMove(colIndex)}
                  disabled={!isConnected}
                ></button>
              ))
            )}
          </div>
        </div>
        {Object.keys(leaderboard).length > 0 && (
          <div className="sidebar">
            <h2>Leaderboard</h2>
            <ul>
              {Object.entries(leaderboard).map(([name, wins]) => (
                <li key={name}>
                  {name}: {wins} wins
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;