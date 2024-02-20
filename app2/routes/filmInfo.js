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

    // select the chosen movie using its primary key
    const getMovie = 'SELECT * FROM Movies WHERE movieId = ?;';
    const [rowsMovie, fieldsM] = await connection.execute(getMovie, [movieId]);
    const movie = rowsMovie[0]; // only one as primary

    // select the genres of this movie
    const getGenres = 'SELECT genreId, genre, ratingAv FROM Genres WHERE genreId IN ? ORDER BY rating;';
    const [genres, fieldsG] = await connection.execute(getGenres, [movie.genres]);

    // select all the users who viewed this movie
    const getViewers = 'SELECT userId, rating, rateTimestamp FROM Users WHERE movieRated = ?;';
    const [viewers, fieldsV] = await connection.execute(getViewers, [movieId]);

    // send output to response frontend
    res.render('filmInfo', { title: 'FilmInfo: '+movie.title, movieData: movie, movieGenres: genres, movieViewers: viewers });
  } catch (err) {
    console.error('Error from filmInfo/movieId:', err);
    res.render('error', { message: 'from filmInfo/movieId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;