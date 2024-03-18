'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');


/* initial page before any tags or previews entered */
router.get('/', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let tagSearch = InputSanitizer.sanitizeString(req.query.tagSearch || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;

    let getTags = `
      SELECT DISTINCT tag
      FROM Tags WHERE tag LIKE ?
      LIMIT ?,5;
    `;
    let [tags, fieldsT] = await connection.execute(getTags, [`%${tagSearch}%`, `${itemNum}`]);
    if (tags.length == 0) {
      itemNum -= 5;
      [tags, fieldsT] = await connection.execute(getTags, [`%${tagSearch}%`, `${itemNum}`]);
    }
    
    // update usedTags
    let usedTags = [];
    if (req.query.usedTags!=null && req.query.usedTags!='') usedTags = req.query.usedTags.split(',').map(tag=>`${tag}`);
    if (req.query.new_tag) {
      let new_tag = InputSanitizer.sanitizeString(req.query.new_tag);
      let index = usedTags.indexOf(new_tag);
      if (index==-1) usedTags.push(new_tag);
      else usedTags.splice(index,1);
    }
    // find prediction average and standard deviation using usedTags only
    let tag_average = 0; 
    let tag_std_deviation = 0;
    if (usedTags.length > 0) {
      const placeholders = Array.from({ length: usedTags.length }, () => '?').join(', ');
      let getRatings = `
        SELECT SQRT(VARIANCE(Viewer.rating)) AS std_deviation, AVG(Viewer.rating) AS average
        FROM 
          (SELECT * FROM Tags WHERE tag IN (${placeholders})) AS UsedTags
        NATURAL JOIN Viewer
        GROUP BY UsedTags.tag;
      `;
      let [tags_ratings, fieldTR] = await connection.execute(getRatings, usedTags);
      const tag_stats = getTagRating(tags_ratings);
      tag_average = parseFloat(tag_stats[0]);
      tag_std_deviation = parseFloat(tag_stats[1]);
    }

    let usedPreviews = [];
    if (req.query.usedPreviews!=null && req.query.usedPreviews!='') usedPreviews = req.query.usedPreviews.split(',').map(prev=>parseFloat(prev));
    if (req.query.new_preview) {
      let new_preview = parseFloat(req.query.new_preview)
      if (new_preview <= 5 && new_preview >= 0) usedPreviews.push(new_preview);
    }
    let preview_average = 0;
    let exp_2 = 0;
    for (var i=0; i<usedPreviews.length; i++) {
      preview_average += parseFloat(usedPreviews[i]);
      exp_2 += Math.pow(parseFloat(usedPreviews[i]), 2);
    }
    preview_average = (preview_average / usedPreviews.length);
    exp_2 = (exp_2 / usedPreviews.length);
    let preview_std_deviation = Math.sqrt(exp_2 - Math.pow(preview_average, 2));

    
    res.render('predict', { title: 'Predict Film Performance', 
     tags: tags, 
     usedTags: usedTags, tag_average: tag_average.toPrecision(3), tag_start: Math.max(0,tag_average-2*tag_std_deviation).toPrecision(3), tag_end: Math.min(5,tag_average+2*tag_std_deviation).toPrecision(3),
     usedPreviews: usedPreviews, preview_average: preview_average.toPrecision(3), preview_start: Math.max(0,preview_average-2*preview_std_deviation).toPrecision(3), preview_end: Math.min(5,preview_average+2*preview_std_deviation).toPrecision(3),
     itemNum: itemNum, tagSearch: tagSearch });
  } catch (err) {
    console.error('Error from predict:', err);
    res.render('error', { message: 'from predict', error: err});
  } finally {
    if (connection) connection.release();
  }
})

/* using multiple features predict the performance of a film */
router.get('/examples', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    let filmSearch = InputSanitizer.sanitizeString(req.query.filmSearch || '%');
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;
    let getMovies = `
      SELECT * 
      FROM Movies 
      WHERE title LIKE ? 
      LIMIT ?,10;
    `;
    let [movies, fieldsM] = await connection.execute(getMovies, [`%${filmSearch}%`, `${itemNum}`]);
    if (movies.length == 0) {
      itemNum -= 10;
      [movies, fieldsM] = await connection.execute(getMovies, [`%${filmSearch}%`, `${itemNum}`]);
    }

    let movieId = parseInt(InputSanitizer.sanitizeString(req.query.movieId || '1'));
    let movieTitle = InputSanitizer.sanitizeString(req.query.movieTitle || 'Toy Story (1995)');
    let getRealRatings = `
      SELECT AVG(rating) as average
      FROM Viewer WHERE movieId = ?;
    `;
    let [film_rating, fieldsMR] = await connection.execute(getRealRatings, [`${movieId}`]);
    
    let getPredictedRatings = `
      SELECT SQRT(VARIANCE(Viewer.rating)) AS std_deviation, AVG(Viewer.rating) AS average
      FROM Viewer NATURAL JOIN (
        SELECT Tags.userId, Tags.movieId 
        FROM Tags INNER JOIN 
          (SELECT * FROM Tags WHERE movieId = ?) AS ThisMovieTags 
        ON ThisMovieTags.tag = Tags.tag WHERE Tags.movieId != ?) AS TagMatch;
    `;
    let [alike_films_ratings, fieldTR] = await connection.execute(getPredictedRatings, [`${movieId}`, `${movieId}`]);
    const tag_stats = getTagRating(alike_films_ratings);
    const mu = parseFloat(tag_stats[0]);
    const sigma = parseFloat(tag_stats[1]);

    res.render('predictExample', { title: 'Predict Film Performance',
      movies: movies, filmSearch: filmSearch, itemNum: itemNum,
      movieId: movieId, movieTitle: movieTitle, true_rating: parseFloat(film_rating[0].average).toPrecision(3),
      average: mu.toPrecision(3), start: Math.max(0,mu-2*sigma).toPrecision(3), end: Math.min(5,mu+2*sigma).toPrecision(3)
    });

  } catch (err) {
    console.error('Error from predict/p:', err);
    res.render('error', { message: 'from predict/p', error: err});
  } finally {
    if (connection) connection.release();
  }
})

function getTagRating(tags_ratings){
  let average = 0; 
  let std_deviation = 0;
  for (var i=0; i<tags_ratings.length; i++){
    average += parseFloat(tags_ratings[i].average);
    std_deviation += parseFloat(tags_ratings[i].std_deviation);
  }
  average = (average / tags_ratings.length);
  std_deviation = (std_deviation / Math.sqrt(tags_ratings.length));
  return [average, std_deviation];
}

module.exports = router;
