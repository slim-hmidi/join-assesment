/* eslint-disable no-unused-vars */

exports.up = (knex, Promise) => knex.schema
  .createTable('reported_cases', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('email');
    table.decimal('bike_frame_number', 10, 0);
    table.boolean('case_resolved')
      .defaultTo(false);
  });

exports.down = (knex, Promise) => knex.schema
  .raw('drop table if exists reported_cases cascade');
