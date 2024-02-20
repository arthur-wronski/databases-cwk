'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');

/* Display all genres */
router.get('/', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    const sqlQuery = 'SELECT * FROM Genre;'; // Modify as needed for additional genre info
    const [rows, fields] = await connection.execute(sqlQuery);
    res.render('genres', { title: 'Genres', data: rows });
  } catch (err) {
    console.error('Error from genres/', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

/* Search within genres */
router.get('/search', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    let searchQuery = req.query.searchQuery;
    const sqlQuery = 'SELECT * FROM Genre WHERE name LIKE ?;'; // Adjust query for relevant genre attributes
    const [rows, fields] = await connection.execute(sqlQuery, [`%${searchQuery}%`]);
    res.render('genres', { title: 'Genres', data: rows });
  } catch (err) {
    console.error('Error from genres/search:', err);
    res.render('error', { message: 'from genres/search', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
