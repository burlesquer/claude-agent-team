const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { store } = require('./data/store');
const { JWT_SECRET } = require('./middleware/auth');
const { logAction } = require('./utils/helpers');

const charactersRouter = require('./routes/characters');
const itemsRouter = require('./routes/items');
const battlesRouter = require('./routes/battles');
const leaderboardRouter = require('./routes/leaderboard');

const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Auth Routes (no middleware needed) ---

// Register
app.post('/auth/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (store.users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const user = {
    id: uuidv4(),
    username,
    email: email || null,
    // Storing a "hash" - in real app this would use bcrypt
    password_hash: Buffer.from(password).toString('base64'),
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  logAction(`User registered: ${username}`);

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: user.id, username: user.username },
  });
});

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = store.users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordHash = Buffer.from(password).toString('base64');
  if (user.password_hash !== passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  logAction(`User logged in: ${username}`);

  res.json({ token, user: { id: user.id, username: user.username } });
});

// --- Game Routes ---
app.use('/characters', charactersRouter);
app.use('/items', itemsRouter);
app.use('/battles', battlesRouter);
app.use('/leaderboard', leaderboardRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    stats: {
      users: store.users.length,
      characters: store.characters.length,
      items: store.items.length,
      battles: store.battles.length,
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RPG API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
