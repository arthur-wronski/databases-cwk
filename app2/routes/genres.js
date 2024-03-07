'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');
var InputSanitizer = require('./inputsanitizer'); // import sanitizer


/* Display all genres */
router.get('/', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    const getGenres = 'SELECT * FROM Genres;';
    const [genres, fields] = await connection.execute(getGenres);
    res.render('genres', { title: 'Genres', genres: genres });
  } catch (err) {
    console.error('Error from genres/', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;