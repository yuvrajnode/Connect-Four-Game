//I intentionally kept game.js limited to pure game rules.
//Grid count as mentioned in assignment
const ROWS = 6;
const COLS = 7;

//Creating an empty 6*7 board where 0->empty 1->player1 2->player2/bot
function createBoard() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new Array(COLS).fill(0); //here we have created a row of 7 zeros 
    board.push(row);
  }
  return board;
}

//Dropping disc into lowest selected column
function dropDisc(board, column, player) {
  for (let row = ROWS - 1; row >= 0; row--) { //starting from bottom to up
    if (board[row][column] === 0) { // found the first empty spot 
      board[row][column] = player; // occupying that pot 
      return true;
    }
  }
  return false; //If all column is full, move failed 
}

//Checking game won or not 
function checkWin(board, player) {
  //Horizontal-check
  //here we scan every row and column and stop 3 row early 
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (
        board[r][c] === player &&
        board[r][c+1] === player &&
        board[r][c+2] === player &&
        board[r][c+3] === player
      ) {
        return true;
      }
    }
  }
  // Vertical-check
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (
        board[r][c] === player &&
        board[r+1][c] === player &&
        board[r+2][c] === player &&
        board[r+3][c] === player
      ) {
        return true;
      }
    }
  }
  // Diagonal (top-left → bottom-right)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (
        board[r][c] === player &&
        board[r+1][c+1] === player &&
        board[r+2][c+2] === player &&
        board[r+3][c+3] === player
      ) {
        return true;
      }
    }
  }
  // Diagonal (bottom-left → top-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (
        board[r][c] === player &&
        board[r-1][c+1] === player &&
        board[r-2][c+2] === player &&
        board[r-3][c+3] === player
      ) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  createBoard,
  dropDisc,
  checkWin
};