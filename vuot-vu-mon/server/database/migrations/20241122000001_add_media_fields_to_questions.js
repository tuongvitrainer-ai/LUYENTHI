/**
 * Migration: Add media support and missing fields to questions table
 * - Add image_url, audio_url for media attachments
 * - Add difficulty_level, points, time_limit fields (previously only in frontend)
 */

exports.up = function(knex) {
  return knex.schema.alterTable('questions', function(table) {
    // Media fields
    table.string('image_url', 500).nullable().comment('URL to question image');
    table.string('audio_url', 500).nullable().comment('URL to question audio');

    // Missing gameplay fields
    table.integer('difficulty_level').defaultTo(1).comment('Difficulty from 1-5 stars');
    table.integer('points').defaultTo(10).comment('Points awarded for correct answer');
    table.integer('time_limit').defaultTo(60).comment('Time limit in seconds');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('questions', function(table) {
    table.dropColumn('image_url');
    table.dropColumn('audio_url');
    table.dropColumn('difficulty_level');
    table.dropColumn('points');
    table.dropColumn('time_limit');
  });
};
