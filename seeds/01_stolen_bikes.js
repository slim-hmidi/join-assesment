
exports.seed = knex => knex('stolen_bikes').del()
  .then(() => knex('stolen_bikes').insert([
    {
      id: 1, name: 'John Smith', email: 'john.smith@gmail.com', bike_frame_number: 'ATU1122CC12G', case_resolved: false,
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
  .finally(() => knex.schema.raw("SELECT setval(pg_get_serial_sequence('stolen_bikes', 'id'), max(id)) FROM stolen_bikes;"));
