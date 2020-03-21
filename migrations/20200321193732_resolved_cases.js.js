
exports.up = knex => knex.schema
  .createTable('resolved_cases', (table) => {
    table.increments('id').primary();
    table.integer('officer_id')
      .unsigned()
      .references('id')
      .inTable('officers')
      .index();
    table.integer('case_id')
      .unsigned()
      .references('id')
      .inTable('reported_cases')
      .index();
  });

exports.down = knex => knex.schema
  .raw('drop table if exists resolved_cases cascade');
