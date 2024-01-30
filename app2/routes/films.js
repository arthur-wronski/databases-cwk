'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js

/* show whole films table */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    const sqlQuery = 'SELECT * FROM Viewer;';                   // select all
    const [rows, fields] = await connection.execute(sqlQuery);  // pooled connection to db
    res.render('films', { title: 'Films', data: rows });        // send output to response frontend
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

    let query;
    if (req.query.query) query = req.query.query;
    else query = '%';

    const sqlQuery = 'SELECT * FROM Viewer WHERE movieId LIKE ?;';              // select subset
    const [rows, fields] = await connection.execute(sqlQuery, [`%${query}%`]);  // pooled connection to db
    res.render('films', { title: 'Films', data: rows });                        // send output to response frontend
  } catch (err) {
    console.error('Error from films/search:', err);
    res.render('error', { message: 'from films/search', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;