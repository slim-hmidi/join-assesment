
exports.up = knex => knex.schema
  .createTable('resolved_cases', (table) => {
    table.increments('id').primary();
    table.integer('officer_id')
      .unsigned()
      .references('id')
      .inTable('officers')
      .index();
    table.integer('case_id');
    table.string('reporter_name');
    table.string('reporter_email');
    table.decimal('bike_frame_number', 10, 0);
  });

exports.down = knex => knex.schema
  .raw('drop table if exists resolved_cases cascade');
