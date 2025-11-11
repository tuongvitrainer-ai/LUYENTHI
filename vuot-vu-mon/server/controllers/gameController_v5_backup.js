const { db } = require('../database/db');

/**
 * Get questions for game/practice
 * GET /api/game/questions
 *
 * Query params:
 * - subject: Filter by subject (Toán, Tiếng Việt, Tiếng Anh)
 * - grade: Filter by grade (Lớp 3)
 * - difficulty_level: Filter by difficulty (1-5)
 * - limit: Number of questions (default: 10)
 */
const getQuestions = (req, res) => {
  try {
    const {
      subject,
      grade = 'Lớp 3',
      difficulty_level,
      limit = 10
    } = req.query;

    let query = `
      SELECT DISTINCT q.id, q.content_json, q.difficulty_level,
             q.points, q.time_limit
      FROM questions q
      INNER JOIN question_tags qt ON q.id = qt.question_id
      WHERE q.status = 'active'
    `;

    const params = [];

    // Filter by grade (always Lớp 3 for now)
    query += ` AND q.id IN (
      SELECT question_id FROM question_tags
      WHERE tag_type = 'grade' AND tag_value = ?
    )`;
    params.push(grade);

    // Filter by subject if provided
    if (subject) {
      query += ` AND q.id IN (
        SELECT question_id FROM question_tags
        WHERE tag_type = 'subject' AND tag_value = ?
      )`;
      params.push(subject);
    }

    // Filter by difficulty if provided
    if (difficulty_level) {
      query += ` AND q.difficulty_level = ?`;
      params.push(difficulty_level);
    }

    // Random order and limit
    query += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(parseInt(limit));

    const questions = db.prepare(query).all(...params);

    // Parse content_json and get tags for each question
    const questionsWithTags = questions.map(q => {
      const tags = db.prepare(`
        SELECT tag_type, tag_value
        FROM question_tags
        WHERE question_id = ?
      `).all(q.id);

      return {
        id: q.id,
        content: JSON.parse(q.content_json),
        difficulty_level: q.difficulty_level,
        points: q.points,
        time_limit: q.time_limit,
        tags: tags
      };
    });

    res.json({
      success: true,
      data: {
        questions: questionsWithTags,
        count: questionsWithTags.length
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
 * Submit answer and update user stats
 * POST /api/game/submit_result
 *
 * Body:
 * - question_id: ID of the question
 * - user_answer: User's answer
 * - time_spent: Time spent in seconds
 */
const submitResult = (req, res) => {
  try {
    const { question_id, user_answer, time_spent } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!question_id || !user_answer) {
      return res.status(400).json({
        success: false,
        message: 'question_id and user_answer are required'
      });
    }

    // Get question
    const question = db.prepare(`
      SELECT id, content_json, points
      FROM questions
      WHERE id = ?
    `).get(question_id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const questionContent = JSON.parse(question.content_json);
    const correctAnswer = questionContent.correct_answer;
    const isCorrect = user_answer.toString() === correctAnswer.toString();

    // Get current user data
    const user = db.prepare(`
      SELECT id, current_streak, max_streak, total_stars, last_activity_date
      FROM users
      WHERE id = ?
    `).get(user_id);

    // Calculate streak (Lazy Calculation)
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = user.last_activity_date ? user.last_activity_date.split(' ')[0] : null;

    let newStreak = user.current_streak || 0;
    let newMaxStreak = user.max_streak || 0;

    if (isCorrect) {
      if (!lastActivity || lastActivity === today) {
        // Same day or first time - maintain streak
        newStreak = user.current_streak || 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivity === yesterdayStr) {
          // Yesterday - increment streak
          newStreak = (user.current_streak || 0) + 1;
        } else {
          // Missed days - reset to 1
          newStreak = 1;
        }
      }

      // Update max streak
      if (newStreak > newMaxStreak) {
        newMaxStreak = newStreak;
      }
    }

    // Calculate points earned
    const pointsEarned = isCorrect ? question.points : 0;
    const newTotalStars = user.total_stars + pointsEarned;

    // Use transaction to update everything
    const transaction = db.transaction(() => {
      // Insert exam result
      db.prepare(`
        INSERT INTO exam_results
        (user_id, question_id, user_answer, is_correct, points_earned, time_spent, streak_at_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        user_id,
        question_id,
        user_answer,
        isCorrect ? 1 : 0,
        pointsEarned,
        time_spent || null,
        newStreak
      );

      // Update user stats
      db.prepare(`
        UPDATE users
        SET total_stars = ?,
            current_streak = ?,
            max_streak = ?,
            last_activity_date = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(newTotalStars, newStreak, newMaxStreak, user_id);

      // Update question stats
      db.prepare(`
        UPDATE questions
        SET total_attempts = total_attempts + 1,
            correct_attempts = correct_attempts + ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(isCorrect ? 1 : 0, question_id);
    });

    // Execute transaction
    transaction();

    res.json({
      success: true,
      data: {
        is_correct: isCorrect,
        correct_answer: correctAnswer,
        explanation: questionContent.explanation || null,
        points_earned: pointsEarned,
        new_total_stars: newTotalStars,
        current_streak: newStreak,
        max_streak: newMaxStreak
      }
    });

  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting result'
    });
  }
};

/**
 * Get user's game history
 * GET /api/game/history
 */
const getHistory = (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const history = db.prepare(`
      SELECT er.id, er.question_id, er.is_correct, er.points_earned,
             er.time_spent, er.streak_at_time, er.created_at,
             q.content_json
      FROM exam_results er
      INNER JOIN questions q ON er.question_id = q.id
      WHERE er.user_id = ?
      ORDER BY er.created_at DESC
      LIMIT ? OFFSET ?
    `).all(user_id, parseInt(limit), parseInt(offset));

    const historyWithContent = history.map(h => ({
      ...h,
      content: JSON.parse(h.content_json)
    }));

    res.json({
      success: true,
      data: {
        history: historyWithContent,
        count: historyWithContent.length
      }
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching history'
    });
  }
};

/**
 * Get user statistics
 * GET /api/game/stats
 */
const getStats = (req, res) => {
  try {
    const user_id = req.user.id;

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        SUM(points_earned) as total_points_earned,
        AVG(time_spent) as avg_time_spent
      FROM exam_results
      WHERE user_id = ?
    `).get(user_id);

    const user = db.prepare(`
      SELECT total_stars, current_streak, max_streak
      FROM users
      WHERE id = ?
    `).get(user_id);

    res.json({
      success: true,
      data: {
        ...user,
        ...stats,
        accuracy: stats.total_attempts > 0
          ? ((stats.correct_answers / stats.total_attempts) * 100).toFixed(1)
          : 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
};

module.exports = {
  getQuestions,
  submitResult,
  getHistory,
  getStats
};
