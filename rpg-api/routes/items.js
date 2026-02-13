const express = require('express');
const router = express.Router();
const { store } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

// Get all items
router.get('/', authMiddleware, (req, res) => {
  res.json({ items: store.items });
});

// Get items owned by current user's character
router.get('/inventory/:characterId', authMiddleware, (req, res) => {
  const character = store.characters.find(c => c.id === req.params.characterId);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  if (character.ownerId !== req.user.userId) {
    return res.status(403).json({ error: 'Not your character' });
  }
  res.json({ inventory: character.inventory });
});

// Trade item between characters
// BUG #4: Shallow Copy / Object Reference Bug
// When trading an item, the item object reference is shared between both inventories.
// Modifying the item (e.g., upgrading it) on one side affects the other.
router.post('/trade', authMiddleware, (req, res) => {
  const { fromCharacterId, toCharacterId, itemId } = req.body;

  if (!fromCharacterId || !toCharacterId || !itemId) {
    return res.status(400).json({ error: 'fromCharacterId, toCharacterId, and itemId are required' });
  }

  const fromChar = store.characters.find(c => c.id === fromCharacterId);
  const toChar = store.characters.find(c => c.id === toCharacterId);

  if (!fromChar || !toChar) {
    return res.status(404).json({ error: 'Character not found' });
  }

  if (fromChar.ownerId !== req.user.userId) {
    return res.status(403).json({ error: 'You can only trade from your own character' });
  }

  const itemIndex = fromChar.inventory.findIndex(item => item.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in inventory' });
  }

  // BUG: Shallow copy - both characters end up sharing the same object reference!
  // Should use: const tradedItem = JSON.parse(JSON.stringify(fromChar.inventory[itemIndex]));
  const tradedItem = fromChar.inventory[itemIndex];

  // Remove from sender (but tradedItem still points to the same object)
  fromChar.inventory.splice(itemIndex, 1);

  // Add the same object reference to receiver's inventory
  toChar.inventory.push(tradedItem);

  res.json({
    message: 'Trade successful',
    tradedItem,
    from: { id: fromChar.id, name: fromChar.name, inventoryCount: fromChar.inventory.length },
    to: { id: toChar.id, name: toChar.name, inventoryCount: toChar.inventory.length },
  });
});

// Assign item to character
router.post('/pickup', authMiddleware, (req, res) => {
  const { characterId, itemId } = req.body;

  const character = store.characters.find(c => c.id === characterId);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  if (character.ownerId !== req.user.userId) {
    return res.status(403).json({ error: 'Not your character' });
  }

  const item = store.items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (item.owner !== null) {
    return res.status(400).json({ error: 'Item already owned' });
  }

  item.owner = characterId;
  // BUG: Same shallow copy issue - pushing the reference, not a copy
  character.inventory.push(item);

  res.json({ message: 'Item picked up', item, character: { id: character.id, name: character.name } });
});

module.exports = router;
