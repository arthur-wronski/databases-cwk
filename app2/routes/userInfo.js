'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    // Sanitize the query parameter
    let userId = InputSanitizer.sanitizeString(req.params.userId || '%');
    
    // only take subset to improve processing
    let getRatings = `SELECT Viewer.movieId, Movies.title, Viewer.rating, Viewer.watchDate FROM Viewer INNER JOIN Movies ON (Viewer.movieId=Movies.movieId) WHERE userId=?;`;
    let [ratings, fields] = await connection.execute(getRatings, [`${userId}`]);

    ratings.forEach(rating => {
      if (rating.watchDate) {
        // Converting date to dd/mm/yyyy format
        const date = new Date(rating.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB'); // 'en-GB' uses dd/mm/yyyy format
        rating.watchDate = formattedDate;
      }
    });

    // render the data
    res.render('userInfo', { title: 'User '+userId, ratings: ratings });
  } catch (err) {
    console.error('Error from userInfo/', err);
    res.render('error', { message: 'from userInfo/', error: err});
  } finally {
    if (connection) connection.release();
  }
})


module.exports = router;
