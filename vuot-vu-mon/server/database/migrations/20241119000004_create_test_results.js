/**
 * Migration: Create test_results table for "Thử thách khởi đầu" game
 * Stores individual test attempts and detailed results
 */

exports.up = function(knex) {
  return knex.schema.createTable('test_results', table => {
    table.increments('id').primary();

    // Foreign key to users table
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();

    // Test metadata
    table.integer('grade_level').notNullable(); // 3, 4, 5
    table.integer('total_questions').notNullable(); // Tổng số câu (VD: 15)
    table.integer('correct_answers').notNullable(); // Số câu đúng
    table.integer('score').notNullable(); // Điểm số (0-100)

    // Time tracking
    table.integer('time_taken').notNullable(); // Thời gian làm bài (giây)
    table.integer('time_limit').defaultTo(1800); // Thời gian giới hạn (30 phút = 1800 giây)

    // Subject breakdown - JSON object
    // Format: { "math": {"correct": 3, "total": 4}, "vietnamese": {"correct": 4, "total": 4}, ... }
    table.text('subject_scores_json');

    // Detailed answers - JSON array
    // Format: [{"question_id": 1, "user_answer": 1, "is_correct": true, "time_spent": 15}, ...]
    table.text('answers_json');

    // Stars earned from this test
    table.integer('stars_earned').defaultTo(0).notNullable();

    // Completion timestamp
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for querying
    table.index('user_id');
    table.index('grade_level');
    table.index('score');
    table.index('completed_at');
    table.index(['user_id', 'grade_level']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('test_results');
};
