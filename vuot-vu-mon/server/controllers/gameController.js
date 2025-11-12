const { db } = require('../database/db');

// ============================================
// API: GET /api/game/questions
// LẤY CÂU HỎI CHO GAME
// ============================================
/**
 * Lấy câu hỏi ngẫu nhiên cho game
 *
 * Query params:
 * - subject: "Toán", "Tiếng Việt", "Tiếng Anh" (optional)
 * - limit: số lượng câu hỏi (default: 10, max: 50)
 * - game_type: "quiz_race", etc. (optional)
 */
const getQuestions = (req, res) => {
  try {
    const { subject, limit = 10, game_type } = req.query;
    const questionLimit = Math.min(parseInt(limit), 50);

    console.log(`🎮 Fetching questions: subject=${subject}, limit=${questionLimit}, game_type=${game_type}`);

    // Build query with filters
    let query = `
      SELECT DISTINCT
        q.id,
        q.content_json,
        q.correct_answer,
        q.type,
        q.explanation,
        q.is_premium,
        q.created_at
      FROM questions q
    `;

    const conditions = [];
    const params = [];

    // Filter by subject if provided
    if (subject) {
      query += ` JOIN question_tags qt ON q.id = qt.question_id`;
      conditions.push(`qt.tag_key = 'môn_học' AND qt.tag_value = ?`);
      params.push(subject);
    }

    // Filter by game_type if provided
    if (game_type) {
      if (!subject) {
        query += ` JOIN question_tags qt ON q.id = qt.question_id`;
      }
      conditions.push(`qt.tag_key = 'game_type' AND qt.tag_value = ?`);
      params.push(game_type);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(questionLimit);

    const questions = db.prepare(query).all(...params);

    console.log(`   ✅ Found ${questions.length} questions`);

    // Parse content_json and format response
    const formattedQuestions = questions.map(q => {
      const content = JSON.parse(q.content_json);
      return {
        id: q.id,
        content: {
          question_text: content.question,
          options: content.options.map((opt, idx) => ({
            id: String.fromCharCode(65 + idx), // A, B, C, D
            text: opt
          })),
          question_type: 'multiple_choice'
        },
        correct_answer: q.correct_answer,
        type: q.type,
        explanation: q.explanation,
        is_premium: q.is_premium,
        difficulty_level: 1, // Default difficulty
        points: 5 // Default points
      };
    });

    res.json({
      success: true,
      data: {
        questions: formattedQuestions,
        count: formattedQuestions.length
      }
    });

  } catch (error) {
    console.error('❌ Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: POST /api/game/submit_result
// CỐT LÕI HỆ THỐNG GAMIFICATION
// ============================================
/**
 * Chấm điểm, thưởng sao, tính streak (Lazy Calculation)
 *
 * Body:
 * {
 *   "exam_type": "game_matching_pairs" | "luyen_tap" | "kiem_tra",
 *   "score": 85,
 *   "details_json": {
 *     "questions": [...],
 *     "total_time": 60
 *   }
 * }
 *
 * Logic:
 * 1. Lưu kết quả vào exam_results
 * 2. Thưởng sao nếu score > 80
 * 3. Tính Streak (Lazy Calculation)
 * 4. Cập nhật users table
 * 5. Trả về kết quả đầy đủ
 */
const submitResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exam_type, score, details_json } = req.body;

    console.log(`🎮 User #${userId} submit kết quả: ${exam_type}, score=${score}`);

    // ============================================
    // VALIDATION
    // ============================================

    if (!exam_type || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'exam_type and score are required'
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'score must be between 0 and 100'
      });
    }

    // ============================================
    // 1. LƯU KẾT QUẢ VÀO exam_results
    // ============================================

    const detailsJsonString = details_json
      ? (typeof details_json === 'string' ? details_json : JSON.stringify(details_json))
      : null;

    const resultInsert = db.prepare(`
      INSERT INTO exam_results (user_id, exam_type, score, details_json)
      VALUES (?, ?, ?, ?)
    `).run(userId, exam_type, score, detailsJsonString);

    const examResultId = resultInsert.lastInsertRowid;

    console.log(`   ✅ Lưu exam_result #${examResultId}`);

    // ============================================
    // 2. LẤY THÔNG TIN USER HIỆN TẠI
    // ============================================

    const user = db.prepare(`
      SELECT
        id, stars_balance, current_streak, max_streak,
        freeze_streaks, last_learnt_date
      FROM users
      WHERE id = ?
    `).get(userId);

    let starsEarned = 0;
    let streakIncreased = false;
    let streakFrozen = false;
    let freezeUsed = 0;

    // ============================================
    // 3. THƯỞNG SAO NẾU score > 80
    // ============================================

    if (score > 80) {
      starsEarned = 5;
      console.log(`   ⭐ Thưởng ${starsEarned} sao (score > 80)`);
    }

    // ============================================
    // 4. TÍNH STREAK (LAZY CALCULATION)
    // ============================================

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastLearntDate = user.last_learnt_date;

    let newCurrentStreak = user.current_streak;
    let newMaxStreak = user.max_streak;
    let newFreezeStreaks = user.freeze_streaks;

    console.log(`   📅 Today: ${today}, Last learnt: ${lastLearntDate || 'Never'}`);

    if (!lastLearntDate) {
      // Lần đầu tiên học
      newCurrentStreak = 1;
      newMaxStreak = Math.max(1, user.max_streak);
      console.log(`   🎯 Lần đầu học → streak = 1`);
    } else if (today === lastLearntDate) {
      // Đã học hôm nay rồi → Không tăng streak
      console.log(`   ⏭️  Đã học hôm nay → Không tăng streak`);
    } else {
      // Tính số ngày gap
      const lastDate = new Date(lastLearntDate);
      const currentDate = new Date(today);
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      console.log(`   📊 Gap: ${daysDiff} ngày`);

      if (daysDiff === 1) {
        // Ngày liên tiếp → Tăng streak
        newCurrentStreak = user.current_streak + 1;
        newMaxStreak = Math.max(newCurrentStreak, user.max_streak);
        streakIncreased = true;
        console.log(`   🔥 Ngày liên tiếp → streak tăng lên ${newCurrentStreak}`);
      } else if (daysDiff > 1) {
        // Có gap → Kiểm tra freeze
        const missedDays = daysDiff - 1; // Số ngày bỏ lỡ (không tính hôm nay)

        if (user.freeze_streaks >= missedDays) {
          // Đủ freeze để bảo vệ streak
          newFreezeStreaks = user.freeze_streaks - missedDays;
          newCurrentStreak = user.current_streak + 1; // Vẫn tăng streak cho hôm nay
          newMaxStreak = Math.max(newCurrentStreak, user.max_streak);
          streakFrozen = true;
          freezeUsed = missedDays;
          console.log(`   🛡️  Dùng ${missedDays} freeze → Giữ streak, tăng lên ${newCurrentStreak}`);
        } else {
          // Không đủ freeze → Reset streak
          newCurrentStreak = 1;
          streakFrozen = false;
          console.log(`   ❄️  Không đủ freeze → Reset streak về 1`);
        }
      }
    }

    // ============================================
    // 5. CẬP NHẬT USERS TABLE
    // ============================================

    const newStarsBalance = user.stars_balance + starsEarned;

    db.prepare(`
      UPDATE users
      SET
        stars_balance = ?,
        current_streak = ?,
        max_streak = ?,
        freeze_streaks = ?,
        last_learnt_date = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      newStarsBalance,
      newCurrentStreak,
      newMaxStreak,
      newFreezeStreaks,
      today,
      userId
    );

    console.log(`   💾 Cập nhật user: stars=${newStarsBalance}, streak=${newCurrentStreak}, freeze=${newFreezeStreaks}`);

    // ============================================
    // 6. TRẢ VỀ KẾT QUẢ ĐẦY ĐỦ
    // ============================================

    const result = {
      exam_result_id: examResultId,
      score: score,
      exam_type: exam_type,

      // Gamification rewards
      stars_earned: starsEarned,
      stars_balance: newStarsBalance,

      // Streak info
      streak_status: {
        current_streak: newCurrentStreak,
        max_streak: newMaxStreak,
        streak_increased: streakIncreased,
        streak_frozen: streakFrozen,
        freeze_used: freezeUsed,
        freeze_remaining: newFreezeStreaks
      },

      // User stats
      user: {
        id: userId,
        stars_balance: newStarsBalance,
        current_streak: newCurrentStreak,
        max_streak: newMaxStreak,
        freeze_streaks: newFreezeStreaks,
        last_learnt_date: today
      }
    };

    console.log(`   ✅ Hoàn tất gamification cho user #${userId}\n`);

    res.json({
      success: true,
      message: 'Result submitted successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Submit result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API BỔ SUNG: GET /api/game/history
// ============================================
/**
 * Lấy lịch sử làm bài của user
 */
const getHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const history = db.prepare(`
      SELECT
        id, exam_type, score, details_json, created_at
      FROM exam_results
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, parseInt(limit), parseInt(offset));

    const historyWithParsedDetails = history.map(h => ({
      ...h,
      details_json: h.details_json ? JSON.parse(h.details_json) : null
    }));

    res.json({
      success: true,
      data: {
        history: historyWithParsedDetails,
        count: historyWithParsedDetails.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching history'
    });
  }
};

// ============================================
// API BỔ SUNG: GET /api/game/stats
// ============================================
/**
 * Lấy thống kê tổng quan của user
 */
const getStats = (req, res) => {
  try {
    const userId = req.user.id;

    // User info
    const user = db.prepare(`
      SELECT
        stars_balance, current_streak, max_streak, freeze_streaks,
        last_learnt_date, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    // Exam stats
    const examStats = db.prepare(`
      SELECT
        COUNT(DISTINCT id) as total_exams,
        COALESCE(AVG(score), 0) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score,
        COUNT(DISTINCT DATE(created_at)) as days_active
      FROM exam_results
      WHERE user_id = ?
    `).get(userId);

    // Stats by exam type
    const statsByType = db.prepare(`
      SELECT
        exam_type,
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(score) as max_score
      FROM exam_results
      WHERE user_id = ?
      GROUP BY exam_type
    `).all(userId);

    res.json({
      success: true,
      data: {
        user: user,
        exam_stats: examStats,
        stats_by_type: statsByType
      }
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};

module.exports = {
  getQuestions,  // GET /api/game/questions
  submitResult,  // POST /api/game/submit_result
  getHistory,    // GET /api/game/history
  getStats       // GET /api/game/stats
};
