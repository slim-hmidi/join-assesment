/* eslint-disable no-unused-vars */

exports.up = (knex, Promise) => knex.schema
  .createTable('stolen_bikes', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('email');
    table.string('bike_frame_number');
    table.boolean('case_resolved')
      .defaultTo(false);
  });

exports.down = (knex, Promise) => knex.schema
  .raw('drop table if exists stolen_bikes cascade');
