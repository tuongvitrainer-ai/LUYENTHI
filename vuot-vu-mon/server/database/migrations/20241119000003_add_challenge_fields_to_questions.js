/**
 * Migration: Add fields for "Thử thách khởi đầu" game to questions table
 * Adds subject, topic, grade_level, and restructures for multiple choice questions
 */

exports.up = function(knex) {
  return knex.schema.table('questions', table => {
    // Môn học: math, vietnamese, english, logic
    table.string('subject', 50);

    // Chủ đề cụ thể (VD: "Phép cộng", "Chính tả", "Vocabulary")
    table.string('topic', 100);

    // Cấp độ lớp: 3, 4, 5 (hoặc null cho câu hỏi chung)
    table.integer('grade_level');

    // Nội dung câu hỏi (text thuần túy, không JSON)
    table.text('question_text');

    // Các đáp án (JSON array: ['Option A', 'Option B', 'Option C', 'Option D'])
    table.text('options_json');

    // Index để tìm kiếm nhanh theo môn học, topic, grade
    table.index('subject');
    table.index('topic');
    table.index('grade_level');
    table.index(['subject', 'grade_level']);
  });
};

exports.down = function(knex) {
  return knex.schema.table('questions', table => {
    table.dropIndex('subject');
    table.dropIndex('topic');
    table.dropIndex('grade_level');
    table.dropIndex(['subject', 'grade_level']);

    table.dropColumn('subject');
    table.dropColumn('topic');
    table.dropColumn('grade_level');
    table.dropColumn('question_text');
    table.dropColumn('options_json');
  });
};
