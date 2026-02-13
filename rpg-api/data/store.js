// In-memory data store for the RPG game
// No database needed - everything lives in memory

const store = {
  users: [],
  characters: [],
  items: [
    { id: 'item_1', name: '철검', type: 'weapon', attack: 10, owner: null },
    { id: 'item_2', name: '강철방패', type: 'armor', defense: 8, owner: null },
    { id: 'item_3', name: '회복물약', type: 'consumable', heal: 30, owner: null },
  ],
  battles: [],
  nextId: 1,
};

function generateId() {
  return `id_${store.nextId++}`;
}

module.exports = { store, generateId };
