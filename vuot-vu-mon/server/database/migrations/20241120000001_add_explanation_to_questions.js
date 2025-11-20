/**
 * Migration: Add explanation field to questions table
 * For detailed review on results screen
 */

exports.up = function(knex) {
  return knex.schema.table('questions', table => {
    // Giải thích chi tiết cho câu trả lời đúng
    table.text('explanation');
  });
};

exports.down = function(knex) {
  return knex.schema.table('questions', table => {
    table.dropColumn('explanation');
  });
};
