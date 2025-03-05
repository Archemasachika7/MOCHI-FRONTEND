const socket = io('https://mochi-backend.onrender.com'); // Replace with your Render backend URL

const gridContainer = document.querySelector('.grid');
const restartBtn = document.getElementById('restart-btn');
const popup = document.getElementById('popup');
const resultMessage = document.getElementById('result-message');
const newGameBtn = document.getElementById('new-game-btn');

let roomId = prompt('Enter room ID:'); // Ask for room ID
let currentPlayer = null;
let board = Array(5).fill().map(() => Array(5).fill(''));
let gameActive = false;

// Join the room
socket.emit('joinRoom', roomId);

// Handle room joined
socket.on('roomJoined', (room) => {
  currentPlayer = room.players[0] === socket.id ? 'A' : 'S';
  board = room.board;
  createBoard();
});

// Handle game start
socket.on('gameStart', (room) => {
  gameActive = true;
  createBoard();
});

// Handle move made
socket.on('moveMade', (data) => {
  board = data.board;
  createBoard();

  if (data.winner) {
    endGame(data.winner);
  } else if (data.isDraw) {
    endGame(null);
  }
});

// Handle player left
socket.on('playerLeft', () => {
  alert('Opponent left the game.');
  resetGame();
});

// Initialize the game board
function createBoard() {
  gridContainer.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('div');
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.textContent = board[i][j];
      cell.style.color = board[i][j] === 'A' ? 'blue' : 'pink';
      if (gameActive && board[i][j] === '') {
        cell.addEventListener('click', handleCellClick);
      }
      gridContainer.appendChild(cell);
    }
  }
}

// Handle cell click
function handleCellClick(event) {
  const row = event.target.dataset.row;
  const col = event.target.dataset.col;
  socket.emit('makeMove', roomId, row, col);
}

// End the game
function endGame(winner) {
  gameActive = false;
  if (winner) {
    resultMessage.textContent = winner === 'A' ? '❤️ Archi Loves Sumo ❤️' : '❤️ Sumo Loves Archi ❤️';
    document.body.style.background = winner === 'A' ? 'linear-gradient(135deg, #0000ff, #87cefa)' : 'linear-gradient(135deg, #ff69b4, #ffc0cb)';
  } else {
    resultMessage.textContent = '💚 LOVE IS ETERNAL GREEN 💚';
    document.body.style.background = 'linear-gradient(135deg, #008000, #00ff00)';
  }
  popup.style.display = 'flex';
}

// Reset the game
function resetGame() {
  board = Array(5).fill().map(() => Array(5).fill(''));
  gameActive = false;
  createBoard();
  document.body.style.background = 'linear-gradient(135deg, #ff7f50, #ff4500)';
}

// Restart the game
restartBtn.addEventListener('click', () => {
  socket.emit('restartGame', roomId);
});

// New Game
newGameBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  resetGame();
});
