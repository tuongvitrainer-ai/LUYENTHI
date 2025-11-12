const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server/database/database.sqlite');
const db = new Database(dbPath);

console.log('📊 Checking current database schema...\n');

// Check users table columns
const usersColumns = db.prepare("PRAGMA table_info(users)").all();

console.log('=== USERS TABLE COLUMNS ===');
usersColumns.forEach(col => {
  console.log(`${col.name} (${col.type})`);
});

console.log('\n✅ Expected V6 columns:');
console.log('- is_anonymous (INTEGER)');
console.log('- stars_balance (INTEGER)');
console.log('- current_streak (INTEGER)');
console.log('- max_streak (INTEGER)');
console.log('- freeze_streaks (INTEGER)');
console.log('- last_learnt_date (TEXT)');

// Check if V6 columns exist
const hasIsAnonymous = usersColumns.some(col => col.name === 'is_anonymous');
const hasStarsBalance = usersColumns.some(col => col.name === 'stars_balance');
const hasCurrentStreak = usersColumns.some(col => col.name === 'current_streak');

console.log('\n📋 Status:');
console.log(`is_anonymous: ${hasIsAnonymous ? '✅' : '❌'}`);
console.log(`stars_balance: ${hasStarsBalance ? '✅' : '❌'}`);
console.log(`current_streak: ${hasCurrentStreak ? '✅' : '❌'}`);

if (!hasIsAnonymous || !hasStarsBalance || !hasCurrentStreak) {
  console.log('\n⚠️  DATABASE IS NOT V6!');
  console.log('👉 Run: node server/database/setup_v6.js');
} else {
  console.log('\n✅ Database is V6!');
}

db.close();
