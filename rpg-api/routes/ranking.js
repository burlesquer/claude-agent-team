const express = require('express');
const router = express.Router();
const { store } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// BUG #7: O(n^2) 성능 이슈
// 유저마다 전체 게임 기록을 순회하여 통계 계산
// 캐싱 없이 매 요청마다 재계산
router.get('/', authMiddleware, (req, res) => {
  const ranking = [];

  for (const user of store.users) {
    let totalBet = 0;
    let totalWinnings = 0;

    // O(m) - 유저마다 전체 게임을 순회
    for (const game of store.games) {
      if (game.userId === user.id) {
        totalBet += Math.abs(game.bet);
        if (game.coinsChange > 0) {
          totalWinnings += game.coinsChange;
        }
      }
    }

    ranking.push({
      id: user.id,
      username: user.username,
      coins: user.coins,
      wins: user.wins,
      losses: user.losses,
      draws: user.draws,
      totalBet,
      totalWinnings,
      winRate: user.wins + user.losses > 0
        ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1)
        : '0.0',
    });
  }

  ranking.sort((a, b) => b.coins - a.coins);

  res.json({ ranking });
});

module.exports = router;
