/**
 * Question Model
 * Manages questions for "Thử thách khởi đầu" game
 */

const { knex } = require('../database/db');

class Question {
  /**
   * Get all questions by grade level and subject
   * @param {number} gradeLevel - Grade level (3, 4, 5)
   * @param {string} subject - Subject filter (optional): 'math', 'vietnamese', 'english', 'logic'
   * @returns {Promise<Array>} Array of questions
   */
  static async getByGradeAndSubject(gradeLevel, subject = null) {
    let query = knex('questions')
      .where({ grade_level: gradeLevel, is_active: true });

    if (subject) {
      query = query.where({ subject });
    }

    const questions = await query.select('*');

    // Parse JSON fields
    return questions.map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : [],
      content: q.content_json ? JSON.parse(q.content_json) : null
    }));
  }

  /**
   * Get random questions for a test
   * @param {number} gradeLevel - Grade level (3, 4, 5)
   * @param {number} count - Number of questions to return
   * @param {Object} distribution - Distribution by subject (optional)
   *   Example: { math: 4, vietnamese: 4, english: 4, logic: 3 }
   * @returns {Promise<Array>} Array of random questions
   */
  static async getRandomQuestions(gradeLevel, count = 15, distribution = null) {
    if (!distribution) {
      // Default: get random questions without subject distribution
      const questions = await knex('questions')
        .where({ grade_level: gradeLevel, is_active: true })
        .orderByRaw('RANDOM()')
        .limit(count)
        .select('*');

      return questions.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : [],
        content: q.content_json ? JSON.parse(q.content_json) : null
      }));
    }

    // Get questions by subject distribution
    const allQuestions = [];

    for (const [subject, subjectCount] of Object.entries(distribution)) {
      const questions = await knex('questions')
        .where({
          grade_level: gradeLevel,
          subject: subject,
          is_active: true
        })
        .orderByRaw('RANDOM()')
        .limit(subjectCount)
        .select('*');

      allQuestions.push(...questions);
    }

    // Parse JSON and shuffle
    const parsedQuestions = allQuestions.map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : [],
      content: q.content_json ? JSON.parse(q.content_json) : null
    }));

    // Shuffle the combined array
    return parsedQuestions.sort(() => Math.random() - 0.5);
  }

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Created question
   */
  static async create(questionData) {
    const {
      subject,
      topic,
      grade_level,
      question_text,
      options,
      correct_answer,
      explanation,
      difficulty = 'medium',
      created_by = null
    } = questionData;

    const [id] = await knex('questions').insert({
      subject,
      topic,
      grade_level,
      question_text,
      options_json: JSON.stringify(options),
      correct_answer,
      explanation,
      difficulty,
      created_by,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }).returning('id');

    return this.getById(id);
  }

  /**
   * Get question by ID
   * @param {number} id - Question ID
   * @returns {Promise<Object>} Question object
   */
  static async getById(id) {
    const question = await knex('questions')
      .where({ id })
      .first();

    if (!question) {
      return null;
    }

    return {
      ...question,
      options: question.options_json ? JSON.parse(question.options_json) : [],
      content: question.content_json ? JSON.parse(question.content_json) : null
    };
  }

  /**
   * Update a question
   * @param {number} id - Question ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated question
   */
  static async update(id, updates) {
    const updateData = { ...updates };

    // Stringify options if provided
    if (updates.options) {
      updateData.options_json = JSON.stringify(updates.options);
      delete updateData.options;
    }

    updateData.updated_at = knex.fn.now();

    await knex('questions')
      .where({ id })
      .update(updateData);

    return this.getById(id);
  }

  /**
   * Delete a question (soft delete - set is_active to false)
   * @param {number} id - Question ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    await knex('questions')
      .where({ id })
      .update({ is_active: false, updated_at: knex.fn.now() });

    return true;
  }

  /**
   * Get question count by grade and subject
   * @param {number} gradeLevel - Grade level
   * @param {string} subject - Subject (optional)
   * @returns {Promise<number>} Question count
   */
  static async getCount(gradeLevel, subject = null) {
    let query = knex('questions')
      .where({ grade_level: gradeLevel, is_active: true });

    if (subject) {
      query = query.where({ subject });
    }

    const result = await query.count('* as count').first();
    return parseInt(result.count);
  }

  /**
   * Get random questions with filters for subjects and difficulty
   * @param {number} gradeLevel - Grade level (3, 4, 5)
   * @param {number} count - Number of questions to return
   * @param {Object} options - Filter options
   *   - subjects: Array of subjects ['math', 'english'] or null for all
   *   - difficultyLevel: Number 1-10 (maps to distribution of easy/medium/hard)
   * @returns {Promise<Array>} Array of random questions
   */
  static async getRandomQuestionsWithFilters(gradeLevel, count = 15, options = {}) {
    const { subjects = null, difficultyLevel = null } = options;

    // Define difficulty distribution map for each level (1-10)
    const difficultyDistribution = {
      1: { easy: 1.0, medium: 0.0, hard: 0.0 },    // 100% easy
      2: { easy: 0.8, medium: 0.2, hard: 0.0 },    // 80% easy, 20% medium
      3: { easy: 0.6, medium: 0.4, hard: 0.0 },    // 60% easy, 40% medium
      4: { easy: 0.5, medium: 0.5, hard: 0.0 },    // 50% easy, 50% medium
      5: { easy: 0.2, medium: 0.8, hard: 0.0 },    // 20% easy, 80% medium
      6: { easy: 0.0, medium: 1.0, hard: 0.0 },    // 100% medium
      7: { easy: 0.0, medium: 0.8, hard: 0.2 },    // 80% medium, 20% hard
      8: { easy: 0.0, medium: 0.5, hard: 0.5 },    // 50% medium, 50% hard
      9: { easy: 0.0, medium: 0.2, hard: 0.8 },    // 20% medium, 80% hard
      10: { easy: 0.0, medium: 0.0, hard: 1.0 }    // 100% hard
    };

    // If difficultyLevel is provided, use distribution; otherwise get random from all difficulties
    if (difficultyLevel && difficultyDistribution[difficultyLevel]) {
      const distribution = difficultyDistribution[difficultyLevel];
      const allQuestions = [];

      // Calculate number of questions for each difficulty
      const counts = {
        easy: Math.round(count * distribution.easy),
        medium: Math.round(count * distribution.medium),
        hard: Math.round(count * distribution.hard)
      };

      // Adjust counts to ensure total equals requested count
      const totalCalculated = counts.easy + counts.medium + counts.hard;
      if (totalCalculated < count) {
        // Add remaining questions to the most prominent difficulty
        const maxKey = Object.keys(distribution).reduce((a, b) =>
          distribution[a] > distribution[b] ? a : b
        );
        counts[maxKey] += (count - totalCalculated);
      } else if (totalCalculated > count) {
        // Remove excess from the most prominent difficulty
        const maxKey = Object.keys(distribution).reduce((a, b) =>
          distribution[a] > distribution[b] ? a : b
        );
        counts[maxKey] -= (totalCalculated - count);
      }

      // Fetch questions for each difficulty level
      for (const [difficulty, difficultyCount] of Object.entries(counts)) {
        if (difficultyCount > 0) {
          let query = knex('questions')
            .where({ grade_level: gradeLevel, is_active: true, difficulty });

          // Filter by subjects if provided
          if (subjects && Array.isArray(subjects) && subjects.length > 0) {
            query = query.whereIn('subject', subjects);
          }

          const questions = await query
            .orderByRaw('RANDOM()')
            .limit(difficultyCount)
            .select('*');

          allQuestions.push(...questions);
        }
      }

      // Shuffle all questions together
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);

      return shuffled.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : [],
        content: q.content_json ? JSON.parse(q.content_json) : null
      }));
    } else {
      // No difficulty level specified, get random questions
      let query = knex('questions')
        .where({ grade_level: gradeLevel, is_active: true });

      // Filter by subjects if provided
      if (subjects && Array.isArray(subjects) && subjects.length > 0) {
        query = query.whereIn('subject', subjects);
      }

      const questions = await query
        .orderByRaw('RANDOM()')
        .limit(count)
        .select('*');

      return questions.map(q => ({
        ...q,
        options: q.options_json ? JSON.parse(q.options_json) : [],
        content: q.content_json ? JSON.parse(q.content_json) : null
      }));
    }
  }
}

module.exports = Question;
