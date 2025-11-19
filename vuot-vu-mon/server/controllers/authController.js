const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { knex } = require('../database/db');

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
 * - Tạo user mới với role='guest', is_anonymous=true
 * - Tặng sẵn 2 freeze_streaks (khiên bảo vệ)
 * - Trả về JWT token để lưu session
 *
 * Mục đích: Trẻ em có thể chơi game ngay mà không cần đăng ký
 */
const createGuestUser = async (req, res) => {
  try {
    console.log('📝 Tạo Guest User mới...');

    // Tạo guest user mới - Knex với returning() cho PostgreSQL
    const [result] = await knex('users')
      .insert({
        role: 'guest',
        is_anonymous: true,
        stars_balance: 0,
        freeze_streaks: 2,
        current_streak: 0,
        max_streak: 0
      })
      .returning('id');

    const userId = result.id || result; // PostgreSQL returns object, SQLite returns number

    // Lấy thông tin user vừa tạo
    const user = await knex('users')
      .select(
        'id', 'role', 'is_anonymous', 'stars_balance',
        'freeze_streaks', 'current_streak', 'max_streak',
        'created_at'
      )
      .where('id', userId)
      .first();

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
    const existingUser = await knex('users')
      .select('id')
      .where('email', email)
      .first();

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
        const guestUser = await knex('users')
          .select('id', 'role', 'is_anonymous', 'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks')
          .where({
            id: guestUserId,
            role: 'guest',
            is_anonymous: true
          })
          .first();

        if (guestUser) {
          // Nâng cấp Guest → Student (GIỮ NGUYÊN thành tích!)
          await knex('users')
            .where('id', guestUserId)
            .update({
              email: email,
              password_hash: password_hash,
              full_name: full_name || null,
              role: 'student',
              is_anonymous: false,
              updated_at: knex.fn.now()
            });

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
      const [result] = await knex('users')
        .insert({
          email: email,
          password_hash: password_hash,
          full_name: full_name || null,
          role: 'student',
          is_anonymous: false,
          stars_balance: 0,
          freeze_streaks: 2,
          current_streak: 0,
          max_streak: 0
        })
        .returning('id');

      userId = result.id || result;
      console.log(`✅ Tạo Student mới #${userId}`);
    }

    // Lấy thông tin user
    const user = await knex('users')
      .select(
        'id', 'email', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks',
        'created_at'
      )
      .where('id', userId)
      .first();

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
    const user = await knex('users')
      .select(
        'id', 'email', 'password_hash', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks'
      )
      .where({
        email: email,
        is_anonymous: false
      })
      .first();

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
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await knex('users')
      .select(
        'id', 'email', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks',
        'last_activity_date', 'created_at'
      )
      .where('id', userId)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get stats
    const stats = await knex('exam_results')
      .where('user_id', userId)
      .select(
        knex.raw('COUNT(DISTINCT id) as total_exams'),
        knex.raw('COALESCE(AVG(score), 0) as avg_score'),
        knex.raw('MAX(score) as max_score')
      )
      .first();

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

// ============================================
// API: UPDATE PROFILE
// PUT /api/auth/profile
// ============================================
/**
 * Cập nhật thông tin profile
 * Requires: authenticateToken middleware
 *
 * Body: { display_name, birthday, gender, phone, bio }
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, birthday, gender, phone, bio } = req.body;

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be male, female, or other'
      });
    }

    // Validate birthday if provided
    if (birthday) {
      const birthdayDate = new Date(birthday);
      if (isNaN(birthdayDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birthday format'
        });
      }

      // Check if birthday is not in future
      if (birthdayDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Birthday cannot be in the future'
        });
      }
    }

    // Validate phone if provided
    if (phone && phone.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Phone number too long'
      });
    }

    // Build update object (only include fields that are provided)
    const updateData = {
      updated_at: knex.fn.now()
    };

    if (display_name !== undefined) updateData.display_name = display_name;
    if (birthday !== undefined) updateData.birthday = birthday;
    if (gender !== undefined) updateData.gender = gender;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    // Update user
    await knex('users')
      .where('id', userId)
      .update(updateData);

    // Get updated user
    const user = await knex('users')
      .select(
        'id', 'email', 'username', 'full_name', 'display_name',
        'birthday', 'gender', 'phone', 'bio',
        'role', 'stars_balance', 'current_streak', 'max_streak',
        'freeze_streaks', 'created_at', 'updated_at'
      )
      .where('id', userId)
      .first();

    console.log(`✅ User #${userId} đã cập nhật profile`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: CHANGE PASSWORD
// PUT /api/auth/password
// ============================================
/**
 * Đổi mật khẩu
 * Requires: authenticateToken middleware
 *
 * Body: { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user's current password hash
    const user = await knex('users')
      .select('id', 'email', 'password_hash')
      .where('id', userId)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has password (not guest user)
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Guest users cannot change password. Please register first.'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await knex('users')
      .where('id', userId)
      .update({
        password_hash: newPasswordHash,
        updated_at: knex.fn.now()
      });

    console.log(`✅ User #${userId} đã đổi mật khẩu`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createGuestUser,  // POST /api/auth/guest
  register,         // POST /api/auth/register (với guest upgrade)
  login,            // POST /api/auth/login
  getMe,            // GET /api/auth/me
  updateProfile,    // PUT /api/auth/profile
  changePassword    // PUT /api/auth/password
};
