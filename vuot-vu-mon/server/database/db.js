const Database = require('better-sqlite3');
const path = require('path');

// °Ýng d«n ¿n file database
const DB_PATH = path.join(__dirname, 'database.sqlite');

// T¡o k¿t nÑi database
let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : null
    });

    // B­t foreign keys
    db.pragma('foreign_keys = ON');

    // TÑi °u hóa performance
    db.pragma('journal_mode = WAL');
  }

  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  get db() {
    return getDatabase();
  }
};
