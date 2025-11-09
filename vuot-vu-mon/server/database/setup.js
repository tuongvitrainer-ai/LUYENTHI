const fs = require('fs');
const path = require('path');
const { getDatabase, closeDatabase } = require('./db');

function setupDatabase() {
  console.log('Starting database initialization...');

  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    const db = getDatabase();

    console.log('Executing SQL file...');
    db.exec(sqlContent);
    console.log('SQL file executed successfully');

    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `).all();

    console.log('\nTables created:');
    tables.forEach(table => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`  - ${table.name} (${count.count} records)`);
    });

    const views = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='view'
      ORDER BY name
    `).all();

    if (views.length > 0) {
      console.log('\nViews created:');
      views.forEach(view => {
        console.log(`  - ${view.name}`);
      });
    }

    console.log('\nDatabase initialized successfully!');
    console.log(`Database file: ${path.join(__dirname, 'database.sqlite')}\n`);

  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  } finally {
    closeDatabase();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
