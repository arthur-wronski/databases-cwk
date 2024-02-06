'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js


/* show more info about the chosen genre */
router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const userId = req.params.userId;
    const sqlQuery = 'SELECT * FROM Users WHERE userId = ?;';             // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [userId]);   // pooled connection to db
    const user = rows[0];

    // reformat data to fit requirements
    res.render('userInfo', { title: 'UserInfo: '+user, userData: user });  // send data to response frontend
  } catch (err) {
    console.error('Error from genre/genreId:', err);
    res.render('error', { message: 'from genre/genreId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
