
exports.up = knex => knex.schema
  .createTable('officers', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.boolean('available')
      .defaultTo(true);
    table.integer('stolen_bike_id')
      .unsigned()
      .references('id')
      .inTable('stolen_bikes')
      .onDelete('SET NULL')
      .index();
  });

exports.down = knex => knex.schema.raw('drop table if exists officers cascade');
