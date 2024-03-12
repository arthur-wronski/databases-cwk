'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');
var InputSanitizer = require('./inputsanitizer'); // import sanitizer


/* Display all genres */
router.get('/', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();

    // get list of genres
    const getGenres = `
      SELECT * 
      FROM Genres 
      ORDER BY genreId;`;
    const [genres, fieldsG] = await connection.execute(getGenres);

    // get the graph data of the genres to compare
    const genreNames = [];
    const genreRatings = [];
    const genreAverages = [];
    const getReviews = `
      SELECT Viewer.rating, MovieGenres.genreId 
      FROM Viewer NATURAL JOIN MovieGenres;
    `;
    const [ratings, fieldsR] = await connection.execute(getReviews);
    // get ratings of all films in these genres
    for (var i=0; i<genres.length; i++){
      // initialise to count frequency of ratings
      genreNames.push(genres[i].name);
      genreRatings.push([0,0,0,0,0,0,0,0,0,0,'X']);
      genreAverages.push(0);
    }
    for (var i=0; i<ratings.length; i++){
      // add each rating to associated genre counter
      genreRatings[parseInt(ratings[i].genreId)-1][parseInt(ratings[i].rating * 2.0)-1] += 1;
      genreAverages[parseInt(ratings[i].genreId)-1] += parseInt(ratings[i].rating * 2.0);
    }
    // fit the average rating of each genre
    for (var i=0; i<genreAverages.length; i++){
      let total_ratings = 0;
      for (var j=0; j<10; j++){
        total_ratings += genreRatings[i][j];
      }
      genreAverages[i] = (genreAverages[i] / (total_ratings*2)).toPrecision(3);
    }  
    
    // Render the genre data for comparisons
    res.render('genres', { title: 'Genres', genres: genres, genreNames: genreNames, genreRatings: genreRatings, genreAverages: genreAverages });
  } catch (err) {
    console.error('Error from genres/', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;