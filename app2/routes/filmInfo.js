'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');


/* GET users listing. */
router.get('/:userId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const userId = req.params.userId;
    const sqlQuery = 'SELECT * FROM Viewer WHERE userId = ?;';
    const [rows, fields] = await connection.execute(sqlQuery, [userId]);

    // also need to get the viewers of the film and show them on this page. Click to show that viewers info??
    res.render('filmInfo', { title: 'FilmInfo-'+userId, data: rows[0] });
  } catch (err) {
    console.error('Error from filmInfo/userId:', err);
    res.render('error', { message: 'from filmInfo/userId', error: err});
  } finally {
    if (connection) connection.release();
  }
})

module.exports = router;
