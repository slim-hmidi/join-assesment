
exports.seed = knex => knex('stolen_bikes').del()
  .then(() => knex('stolen_bikes').insert([
    {
      id: 1, owner_name: 'Smith', owner_phone_number: '+330612345678', frame_number: 'ATU1122CC12G', case_resolved: false,
    },
    {
      id: 2, owner_name: 'Alex', owner_phone_number: '+330612345678', frame_number: 'ATU1122CC10F', case_resolved: false,
    },
    {
      id: 3, owner_name: 'Mark', owner_phone_number: '+330612345678', frame_number: 'AJU1452CC10F', case_resolved: false,
    },
    {
      id: 4, owner_name: 'Mark', owner_phone_number: '+330612345678', frame_number: 'AJU0452CC10F', case_resolved: false,
    },
  ]))
  .finally(() => knex.schema.raw("SELECT setval(pg_get_serial_sequence('stolen_bikes', 'id'), max(id)) FROM stolen_bikes;"));
