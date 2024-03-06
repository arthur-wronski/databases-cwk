const mysql = require('mysql2/promise');

/* pooling allows multiple simultaneous db access */
const pool = mysql.createPool({
  host: 'mysql_container',
  user: 'root',
  password: 'your_root_password',
  database: 'MovieLens', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
