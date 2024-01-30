const mysql = require('mysql2/promise')
const pool = mysql.createPool({
  host: 'host.docker.internal',
  user: 'root',
  password: 'idonthaveone',
  database: 'coursework',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool;