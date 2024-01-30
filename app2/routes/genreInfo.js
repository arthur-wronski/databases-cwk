'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');


/* GET users listing. */
router.get('/:genre', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const genre = req.params.genre;
    const sqlQuery = 'SELECT * FROM Viewer WHERE movieId = ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [genre]);

    res.render('genreInfo', { title: 'GenreInfo-'+genre, data: rows[0] });
  } catch (err) {
    console.error('Error from genre/genre:', err);
    res.render('error', { message: 'from genre/genre', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
