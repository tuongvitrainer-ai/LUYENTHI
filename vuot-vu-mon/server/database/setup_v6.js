const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Đường dẫn database
const DB_PATH = path.join(__dirname, 'database.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'init_v6.sql');

console.log('========================================');
console.log('🚀 SETTING UP DATABASE V6');
console.log('========================================');

try {
  // Xóa database cũ nếu tồn tại
  if (fs.existsSync(DB_PATH)) {
    console.log('⚠️  Xóa database cũ...');
    fs.unlinkSync(DB_PATH);
  }

  // Tạo database mới
  console.log('📦 Tạo database mới...');
  const db = new Database(DB_PATH, { verbose: console.log });

  // Bật foreign keys
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Đọc schema
  console.log('📄 Đọc schema V6...');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // Execute schema
  console.log('⚙️  Khởi tạo schema...');
  db.exec(schema);

  // Tạo admin user mặc định
  console.log('👤 Tạo admin user mặc định...');
  const bcrypt = require('bcryptjs');
  const adminPassword = bcrypt.hashSync('admin123', 10);

  db.prepare(`
    INSERT INTO users (
      email, password_hash, google_id, role, full_name,
      is_anonymous, stars_balance, freeze_streaks
    ) VALUES (?, ?, NULL, 'admin', 'Administrator', 0, 1000, 5)
  `).run('admin@example.com', adminPassword);

  // Tạo một guest user mẫu
  console.log('👻 Tạo guest user mẫu...');
  db.prepare(`
    INSERT INTO users (
      role, full_name, is_anonymous, stars_balance, freeze_streaks
    ) VALUES ('guest', NULL, 1, 0, 2)
  `).run();

  // Verify
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log(`✅ Đã tạo ${userCount.count} users`);

  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  console.log(`✅ Đã tạo ${tables.length} tables:`, tables.map(t => t.name).join(', '));

  const views = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='view'
  `).all();
  console.log(`✅ Đã tạo ${views.length} views:`, views.map(v => v.name).join(', '));

  db.close();

  console.log('========================================');
  console.log('✅ DATABASE V6 SETUP HOÀN TẤT!');
  console.log('========================================');
  console.log('📍 Database location:', DB_PATH);
  console.log('👤 Admin credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('========================================');

} catch (error) {
  console.error('❌ LỖI KHI SETUP DATABASE:', error);
  process.exit(1);
}
