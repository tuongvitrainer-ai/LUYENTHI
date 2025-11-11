const { db } = require('../database/db');

/**
 * Create a new question with tags (Admin only)
 * POST /api/admin/questions
 *
 * Required fields:
 * - content_json: JSON object containing question data
 * - tags: Array of tag objects [{tag_type, tag_value}]
 *
 * Optional fields:
 * - difficulty_level: 1-5 (default: 1)
 * - points: Points for correct answer (default: 10)
 * - time_limit: Time limit in seconds (default: 60)
 */
const createQuestion = (req, res) => {
  try {
    const {
      content_json,
      tags,
      difficulty_level = 1,
      points = 10,
      time_limit = 60
    } = req.body;

    // Validation
    if (!content_json) {
      return res.status(400).json({
        success: false,
        message: 'content_json is required'
      });
    }

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

    // Use transaction to insert into both tables
    const transaction = db.transaction((contentJson, tagsArray, diffLevel, pts, timeLimit, userId) => {
      // Insert question
      const insertQuestion = db.prepare(`
        INSERT INTO questions (content_json, difficulty_level, points, time_limit, created_by)
        VALUES (?, ?, ?, ?, ?)
      `);

      const questionResult = insertQuestion.run(
        contentJson,
        diffLevel,
        pts,
        timeLimit,
        userId
      );

      const questionId = questionResult.lastInsertRowid;

      // Insert tags
      const insertTag = db.prepare(`
        INSERT INTO question_tags (question_id, tag_type, tag_value)
        VALUES (?, ?, ?)
      `);

      for (const tag of tagsArray) {
        insertTag.run(questionId, tag.tag_type, tag.tag_value);
      }

      return questionId;
    });

    // Execute transaction
    const questionId = transaction(
      contentJsonString,
      tags,
      difficulty_level,
      points,
      time_limit,
      req.user.id
    );

    // Fetch created question with tags
    const question = db.prepare(`
      SELECT id, content_json, difficulty_level, points, time_limit,
             status, created_by, created_at
      FROM questions
      WHERE id = ?
    `).get(questionId);

    const questionTags = db.prepare(`
      SELECT tag_type, tag_value
      FROM question_tags
      WHERE question_id = ?
    `).all(questionId);

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
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all questions (with optional filtering)
 * GET /api/admin/questions
 */
const getQuestions = (req, res) => {
  try {
    const {
      tag_type,
      tag_value,
      difficulty_level,
      status = 'active',
      limit = 50,
      offset = 0
    } = req.query;

    let query = `
      SELECT DISTINCT q.id, q.content_json, q.difficulty_level, q.points,
             q.time_limit, q.status, q.total_attempts, q.correct_attempts,
             q.created_by, q.created_at
      FROM questions q
    `;

    const conditions = [];
    const params = [];

    if (tag_type || tag_value) {
      query += ` INNER JOIN question_tags qt ON q.id = qt.question_id`;

      if (tag_type) {
        conditions.push('qt.tag_type = ?');
        params.push(tag_type);
      }

      if (tag_value) {
        conditions.push('qt.tag_value = ?');
        params.push(tag_value);
      }
    }

    if (status) {
      conditions.push('q.status = ?');
      params.push(status);
    }

    if (difficulty_level) {
      conditions.push('q.difficulty_level = ?');
      params.push(difficulty_level);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const questions = db.prepare(query).all(...params);

    // Get tags for each question
    const questionsWithTags = questions.map(q => {
      const tags = db.prepare(`
        SELECT tag_type, tag_value
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
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
};

/**
 * Update question
 * PUT /api/admin/questions/:id
 */
const updateQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const { content_json, tags, difficulty_level, points, time_limit, status } = req.body;

    // Check if question exists
    const existingQuestion = db.prepare('SELECT id FROM questions WHERE id = ?').get(id);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Use transaction for update
    const transaction = db.transaction((questionId, updates) => {
      // Build update query dynamically
      const updateFields = [];
      const updateParams = [];

      if (updates.content_json !== undefined) {
        updateFields.push('content_json = ?');
        const contentStr = typeof updates.content_json === 'string'
          ? updates.content_json
          : JSON.stringify(updates.content_json);
        updateParams.push(contentStr);
      }

      if (updates.difficulty_level !== undefined) {
        updateFields.push('difficulty_level = ?');
        updateParams.push(updates.difficulty_level);
      }

      if (updates.points !== undefined) {
        updateFields.push('points = ?');
        updateParams.push(updates.points);
      }

      if (updates.time_limit !== undefined) {
        updateFields.push('time_limit = ?');
        updateParams.push(updates.time_limit);
      }

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateParams.push(updates.status);
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = datetime(\'now\')');
        updateParams.push(questionId);

        const updateQuery = `UPDATE questions SET ${updateFields.join(', ')} WHERE id = ?`;
        db.prepare(updateQuery).run(...updateParams);
      }

      // Update tags if provided
      if (updates.tags && Array.isArray(updates.tags)) {
        // Delete existing tags
        db.prepare('DELETE FROM question_tags WHERE question_id = ?').run(questionId);

        // Insert new tags
        const insertTag = db.prepare(`
          INSERT INTO question_tags (question_id, tag_type, tag_value)
          VALUES (?, ?, ?)
        `);

        for (const tag of updates.tags) {
          insertTag.run(questionId, tag.tag_type, tag.tag_value);
        }
      }
    });

    // Execute transaction
    transaction(id, { content_json, tags, difficulty_level, points, time_limit, status });

    // Fetch updated question
    const question = db.prepare(`
      SELECT id, content_json, difficulty_level, points, time_limit,
             status, created_at, updated_at
      FROM questions
      WHERE id = ?
    `).get(id);

    const questionTags = db.prepare(`
      SELECT tag_type, tag_value
      FROM question_tags
      WHERE question_id = ?
    `).all(id);

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
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question'
    });
  }
};

/**
 * Delete question
 * DELETE /api/admin/questions/:id
 */
const deleteQuestion = (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question'
    });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion
};
