'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js


/* show more info about the chosen film */
router.get('/:movieId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const movieId = req.params.movieId;
    const getMovie = 'SELECT * FROM Movies WHERE movieId = ?;';                     // select one row using primary key
    const [rowsMovie, fieldsM] = await connection.execute(getMovie, [movieId]);     // get info of the movie
    const movie = rowsMovie[0];
    const getViewers = 'SELECT * FROM Users WHERE ANY (movie-rated) = ?;';          // select from array
    const [users, fieldsV] = await connection.execute(getViewers, [movieId]);       // get all users who have watched movie
    const getGenres = 'SELECT * FROM Genres WHERE genreId IN ?;';
    const [genres, fieldsG] = await connection.execute(getGenres, [movie.genres]);  // get all genres of the movie
    // sort genres by average rating

    res.render('filmInfo', { title: 'FilmInfo: '+movie.title, movieData: movie, viewers: users, genreData: genre });
  } catch (err) {
    console.error('Error from filmInfo/movieId:', err);
    res.render('error', { message: 'from filmInfo/movieId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
