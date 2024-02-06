'use strict'
var express = require('express');
var router = express.Router();

/* start page to view data */
router.get('/', async function(req, res) {
  // frontend render on index.jade
  res.render('index', { title: 'Databases Coursework' });

  // add option to predict a film's rating based on tags and tag-related films ratings
});

module.exports = router;