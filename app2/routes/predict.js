
'use strict';
var express = require('express');
var router = express.Router();
var pool = require('./db');
var InputSanitizer = require('./inputsanitizer');

router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    let searchQuery = InputSanitizer.sanitizeString(req.query.searchQuery || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    let getTags = `SELECT * FROM Tags WHERE tagId LIKE ? LIMIT ?,30;`;
    let [tags, fieldsT] = await connection.execute(getTags, [`%${searchQuery}%`, `${itemNum}`]);

    const query = `
      SELECT Viewer.rating, Tags.tagId
      FROM Tags NATURAL JOIN Viewer;
    `;
    
    const [ratings, fieldV] = await connection.execute(query);

    // we cant be cool
    // we need to get all the ratings and for each tag get their average and sd
    // do the thing below this comment in a for loop for each of the tags in the tag list xoxo gossip girl 
    // for loop to go thourh each tag either with a dictoinary or a 2d array - EACH TAG HAS A CORRESPONDING EXP AND SD 
    // ALSO COMBINED ONES - PUT TOGETHER THE ONES YOUVE SPECIFCAKH GOTON
    // ARRAY OF TAGS

    // dictionary
    let tagAverages = {
      [tagId]: { exp: averageRating, sdev: standardDeviation }
    }

    for (let i = 0; i < tags.length; i++) {
        let tagId = tags[i].tagId;

        let sum = 0, sumSq = 0, n = ratings.length;
        ratings.forEach(rating => {
            let value = parseFloat(rating.rating);
            sum += value;
            sumSq += value * value;
        });
        
        let mean = n > 0 ? sum / n : 0;
        let variance = n > 0 ? (sumSq / n - mean * mean) : 0;
        let sd = Math.sqrt(variance);

        tagAverages[tagId] = { mean, sd };
    }

    res.render('predict', { 
        title: 'Predictions', 
        tags: tags, 
        searchQuery: searchQuery,
        itemNum: itemNum,
        tagAverages: tagAverages 
    });
  } catch (err) {
    console.error('Error from predictions/', err);
    res.render('error', { message: 'Error loading predictions', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;