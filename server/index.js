const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve built frontend in production
app.use(express.static(path.join(__dirname, '../client/dist')));

const game = new Game(io);

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} connected`);

  // Send current state to newly connected client
  socket.emit('game_state', {
    state: game.state,
    players: game.getPlayersArray(),
    isFull: game.isFull()
  });

  socket.on('join_game', ({ name, emoji }) => {
    if (game.isFull()) {
      socket.emit('join_error', { message: 'Game is full (max 20 players)' });
      return;
    }
    if (game.state === 'finished') {
      socket.emit('join_error', { message: 'Game has already ended' });
      return;
    }
    const trimmedName = String(name || '').trim().slice(0, 20);
    if (!trimmedName) {
      socket.emit('join_error', { message: 'Name cannot be empty' });
      return;
    }

    const isLateJoin = game.state !== 'lobby';
    game.addPlayer(socket.id, trimmedName, emoji || '🎮');
    const gameState = isLateJoin ? game.getCurrentStateSync() : null;
    socket.emit('join_success', { id: socket.id, name: trimmedName, emoji, gameState });
    console.log(`[+] ${trimmedName} ${emoji} joined${isLateJoin ? ' (late)' : ''}`);
  });

  socket.on('start_game', () => {
    const started = game.startGame();
    if (!started) {
      socket.emit('start_error', { message: 'Cannot start game right now' });
    }
  });

  socket.on('submit_answer', ({ optionIndex }) => {
    game.submitAnswer(socket.id, optionIndex);
  });

  socket.on('reset_game', () => {
    game.reset();
    io.emit('game_reset', { state: 'lobby', players: [] });
    console.log('[~] Game reset');
  });

  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id} disconnected`);
    game.removePlayer(socket.id);
  });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bark Quiz server running on http://localhost:${PORT}`);
});
