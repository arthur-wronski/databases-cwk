'use strict'
var express = require('express');
var router = express.Router();

/* GET all of table */
router.get('/', async function(req, res) {
  res.render('index', { title: 'Databases Coursework' });
});

module.exports = router;