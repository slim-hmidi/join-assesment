
exports.seed = knex => knex('reported_cases').del()
  .then(() => knex('reported_cases').insert([
    {
      id: 1, name: 'user', email: 'user.123@gmail.com', bike_frame_number: 'ATU1122CC12G', case_resolved: false,
    },
    {
      id: 2, name: 'Alex Stan', email: 'alex.stan@gmail.com', bike_frame_number: 'ATU1122CC10F', case_resolved: false,
    },
    {
      id: 3, name: 'Mark Fred', email: 'mark.fred@yahoo.com', bike_frame_number: 'AJU1452CC10F', case_resolved: false,
    },
    {
      id: 4, name: 'Mark Fred', email: 'mark.fred@yahoo.com', bike_frame_number: 'AJU0452CC10F', case_resolved: false,
    },
  ]))
  .finally(() => knex.schema.raw("SELECT setval(pg_get_serial_sequence('reported_cases', 'id'), max(id)) FROM reported_cases;"));
