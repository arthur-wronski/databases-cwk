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
    const getMovie = `SELECT * FROM Movies WHERE movieId = ? LIMIT 1;`;
    const [rowsMovie, fieldsM] = await connection.execute(getMovie, [`${movieId}`]);
    const movie = rowsMovie[0]; // only one as primary

    // select the genres of this movie
    const getGenres = `SELECT Genres.genreId, Genres.name FROM Genres INNER JOIN MovieGenres ON (MovieGenres.genreId=Genres.genreId) WHERE MovieGenres.movieId=?;`;
    const [genres, fieldsG] = await connection.execute(getGenres, [`${movieId}`]);
    
    // select all the users who viewed this movie
    const getViewers = `SELECT userId, rating, watchDate FROM Viewer WHERE movieId=?;`;
    const [viewers, fieldsV] = await connection.execute(getViewers, [`${movieId}`]);
    // can add pages of the viewers same as pages on /films

    viewers.forEach(viewer => {
      if (viewer.watchDate) {
        // Converting date to dd/mm/yyyy format
        const date = new Date(viewer.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB'); // 'en-GB' uses dd/mm/yyyy format
        viewer.watchDate = formattedDate;
      }
    });

    // send output to response frontend
    res.render('filmInfo', { movie: movie, genres: genres, viewers: viewers });
  } catch (err) {
    console.error('Error from filmInfo/movieId:', err);
    res.render('error', { message: 'from filmInfo/movieId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;