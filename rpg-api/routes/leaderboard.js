const express = require('express');
const router = express.Router();
const { store } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// BUG #7: O(n^2) Performance Issue
// For each character, iterates through ALL battles to compute stats.
// No caching - recalculated on every single request.
// With 1000 characters and 10000 battles, this becomes extremely slow.
router.get('/', authMiddleware, (req, res) => {
  const leaderboard = [];

  // O(n) - iterate all characters
  for (const character of store.characters) {
    let wins = 0;
    let losses = 0;
    let totalDamageDealt = 0;
    let totalDamageReceived = 0;

    // O(m) - for EACH character, iterate ALL battles
    // This makes it O(n * m) overall
    for (const battle of store.battles) {
      if (battle.attackerId === character.id) {
        totalDamageDealt += battle.damage;
        if (battle.defeated) {
          wins++;
        }
      }
      if (battle.defenderId === character.id) {
        totalDamageReceived += battle.damage;
        if (battle.defeated) {
          losses++;
        }
      }
    }

    leaderboard.push({
      characterId: character.id,
      name: character.name,
      characterClass: character.characterClass,
      level: character.level,
      wins,
      losses,
      winRate: wins + losses > 0 ? (wins / (wins + losses) * 100).toFixed(1) : '0.0',
      totalDamageDealt,
      totalDamageReceived,
      owner: character.ownerId,
    });
  }

  // Sort by wins descending, then by level
  leaderboard.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.level - a.level;
  });

  res.json({ leaderboard });
});

module.exports = router;
