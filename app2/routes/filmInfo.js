'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db'); // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

/* show more info about the chosen film */
router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the userId parameter before using it in the SQL query
    const userId = InputSanitizer.sanitizeString(req.params.userId);

    const sqlQuery = 'SELECT * FROM Viewer WHERE userId = ?;'; // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [userId]); // pooled connection to db

    // also need to get the viewers of the film and show them on this page. Click to show that viewers info??
    res.render('filmInfo', { title: 'FilmInfo-' + userId, data: rows[0] }); // send data to response frontend
  } catch (err) {
    console.error('Error from filmInfo/userId:', err);
    res.render('error', { message: 'from filmInfo/userId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
