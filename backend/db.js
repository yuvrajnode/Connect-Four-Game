const { Pool } = require("pg");

const pool = new Pool({
  user: "yuvraj",           
  host: "localhost",
  database: "connect_four",
  port: 5432,
});

module.exports = pool;