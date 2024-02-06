'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js

/* predict likely viewer ratings by tag */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    // collect array of tags
    let tagList = req.query.tags;
    let rating;
    // find average rating of tag by each film's relevance
    // average between all added tags
    // output result
    res.render('predict', { title: 'Predict Reviews', tags: tagList, prediction: rating });
  } catch (err) {
    console.error('Error from films/:', err);
    res.render('error', { message: 'from films/', error: err});
  } finally {
    if (connection) connection.release();
  }
});