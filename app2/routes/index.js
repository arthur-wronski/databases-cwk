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

/* GET all of table */
router.get('/', async function(req, res, next) {
  let connection;

  try {
    connection = await pool.getConnection();

    const sqlQuery = 'SELECT * FROM tags;';
    const [rows, fields] = await connection.execute(sqlQuery);
    res.render('index', { title: 'Database', data: rows });
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) connection.release();
  }
});

/* GET queried table */
router.get('/search', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let query;
    if (req.query.query) query = req.query.query;
    else query = '%';

    const sqlQuery = 'SELECT * FROM tags WHERE tag LIKE ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [`%${query}%`]);
    res.render('index', { title: 'Database', data: rows });
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) connection.release();
  }
})

/* handle link (just a trial for now) */
router.get('/:tagId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const tagId = req.params.tagId;
    const sqlQuery = 'SELECT * FROM tags WHERE tagId = ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [tagId]);

    res.render('index', { title: 'Database', data: rows });
  } catch (err) {
    console.error('Error executing database query:', err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) connection.release();
  }
})
module.exports = router;