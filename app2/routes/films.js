'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;
    
    // only take subset to improve processing
    let getMovies = `SELECT Movies.title, Crew.* FROM Movies INNER JOIN Crew ON Movies.movieId=Crew.movieId WHERE Movies.title LIKE ? OR Crew.Director LIKE ? OR Crew.TopTwoActors LIKE ? LIMIT ?,30;`;
    let [movies, fields] = await connection.execute(getMovies, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `${itemNum}`]);
    if (movies.length < 30) itemNum -= 30;

    // set the used columns as selected by the user
    const shownColQuery = req.query.shownCols;
    const colQuery = req.query.col;
    let shownCols;
    const allCols = fields.map(field => field.name);
    if (shownColQuery==null) shownCols = allCols;
    else shownCols = shownColQuery.split(',');
    if (colQuery!=null) shownCols = add_or_remove(allCols, shownCols, colQuery);

    movies.forEach(movie => {
      if (movie.releaseDate) {
        const date = new Date(movie.releaseDate);
        const formattedDate = date.toLocaleDateString('en-GB');
        movie.releaseDate = formattedDate;
      }
    });

    // render the data
    res.render('films', { title: 'Films', data: movies, allCols: allCols, shownCols: shownCols, searchQuery: searchQuery, itemNum: itemNum, route: '/films' });
  } catch (err) {
    console.error('Error from films/', err);
    res.render('error', { message: 'from films/', error: err});
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

module.exports = router;