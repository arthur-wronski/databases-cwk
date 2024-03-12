'use strict'
var express = require('express');
var router = express.Router();
var pool = require('./db');     // retrieve pool from db.js
var InputSanitizer = require('./inputsanitizer');
var Statistics = require('statistics.js');

router.get('/:genreTrait', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();

    const [genre, trait] = (req.params.genreTrait || '1&extraversion').split('&');

    const genreId = parseInt(InputSanitizer.sanitizeString(genre));
    let getGenre = `
        SELECT * 
        FROM Genres
    ;`;
    let [genres, fieldsG] = await connection.execute(getGenre, [`${genreId}`]);
    const currentGenre = genres[genreId];

    const traits = ['openness',  'agreeableness', 'emotional_stability', 'conscientiousness', 'extraversion'];
    const currentTrait = InputSanitizer.sanitizeString(trait);
    /*
    let getTraitVals = `
      SELECT Personality.? AS traitVal, ThisGenreRatings.rating
      FROM Personality 
      NATURAL JOIN 
      (SELECT PersonalityRatings.userId, PersonalityRatings.rating 
        FROM PersonalityRatings 
        NATURAL JOIN
        (SELECT * FROM MovieGenres WHERE genreId = ?) AS ThisGenreMovies
      ) AS ThisGenreRatings
      ORDER BY Personality.?;
    `;
    let [traitVals, fieldsTV] = await connection.execute(getTraitVals, [`${currentTrait}`, `${currentGenre.genreId}`, `${currentTrait}`]);
    */
    let traitRate = [{traitVal: 0.6, rating: 4}, {traitVal: 1, rating: 1}, {traitVal: 2, rating: 3}];
    const traitRateVars = {traitVal: 'metric', rating: 'metric'};
    const stats = new Statistics(traitRate, traitRateVars);
    const regression = stats.linearRegression('traitVal', 'rating');

    res.render('personality_genre', {
        genres: genres, traits: traits, 
        currentGenre: currentGenre, currentTrait: currentTrait,
        regression: {coefficient: regression.correlationCoefficient.toPrecision(3), 
          pointStart: regression.regressionSecond.beta1, pointEnd: 10*regression.regressionSecond.beta2 + regression.regressionSecond.beta1},
        data: traitRate.map(pair => [pair.traitVal,pair.rating,'X']),
        traitVals: traitVals
    })

  } catch (err) {
    console.error('Error from correlate/', err);
    res.render('error', { message: 'Error in correlate', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;