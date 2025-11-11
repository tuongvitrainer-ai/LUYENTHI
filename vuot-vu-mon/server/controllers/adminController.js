const { db } = require('../database/db');

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
 *   "type": "matching_pair" | "multiple_choice" | "true_false" | "fill_blank",
 *   "explanation": "5 nhân 3 bằng 15",
 *   "is_premium": 0 | 1,
 *   "tags": [
 *     {"tag_key": "môn_học", "tag_value": "Toán"},
 *     {"tag_key": "lớp_nguồn", "tag_value": "3"},
 *     {"tag_key": "game_type", "tag_value": "matching_pairs_trang_chu"}
 *   ]
 * }
 *
 * Logic:
 * - Validate input
 * - Use transaction để insert vào cả questions và question_tags
 * - Trả về question vừa tạo
 */
const createQuestion = (req, res) => {
  try {
    const {
      content_json,
      correct_answer,
      type,
      explanation,
      is_premium = 0,
      tags
    } = req.body;

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

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'type is required (matching_pair, multiple_choice, true_false, fill_blank)'
      });
    }

    // Validate type
    const validTypes = ['matching_pair', 'multiple_choice', 'true_false', 'fill_blank'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
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
      if (!tag.tag_key || !tag.tag_value) {
        return res.status(400).json({
          success: false,
          message: 'Each tag must have tag_key and tag_value'
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

    const transaction = db.transaction((contentJson, answer, qType, expl, premium, tagsArray) => {
      // 1. Insert question
      const insertQuestion = db.prepare(`
        INSERT INTO questions (
          content_json, correct_answer, type, explanation, is_premium
        ) VALUES (?, ?, ?, ?, ?)
      `);

      const questionResult = insertQuestion.run(
        contentJson,
        answer,
        qType,
        expl || null,
        premium
      );

      const questionId = questionResult.lastInsertRowid;

      // 2. Insert tags
      const insertTag = db.prepare(`
        INSERT INTO question_tags (question_id, tag_key, tag_value)
        VALUES (?, ?, ?)
      `);

      for (const tag of tagsArray) {
        insertTag.run(questionId, tag.tag_key, tag.tag_value);
      }

      return questionId;
    });

    // Execute transaction
    const questionId = transaction(
      contentJsonString,
      correct_answer,
      type,
      explanation,
      is_premium,
      tags
    );

    // ============================================
    // FETCH CREATED QUESTION WITH TAGS
    // ============================================

    const question = db.prepare(`
      SELECT
        id, content_json, correct_answer, type, explanation,
        is_premium, created_at, updated_at
      FROM questions
      WHERE id = ?
    `).get(questionId);

    const questionTags = db.prepare(`
      SELECT tag_key, tag_value
      FROM question_tags
      WHERE question_id = ?
    `).all(questionId);

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
// API 2: GET /api/game/questions
// Lấy câu hỏi theo tag (Public, Guest có thể gọi)
// ============================================
/**
 * Lấy câu hỏi theo tag
 *
 * Query params:
 * - tag: tag_value để filter (VD: ?tag=matching_pairs_trang_chu)
 * - tag_key: tag_key để filter cùng với tag_value (VD: ?tag_key=game_type&tag=matching_pairs_trang_chu)
 * - limit: Số câu hỏi tối đa (default: 10)
 *
 * Response: Danh sách câu hỏi với tags
 */
const getQuestions = (req, res) => {
  try {
    const {
      tag,           // tag_value
      tag_key,       // tag_key (optional, để filter chính xác hơn)
      limit = 10
    } = req.query;

    console.log(`🔍 Lấy câu hỏi theo filter: tag_key=${tag_key}, tag=${tag}, limit=${limit}`);

    let query = `
      SELECT DISTINCT q.id, q.content_json, q.correct_answer, q.type,
             q.explanation, q.is_premium, q.created_at
      FROM questions q
    `;

    const conditions = [];
    const params = [];

    // Filter by tag
    if (tag) {
      query += ` INNER JOIN question_tags qt ON q.id = qt.question_id`;

      if (tag_key) {
        // Filter by both tag_key and tag_value
        conditions.push('qt.tag_key = ?');
        conditions.push('qt.tag_value = ?');
        params.push(tag_key, tag);
      } else {
        // Filter by tag_value only
        conditions.push('qt.tag_value = ?');
        params.push(tag);
      }
    }

    // Add WHERE clause
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Order by newest first
    query += ' ORDER BY q.created_at DESC';

    // Add limit
    query += ' LIMIT ?';
    params.push(parseInt(limit));

    // Execute query
    const questions = db.prepare(query).all(...params);

    // Get tags for each question
    const questionsWithTags = questions.map(q => {
      const tags = db.prepare(`
        SELECT tag_key, tag_value
        FROM question_tags
        WHERE question_id = ?
      `).all(q.id);

      return {
        ...q,
        content_json: JSON.parse(q.content_json),
        tags
      };
    });

    console.log(`✅ Tìm thấy ${questionsWithTags.length} câu hỏi`);

    res.json({
      success: true,
      data: {
        questions: questionsWithTags,
        count: questionsWithTags.length,
        limit: parseInt(limit)
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
// API BỔ SUNG: GET ALL QUESTIONS (Admin)
// ============================================
/**
 * Lấy tất cả câu hỏi (Admin only)
 */
const getAllQuestions = (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const questions = db.prepare(`
      SELECT id, content_json, correct_answer, type, explanation,
             is_premium, created_at, updated_at
      FROM questions
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    // Get tags for each question
    const questionsWithTags = questions.map(q => {
      const tags = db.prepare(`
        SELECT tag_key, tag_value
        FROM question_tags
        WHERE question_id = ?
      `).all(q.id);

      return {
        ...q,
        content_json: JSON.parse(q.content_json),
        tags
      };
    });

    res.json({
      success: true,
      data: {
        questions: questionsWithTags,
        count: questionsWithTags.length,
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

module.exports = {
  createQuestion,    // POST /api/admin/questions
  getQuestions,      // GET /api/game/questions (Public)
  getAllQuestions    // GET /api/admin/questions (Admin only)
};
