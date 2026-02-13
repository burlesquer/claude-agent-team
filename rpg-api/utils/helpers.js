const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'game.log');

// BUG #8: Synchronous File I/O
// Uses writeFileSync which blocks the entire event loop on every call.
// Every API request that logs an action will block all other requests
// until the file write completes. Under load, this causes severe latency.
function logAction(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  // Blocking I/O - should use fs.appendFile (async) or a proper logging library
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    // Silently ignore write errors
  }
}

// Calculate distance between two points (used for future features)
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Format gold amount with commas
function formatGold(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = { logAction, calculateDistance, formatGold };
