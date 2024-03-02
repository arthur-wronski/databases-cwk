'use strict';
var express = require('express');
var router = express.Router();
var pool = require('./db'); // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

// Define arrays for genres and corresponding ratings
const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const ratings = [4, 3, 1, 2, 5, 4, 3, 5, 4, 4, 4, 3, 5, 1, 1]; // Example ratings for each genre

/* show whole films table */
router.get('/:genreId', async function(req, res) {
  try {
    connection = await pool.getConnection();
    const movieId = req.params.movieId;

    // select the chosen movie using its primary key
    const getGenre = 'SELECT * FROM Genres WHERE genreId = ?;';
    const [rowsGenre, fieldsG] = await connection.execute(getGenre, [genreId]);
    const genre = rowsGenre[0]; // only one as primary

    // join Users to Movies via MovieId to get genre list as one column
    const getRatings = 'SELECT * FROM Users;';//rating FROM (JOIN Users Movies) WHERE ? IN genres;';
    const [ratings, fieldsR] = await connection.execute(getRatings, [genre]);

    // send output to response frontend - this wants to be presented as scatter-plot
    res.render('genreInfo', { title: 'GenreInfo: '+genre.genre, genreData: genre, ratings: ratings });
  } catch (err) {
    console.error('Error from filmInfo/movieId:', err);
    res.render('error', { message: 'from filmInfo/movieId', error: err});
  } finally {
    if (connection) connection.release();
  }
});


router.get('/movieId-distribution', async function(req, res) {
  try {
    // Calculate average rating for each genre
    const genreAverageRating = {};
    genres.forEach((genre, index) => {
        if (!genreAverageRating[genre]) {
            genreAverageRating[genre] = { total: 0, count: 0 };
        }
        genreAverageRating[genre].total += ratings[index];
        genreAverageRating[genre].count += 1;
    });

    Object.keys(genreAverageRating).forEach((genre) => {
        genreAverageRating[genre] = genreAverageRating[genre].total / genreAverageRating[genre].count;
    });

    // Calculate standard deviation for each genre
    const genreStandardDeviation = {};
    genres.forEach((genre, index) => {
        if (!genreStandardDeviation[genre]) {
            genreStandardDeviation[genre] = [];
        }
        genreStandardDeviation[genre].push(ratings[index]);
    });

    Object.keys(genreStandardDeviation).forEach((genre) => {
        const ratings = genreStandardDeviation[genre];
        const average = genreAverageRating[genre];
        const variance = ratings.reduce((total, rating) => total + Math.pow(rating - average, 2), 0) / ratings.length;
        genreStandardDeviation[genre] = Math.sqrt(variance);
    });

    // Sort genres by standard deviation in descending order
    const sortedGenres = Object.keys(genreStandardDeviation).sort((a, b) => genreStandardDeviation[b] - genreStandardDeviation[a]);

    // Output the most polarizing genres
    console.log("Most Polarizing Genres:");
    const mostPolarizingGenres = sortedGenres.slice(0, 5).map(genre => ({
      name: genre,
      standardDeviation: genreStandardDeviation[genre]
    }));

    console.log(mostPolarizingGenres);

    res.render('genreInfo', { 
      title: 'MovieId Distribution', 
      mostPolarizingGenres: mostPolarizingGenres
    });
  } catch (err) {
    console.error('Error:', err);
    res.render('error', { message: 'Error fetching movieId distribution', error: err });
  }
});




module.exports = router;
