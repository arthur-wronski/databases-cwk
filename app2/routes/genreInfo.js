'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

/* show more info about the chosen genre */
router.get('/:genre', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the genre parameter
    const genre = InputSanitizer.sanitizeString(req.params.genre);

    const sqlQuery = 'SELECT * FROM Viewer WHERE movieId = ?;';             // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [genre]);     // pooled connection to db

    res.render('genreInfo', { title: 'GenreInfo-'+genre, data: rows[0] });  // send data to response frontend
  } catch (err) {
    console.error('Error from genre/genre:', err);
    res.render('error', { message: 'from genre/genre', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
