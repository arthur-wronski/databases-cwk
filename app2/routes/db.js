const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'db-cont', //replace with your container name
  user: 'root',
  password: 'pass', //replace with your password
  database: 'MovieLens', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
