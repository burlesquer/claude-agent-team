const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { store } = require('./data/store');
const { JWT_SECRET } = require('./middleware/auth');
const { logAction } = require('./utils/helpers');

const usersRouter = require('./routes/users');
const gameRouter = require('./routes/game');
const rankingRouter = require('./routes/ranking');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 회원가입
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요' });
  }
  if (store.users.find(u => u.username === username)) {
    return res.status(409).json({ error: '이미 사용중인 아이디입니다' });
  }

  const user = {
    id: uuidv4(),
    username,
    password_hash: Buffer.from(password).toString('base64'),
    coins: 1000,
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  logAction('가입: ' + username);

  res.status(201).json({
    message: '가입 완료',
    user: { id: user.id, username: user.username, coins: user.coins },
  });
});

// 로그인
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '아이디와 비밀번호를 입력하세요' });
  }

  const user = store.users.find(u => u.username === username);
  if (!user || user.password_hash !== Buffer.from(password).toString('base64')) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  logAction('로그인: ' + username);

  res.json({
    token,
    user: { id: user.id, username: user.username, coins: user.coins },
  });
});

app.use('/users', usersRouter);
app.use('/game', gameRouter);
app.use('/ranking', rankingRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    users: store.users.length,
    games: store.games.length,
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('가위바위보 도박장 서버: http://localhost:' + PORT);
  });
}

module.exports = app;
