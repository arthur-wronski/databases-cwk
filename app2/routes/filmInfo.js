'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');


/* GET users listing. */
router.get('/:tagId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const tagId = req.params.tagId;
    const sqlQuery = 'SELECT * FROM tags WHERE tagId = ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [tagId]);

    // also need to get the viewers of the film and show them on this page. Click to show that viewers info??
    res.render('filmInfo', { title: 'FilmInfo-'+tagId, data: rows[0] });
  } catch (err) {
    console.error('Error from filmInfo/tagId:', err);
    res.render('error', { message: 'from filmInfo/tagId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
