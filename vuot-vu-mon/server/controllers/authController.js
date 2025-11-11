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
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// ============================================
// API 1: GUEST LOGIN (CỐT LÕI CHIẾN LƯỢC "GUEST-FIRST")
// POST /api/auth/guest
// ============================================
/**
 * Tạo tài khoản Guest để người dùng chơi ngay lập tức
 *
 * Logic:
 * - Tạo user mới với role='guest', is_anonymous=1
 * - Tặng sẵn 2 freeze_streaks (khiên bảo vệ)
 * - Trả về JWT token để lưu session
 *
 * Mục đích: Trẻ em có thể chơi game ngay mà không cần đăng ký
 */
const createGuestUser = async (req, res) => {
  try {
    console.log('📝 Tạo Guest User mới...');

    // Tạo guest user mới
    const result = db.prepare(`
      INSERT INTO users (
        role,
        is_anonymous,
        stars_balance,
        freeze_streaks,
        current_streak,
        max_streak
      ) VALUES ('guest', 1, 0, 2, 0, 0)
    `).run();

    const userId = result.lastInsertRowid;

    // Lấy thông tin user vừa tạo
    const user = db.prepare(`
      SELECT
        id, role, is_anonymous, stars_balance,
        freeze_streaks, current_streak, max_streak,
        created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    // Tạo JWT token
    const token = generateToken(userId);

    console.log(`✅ Guest User #${userId} đã được tạo`);

    res.status(201).json({
      success: true,
      message: 'Guest user created successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('❌ Create guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating guest user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API 2: REGISTER (NÂNG CẤP GUEST → STUDENT)
// POST /api/auth/register
// ============================================
/**
 * Nâng cấp tài khoản Guest thành Student (hoặc tạo mới nếu không có token)
 *
 * Logic:
 * - Nếu có JWT token (guest): Cập nhật user đó thành student
 * - Nếu không có token: Tạo user mới với role='student'
 * - Giữ nguyên stars_balance, current_streak (bảo toàn thành tích)
 *
 * Body: { email, password, full_name?, guestToken? }
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name, guestToken } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
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

    // Check if email already exists
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE email = ?
    `).get(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    let userId;
    let upgradeMode = false;

    // CASE 1: Upgrade từ Guest (có guestToken)
    if (guestToken) {
      try {
        // Verify guest token
        const decoded = jwt.verify(guestToken, process.env.JWT_SECRET);
        const guestUserId = decoded.userId;

        // Kiểm tra user có phải guest không
        const guestUser = db.prepare(`
          SELECT id, role, is_anonymous, stars_balance, current_streak, max_streak, freeze_streaks
          FROM users
          WHERE id = ? AND role = 'guest' AND is_anonymous = 1
        `).get(guestUserId);

        if (guestUser) {
          // Nâng cấp Guest → Student (GIỮ NGUYÊN thành tích!)
          db.prepare(`
            UPDATE users
            SET
              email = ?,
              password_hash = ?,
              full_name = ?,
              role = 'student',
              is_anonymous = 0,
              updated_at = datetime('now')
            WHERE id = ?
          `).run(email, password_hash, full_name || null, guestUserId);

          userId = guestUserId;
          upgradeMode = true;

          console.log(`✅ Nâng cấp Guest #${guestUserId} → Student với stars=${guestUser.stars_balance}, streak=${guestUser.current_streak}`);
        }
      } catch (tokenError) {
        console.log('⚠️  Invalid guest token, tạo user mới');
      }
    }

    // CASE 2: Tạo user mới (không có guestToken hoặc token không hợp lệ)
    if (!userId) {
      const result = db.prepare(`
        INSERT INTO users (
          email, password_hash, full_name,
          role, is_anonymous,
          stars_balance, freeze_streaks, current_streak, max_streak
        ) VALUES (?, ?, ?, 'student', 0, 0, 2, 0, 0)
      `).run(email, password_hash, full_name || null);

      userId = result.lastInsertRowid;
      console.log(`✅ Tạo Student mới #${userId}`);
    }

    // Lấy thông tin user
    const user = db.prepare(`
      SELECT
        id, email, full_name, role, is_anonymous,
        stars_balance, current_streak, max_streak, freeze_streaks,
        created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    // Generate token mới
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: upgradeMode
        ? 'Guest account upgraded to Student successfully'
        : 'User registered successfully',
      data: {
        user,
        token,
        upgraded: upgradeMode
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API 3: LOGIN (THỦ CÔNG)
// POST /api/auth/login
// ============================================
/**
 * Đăng nhập bằng email/password
 *
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = db.prepare(`
      SELECT
        id, email, password_hash, full_name, role, is_anonymous,
        stars_balance, current_streak, max_streak, freeze_streaks
      FROM users
      WHERE email = ? AND is_anonymous = 0
    `).get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Remove password_hash from response
    delete user.password_hash;

    // Generate token
    const token = generateToken(user.id);

    console.log(`✅ User #${user.id} (${user.email}) đã đăng nhập`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API BỔ SUNG: GET ME
// GET /api/auth/me
// ============================================
/**
 * Lấy thông tin user hiện tại (từ token)
 * Requires: authenticateToken middleware
 */
const getMe = (req, res) => {
  try {
    const userId = req.user.id;

    const user = db.prepare(`
      SELECT
        id, email, full_name, avatar_url, role, is_anonymous,
        stars_balance, current_streak, max_streak, freeze_streaks,
        last_learnt_date, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get stats
    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT id) as total_exams,
        COALESCE(AVG(score), 0) as avg_score,
        MAX(score) as max_score
      FROM exam_results
      WHERE user_id = ?
    `).get(userId);

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
    console.error('❌ GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user info'
    });
  }
};

module.exports = {
  createGuestUser,  // POST /api/auth/guest
  register,         // POST /api/auth/register (với guest upgrade)
  login,            // POST /api/auth/login
  getMe             // GET /api/auth/me
};
