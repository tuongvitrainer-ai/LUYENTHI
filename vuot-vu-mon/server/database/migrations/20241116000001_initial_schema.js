/**
 * Initial schema migration - creates all tables for vuotvumon
 * Compatible with PostgreSQL
 */

exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username', 50).unique();
      table.string('email', 100).unique();
      table.string('password_hash', 255);
      table.string('full_name', 100);
      table.string('role', 20).defaultTo('student').notNullable();
      table.integer('stars_balance').defaultTo(0).notNullable();
      table.integer('current_streak').defaultTo(0).notNullable();
      table.integer('max_streak').defaultTo(0).notNullable();
      table.integer('freeze_streaks').defaultTo(0).notNullable();
      table.date('last_activity_date');
      table.boolean('is_anonymous').defaultTo(false).notNullable();
      table.boolean('is_active').defaultTo(true).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('username');
      table.index('email');
      table.index('role');
      table.index('is_anonymous');
    })

    // Questions table
    .createTable('questions', table => {
      table.increments('id').primary();
      table.text('content_json').notNullable();
      table.string('correct_answer', 255).notNullable();
      table.text('explanation');
      table.string('difficulty', 20).defaultTo('medium');
      table.integer('created_by').references('id').inTable('users').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('difficulty');
      table.index('is_active');
    })

    // Question tags table
    .createTable('question_tags', table => {
      table.increments('id').primary();
      table.integer('question_id').references('id').inTable('questions').onDelete('CASCADE').notNullable();
      table.string('tag_type', 50).notNullable();
      table.string('tag_value', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('question_id');
      table.index('tag_type');
      table.index('tag_value');
      table.index(['tag_type', 'tag_value']);
    })

    // Exam results table
    .createTable('exam_results', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      table.string('exam_type', 50).notNullable();
      table.integer('score').notNullable();
      table.integer('stars_earned').defaultTo(0).notNullable();
      table.text('details_json');
      table.timestamp('completed_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('user_id');
      table.index('exam_type');
      table.index('completed_at');
    })

    // Shop items table
    .createTable('shop_items', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.text('description');
      table.string('category', 50).notNullable();
      table.integer('price').notNullable();
      table.string('image_url', 500);
      table.text('properties_json');
      table.boolean('is_active').defaultTo(true).notNullable();
      table.integer('stock').defaultTo(-1);
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('category');
      table.index('is_active');
      table.index('price');
    })

    // User purchases table
    .createTable('user_purchases', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      table.integer('item_id').references('id').inTable('shop_items').onDelete('CASCADE').notNullable();
      table.integer('price_paid').notNullable();
      table.boolean('is_equipped').defaultTo(false).notNullable();
      table.timestamp('purchased_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('user_id');
      table.index('item_id');
      table.index(['user_id', 'item_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_purchases')
    .dropTableIfExists('shop_items')
    .dropTableIfExists('exam_results')
    .dropTableIfExists('question_tags')
    .dropTableIfExists('questions')
    .dropTableIfExists('users');
};
