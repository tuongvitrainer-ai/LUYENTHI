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
}

module.exports = Question;
