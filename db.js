const { Pool } = require('pg');
require("dotenv").config()
// const pool = new Pool({
//     user: "personmeetsdb_user",
//     password: "n024Me6LyYUx44YCQXh7f5NUupD9NWPu",
//     host: "dpg-cnh66g6n7f5s73ah2oi0-a.oregon-postgres.render.com",
//     port: 5432,
//     database: "personmeetsdb",
//     ssl: {
//     rejectUnauthorized: false 
//   }
// });
console.log(process.env.DB_USER)
console.log(process.env.DB_HOST)
console.log(process.env.DB_PASSWORD)
console.log(process.env.DB_NAME)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
//   ssl: {
//   rejectUnauthorized: false 
// }
});

module.exports = pool;
