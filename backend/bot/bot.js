const { dropDisc, checkWin } = require("../game/game");

/*
 * Decides the next move for the bot on priority basis :-
 1. Win if possible first 
 2. Try to block opponent's win
 3. Play center column to max future chances
--->"As dice in the centre has max chances to from horizontal,vertical,diagonal dots first"
 4. Play first available column
 */

function getBotMove(board) {
    //1. Win if possible first
  for (let col = 0; col < 7; col++) {
    const testBoard = board.map(row => row.slice()); //created a copy
    if (dropDisc(testBoard, col, 2)) { //checking if any move results in a win we takes that move immediately
      if (checkWin(testBoard, 2)) { // checking did bot find it 
        return col; // return the best move immediately
      }
    }
  }
  //2. Try to block opponent's move
  for (let col = 0; col < 7; col++) {
    const testBoard = board.map(row => row.slice()); //created a copy
    if (dropDisc(testBoard, col, 1)) { //bot check by dropping in every column
      if (checkWin(testBoard, 1)) { // check would human win 
        return col;
      }
    }
  }
  //3. Play center column to max future chances 
  const centerColumn = 3;
  if (board[0][centerColumn] === 0) {
    return centerColumn;
  }
  // picking the first column that is not full
  for (let col = 0; col < 7; col++) {
    if (board[0][col] === 0) {
      return col;
    }
  }
  // No valid moves (board is full)
  return -1;
}
module.exports = getBotMove;