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
    let genreId = parseInt(InputSanitizer.sanitizeString(req.query.genreId || '0'));
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;
    
    let movies; let fields;
    if (genreId == 0){
      let getMovies = `
        SELECT DISTINCT Movies.title, Crew.*, AVG(Viewer.rating) AS rating
        FROM Movies 
          INNER JOIN Crew ON Movies.movieId=Crew.movieId 
          INNER JOIN Tags ON Movies.movieId=Tags.movieId
          INNER JOIN Viewer ON Movies.movieId=Viewer.movieId
        WHERE Movies.title LIKE ? OR Crew.Director LIKE ? OR Crew.TopTwoActors LIKE ? OR Tags.tag LIKE ?
        GROUP BY Viewer.movieId
        ORDER BY rating DESC
        LIMIT ?,30;
      `;
      [movies, fields] = await connection.execute(getMovies, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `${itemNum}`]);
      if (movies.length == 0) {
        itemNum -= 30;
        [movies, fields] = await connection.execute(getMovies, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `${itemNum}`]);
      }
    } else {
      let getMovies = `
        SELECT DISTINCT MoviesInGenre.title, Crew.*, AVG(Viewer.rating) AS rating
        FROM 
          (SELECT Movies.* FROM Movies INNER JOIN MovieGenres ON Movies.movieId=MovieGenres.movieId WHERE MovieGenres.genreId = ?) AS MoviesInGenre
          INNER JOIN Crew ON MoviesInGenre.movieId=Crew.movieId 
          INNER JOIN Tags ON MoviesInGenre.movieId=Tags.movieId
          INNER JOIN Viewer ON MoviesInGenre.movieId=Viewer.movieId
        WHERE MoviesInGenre.title LIKE ? OR Crew.Director LIKE ? OR Crew.TopTwoActors LIKE ? OR Tags.tag LIKE ?
        GROUP BY Viewer.movieId
        ORDER BY rating DESC
        LIMIT ?,30;
      `;
      [movies, fields] = await connection.execute(getMovies, [`${genreId}`,`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `${itemNum}`]);
      if (movies.length == 0) {
        itemNum -= 30;
        [movies, fields] = await connection.execute(getMovies, [`${genreId}`,`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `${itemNum}`]);
      }
    }
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

    const getGenre = `
      SELECT * 
      FROM Genres
      ORDER BY genreId;
    `;
    const [genres, fieldsG] = await connection.execute(getGenre);

    // render the data
    res.render('films', { title: 'Films', 
      data: movies, genres: genres, genreShown: genreId,
      allCols: allCols, shownCols: shownCols, 
      searchQuery: searchQuery, itemNum: itemNum, route: '/films' });
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