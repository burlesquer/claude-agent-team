const express = require('express');
const router = express.Router();
const { store } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// 유저 목록
// BUG #3: 민감 정보 노출
// password_hash 필드가 그대로 노출됨
router.get('/', authMiddleware, (req, res) => {
  const users = store.users.map(u => ({
    id: u.id,
    username: u.username,
    coins: u.coins,
    wins: u.wins,
    losses: u.losses,
    draws: u.draws,
    password_hash: u.password_hash,  // BUG: 비밀번호 해시 노출!
    createdAt: u.createdAt,
  }));
  res.json({ users });
});

// 유저 검색
// BUG #2: ReDoS
// 사용자 입력을 RegExp에 직접 삽입
router.get('/search', authMiddleware, (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: '검색어를 입력하세요' });
  }
  const pattern = new RegExp(name, 'i');
  const results = store.users.filter(u => pattern.test(u.username));
  res.json({ results: results.map(u => ({ id: u.id, username: u.username, coins: u.coins })) });
});

// 내 정보
router.get('/me', authMiddleware, (req, res) => {
  const user = store.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다' });
  res.json({
    id: user.id,
    username: user.username,
    coins: user.coins,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    winStreak: user.winStreak,
  });
});

module.exports = router;
