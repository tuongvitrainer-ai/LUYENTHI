const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

console.log('========================================');
console.log('🔍 KIỂM TRA DATABASE V6');
console.log('========================================\n');

try {
  const db = new Database(DB_PATH, { readonly: true });

  // Check tables
  console.log('📋 BẢNG (TABLES):');
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();
  tables.forEach(t => console.log(`   ✓ ${t.name}`));

  // Check views
  console.log('\n👁️  VIEWS:');
  const views = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='view'
  `).all();
  views.forEach(v => console.log(`   ✓ ${v.name}`));

  // Check indexes
  console.log('\n📇 INDEXES:');
  const indexes = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'
  `).all();
  console.log(`   Tổng: ${indexes.length} indexes`);

  // Check triggers
  console.log('\n⚡ TRIGGERS:');
  const triggers = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='trigger'
  `).all();
  triggers.forEach(t => console.log(`   ✓ ${t.name}`));

  // Check users
  console.log('\n👥 USERS:');
  const users = db.prepare('SELECT id, email, role, full_name, is_anonymous, stars_balance, freeze_streaks FROM users').all();
  users.forEach(u => {
    console.log(`   ${u.id}. ${u.email || '(guest)'} - Role: ${u.role} - Anonymous: ${u.is_anonymous} - Stars: ${u.stars_balance} - Freeze: ${u.freeze_streaks}`);
  });

  // Check schema for users table
  console.log('\n🏗️  USERS TABLE SCHEMA:');
  const userSchema = db.prepare(`PRAGMA table_info(users)`).all();
  userSchema.forEach(col => {
    console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
  });

  db.close();

  console.log('\n========================================');
  console.log('✅ DATABASE V6 HOẠT ĐỘNG BÌNH THƯỜNG!');
  console.log('========================================');

} catch (error) {
  console.error('❌ LỖI:', error);
  process.exit(1);
}
