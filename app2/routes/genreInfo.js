'use strict';
var express = require('express');
var router = express.Router();
var pool = require('./db'); // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

// Define arrays for genres and corresponding ratings
const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const ratings = [4, 3, 1, 2, 5, 4, 3, 5, 4, 4, 4, 3, 5, 1, 1]; // Example ratings for each genre

/* show whole films table */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    const sqlQuery = 'SELECT * FROM Viewer LIMIT 5;'; // select all
    const [rows, fields] = await connection.execute(sqlQuery); // pooled connection to db
    res.render('films', { title: 'Films', data: rows }); // send output to response frontend
  } catch (err) {
    console.error('Error from films/:', err);
    res.render('error', { message: 'from films/', error: err });
  } finally {
    if (connection) connection.release();
  }
});

/* query-search the table for a subset */
router.get('/search', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the query parameter
    let query = InputSanitizer.sanitizeString(req.query.query || '%');

    const sqlQuery = 'SELECT * FROM Viewer WHERE movieId LIKE ?;'; // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [`%${query}%`]); // pooled connection to db
    res.render('genreInfo', { title: 'Films', data: rows }); // send output to response frontend
  } catch (err) {
    console.error('Error from films/search:', err);
    res.render('error', { message: 'from films/search', error: err });
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
