'use strict';

var express = require('express');
var router = express.Router();

/* start page to view data */
router.get('/', async function(req, res) {
  // frontend render on index.jade
  res.render('index', { title: 'Databases Coursework' });
});

module.exports = router;
