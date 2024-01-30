const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'databases-cwk-db-1', //replace with your container name
  user: 'root',
  password: 'my-secret-pw', //replace with your password
  database: 'MovieLens', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
