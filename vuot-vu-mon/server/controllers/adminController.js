const { knex } = require('../database/db');

// ============================================
// API 1: POST /api/admin/questions
// Tạo câu hỏi mới (Admin only)
// ============================================
/**
 * Tạo câu hỏi mới với tags
 *
 * Body:
 * {
 *   "content_json": {"question": "5 x 3 = ?", "options": ["10", "15", "20"]},
 *   "correct_answer": "15",
 *   "difficulty": "easy" | "medium" | "hard",
 *   "explanation": "5 nhân 3 bằng 15",
 *   "tags": [
 *     {"tag_type": "môn_học", "tag_value": "Toán"},
 *     {"tag_type": "lớp_nguồn", "tag_value": "3"},
 *     {"tag_type": "game_type", "tag_value": "matching_pairs_trang_chu"}
 *   ]
 * }
 *
 * Logic:
 * - Validate input
 * - Use transaction để insert vào cả questions và question_tags
 * - Trả về question vừa tạo
 */
const createQuestion = async (req, res) => {
  try {
    const {
      content_json,
      correct_answer,
      difficulty = 'medium',
      explanation,
      tags
    } = req.body;

    const created_by = req.user.id;

    console.log('📝 Admin tạo câu hỏi mới...');

    // ============================================
    // VALIDATION
    // ============================================

    // Required fields
    if (!content_json) {
      return res.status(400).json({
        success: false,
        message: 'content_json is required'
      });
    }

    if (!correct_answer) {
      return res.status(400).json({
        success: false,
        message: 'correct_answer is required'
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Validate tags
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tags array is required and must not be empty'
      });
    }

    // Validate tags structure
    for (const tag of tags) {
      if (!tag.tag_type || !tag.tag_value) {
        return res.status(400).json({
          success: false,
          message: 'Each tag must have tag_type and tag_value'
        });
      }
    }

    // Validate content_json is valid JSON
    let contentJsonString;
    try {
      contentJsonString = typeof content_json === 'string'
        ? content_json
        : JSON.stringify(content_json);

      // Verify it can be parsed back
      JSON.parse(contentJsonString);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'content_json must be valid JSON'
      });
    }

    // ============================================
    // TRANSACTION: INSERT QUESTION + TAGS
    // ============================================

    const questionId = await knex.transaction(async (trx) => {
      // 1. Insert question
      const [result] = await trx('questions')
        .insert({
          content_json: contentJsonString,
          correct_answer: correct_answer,
          difficulty: difficulty,
          explanation: explanation || null,
          created_by: created_by,
          is_active: true
        })
        .returning('id');

      const qId = result.id || result;

      // 2. Insert tags
      const tagInserts = tags.map(tag => ({
        question_id: qId,
        tag_type: tag.tag_type,
        tag_value: tag.tag_value
      }));

      await trx('question_tags').insert(tagInserts);

      return qId;
    });

    // ============================================
    // FETCH CREATED QUESTION WITH TAGS
    // ============================================

    const question = await knex('questions')
      .select(
        'id', 'content_json', 'correct_answer', 'difficulty', 'explanation',
        'is_active', 'created_by', 'created_at', 'updated_at'
      )
      .where('id', questionId)
      .first();

    const questionTags = await knex('question_tags')
      .select('tag_type', 'tag_value')
      .where('question_id', questionId);

    console.log(`✅ Question #${questionId} được tạo với ${questionTags.length} tags`);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        question: {
          ...question,
          content_json: JSON.parse(question.content_json),
          tags: questionTags
        }
      }
    });

  } catch (error) {
    console.error('❌ Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// API 2: GET /api/admin/questions/:id
// Lấy một câu hỏi theo ID (Admin only)
// ============================================
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await knex('questions')
      .select(
        'id', 'content_json', 'correct_answer', 'difficulty', 'explanation',
        'is_active', 'created_by', 'created_at', 'updated_at'
      )
      .where('id', id)
      .first();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const tags = await knex('question_tags')
      .select('tag_type', 'tag_value')
      .where('question_id', id);

    res.json({
      success: true,
      data: {
        question: {
          ...question,
          content_json: JSON.parse(question.content_json),
          tags
        }
      }
    });

  } catch (error) {
    console.error('❌ Get question by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question'
    });
  }
};

