const pgp = require('pg-promise')();

const connectionSettings = {
  host: 'localhost',
  port: 5432,
  database: 'weather_api_app',
  user: 'jonathanellsaesser'
}

const db = pgp(process.env.DATABASE_URL || connectionSettings);
module.exports = db;
