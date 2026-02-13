const express = require('express');
const router = express.Router();
const { store, generateId } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const { logAction } = require('../utils/helpers');

// Experience needed per level: level * 100
function expNeededForLevel(level) {
  return level * 100;
}

// Attack another character
router.post('/attack', authMiddleware, (req, res) => {
  const { attackerId, defenderId } = req.body;

  if (!attackerId || !defenderId) {
    return res.status(400).json({ error: 'attackerId and defenderId are required' });
  }

  if (attackerId === defenderId) {
    return res.status(400).json({ error: 'Cannot attack yourself' });
  }

  const attacker = store.characters.find(c => c.id === attackerId);
  const defender = store.characters.find(c => c.id === defenderId);

  if (!attacker || !defender) {
    return res.status(404).json({ error: 'Character not found' });
  }

  if (attacker.ownerId !== req.user.userId) {
    return res.status(403).json({ error: 'You can only attack with your own character' });
  }

  if (attacker.hp <= 0) {
    return res.status(400).json({ error: 'Your character is defeated and cannot attack' });
  }

  if (defender.hp <= 0) {
    return res.status(400).json({ error: 'Target is already defeated' });
  }

  // Calculate damage
  // BUG #5: Negative damage when defense > attack
  // Missing Math.max(0, damage) - if defender's defense is higher than
  // attacker's attack, damage goes negative and HEALS the defender!
  const baseDamage = attacker.attack - defender.defense;
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8x ~ 1.2x
  const damage = Math.floor(baseDamage * randomFactor);
  // Should be: const damage = Math.max(0, Math.floor(baseDamage * randomFactor));

  // Apply damage (or accidentally heal if negative!)
  defender.hp -= damage;

  // Cap HP at maxHp (but doesn't prevent going above if damage is negative)
  if (defender.hp > defender.maxHp) {
    defender.hp = defender.maxHp;
  }

  const defeated = defender.hp <= 0;
  if (defeated) {
    defender.hp = 0;
  }

  // Award experience to attacker
  const expGained = defeated ? 50 : 20;
  attacker.experience += expGained;

  // Check for level up
  // BUG #6: Off-by-one error in level-up condition
  // Uses > instead of >= so exact threshold doesn't trigger level up
  // e.g., if expNeeded is 100 and exp is exactly 100, no level up occurs
  const expNeeded = expNeededForLevel(attacker.level);
  if (attacker.experience > expNeeded) {  // Should be >=
    attacker.level += 1;
    attacker.experience -= expNeeded;
    attacker.maxHp += 10;
    attacker.hp = attacker.maxHp;
    attacker.attack += 3;
    attacker.defense += 2;
    attacker.speed += 1;
  }

  // Record battle
  const battle = {
    id: generateId(),
    attackerId,
    defenderId,
    damage,
    defenderHpRemaining: defender.hp,
    defeated,
    expGained,
    attackerLevel: attacker.level,
    timestamp: new Date().toISOString(),
  };
  store.battles.push(battle);

  logAction(`Battle: ${attacker.name} dealt ${damage} damage to ${defender.name}`);

  res.json({
    battle,
    attacker: {
      id: attacker.id,
      name: attacker.name,
      level: attacker.level,
      experience: attacker.experience,
      hp: attacker.hp,
    },
    defender: {
      id: defender.id,
      name: defender.name,
      hp: defender.hp,
      defeated,
    },
  });
});

// Get battle history
router.get('/history', authMiddleware, (req, res) => {
  const { characterId } = req.query;

  let battles = store.battles;
  if (characterId) {
    battles = battles.filter(
      b => b.attackerId === characterId || b.defenderId === characterId
    );
  }

  res.json({ battles });
});

// Heal character (rest)
router.post('/heal', authMiddleware, (req, res) => {
  const { characterId } = req.body;

  const character = store.characters.find(c => c.id === characterId);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  if (character.ownerId !== req.user.userId) {
    return res.status(403).json({ error: 'Not your character' });
  }

  character.hp = character.maxHp;

  logAction(`Heal: ${character.name} restored to full HP`);

  res.json({
    message: 'Character fully healed',
    character: { id: character.id, name: character.name, hp: character.hp, maxHp: character.maxHp },
  });
});

module.exports = router;
