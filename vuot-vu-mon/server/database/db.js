/**
 * Database connection using Knex.js for PostgreSQL
 */

require('dotenv').config();
const knexConfig = require('../knexfile');

// Determine which configuration to use
const environment = process.env.NODE_ENV || 'development';

// Use production config if in production, otherwise use development
const config = environment === 'production'
  ? knexConfig.production
  : knexConfig.development;

console.log(`🐘 Using PostgreSQL (${environment})`);

// Initialize Knex
const knex = require('knex')(config);

// Test database connection
async function testConnection() {
  try {
    await knex.raw('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Get database instance (for backward compatibility)
function getDatabase() {
  return knex;
}

// Close database connection
async function closeDatabase() {
  try {
    await knex.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
}

// Run pending migrations
async function runMigrations() {
  try {
    console.log('Running database migrations...');
    const [batch, log] = await knex.migrate.latest();
    if (log.length === 0) {
      console.log('Database is already up to date');
    } else {
      console.log(`Batch ${batch} run: ${log.length} migrations`);
      log.forEach(file => console.log(`  - ${file}`));
    }
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
}

// Rollback last migration
async function rollbackMigration() {
  try {
    const [batch, log] = await knex.migrate.rollback();
    console.log(`Batch ${batch} rolled back: ${log.length} migrations`);
    return true;
  } catch (error) {
    console.error('Rollback failed:', error.message);
    return false;
  }
}

// Get migration status
async function getMigrationStatus() {
  try {
    const [completed, pending] = await Promise.all([
      knex.migrate.list().then(([_, list]) => list),
      knex.migrate.list().then(([list]) => list)
    ]);
    return { completed, pending };
  } catch (error) {
    console.error('Error getting migration status:', error.message);
    return null;
  }
}

module.exports = {
  knex,
  getDatabase,
  closeDatabase,
  testConnection,
  runMigrations,
  rollbackMigration,
  getMigrationStatus,
  // Backward compatibility - expose knex as db
  get db() {
    return knex;
  }
};
