'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let userId = parseInt(InputSanitizer.sanitizeString(req.params.userId || '1'));

    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    // get individual movie ratings
    let getRatings_Movie = `
      SELECT ThisViewer.movieId, SearchedMovies.title, ThisViewer.rating, ThisViewer.watchDate 
      FROM 
        (SELECT * FROM Viewer WHERE Viewer.userId = ?) AS ThisViewer
      INNER JOIN 
        (SELECT * FROM Movies WHERE Movies.title LIKE ?) AS SearchedMovies
      ON ThisViewer.movieId=SearchedMovies.movieId
      LIMIT ?, 10;
    `;
    let [movies,fieldsM] = await connection.execute(getRatings_Movie, [`${userId}`, `%${searchQuery}%`, `${itemNum}`]);
    if (movies.length == 0) {
      itemNum -= 10;
      [movies,fieldsM] = await connection.execute(getRatings_Movie, [`${userId}`, `%${searchQuery}%`, `${itemNum}`]);
    }
    
    movies.forEach(rating => {
      if (rating.watchDate) {
        const date = new Date(rating.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB');
        rating.watchDate = formattedDate;
      }
    });

    // get the graph data of the genres to compare
    const getRatings_Genre = `
      SELECT MovieGenres.genreId, Genres.name,
        COUNT(CASE WHEN ThisViewer.rating=0.5 THEN 1 END) AS count05,
        COUNT(CASE WHEN ThisViewer.rating=1.0 THEN 1 END) AS count10,
        COUNT(CASE WHEN ThisViewer.rating=1.5 THEN 1 END) AS count15,
        COUNT(CASE WHEN ThisViewer.rating=2.0 THEN 1 END) AS count20,
        COUNT(CASE WHEN ThisViewer.rating=2.5 THEN 1 END) AS count25,
        COUNT(CASE WHEN ThisViewer.rating=3.0 THEN 1 END) AS count30,
        COUNT(CASE WHEN ThisViewer.rating=3.5 THEN 1 END) AS count35,
        COUNT(CASE WHEN ThisViewer.rating=4.0 THEN 1 END) AS count40,
        COUNT(CASE WHEN ThisViewer.rating=4.5 THEN 1 END) AS count45,
        COUNT(CASE WHEN ThisViewer.rating=5.0 THEN 1 END) AS count50
      FROM 
        (SELECT * FROM Viewer WHERE Viewer.userId=?) AS ThisViewer
      NATURAL JOIN MovieGenres INNER JOIN Genres ON MovieGenres.genreId=Genres.genreId
      GROUP BY MovieGenres.genreId;
    `;
    const [genres, fieldsG] = await connection.execute(getRatings_Genre, [`${userId}`]);
    const genreNames = genres.map(genre => genre.name);
    const genreRatings = genres.map(genre => [genre.count05, genre.count10, genre.count15, genre.count20, genre.count25, genre.count30, genre.count35, genre.count40, genre.count45, genre.count50, 'X']);
    
    res.render('userInfo', { 
      id: userId,
      searchQuery: searchQuery, itemNum: itemNum, 
      movies: movies, genreNames: genreNames, genreRatings: genreRatings });
  } catch (err) {
    console.error('Error from userInfo/', err);
    res.render('error', { message: 'Error in userInfo', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;