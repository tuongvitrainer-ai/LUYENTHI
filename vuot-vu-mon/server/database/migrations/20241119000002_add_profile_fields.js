/**
 * Migration: Add profile fields to users table
 * Thêm các trường thông tin cá nhân: birthday, gender, phone, bio, avatar
 */

exports.up = function(knex) {
  return knex.schema.table('users', table => {
    // Ngày sinh nhật
    table.date('birthday');

    // Giới tính: male, female, other
    table.string('gender', 20);

    // Số điện thoại
    table.string('phone', 20);

    // Tiểu sử/Giới thiệu ngắn
    table.text('bio');

    // Avatar URL (đã có sẵn avatar_url hoặc thêm display_name nếu chưa có)
    table.string('display_name', 100);

    // Indexes
    table.index('gender');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('birthday');
    table.dropColumn('gender');
    table.dropColumn('phone');
    table.dropColumn('bio');
    table.dropColumn('display_name');
  });
};
