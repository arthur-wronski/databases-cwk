'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

/* show whole films table */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // get all movies
    const getMovies = 'SELECT movieId, title, ratingAv FROM Movies;';
    const [rows, fields] = await connection.execute(getMovies);

    // send output to response frontend
    res.render('films', { title: 'Films', data: rows });
  } catch (err) {
    console.error('Error from films/:', err);
    res.render('error', { message: 'from films/', error: err});
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
    let query = InputSanitizer.sanitizeString(req.query.searchQuery || '%');

    // if search resembles a tag, movie results will be ordered by it
    let related_tag = -1;
    const search_tag = 'SELECT tagId FROM Tags WHERE tag LIKE ?;';
    const [tags, fieldT] = await connection.execute(search_tag, [query]);
    if (tags.length != 0){
      related_tag = tags[0].tagId;
    }

    // find films resembling (in title or genre) the query and order by relation to chosen tag (if there is one)
    if (related_tag != -1){
      search_Movie_Genre = 'SELECT movieId, title, ratingAv FROM Movies WHERE title LIKE ? OR genre LIKE ? ORDER BY tags[?];';
      const [movies, fieldM] = await connection.execute(search_Movie_Genre, [query, query, related_tag]);
      res.render('films', { title: 'Films', data: movies });
    } else {
      search_Movie_Genre = 'SELECT movieId, title, ratingAv FROM Movies WHERE title LIKE ? OR genre LIKE ? ORDER BY tags[?];';
      const [movies, fieldM] = await connection.execute(search_Movie_Genre, [query, query, related_tag]);
      res.render('films', { title: 'Films', data: movies });
    }
  } catch (err) {
    console.error('Error from films/search:', err);
    res.render('error', { message: 'from films/search', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
