const jwt = require('jsonwebtoken');
const { knex } = require('../database/db');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from database using Knex
    const user = await knex('users')
      .select(
        'id', 'email', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks',
        'last_activity_date'
      )
      .where('id', decoded.userId)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    next();

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
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      req.user = null;
      return next();
    }

    const user = await knex('users')
      .select(
        'id', 'email', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks',
        'last_activity_date'
      )
      .where('id', decoded.userId)
      .first();

    req.user = user || null;
    next();

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
