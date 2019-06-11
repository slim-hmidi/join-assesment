# join-assesment


# Install npm packages
```
npm install

```

# Start server
```
npm start

```

# Run tests
```
npm test

```

# Check the lint of different files
```
npm run lint

```
# Create databases (user: postgres, password: admin)
```
psql -U postgres  
CREATE DATABASE joindb;
CREATE DATABASE jointestdb;

```

# create the schema into database
```
npm run migrate

```
# Populate the Databse tables with seeds
```
npm run seed:run

```
# Rollback the databse
```
npm run rollback

```

