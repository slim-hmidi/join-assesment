
exports.seed = knex => knex('officers').del()
  .then(() => knex('officers').insert([
    {
      id: 1, name: 'officer 1', available: true, reported_case_id: null,
    },
    {
      id: 2, name: 'officer 2', available: false, reported_case_id: 2,
    },
    {
      id: 3, name: 'officer 3', available: false, reported_case_id: 1,
    },
  ]))
  .finally(() => knex.schema.raw("SELECT setval(pg_get_serial_sequence('officers', 'id'), max(id)) FROM officers;"));
