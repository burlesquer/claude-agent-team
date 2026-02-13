// In-memory data store for the RPG game
// No database needed - everything lives in memory

const store = {
  users: [],
  characters: [],
  items: [
    { id: 'item_1', name: 'Iron Sword', type: 'weapon', attack: 10, owner: null },
    { id: 'item_2', name: 'Steel Shield', type: 'armor', defense: 8, owner: null },
    { id: 'item_3', name: 'Health Potion', type: 'consumable', heal: 30, owner: null },
    { id: 'item_4', name: 'Fire Staff', type: 'weapon', attack: 15, owner: null },
    { id: 'item_5', name: 'Dragon Armor', type: 'armor', defense: 20, owner: null },
  ],
  battles: [],
  nextId: 1,
};

function generateId() {
  return `id_${store.nextId++}`;
}

module.exports = { store, generateId };
