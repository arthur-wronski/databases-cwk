'use strict';
var express = require('express');
var router = express.Router();
var pool = require('./db');
var InputSanitizer = require('./inputsanitizer');

function add_or_remove(selectedTags, tag) {
  const index = selectedTags.indexOf(tag);

  if (index === -1) {
    selectedTags.push(tag);
  } else {
    selectedTags.splice(index, 1);
  }

  return selectedTags;
}


router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    let getTags = `SELECT * FROM Tags WHERE tag LIKE ? LIMIT ?,30;`;
    let [tags, fieldsT] = await connection.execute(getTags, [`%${searchQuery}%`, `${itemNum}`]);

    let selectedTagsQuery = req.query.selectedTags || '';
    let selectedTags = [...new Set(selectedTagsQuery ? selectedTagsQuery.split(',') : [])];

    let averageRating; 
    if (req.query.tag) {
      selectedTags = add_or_remove(selectedTags, req.query.tag);

      let avgRatingQuery = `
        SELECT AVG(v.rating) as averageRating
        FROM Viewer v
        JOIN Tags t ON v.userId = t.userId AND v.movieId = t.movieId
        WHERE t.tag = ?;
      `;
      let [avgRatingResult, fieldsV] = await connection.execute(avgRatingQuery, [req.query.tag]);
      averageRating = avgRatingResult[0]?.averageRating; 

    res.render('predict', { 
        title: 'Predictions', 
        tags: tags, 
        selectedTags: selectedTags,
        searchQuery: searchQuery,
        itemNum: itemNum,
        averageRating: averageRating ? averageRating.toFixed(1) : 'No ratings' 
    });
    } 
  } catch (err) {
    console.error('Error from predictions/', err);
    res.render('error', { message: 'Error loading predictions', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
