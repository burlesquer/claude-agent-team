const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super-secret-rpg-key-2024';

// BUG #1: Authentication Bypass
// The Bearer prefix check is case-sensitive.
// Sending "bearer" or "BEARER" instead of "Bearer" skips token verification entirely.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  // Case-sensitive check - only exact "Bearer " prefix triggers verification
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // If prefix doesn't match "Bearer " exactly (e.g., "bearer ", "BEARER "),
  // we just pass through without verification - this is the bug!
  // An attacker can send "bearer <anything>" and bypass auth
  const parts = authHeader.split(' ');
  if (parts.length === 2) {
    // Blindly trust any token-like string with a non-"Bearer" prefix
    try {
      const decoded = jwt.decode(parts[1]); // decode without verification!
      if (decoded) {
        req.user = decoded;
        return next();
      }
    } catch (e) {
      // fall through
    }
  }

  return res.status(401).json({ error: 'Invalid authorization format' });
}

module.exports = { authMiddleware, JWT_SECRET };
