/**
 * TestResult Model
 * Manages test results for "Thử thách khởi đầu" game
 */

const { knex } = require('../database/db');

class TestResult {
  /**
   * Create a new test result
   * @param {Object} resultData - Test result data
   * @returns {Promise<Object>} Created test result
   */
  static async create(resultData) {
    const {
      user_id,
      grade_level,
      total_questions,
      correct_answers,
      score,
      time_taken,
      time_limit = 1800,
      subject_scores,
      answers,
      stars_earned = 0
    } = resultData;

    const result = await knex('test_results').insert({
      user_id,
      grade_level,
      total_questions,
      correct_answers,
      score,
      time_taken,
      time_limit,
      subject_scores_json: JSON.stringify(subject_scores),
      answers_json: JSON.stringify(answers),
      stars_earned,
      completed_at: knex.fn.now(),
      created_at: knex.fn.now()
    }).returning('id');

    // Extract ID properly (handle both array and object responses)
    const insertedId = Array.isArray(result)
      ? (typeof result[0] === 'object' ? result[0].id : result[0])
      : (typeof result === 'object' ? result.id : result);

    console.log(`   💾 Inserted test result with ID: ${insertedId} (type: ${typeof insertedId})`);

    return this.getById(insertedId);
  }

  /**
   * Get test result by ID
   * @param {number} id - Test result ID
   * @returns {Promise<Object>} Test result object
   */
  static async getById(id) {
    // Ensure id is a number
    const numericId = typeof id === 'object' && id.id ? id.id : id;
    const parsedId = parseInt(numericId);

    if (isNaN(parsedId)) {
      console.error(`   ❌ Invalid ID passed to getById:`, id);
      throw new Error(`Invalid test result ID: ${JSON.stringify(id)}`);
    }

    const result = await knex('test_results')
      .where({ id: parsedId })
      .first();

    if (!result) {
      return null;
    }

    return {
      ...result,
      subject_scores: result.subject_scores_json ? JSON.parse(result.subject_scores_json) : {},
      answers: result.answers_json ? JSON.parse(result.answers_json) : []
    };
  }

  /**
   * Get all test results for a user
   * @param {number} userId - User ID
   * @param {Object} filters - Optional filters
   * @param {number} filters.grade_level - Filter by grade level
   * @param {number} filters.limit - Limit number of results
   * @returns {Promise<Array>} Array of test results
   */
  static async getByUser(userId, filters = {}) {
    let query = knex('test_results')
      .where({ user_id: userId })
      .orderBy('completed_at', 'desc');

    if (filters.grade_level) {
      query = query.where({ grade_level: filters.grade_level });
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const results = await query.select('*');

    return results.map(r => ({
      ...r,
      subject_scores: r.subject_scores_json ? JSON.parse(r.subject_scores_json) : {},
      answers: r.answers_json ? JSON.parse(r.answers_json) : []
    }));
  }

  /**
   * Get user's best score for a grade level
   * @param {number} userId - User ID
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Best test result
   */
  static async getBestScore(userId, gradeLevel) {
    const result = await knex('test_results')
      .where({ user_id: userId, grade_level: gradeLevel })
      .orderBy('score', 'desc')
      .first();

    if (!result) {
      return null;
    }

    return {
      ...result,
      subject_scores: result.subject_scores_json ? JSON.parse(result.subject_scores_json) : {},
      answers: result.answers_json ? JSON.parse(result.answers_json) : []
    };
  }

  /**
   * Get user statistics for a grade level
   * @param {number} userId - User ID
   * @param {number} gradeLevel - Grade level
   * @returns {Promise<Object>} Statistics object
   */
  static async getUserStats(userId, gradeLevel) {
    const results = await knex('test_results')
      .where({ user_id: userId, grade_level: gradeLevel })
      .select('*');

    if (results.length === 0) {
      return {
        total_attempts: 0,
        best_score: 0,
        average_score: 0,
        total_stars: 0,
        total_time: 0
      };
    }

    const total_attempts = results.length;
    const best_score = Math.max(...results.map(r => r.score));
    const average_score = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / total_attempts
    );
    const total_stars = results.reduce((sum, r) => sum + r.stars_earned, 0);
    const total_time = results.reduce((sum, r) => sum + r.time_taken, 0);

    return {
      total_attempts,
      best_score,
      average_score,
      total_stars,
      total_time,
      average_time: Math.round(total_time / total_attempts)
    };
  }

  /**
   * Get leaderboard for a grade level
   * @param {number} gradeLevel - Grade level
   * @param {number} limit - Number of top results (default: 10)
   * @returns {Promise<Array>} Leaderboard array
   */
  static async getLeaderboard(gradeLevel, limit = 10) {
    const results = await knex('test_results')
      .select(
        'test_results.user_id',
        'users.username',
        'users.full_name',
        knex.raw('MAX(test_results.score) as best_score'),
        knex.raw('COUNT(*) as total_attempts'),
        knex.raw('SUM(test_results.stars_earned) as total_stars')
      )
      .leftJoin('users', 'test_results.user_id', 'users.id')
      .where({ 'test_results.grade_level': gradeLevel })
      .groupBy('test_results.user_id', 'users.username', 'users.full_name')
      .orderBy('best_score', 'desc')
      .limit(limit);

    return results;
  }

  /**
   * Delete test result
   * @param {number} id - Test result ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    await knex('test_results')
      .where({ id })
      .delete();

    return true;
  }

  /**
   * Calculate stars earned based on score
   * @param {number} score - Score (0-100)
   * @param {number} gradeLevel - Grade level
   * @returns {number} Stars earned
   */
  static calculateStarsEarned(score, gradeLevel) {
    // Base stars on score percentage
    let stars = 0;

    if (score >= 90) {
      stars = 5; // 5 stars for 90%+
    } else if (score >= 80) {
      stars = 4; // 4 stars for 80-89%
    } else if (score >= 70) {
      stars = 3; // 3 stars for 70-79%
    } else if (score >= 60) {
      stars = 2; // 2 stars for 60-69%
    } else if (score >= 50) {
      stars = 1; // 1 star for 50-59%
    }

    // Bonus star for higher grade levels
    if (gradeLevel >= 5 && stars > 0) {
      stars += 1;
    }

    return stars;
  }
}

module.exports = TestResult;
