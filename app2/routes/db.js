const mysql = require('mysql2/promise');

/* pooling allows multiple simultaneous db access */
const pool = mysql.createPool({
  host: 'db-cont',
  user: 'root',
  password: 'pass',
  database: 'MovieLens', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
