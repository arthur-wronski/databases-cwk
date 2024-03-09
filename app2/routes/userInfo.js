'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let userId = InputSanitizer.sanitizeString(req.params.userId);

    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    let getRatings = `
      SELECT Viewer.movieId, Movies.title, Viewer.rating, Viewer.watchDate 
      FROM Viewer INNER JOIN Movies ON Viewer.movieId=Movies.movieId
      WHERE Viewer.userId = ? AND Movies.title LIKE ? 
      LIMIT ?, 10;
    `;
    let [ratings,fieldsR] = await connection.execute(getRatings, [`${userId}`, `%${searchQuery}%`, `${itemNum}`]);
    if (ratings.length < 10) itemNum -= 10;

    ratings.forEach(rating => {
      if (rating.watchDate) {
        const date = new Date(rating.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB');
        rating.watchDate = formattedDate;
      }
    });

    // get list of genres
    const getGenres = 'SELECT * FROM Genres ORDER BY genreId;';
    const [genres, fieldsG] = await connection.execute(getGenres);
    // get the graph data of the genres to compare
    const genreNames = [];
    const genreRatings = [];
    const genreAverages = [];
    const getRatings_Genre = `SELECT Viewer.rating, MovieGenres.genreId FROM Viewer NATURAL JOIN MovieGenres WHERE Viewer.userId=?;`;
    const [ratings_genre, fieldsRG] = await connection.execute(getRatings_Genre, [`${userId}`]);
    // get ratings of all films in these genres
    for (var i=0; i<genres.length; i++){
      // initialise to count frequency of ratings
      genreNames.push(genres[i].name);
      genreRatings.push([0,0,0,0,0,0,0,0,0,0,'X']);
      genreAverages.push(0);
    }
    for (var i=0; i<ratings_genre.length; i++){
      // add each rating to associated genre counter
      genreRatings[parseInt(ratings_genre[i].genreId)-1][parseInt(ratings_genre[i].rating * 2.0)-1] += 1;
      genreAverages[parseInt(ratings_genre[i].genreId)-1] += parseInt(ratings_genre[i].rating * 2.0);
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
    res.render('userInfo', { id: userId, ratings: ratings, searchQuery: searchQuery, itemNum: itemNum });
    //res.render('genres', { title: 'Genres', genres: genres, genreNames: genreNames, genreRatings: genreRatings, genreAverages: genreAverages });
  } catch (err) {
    console.error('Error from userInfo/', err);
    res.render('error', { message: 'Error in userInfo', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
