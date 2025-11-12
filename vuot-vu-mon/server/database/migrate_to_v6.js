const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('🔄 MIGRATING DATABASE TO V6...\n');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found at:', dbPath);
  console.log('👉 Run: node server/database/setup_v6.js instead');
  process.exit(1);
}

const db = new Database(dbPath);

// Backup database first
const backupPath = path.join(__dirname, `database_backup_${Date.now()}.sqlite`);
console.log('📦 Creating backup:', backupPath);
fs.copyFileSync(dbPath, backupPath);
console.log('✅ Backup created!\n');

// Check current schema
console.log('📊 Checking current schema...');
const usersColumns = db.prepare("PRAGMA table_info(users)").all();
const columnNames = usersColumns.map(col => col.name);

console.log('Current columns:', columnNames.join(', '));

// Add missing V6 columns
const columnsToAdd = [
  { name: 'is_anonymous', sql: 'ALTER TABLE users ADD COLUMN is_anonymous INTEGER DEFAULT 1 CHECK (is_anonymous IN (0, 1))' },
  { name: 'stars_balance', sql: 'ALTER TABLE users ADD COLUMN stars_balance INTEGER DEFAULT 0' },
  { name: 'current_streak', sql: 'ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0' },
  { name: 'max_streak', sql: 'ALTER TABLE users ADD COLUMN max_streak INTEGER DEFAULT 0' },
  { name: 'freeze_streaks', sql: 'ALTER TABLE users ADD COLUMN freeze_streaks INTEGER DEFAULT 2' },
  { name: 'last_learnt_date', sql: 'ALTER TABLE users ADD COLUMN last_learnt_date TEXT' }
];

console.log('\n🔨 Adding V6 columns to users table...');

let addedCount = 0;
for (const col of columnsToAdd) {
  if (!columnNames.includes(col.name)) {
    try {
      db.prepare(col.sql).run();
      console.log(`  ✅ Added column: ${col.name}`);
      addedCount++;
    } catch (error) {
      console.log(`  ⚠️  Column ${col.name} already exists or error:`, error.message);
    }
  } else {
    console.log(`  ⏭️  Column ${col.name} already exists`);
  }
}

// Update existing users to set is_anonymous based on whether they have email
console.log('\n🔄 Updating existing users...');
try {
  const result = db.prepare(`
    UPDATE users
    SET is_anonymous = CASE
      WHEN email IS NULL OR email = '' THEN 1
      ELSE 0
    END
    WHERE is_anonymous IS NULL
  `).run();
  console.log(`  ✅ Updated ${result.changes} users`);
} catch (error) {
  console.log('  ⚠️  Error updating users:', error.message);
}

// Migrate total_stars to stars_balance if exists
const hasTotalStars = columnNames.includes('total_stars');
if (hasTotalStars) {
  console.log('\n🔄 Migrating total_stars → stars_balance...');
  try {
    db.prepare(`UPDATE users SET stars_balance = total_stars WHERE total_stars IS NOT NULL`).run();
    console.log('  ✅ Migrated total_stars to stars_balance');
  } catch (error) {
    console.log('  ⚠️  Error migrating:', error.message);
  }
}

// Check if questions table exists and has correct schema
console.log('\n📊 Checking questions table...');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
const tableNames = tables.map(t => t.name);

if (!tableNames.includes('questions')) {
  console.log('  ⚠️  Questions table not found, creating...');

  const initSqlPath = path.join(__dirname, 'init_v6.sql');
  if (fs.existsSync(initSqlPath)) {
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    db.exec(initSql);
    console.log('  ✅ Created all V6 tables');
  } else {
    console.log('  ❌ init_v6.sql not found!');
  }
} else {
  console.log('  ✅ Questions table exists');
}

// Check if question_tags exists
if (!tableNames.includes('question_tags')) {
  console.log('  ⚠️  Question_tags table not found, creating...');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS question_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      tag_key TEXT NOT NULL,
      tag_value TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(question_id, tag_key, tag_value)
    )
  `).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON question_tags(question_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_question_tags_key_value ON question_tags(tag_key, tag_value)`).run();

  console.log('  ✅ Created question_tags table');
}

// Check exam_results table
if (!tableNames.includes('exam_results')) {
  console.log('  ⚠️  Exam_results table not found, creating...');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exam_type TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      details_json TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_results_created_at ON exam_results(created_at)`).run();

  console.log('  ✅ Created exam_results table');
}

console.log('\n✅ MIGRATION COMPLETED!\n');

// Final verification
const finalColumns = db.prepare("PRAGMA table_info(users)").all();
console.log('📋 Final users table schema:');
finalColumns.forEach(col => {
  const marker = columnsToAdd.some(c => c.name === col.name) ? '🆕' : '  ';
  console.log(`${marker} ${col.name} (${col.type})`);
});

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`\n👥 Total users: ${userCount.count}`);

const questionsCount = db.prepare('SELECT COUNT(*) as count FROM questions').get();
console.log(`📝 Total questions: ${questionsCount.count}`);

console.log('\n🎉 Database is now V6-compatible!');
console.log(`📦 Backup saved at: ${backupPath}`);
console.log('\n👉 You can now run: npm start');

db.close();