// ============================================
// API 3: PUT /api/admin/questions/:id
// Cập nhật câu hỏi (Admin only)
// ============================================
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      content_json,
      correct_answer,
      difficulty,
      explanation,
      is_active,
      tags
    } = req.body;

    // Check if question exists
    const existingQuestion = await knex('questions')
      .where('id', id)
      .first();

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Build update object
    const updateData = { updated_at: knex.fn.now() };

    if (content_json !== undefined) {
      updateData.content_json = typeof content_json === 'string'
        ? content_json
        : JSON.stringify(content_json);
    }
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (is_active !== undefined) updateData.is_active = is_active;

    await knex.transaction(async (trx) => {
      // Update question
      await trx('questions')
        .where('id', id)
        .update(updateData);

      // Update tags if provided
      if (tags && Array.isArray(tags)) {
        // Delete existing tags
        await trx('question_tags')
          .where('question_id', id)
          .delete();

        // Insert new tags
        if (tags.length > 0) {
          const tagInserts = tags.map(tag => ({
            question_id: id,
            tag_type: tag.tag_type,
            tag_value: tag.tag_value
          }));
          await trx('question_tags').insert(tagInserts);
        }
      }
    });

    // Fetch updated question
    const question = await knex('questions')
      .where('id', id)
      .first();

    const questionTags = await knex('question_tags')
      .select('tag_type', 'tag_value')
      .where('question_id', id);

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: {
        question: {
          ...question,
          content_json: JSON.parse(question.content_json),
          tags: questionTags
        }
      }
    });

  } catch (error) {
    console.error('❌ Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question'
    });
  }
};

// ============================================
// API 4: DELETE /api/admin/questions/:id
// Xóa câu hỏi (Admin only)
// ============================================
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await knex('questions')
      .where('id', id)
      .delete();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Tags will be automatically deleted due to CASCADE

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question'
    });
  }
};

