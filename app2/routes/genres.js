'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');
var InputSanitizer = require('./inputsanitizer');

/* Display all genres */
router.get('/', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    const sqlQuery = 'SELECT * FROM Genres;'; // Modify as needed for additional genre info
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
    let query = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    const sqlQuery = 'SELECT * FROM Genres WHERE genre LIKE ?;'; // Adjust query for relevant genre attributes
    const [rows, fields] = await connection.execute(sqlQuery, [query]);
    res.render('genres', { title: 'Genres', data: rows });
  } catch (err) {
    console.error('Error from genres/search:', err);
    res.render('error', { message: 'from genres/search', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;