const store = {
  users: [],
  games: [],
  nextId: 1,
};

function generateId() {
  return 'id_' + store.nextId++;
}

module.exports = { store, generateId };
