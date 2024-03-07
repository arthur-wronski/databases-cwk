'use strict';
var express = require('express');
var router = express.Router();
var pool = require('./db'); // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

// Define arrays for genres and corresponding ratings
const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];
const ratings = [4, 3, 1, 2, 5, 4, 3, 5, 4, 4, 4, 3, 5, 1, 1]; // Example ratings for each genre

router.get('/:genreId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the query parameter
    let genreId = InputSanitizer.sanitizeString(req.params.genreId || '%');
    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    // get Genre name
    const getGenre = `SELECT name FROM Genres WHERE genreId = ? LIMIT 1;`;
    const [rowsGenre, fieldsG] = await connection.execute(getGenre, [`${genreId}`]);
    const genre = rowsGenre[0].name; // only one as primary

    const getMovieFields = `SELECT * FROM Movies LIMIT 1;`;
    const [rows, fieldsM] = await connection.execute(getMovieFields);

    let getMovies = `SELECT Movies.* FROM Movies NATURAL JOIN MovieGenres WHERE Movies.title LIKE ? AND MovieGenres.genreId = ? LIMIT ?,30;`;
    let [movies, fields] = await connection.execute(getMovies, [`%${searchQuery}%`, `${genreId}`, `${itemNum}`]);
    if (movies.length < 30) itemNum -= 30;

    // set the used columns as selected by the user
    const shownColQuery = req.query.shownCols;
    const colQuery = req.query.col;
    let shownCols;
    const allCols = fields.map(field => field.name);
    if (shownColQuery==null) shownCols = allCols;
    else shownCols = shownColQuery.split(',');
    if (colQuery!=null) shownCols = add_or_remove(allCols, shownCols, colQuery);

    // render the data
    res.render('films', { title: genre+' genre', data: movies, allCols: allCols, shownCols: shownCols, searchQuery: searchQuery, itemNum: itemNum});
  } catch (err) {
    console.error('Error from genreInfo/', err);
    res.render('error', { message: 'from genreInfo/', error: err});
  } finally {
    if (connection) connection.release();
  }
})

function add_or_remove(allEls, shownEls, element){
  const index = shownEls.indexOf(element);
  if (allEls.indexOf(element)==-1) return shownEls;
  if (index == -1){
    // re-add the element in its original position
    let newShown = [];
    for (var i=0; i<allEls.length; i++){
      if (shownEls.includes(allEls[i]) || allEls[i]==element){
        newShown.push(allEls[i]);
      }
    }
    return newShown;
  } else {
    // remove the element
    shownEls.splice(index, 1);
    return shownEls;
  }
}

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
