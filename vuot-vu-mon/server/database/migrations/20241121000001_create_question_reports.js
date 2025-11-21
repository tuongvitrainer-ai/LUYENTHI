/**
 * Migration: Create question_reports table
 * For users to report issues with questions
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('question_reports', table => {
      table.increments('id').primary();
      table.integer('question_id').references('id').inTable('questions').onDelete('CASCADE').notNullable();
      table.integer('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('report_type', 50).defaultTo('error').notNullable(); // 'error', 'typo', 'wrong_answer', 'other'
      table.text('comment'); // Optional user comment
      table.text('context_json'); // Store additional context (exam_type, user_answer, etc.)
      table.string('status', 20).defaultTo('pending').notNullable(); // 'pending', 'reviewing', 'resolved', 'rejected'
      table.integer('resolved_by').references('id').inTable('users').onDelete('SET NULL'); // Admin who resolved
      table.text('admin_note'); // Admin's note when resolving
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('resolved_at');

      // Indexes
      table.index('question_id');
      table.index('user_id');
      table.index('status');
      table.index('created_at');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('question_reports');
};
