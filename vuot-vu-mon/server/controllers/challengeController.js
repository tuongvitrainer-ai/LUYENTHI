/**
 * Challenge Controller - "Thử thách khởi đầu" game
 * Sử dụng Question và TestResult models
 */

const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

// ============================================
// API: GET /api/challenge/questions/:gradeLevel
// LẤY CÂU HỎI CHO BÀI TEST
// ============================================
/**
 * Lấy 15 câu hỏi ngẫu nhiên theo lớp
 *
 * URL params:
 * - gradeLevel: 3, 4, 5
 *
 * Query params (optional):
 * - count: số câu hỏi (default: 15)
 * - distribution: có phân bố môn không (default: true)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     questions: [...],
 *     count: 15,
 *     grade_level: 3
 *   }
 * }
 */
const getQuestions = async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);

    // Validate grade level
    if (![3, 4, 5].includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    // Get count from query params with validation
    const count = parseInt(req.query.count) || 15;

    if (count < 5 || count > 50) {
      return res.status(400).json({
        success: false,
        message: 'Số câu hỏi phải từ 5 đến 50'
      });
    }

    // Get subjects filter (can be array or single value)
    let subjects = null;
    if (req.query.subjects) {
      // If it's an array, use it directly
      if (Array.isArray(req.query.subjects)) {
        subjects = req.query.subjects;
      } else {
        // If it's a single value, convert to array
        subjects = [req.query.subjects];
      }
    }

    // Get difficulty level (1-10)
    const difficultyLevel = req.query.difficulty ? parseInt(req.query.difficulty) : null;

    console.log(`🎯 [Challenge] Fetching ${count} questions for grade ${gradeLevel}`);
    if (subjects) {
      console.log(`   📚 Subjects filter: ${subjects.join(', ')}`);
    }
    if (difficultyLevel) {
      console.log(`   📊 Difficulty level: ${difficultyLevel}`);
    }

    // Get questions with filters
    const questions = await Question.getRandomQuestionsWithFilters(gradeLevel, count, {
      subjects,
      difficultyLevel
    });

    console.log(`   ✅ Found ${questions.length} questions`);

    // Format response - KHÔNG trả về correct_answer
    const safeQuestions = questions.map(q => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      question_text: q.question_text,
      options: q.options,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      data: {
        questions: safeQuestions,
        count: safeQuestions.length,
        grade_level: gradeLevel
      }
    });

  } catch (error) {
    console.error('❌ [Challenge] Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy câu hỏi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: POST /api/challenge/submit
// NỘP BÀI VÀ CHẤM ĐIỂM
// ============================================
/**
 * Nộp bài test và lưu kết quả
 *
 * Body:
 * {
 *   "user_id": 1,
 *   "grade_level": 3,
 *   "answers": [
 *     { "question_id": 1, "user_answer": "503" },
 *     { "question_id": 2, "user_answer": "253" },
 *     ...
 *   ],
 *   "time_taken": 1200  // giây
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     test_id: 1,
 *     score: 85,
 *     correct_answers: 13,
 *     total_questions: 15,
 *     stars_earned: 4,
 *     subject_scores: {...}
 *   }
 * }
 */
const submitTest = async (req, res) => {
  try {
    const { user_id, grade_level, answers, time_taken } = req.body;

    // Validate input
    if (!user_id || !grade_level || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: user_id, grade_level, answers'
      });
    }

    if (![3, 4, 5].includes(grade_level)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    if (answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phải có ít nhất 1 câu trả lời'
      });
    }

    console.log(`🎯 [Challenge] User ${user_id} submitting test - Grade ${grade_level}`);

    // Lấy questions để chấm điểm
    const questionIds = answers.map(a => a.question_id);
    console.log(`   📋 Question IDs to fetch:`, questionIds);

    const questions = await Promise.all(
      questionIds.map(async (id) => {
        try {
          const q = await Question.getById(id);
          if (!q) {
            console.error(`   ❌ Question ${id} not found`);
          }
          return q;
        } catch (err) {
          console.error(`   ❌ Error fetching question ${id}:`, err.message);
          return null;
        }
      })
    );

    console.log(`   ✅ Fetched ${questions.filter(q => q).length}/${questionIds.length} questions`);

    // Kiểm tra questions exist
    if (questions.some(q => !q)) {
      return res.status(404).json({
        success: false,
        message: 'Một số câu hỏi không tồn tại'
      });
    }

    // Chấm điểm
    let correct = 0;
    const subjectScores = {};
    const detailedAnswers = [];

    answers.forEach((answer, index) => {
      const question = questions[index];

      // So sánh đáp án (case-sensitive)
      const isCorrect = String(answer.user_answer).trim() === String(question.correct_answer).trim();

      if (isCorrect) correct++;

      // Track by subject
      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      subjectScores[question.subject].total++;
      if (isCorrect) subjectScores[question.subject].correct++;

      // Detailed answers
      detailedAnswers.push({
        question_id: question.id,
        user_answer: answer.user_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        subject: question.subject,
        topic: question.topic
      });
    });

    const score = Math.round((correct / questions.length) * 100);
    const stars = TestResult.calculateStarsEarned(score, grade_level);

    console.log(`   📊 Score: ${score}/100 (${correct}/${questions.length})`);
    console.log(`   ⭐ Stars: ${stars}`);

    // Lưu kết quả
    const result = await TestResult.create({
      user_id,
      grade_level,
      total_questions: questions.length,
      correct_answers: correct,
      score,
      time_taken: time_taken || 0,
      subject_scores: subjectScores,
      answers: detailedAnswers,
      stars_earned: stars
    });

    console.log(`   ✅ Saved test result #${result.id}\n`);

    // Format detailed review for frontend
    console.log(`   📝 Creating review_questions...`);
    const reviewQuestions = questions.map((q, index) => {
      const answer = answers[index];
      const isCorrect = String(answer.user_answer).trim() === String(q.correct_answer).trim();

      const review = {
        question_id: q.id,
        question_text: q.question_text,
        options: q.options,
        user_answer: answer.user_answer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation || null,
        subject: q.subject,
        topic: q.topic
      };

      console.log(`      Q${index + 1}: ${q.id} - ${isCorrect ? '✓' : '✗'} - has explanation: ${!!q.explanation}`);

      return review;
    });

    console.log(`   ✅ Created ${reviewQuestions.length} review questions`);

    // Response
    const responseData = {
      test_id: result.id,
      score: result.score,
      correct_answers: result.correct_answers,
      total_questions: result.total_questions,
      percentage: result.score,
      stars_earned: result.stars_earned,
      subject_scores: result.subject_scores,
      time_taken: result.time_taken,
      completed_at: result.completed_at,
      review_questions: reviewQuestions // NEW: Detailed review với explanation
    };

    console.log(`   📤 Sending response with ${responseData.review_questions.length} review questions`);

    res.json({
      success: true,
      message: 'Nộp bài thành công',
      data: responseData
    });

  } catch (error) {
    console.error('❌ [Challenge] Submit test error:', error);
    console.error('   Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      message: 'Lỗi khi nộp bài',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// ============================================
// API: GET /api/challenge/history/:userId
// LỊCH SỬ TEST CỦA USER
// ============================================
/**
 * Lấy lịch sử test của user
 *
 * URL params:
 * - userId: ID của user
 *
 * Query params:
 * - grade_level: lọc theo lớp (optional)
 * - limit: giới hạn số kết quả (default: 10)
 */
const getHistory = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const gradeLevel = req.query.grade_level ? parseInt(req.query.grade_level) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    console.log(`🎯 [Challenge] Getting history for user ${userId}`);

    const filters = {};
    if (gradeLevel) filters.grade_level = gradeLevel;
    if (limit) filters.limit = limit;

    const results = await TestResult.getByUser(userId, filters);

    console.log(`   ✅ Found ${results.length} test results`);

    res.json({
      success: true,
      data: {
        history: results,
        count: results.length
      }
    });

  } catch (error) {
    console.error('❌ [Challenge] Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: GET /api/challenge/stats/:userId/:gradeLevel
// THỐNG KÊ CỦA USER
// ============================================
/**
 * Lấy thống kê chi tiết của user cho một lớp
 */
const getStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const gradeLevel = parseInt(req.params.gradeLevel);

    if (![3, 4, 5].includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    console.log(`🎯 [Challenge] Getting stats for user ${userId}, grade ${gradeLevel}`);

    const stats = await TestResult.getUserStats(userId, gradeLevel);

    console.log(`   ✅ Stats retrieved`);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ [Challenge] Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: GET /api/challenge/leaderboard/:gradeLevel
// BẢNG XẾP HẠNG
// ============================================
/**
 * Lấy bảng xếp hạng theo lớp
 *
 * Query params:
 * - limit: số lượng top (default: 10)
 */
const getLeaderboard = async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (![3, 4, 5].includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    console.log(`🎯 [Challenge] Getting leaderboard for grade ${gradeLevel}`);

    const leaderboard = await TestResult.getLeaderboard(gradeLevel, limit);

    console.log(`   ✅ Found ${leaderboard.length} entries`);

    res.json({
      success: true,
      data: {
        leaderboard,
        count: leaderboard.length,
        grade_level: gradeLevel
      }
    });

  } catch (error) {
    console.error('❌ [Challenge] Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy bảng xếp hạng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API: GET /api/challenge/question-count/:gradeLevel
// ĐẾM SỐ CÂU HỎI
// ============================================
/**
 * Đếm số câu hỏi có sẵn theo lớp
 */
const getQuestionCount = async (req, res) => {
  try {
    const gradeLevel = parseInt(req.params.gradeLevel);

    if (![3, 4, 5].includes(gradeLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Grade level phải là 3, 4, hoặc 5'
      });
    }

    const subjects = ['math', 'vietnamese', 'english', 'logic'];
    const counts = {};

    for (const subject of subjects) {
      counts[subject] = await Question.getCount(gradeLevel, subject);
    }

    counts.total = await Question.getCount(gradeLevel);

    res.json({
      success: true,
      data: {
        grade_level: gradeLevel,
        counts
      }
    });

  } catch (error) {
    console.error('❌ [Challenge] Get question count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đếm câu hỏi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getQuestions,      // GET /api/challenge/questions/:gradeLevel
  submitTest,        // POST /api/challenge/submit
  getHistory,        // GET /api/challenge/history/:userId
  getStats,          // GET /api/challenge/stats/:userId/:gradeLevel
  getLeaderboard,    // GET /api/challenge/leaderboard/:gradeLevel
  getQuestionCount   // GET /api/challenge/question-count/:gradeLevel
};
