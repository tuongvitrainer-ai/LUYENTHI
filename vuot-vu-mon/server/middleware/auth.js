const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Get user from database (V6 schema)
      const user = db.prepare(`
        SELECT id, email, full_name, role, is_anonymous,
               stars_balance, current_streak, max_streak, freeze_streaks,
               avatar_url, google_id, last_learnt_date
        FROM users
        WHERE id = ?
      `).get(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

/**
 * Optional auth - doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        req.user = null;
        return next();
      }

      const user = db.prepare(`
        SELECT id, email, full_name, role, is_anonymous,
               stars_balance, current_streak, max_streak, freeze_streaks,
               avatar_url, google_id, last_learnt_date
        FROM users
        WHERE id = ?
      `).get(decoded.userId);

      req.user = user || null;
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  optionalAuth
};
