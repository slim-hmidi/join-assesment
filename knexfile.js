module.exports = {
    development: {
      client: 'pg',
      useNullAsDefault: true,
      connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'joindb',
      },
    },
    test: {
      client: 'pg',
      useNullAsDefault: true,
      connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'admin',
        database: 'jointestdb',
      },
    },
  };
  