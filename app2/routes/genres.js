'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js

/* list genres of a chosen film */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const film = req.params.film;
    // get list of genres from film
    const getGenres = 'SELECT * FROM Genre;';
    const [genres, fields] = await connection.execute(getGenres);     // get all the genres
    // sort by average rating
    res.render('genres', { title: 'Genres', data: genres });   // send data to response frontend
  } catch (err) {
    console.error('Error from genres/', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;