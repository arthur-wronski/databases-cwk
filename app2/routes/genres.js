'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

/* list genres of a chosen film */
router.get('/:film', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the film parameter
    const film = InputSanitizer.sanitizeString(req.params.film);

    // get list of genres from film
    const sqlQuery = 'SELECT * FROM Viewer WHERE filmId = ?;'; // Assuming you want to filter by filmId
    const [rows, fields] = await connection.execute(sqlQuery, [film]); // pooled connection to db
    res.render('genres', { title: 'Genres of '+film, data: rows }); // send data to response frontend
  } catch (err) {
    console.error('Error from genres/:', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
