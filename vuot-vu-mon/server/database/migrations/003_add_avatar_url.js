const { db } = require('../db');

/**
 * Migration 003: Add avatar_url column to users table
 */
function up() {
  console.log('Running migration 003: Add avatar_url to users table');

  try {
    // Check if column exists
    const columns = db.prepare("PRAGMA table_info(users)").all();
    const hasAvatarUrl = columns.some(col => col.name === 'avatar_url');

    if (!hasAvatarUrl) {
      db.prepare(`
        ALTER TABLE users
        ADD COLUMN avatar_url TEXT
      `).run();
      console.log('✓ Added avatar_url column to users table');
    } else {
      console.log('✓ avatar_url column already exists');
    }

  } catch (error) {
    console.error('Migration 003 failed:', error);
    throw error;
  }
}

function down() {
  console.log('Migration 003 rollback not supported (SQLite limitations)');
  // SQLite doesn't support DROP COLUMN easily
  // Would need to recreate table without the column
}

module.exports = { up, down };
