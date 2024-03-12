'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer


/* show more info about the chosen film */
router.get('/:movieId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    const movieId = InputSanitizer.sanitizeString(req.params.movieId || '%');

    // select the chosen movie using its primary key
    const getMovie = `
      SELECT * 
      FROM Movies INNER JOIN Crew ON Movies.movieId=Crew.movieId 
      WHERE Movies.movieId = ? 
      LIMIT 1;
    `;
    const [rowsMovie, fieldsM] = await connection.execute(getMovie, [`${movieId}`]);
    const movie = rowsMovie[0]; // only one as primary

    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      const formattedDate = date.toLocaleDateString('en-GB');
      movie.releaseDate = formattedDate;
    }

    // select the genres of this movie
    const getGenres = `
      SELECT Genres.genreId, Genres.name 
      FROM Genres INNER JOIN MovieGenres ON MovieGenres.genreId=Genres.genreId
      WHERE MovieGenres.movieId=?;
    `;
    const [genres, fieldsG] = await connection.execute(getGenres, [`${movieId}`]);
    
    // select all the users who viewed this movie
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;
    const getViewers = `
      SELECT userId, rating, watchDate 
      FROM Viewer WHERE movieId=? 
      LIMIT ?,30;
    `;
    const [viewers, fieldsV] = await connection.execute(getViewers, [`${movieId}`, `${itemNum}`]);
    if (viewers.length < 30) itemNum -= 30;

    let ratingFrequencies = [0,0,0,0,0,0,0,0,0,0];
    let rating = 0;
    for (var i=0; i<viewers.length; i++){
      rating += viewers[i].rating / viewers.length;
      ratingFrequencies[parseInt(viewers[i].rating * 2.0)-1] += 1;
    }
    rating = rating.toPrecision(3);

    viewers.forEach(viewer => {
      if (viewer.watchDate) {
        // Converting date to dd/mm/yyyy format
        const date = new Date(viewer.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB'); // 'en-GB' uses dd/mm/yyyy format
        viewer.watchDate = formattedDate;
      }
    });

    // send output to response frontend
    res.render('filmInfo', { movie: movie, genres: genres, viewers: viewers, rating: rating, ratingFrequencies: ratingFrequencies, itemNum: itemNum });
  } catch (err) {
    console.error('Error from filmInfo/', err);
    res.render('error', { message: 'from filmInfo/', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;