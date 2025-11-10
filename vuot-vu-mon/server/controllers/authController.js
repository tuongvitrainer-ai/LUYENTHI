const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE username = ? OR email = ?
    `).get(username, email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, auth_provider, role)
      VALUES (?, ?, ?, ?, 'manual', 'student')
    `).run(username, email, password_hash, display_name || username);

    const userId = result.lastInsertRowid;

    // Get created user
    const user = db.prepare(`
      SELECT id, username, email, display_name, role, total_stars, current_streak, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user (can login with username or email)
    const user = db.prepare(`
      SELECT id, username, email, password_hash, display_name, role,
             total_stars, current_streak, max_streak, auth_provider
      FROM users
      WHERE username = ? OR email = ?
    `).get(username, username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if user registered with social auth
    if (user.auth_provider !== 'manual') {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.auth_provider} login. Please login with ${user.auth_provider}.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Update last activity
    db.prepare(`
      UPDATE users
      SET last_activity_date = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(user.id);

    // Remove password_hash from response
    delete user.password_hash;

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 * Requires authentication
 */
const getMe = (req, res) => {
  try {
    // User is already attached by auth middleware
    const user = req.user;

    // Get additional stats
    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT er.id) as total_attempts,
        SUM(CASE WHEN er.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
        COUNT(DISTINCT DATE(er.created_at)) as days_active
      FROM exam_results er
      WHERE er.user_id = ?
    `).get(user.id);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          stats
        }
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user info'
    });
  }
};

/**
 * Logout (client-side mainly, just for API consistency)
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
