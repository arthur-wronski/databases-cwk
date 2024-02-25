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
    // handle any search queries if entered
    let query = InputSanitizer.sanitizeString(req.query.query || '%');
    const sqlQuery = `SELECT * FROM Viewer WHERE movieId LIKE ?;`;
    const [rows, fields] = await connection.execute(sqlQuery, [`%${query}%`]);

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
});

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
