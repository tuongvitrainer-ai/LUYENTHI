/**
 * Migration: Add explanation field to questions table
 * For detailed review on results screen
 * Note: This migration checks if the column exists before adding
 */

exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('questions', 'explanation');

  if (!hasColumn) {
    return knex.schema.table('questions', table => {
      // Giải thích chi tiết cho câu trả lời đúng
      table.text('explanation');
    });
  }

  // Column already exists, skip
  return Promise.resolve();
};

exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('questions', 'explanation');

  if (hasColumn) {
    return knex.schema.table('questions', table => {
      table.dropColumn('explanation');
    });
  }

  return Promise.resolve();
};
