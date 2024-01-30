'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');

/* GET all of table */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    const sqlQuery = 'SELECT * FROM tags;';
    const [rows, fields] = await connection.execute(sqlQuery);
    res.render('films', { title: 'Films', data: rows });
  } catch (err) {
    console.error('Error from films/:', err);
    res.render('error', { message: 'from films/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

/* GET queried table */
router.get('/search', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let query;
    if (req.query.query) query = req.query.query;
    else query = '%';

    const sqlQuery = 'SELECT * FROM tags WHERE tag LIKE ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [`%${query}%`]);
    res.render('films', { title: 'Films', data: rows });
  } catch (err) {
    console.error('Error from films/search:', err);
    res.render('error', { message: 'from films/search', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;