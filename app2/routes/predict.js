'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer'); // import sanitizer

/* using multiple features predict the performance of a film */
router.get('/add_tag/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    let tags = req.query.tags;
    let previews = req.query.previews;
    let tagRate = req.query.tagRate;
    let previewRate = req.query.previewRate;

    // find new tag's id
    const tag_query = InputSanitizer.sanitizeString(req.query.new_tag || '%');
    const search_tag = 'SELECT tagId FROM Tags WHERE tag LIKE ?;';
    const [allTags, fieldT] = await connection.execute(search_tag, [tag_query]);
    let new_tag = allTags[0];

    // decipher predicted rating of new tag
    const getMovies = 'SELECT tags, ratingAv FROM Movies;';
    const [movies, fieldM] = await connection.execute(getMovies);
    let new_tag_rating;
    for (var i=0; i<movies.length; i++){
      // some method of balancing each movie's use by its value at movie.tags[tag.tagId]
      // could use ML for this @Ghalia?
    }    

    // balance use of each tag given
    tagRate *= tags.length;
    tags.push(new_tag.tag);
    tagRate = (tagRate + tag_rating) / tags.length

    // send output to response frontend
    res.render('predict', { title: 'Predict Film Performance', tags: tags, previews: previews, tagRate: tagRate, previewRate: previewRate });
  } catch (err) {
    console.error('Error from predict/p:', err);
    res.render('error', { message: 'from predict/p', error: err});
  } finally {
    if (connection) connection.release();
  }
})

router.get('/add_review/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    let tags = req.query.tags;
    let previews = req.query.previews;
    let tagRate = req.query.tagRate;
    let previewRate = req.query.previewRate;

    let new_review = InputSanitizer.sanitizeString(req.query.next_review || '%');
    previewRate *= previews.length;
    previews.push(new_review);
    previewRate = (previewRate + new_review) / previous.length;

    // send output to response frontend
    res.render('predict', { title: 'Predict Film Performance', tags: tags, previews: previous, tagRate: tagRate, previewRate: previewRate });
  } catch (err) {
    console.error('Error from predict/p:', err);
    res.render('error', { message: 'from predict/p', error: err});
  } finally {
    if (connection) connection.release();
  }
})

/* initial page before any tags or previews entered */
router.get('/', async function(req, res) {
    let connection;
  
    try {
      connection = await pool.getConnection();
      res.render('predict', { title: 'Predict Film Performance', tags: [], ratingTag: 0, ratingView: 0 });
    } catch (err) {
      console.error('Error from predict:', err);
      res.render('error', { message: 'from predict', error: err});
    } finally {
      if (connection) connection.release();
    }
  })

module.exports = router;
