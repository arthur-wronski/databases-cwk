'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js


/* show more info about the chosen genre */
router.get('/:genreId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const genreId = req.params.genreId;
    const sqlQuery = 'SELECT * FROM Genres WHERE genreId = ?;';             // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [genreId]);   // pooled connection to db
    const genre = rows[0];

    res.render('genreInfo', { title: 'GenreInfo: '+genre, genreData: genre });  // send data to response frontend
  } catch (err) {
    console.error('Error from genre/genreId:', err);
    res.render('error', { message: 'from genre/genreId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
