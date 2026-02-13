const express = require('express');
const router = express.Router();
const { store, generateId } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const { logAction } = require('../utils/helpers');

const CHOICES = ['가위', '바위', '보'];

function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * 3)];
}

function getResult(player, computer) {
  if (player === computer) return 'draw';
  if (
    (player === '가위' && computer === '보') ||
    (player === '바위' && computer === '가위') ||
    (player === '보' && computer === '바위')
  ) return 'win';
  return 'lose';
}

// 가위바위보 플레이
router.post('/play', authMiddleware, (req, res) => {
  const { choice, bet } = req.body;

  if (!choice || bet === undefined) {
    return res.status(400).json({ error: '선택(choice)과 베팅금액(bet)을 입력하세요' });
  }

  if (!CHOICES.includes(choice)) {
    return res.status(400).json({ error: '가위, 바위, 보 중에서 선택하세요' });
  }

  // BUG #4: 음수 베팅 미검증
  // bet에 음수를 넣으면, 졌을 때 coins -= 음수 = 코인 증가!
  // 검증이 없어서 -1000 베팅 후 지면 1000코인 획득
  // 수정: if (bet <= 0) return res.status(400).json(...)

  const user = store.users.find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다' });

  if (user.coins < bet) {
    return res.status(400).json({ error: '코인이 부족합니다' });
  }

  const computerChoice = getComputerChoice();
  const result = getResult(choice, computerChoice);

  let coinsChange = 0;

  if (result === 'win') {
    coinsChange = bet;
    user.wins++;
    user.winStreak++;

    // BUG #6: 연승 보너스 off-by-one
    // 3연승 보너스인데 > 3 으로 비교 → 정확히 3연승일 때 보너스 안 줌
    // 수정: >= 3
    if (user.winStreak > 3) {
      coinsChange += 500;
    }
  } else if (result === 'lose') {
    // BUG #5: 패배 페널티 음수 전환
    // 패배 시 페널티 = bet - (winStreak * 10)
    // 연승이 높으면 페널티가 음수 → 지는데 코인 증가!
    // 수정: Math.max(0, bet - user.winStreak * 10) 또는 단순히 bet
    coinsChange = -(bet - user.winStreak * 10);
    user.losses++;
    user.winStreak = 0;
  } else {
    user.draws++;
    // 무승부는 코인 변동 없음
  }

  user.coins += coinsChange;

  const game = {
    id: generateId(),
    userId: user.id,
    username: user.username,
    choice,
    computerChoice,
    result,
    bet,
    coinsChange,
    coinsAfter: user.coins,
    timestamp: new Date().toISOString(),
  };
  store.games.push(game);

  logAction(user.username + ': ' + choice + ' vs ' + computerChoice + ' = ' + result + ' (' + coinsChange + ')');

  res.json({ game });
});

// 게임 기록
router.get('/history', authMiddleware, (req, res) => {
  const userId = req.user.userId;
  const history = store.games
    .filter(g => g.userId === userId)
    .reverse()
    .slice(0, 30);
  res.json({ history });
});

module.exports = router;
