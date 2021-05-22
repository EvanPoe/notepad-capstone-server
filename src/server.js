require('dotenv').config()
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')
const knex = require('knex')
const pg = require('pg');
pg.defaults.ssl = process.env.NODE_ENV === "production";

//tell knex how to connect to db, using the client (postgres) 
//and the url for the databse
const db = knex({ 
  client: 'pg',
  connection: DATABASE_URL
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})








