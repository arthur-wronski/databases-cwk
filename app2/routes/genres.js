'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');


/* Display all genres */
router.get('/', async function(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const getReviews = `
      SELECT MovieGenres.genreId, Genres.name,
        AVG(Viewer.rating) AS average_rating,
        COUNT(CASE WHEN Viewer.rating=0.5 THEN 1 END) AS count05,
        COUNT(CASE WHEN Viewer.rating=1.0 THEN 1 END) AS count10,
        COUNT(CASE WHEN Viewer.rating=1.5 THEN 1 END) AS count15,
        COUNT(CASE WHEN Viewer.rating=2.0 THEN 1 END) AS count20,
        COUNT(CASE WHEN Viewer.rating=2.5 THEN 1 END) AS count25,
        COUNT(CASE WHEN Viewer.rating=3.0 THEN 1 END) AS count30,
        COUNT(CASE WHEN Viewer.rating=3.5 THEN 1 END) AS count35,
        COUNT(CASE WHEN Viewer.rating=4.0 THEN 1 END) AS count40,
        COUNT(CASE WHEN Viewer.rating=4.5 THEN 1 END) AS count45,
        COUNT(CASE WHEN Viewer.rating=5.0 THEN 1 END) AS count50
      FROM Viewer NATURAL JOIN MovieGenres INNER JOIN Genres ON MovieGenres.genreId=Genres.genreId
      GROUP BY MovieGenres.genreId
      ORDER BY average_rating DESC;
    `;
    const [genres, fields] = await connection.execute(getReviews);
    const genreNames = genres.map(genre => genre.name);
    const genreRatings = genres.map(genre => [genre.count05, genre.count10, genre.count15, genre.count20, genre.count25, genre.count30, genre.count35, genre.count40, genre.count45, genre.count50, 'X']);
    
    res.render('genres', { title: 'Genres', genres: genres, genreNames: genreNames, genreRatings: genreRatings })
  } catch (err) {
    console.error('Error from genres/', err);
    res.render('error', { message: 'from genres/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;