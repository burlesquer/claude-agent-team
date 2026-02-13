const express = require('express');
const router = express.Router();
const { store, generateId } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// Get all characters
// BUG #3: Sensitive Information Exposure
// Returns password_hash field of all users along with character data
router.get('/', authMiddleware, (req, res) => {
  const characters = store.characters.map(char => {
    const owner = store.users.find(u => u.id === char.ownerId);
    return {
      ...char,
      owner: owner ? {
        id: owner.id,
        username: owner.username,
        email: owner.email,
        password_hash: owner.password_hash,  // BUG: leaking sensitive data!
        createdAt: owner.createdAt,
      } : null,
    };
  });
  res.json({ characters });
});

// Create a character
router.post('/', authMiddleware, (req, res) => {
  const { name, characterClass } = req.body;

  if (!name || !characterClass) {
    return res.status(400).json({ error: 'Name and characterClass are required' });
  }

  const validClasses = ['warrior', 'mage', 'rogue', 'healer'];
  if (!validClasses.includes(characterClass)) {
    return res.status(400).json({ error: `Invalid class. Choose from: ${validClasses.join(', ')}` });
  }

  const baseStats = {
    warrior: { hp: 120, attack: 15, defense: 12, speed: 8 },
    mage:    { hp: 80,  attack: 20, defense: 6,  speed: 10 },
    rogue:   { hp: 90,  attack: 18, defense: 8,  speed: 15 },
    healer:  { hp: 100, attack: 8,  defense: 10, speed: 9 },
  };

  const character = {
    id: generateId(),
    name,
    characterClass,
    level: 1,
    experience: 0,
    ...baseStats[characterClass],
    maxHp: baseStats[characterClass].hp,
    inventory: [],
    ownerId: req.user.userId,
    createdAt: new Date().toISOString(),
  };

  store.characters.push(character);
  res.status(201).json({ character });
});

// Search characters by name
// BUG #2: ReDoS (Regular Expression Denial of Service)
// User input is passed directly into RegExp constructor without sanitization
router.get('/search', authMiddleware, (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Search name parameter is required' });
  }

  // Directly using user input in RegExp - vulnerable to ReDoS!
  // An attacker can send a crafted pattern like "(a+)+$" with a long string
  // to cause catastrophic backtracking
  const pattern = new RegExp(name, 'i');
  const results = store.characters.filter(char => pattern.test(char.name));

  res.json({ results });
});

// Get character by ID
router.get('/:id', authMiddleware, (req, res) => {
  const character = store.characters.find(c => c.id === req.params.id);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  res.json({ character });
});

module.exports = router;
