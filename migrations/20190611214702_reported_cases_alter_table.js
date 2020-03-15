
exports.up = knex => knex.schema.alterTable('reported_cases', (table) => {
  table.unique('bike_frame_number');
});

exports.down = knex => knex.schema.raw('drop table if exists reported_cases cascade');
