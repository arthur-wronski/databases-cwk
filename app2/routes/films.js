'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the query parameter
    let query = InputSanitizer.sanitizeString(req.query.searchQuery || '%');

    // if search resembles a tag, movie results will be ordered by it
    let related_tag = -1;
    const search_tag = 'SELECT tagId FROM Tags WHERE tag LIKE ?;';
    const [tags, fieldT] = await connection.execute(search_tag, [`%${query}%`]);
    if (tags.length != 0){
      related_tag = tags[0].tagId;
    }

    // find films resembling (in title or genre) the query and order by relation to chosen tag (if there is one)
    let search_Movie_Genre; let movies; let fields;
    if (related_tag != -1){
      search_Movie_Genre = `SELECT * FROM Movies WHERE title LIKE ${query} OR genre LIKE ${query};`;
      [movies, fields] = await connection.execute(search_Movie_Genre);
    } else {
      search_Movie_Genre = `SELECT * FROM Movies WHERE title LIKE ${query} OR genre LIKE ${query} ORDER BY tags[?];`;
      [movies, fields] = await connection.execute(search_Movie_Genre, [`%${related_tag}%`]);
    }

    // set the used columns
    const shownColQuery = req.query.shownCols;
    const colQuery = req.query.col;
    let shownCols;
    const allCols = fields.map(field => field.name);
    if (shownColQuery==null) shownCols = allCols;
    else shownCols = shownColQuery.split(',');
    if (colQuery!=null) shownCols = add_or_remove(allCols, shownCols, colQuery);

    // render the data
    res.render('films', { title: 'Films', data: rows, allCols: allCols, shownCols: shownCols});
  } catch (err) {
    console.error('Error from films/:', err);
    res.render('error', { message: 'from films/', error: err});
  } finally {
    if (connection) connection.release();
  }
})

function add_or_remove(allEls, shownEls, element){
  const index = shownEls.indexOf(element);
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
