
exports.up = knex => knex.schema.alterTable('stolen_bikes', (table) => {
  table.unique('bike_frame_number');
});

exports.down = knex => knex.schema.raw('drop table if exists stolen_bikes cascade');
