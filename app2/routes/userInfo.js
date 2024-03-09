'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');

router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let userId = InputSanitizer.sanitizeString(req.params.userId);

    // Add this to the top of your router.get('/:userId', ...) to handle itemNum for pagination
    let itemNum = parseInt(req.query.itemNum || '0', 10);
    if (itemNum < 0) itemNum = 0;

    // Update your SQL query to include LIMIT and OFFSET
    let getRatings = `
      SELECT Viewer.movieId, Movies.title, Viewer.rating, Viewer.watchDate 
      FROM Viewer 
      INNER JOIN Movies ON Viewer.movieId=Movies.movieId 
      WHERE Viewer.userId = ? AND Movies.title LIKE ? 
      LIMIT ?, 30;
    `;

    // Adjust the connection.execute call to include itemNum for the OFFSET
    let [ratings] = await connection.execute(getRatings, [`%${userId}%`, `%${searchQuery}%`, `%${itemNum}%`]);

    ratings.forEach(rating => {
      if (rating.watchDate) {
        const date = new Date(rating.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB');
        rating.watchDate = formattedDate;
      }
    });

    res.render('userInfo', { title: 'User ' + userId, userId: userId, ratings: ratings, searchQuery: searchQuery, itemNum: itemNum });
  } catch (err) {
    console.error('Error from userInfo/', err);
    res.render('error', { message: 'Error in userInfo', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
