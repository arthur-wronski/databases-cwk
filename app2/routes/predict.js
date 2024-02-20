'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js


/* using multiple features predict the performance of a film */
router.get('/p/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    let tags = req.query.tags;
    let previewRatings = req.query.ratings;

    // average movie ratings by relevance to chosen tags
    let tagRate = 0;
    for (var i=0; i<tags.length; i++){
        const getMovies = 'SELECT tags, ratingAv FROM Movies;';
        const [movies, fields] = await connection.execute(getMovies);
        for (var j=0; j<movies.length; j++){
            tagRate += movies[j].tags[i] * movies[j].ratingAv;
        }
    }

    // average rating deduced by previews
    let previewRate = 0;
    for (var i=0; i<previewRatings.length; i++){
        previewRate += previewRatings[i] / previewRatings.length;
    }

    // send output to response frontend
    res.render('predict', { title: 'Predict Film Performance', tags: tags, ratings: previewRatings, ratingTag: tagRate, ratingView: previewRate });
  } catch (err) {
    console.error('Error from filmInfo/movieId:', err);
    res.render('error', { message: 'from filmInfo/movieId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

/* initial page before any tags or previews entered */
router.get('/', async function(req, res) {
    let connection;
  
    try {
      connection = await pool.getConnection();
      res.render('predict', { title: 'Predict Film Performance', tags: [], ratingTag: 0, ratingView: 0 });
    } catch (err) {
      console.error('Error from filmInfo/movieId:', err);
      res.render('error', { message: 'from filmInfo/movieId', error: err});
    } finally {
      if (connection) connection.release();
    }
  })

module.exports = router;