// ============================================
// API 5: GET /api/admin/questions
// Lấy tất cả câu hỏi với filters (Admin only)
// ============================================
const getAllQuestions = async (req, res) => {
  try {
    const {
      limit = 100,
      offset = 0,
      difficulty,
      tag_type,
      tag_value,
      is_active
    } = req.query;

    let query = knex('questions as q')
      .distinct('q.id')
      .select(
        'q.id', 'q.content_json', 'q.correct_answer', 'q.difficulty',
        'q.explanation', 'q.is_active', 'q.created_by', 'q.created_at', 'q.updated_at'
      );

    // Apply filters
    if (difficulty) {
      query = query.where('q.difficulty', difficulty);
    }

    if (is_active !== undefined) {
      query = query.where('q.is_active', is_active === 'true' || is_active === true);
    }

    if (tag_type || tag_value) {
      query = query.innerJoin('question_tags as qt', 'q.id', 'qt.question_id');

      if (tag_type) {
        query = query.where('qt.tag_type', tag_type);
      }
      if (tag_value) {
        query = query.where('qt.tag_value', tag_value);
      }
    }

    query = query
      .orderBy('q.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const questions = await query;

    // Get tags for each question
    const questionsWithTags = await Promise.all(
      questions.map(async (q) => {
        const tags = await knex('question_tags')
          .select('tag_type', 'tag_value')
          .where('question_id', q.id);

        return {
          ...q,
          content_json: JSON.parse(q.content_json),
          tags
        };
      })
    );

    // Get total count
    const totalCount = await knex('questions')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        questions: questionsWithTags,
        count: questionsWithTags.length,
        total: parseInt(totalCount.count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
};

// ============================================
// API 6: GET /api/admin/users
// Lấy danh sách users (Admin only)
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0, role } = req.query;

    let query = knex('users')
      .select(
        'id', 'username', 'email', 'full_name', 'role', 'is_anonymous',
        'stars_balance', 'current_streak', 'max_streak', 'freeze_streaks',
        'last_activity_date', 'is_active', 'created_at'
      );

    if (role) {
      query = query.where('role', role);
    }

    query = query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const users = await query;

    const totalCount = await knex('users')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        users,
        count: users.length,
        total: parseInt(totalCount.count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// ============================================
// API 7: GET /api/admin/stats
// Dashboard statistics (Admin only)
// ============================================
const getDashboardStats = async (req, res) => {
  try {
    // User stats
    const userStats = await knex('users')
      .select(
        knex.raw('COUNT(*) as total_users'),
        knex.raw('COUNT(CASE WHEN is_anonymous = true THEN 1 END) as guest_users'),
        knex.raw('COUNT(CASE WHEN is_anonymous = false THEN 1 END) as registered_users'),
        knex.raw('COUNT(CASE WHEN role = ? THEN 1 END) as admin_users', ['admin'])
      )
      .first();

    // Question stats
    const questionStats = await knex('questions')
      .select(
        knex.raw('COUNT(*) as total_questions'),
        knex.raw('COUNT(CASE WHEN is_active = true THEN 1 END) as active_questions')
      )
      .first();

    // Exam result stats
    const examStats = await knex('exam_results')
      .select(
        knex.raw('COUNT(*) as total_exams'),
        knex.raw('COALESCE(AVG(score), 0) as avg_score')
      )
      .first();

    // Recent activity (last 7 days)
    const recentActivity = await knex('exam_results')
      .select(knex.raw('DATE(completed_at) as date'))
      .select(knex.raw('COUNT(*) as exam_count'))
      .where('completed_at', '>=', knex.raw("CURRENT_DATE - INTERVAL '7 days'"))
      .groupByRaw('DATE(completed_at)')
      .orderBy('date', 'desc');

    res.json({
      success: true,
      data: {
        user_stats: userStats,
        question_stats: questionStats,
        exam_stats: examStats,
        recent_activity: recentActivity
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// ============================================
// API 8: GET /api/admin/question-reports
// Lấy danh sách báo cáo lỗi câu hỏi (Admin only)
// ============================================
const getQuestionReports = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    let query = knex('question_reports as qr')
      .select(
        'qr.id', 'qr.question_id', 'qr.user_id', 'qr.report_type',
        'qr.comment', 'qr.context_json', 'qr.status',
        'qr.resolved_by', 'qr.admin_note', 'qr.created_at', 'qr.resolved_at',
        'q.content_json', 'q.correct_answer', 'q.difficulty',
        'u.username as reporter_username', 'u.email as reporter_email'
      )
      .leftJoin('questions as q', 'qr.question_id', 'q.id')
      .leftJoin('users as u', 'qr.user_id', 'u.id');

    // Filter by status
    if (status) {
      query = query.where('qr.status', status);
    }

    query = query
      .orderBy('qr.created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    const reports = await query;

    // Parse JSON fields
    const reportsWithParsedData = reports.map(r => ({
      ...r,
      content_json: r.content_json ? JSON.parse(r.content_json) : null,
      context_json: r.context_json ? JSON.parse(r.context_json) : null
    }));

    // Get total count
    const totalCountQuery = knex('question_reports');
    if (status) {
      totalCountQuery.where('status', status);
    }
    const totalCount = await totalCountQuery.count('* as count').first();

    res.json({
      success: true,
      data: {
        reports: reportsWithParsedData,
        count: reportsWithParsedData.length,
        total: parseInt(totalCount.count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('❌ Get question reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question reports'
    });
  }
};

// ============================================
// API 9: PUT /api/admin/question-reports/:id
// Cập nhật trạng thái báo cáo (Admin only)
// ============================================
const updateQuestionReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    const adminId = req.user.id;

    // Check if report exists
    const report = await knex('question_reports')
      .where('id', id)
      .first();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'resolved', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Build update object
    const updateData = { };

    if (status) {
      updateData.status = status;
    }

    if (admin_note !== undefined) {
      updateData.admin_note = admin_note;
    }

    // If resolving or rejecting, set resolved_by and resolved_at
    if (status === 'resolved' || status === 'rejected') {
      updateData.resolved_by = adminId;
      updateData.resolved_at = knex.fn.now();
    }

    await knex('question_reports')
      .where('id', id)
      .update(updateData);

    // Fetch updated report
    const updatedReport = await knex('question_reports')
      .where('id', id)
      .first();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: {
          ...updatedReport,
          context_json: updatedReport.context_json ? JSON.parse(updatedReport.context_json) : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Update question report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question report'
    });
  }
};

// ============================================
// API 10: GET /api/admin/question-reports/stats
// Thống kê báo cáo lỗi (Admin only)
// ============================================
const getQuestionReportStats = async (req, res) => {
  try {
    // Overall stats
    const overallStats = await knex('question_reports')
      .select(
        knex.raw('COUNT(*) as total_reports'),
        knex.raw('COUNT(CASE WHEN status = ? THEN 1 END) as pending_reports', ['pending']),
        knex.raw('COUNT(CASE WHEN status = ? THEN 1 END) as reviewing_reports', ['reviewing']),
        knex.raw('COUNT(CASE WHEN status = ? THEN 1 END) as resolved_reports', ['resolved']),
        knex.raw('COUNT(CASE WHEN status = ? THEN 1 END) as rejected_reports', ['rejected'])
      )
      .first();

    // Reports by type
    const reportsByType = await knex('question_reports')
      .select('report_type')
      .select(knex.raw('COUNT(*) as count'))
      .groupBy('report_type');

    // Most reported questions
    const mostReported = await knex('question_reports as qr')
      .select('qr.question_id')
      .select(knex.raw('COUNT(*) as report_count'))
      .select('q.content_json')
      .leftJoin('questions as q', 'qr.question_id', 'q.id')
      .groupBy('qr.question_id', 'q.content_json')
      .orderBy('report_count', 'desc')
      .limit(10);

    const mostReportedParsed = mostReported.map(r => ({
      ...r,
      content_json: r.content_json ? JSON.parse(r.content_json) : null
    }));

    res.json({
      success: true,
      data: {
        overall_stats: overallStats,
        reports_by_type: reportsByType,
        most_reported_questions: mostReportedParsed
      }
    });

  } catch (error) {
    console.error('❌ Get question report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question report stats'
    });
  }
};

module.exports = {
  createQuestion,          // POST /api/admin/questions
  getQuestionById,         // GET /api/admin/questions/:id
  updateQuestion,          // PUT /api/admin/questions/:id
  deleteQuestion,          // DELETE /api/admin/questions/:id
  getAllQuestions,         // GET /api/admin/questions
  getAllUsers,             // GET /api/admin/users
  getDashboardStats,       // GET /api/admin/stats
  getQuestionReports,      // GET /api/admin/question-reports
  updateQuestionReport,    // PUT /api/admin/question-reports/:id
  getQuestionReportStats   // GET /api/admin/question-reports/stats
};
