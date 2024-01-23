'use strict'
var express = require('express');
const { resolve } = require('styled-jsx/css');
var router = express.Router();
const mysql = require('mysql2/promise')
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'idonthaveone',
  database: 'coursework',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
router.get('/:tagId', async function(req, res) {
    let connection;
  
    try {
      connection = await pool.getConnection();
  
      const tagId = req.params.tagId;
      const sqlQuery = 'SELECT * FROM tags WHERE tagId = ?;';
      const [rows, fields] = await connection.execute(sqlQuery, [tagId]);
  
      res.render('filmInfo', { title: 'Database', data: rows });
    } catch (err) {
      console.error('Error executing database query:', err);
      res.status(500).send('Internal Server Error');
    } finally {
      if (connection) connection.release();
    }
})