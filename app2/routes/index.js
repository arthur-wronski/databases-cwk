'use strict';

var express = require('express');
var router = express.Router();

// Import predict route
var predictRouter = require('./predict');

/* start page to view data */
router.get('/', async function(req, res) {
  // frontend render on index.jade
  res.render('index', { title: 'Databases Coursework' });
});

// Use the predict route
router.use('/predict', predictRouter);

module.exports = router;
