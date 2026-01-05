const WebSocket = require("ws");
const http = require("http");
//uuid generator for unique game id each time
const { v4: uuidv4 } = require("uuid");
//for game logic
const { createBoard, dropDisc, checkWin } = require("./game/game");
//for bot logic 
const getBotMove = require("./bot/bot");


const WS_PORT = 8080; //websocket port
const LEADERBOARD_PORT = 3001; // leaderboard rest-api
const RECONNECT_TIME = 30000; //time allowed for a disconnected player to reconnect within 30 seconds


let waitingPlayer = null; //player who is waiting for match
const games = {}; //for storing all active games in the memory 
const leaderboard = {}; // username storing basically who wins

//created a websocket server 
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (socket) => {
  console.log("Player connected");

  //handling the connections here 
  socket.on("message", (msg) => {
    const data = JSON.parse(msg);

    //checking if the user joined or not 
    if (data.type === "join") {
      socket.username = data.username;

      // Check if this user is either reconnecting
      for (const gameId in games) {
        const game = games[gameId];
        //cancel here 
        if (game.players[socket.username]) {
          clearTimeout(game.disconnectTimers[socket.username]);
          //recheck here
          game.players[socket.username] = socket;
          socket.gameId = gameId;
          socket.playerNumber = game.playerOrder.indexOf(socket.username) + 1;
          //sending the current state status
          socket.send(JSON.stringify({
            type: "reconnected",
            board: game.board
          }));

          console.log(`${socket.username} reconnected`);
          return;
        }
      }

      // matchmaking code
      //if here another player is already waiting we start match with that person 
      if (waitingPlayer) {
        startGame(waitingPlayer, socket, false);
        waitingPlayer = null;
      } else {
        //put this player on waiting state 
        waitingPlayer = socket;

        //here implemented the time criteria of 10 sec, else start the game with bot
        setTimeout(() => {
          if (waitingPlayer === socket) {
            startGame(socket, null, true);
            waitingPlayer = null;
          }
        }, 10000);
      }
    }

    //here we have managed the movement 
    if (data.type === "move") {
      const game = games[socket.gameId];
      if (!game) return;
      //allowing only if it was the player turn 
      if (game.currentTurn !== socket.playerNumber) return;
      //dropping the disc in player choice column 
      const moveDone = dropDisc(
        game.board,
        data.column,
        socket.playerNumber
      );

      if (!moveDone) return;

      //checking if this move win the game 
      if (checkWin(game.board, socket.playerNumber)) {
        finishGame(game, socket.username);
        return;
      }

      // Switching the turn to other player 
      game.currentTurn = game.currentTurn === 1 ? 2 : 1;
      //sending updated board to all player 
      broadcast(game, { type: "update", board: game.board });

      //bot move if it was a bot game 
      if (game.isBotGame && game.currentTurn === 2) {
        playBotTurn(game);
      }
    }
  });

  //handling the case if player got disconnected 
  socket.on("close", () => {
    const game = games[socket.gameId];
    if (!game) return;

    console.log(`${socket.username} disconnected`);
    //giving the player 30 seconds to reconnect 
    game.disconnectTimers[socket.username] = setTimeout(() => {
      finishGame(game, "Opponent (disconnect)");
    }, RECONNECT_TIME);
  });
});

//either starting a new game with the person or with the bot 
function startGame(player1, player2, isBotGame) {
  const gameId = uuidv4();
  const board = createBoard();

  games[gameId] = {
    id: gameId,
    board,
    currentTurn: 1,
    isBotGame,
    playerOrder: [
      player1.username,
      isBotGame ? "Bot" : player2.username
    ],
    players: {
      [player1.username]: player1
    },
    disconnectTimers: {}
  };
  //assigning the player number and initial board
  player1.gameId = gameId;
  player1.playerNumber = 1;
  player1.send(JSON.stringify({ type: "start", board }));

  if (!isBotGame) {
    games[gameId].players[player2.username] = player2;
    player2.gameId = gameId;
    player2.playerNumber = 2;
    player2.send(JSON.stringify({ type: "start", board }));
  }

  console.log("Game started:", gameId);
}

function playBotTurn(game) {
  const botColumn = getBotMove(game.board);
  dropDisc(game.board, botColumn, 2);

  if (checkWin(game.board, 2)) {
    finishGame(game, "Bot");
    return;
  }

  game.currentTurn = 1;
  broadcast(game, { type: "update", board: game.board });
}

//finishing the game if bot wins here 
function finishGame(game, winner) {
  if (winner !== "Bot") {
    leaderboard[winner] = (leaderboard[winner] || 0) + 1;
  }
  //showing the leaderboard 
  broadcast(game, {
    type: "game_over",
    board: game.board,
    result: `${winner} won the game`
  });
  //deleting from memory 
  delete games[game.id];
  console.log("Game ended:", game.id);
}

//send the message to all the player in the game here 
function broadcast(game, message) {
  Object.values(game.players).forEach(player => {
    if (player && player.readyState === WebSocket.OPEN) {
      player.send(JSON.stringify(message));
    }
  });
}

//leaderboard working basically an endpoint that return leaderboard data as json fetched when needed 
//I use HTTP here as real time data is not required on the leaderboard  
http.createServer((req, res) => {
  if (req.url === "/leaderboard") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify(leaderboard));
  }
}).listen(LEADERBOARD_PORT, () => {
  console.log(
    `Leaderboard API running at http://localhost:${LEADERBOARD_PORT}/leaderboard`
  );
});