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

    const [genre, trait] = (req.params.genreTrait).split('&');

    // only take genres which have ratings in the Personality & PersonalityRatings tables
    let getGenre = `
        SELECT DISTINCT Genres.*
        FROM Genres 
          INNER JOIN MovieGenres ON Genres.genreId=MovieGenres.genreId 
          INNER JOIN PersonalityRatings ON MovieGenres.movieId=PersonalityRatings.movieId
        ORDER BY Genres.genreId;
    `;
    let [genres, fieldsG] = await connection.execute(getGenre);

    let genreId = genres[0].genreId;
    if (genre.length > 0) genreId = parseInt(InputSanitizer.sanitizeString(genre));

    let currentGenre = { genreId: genreId, name: ''};
    for (var i=0; i<genres.length; i++){
      if (genres[i].genreId == genreId)  currentGenre.name = genres[i].name;
    }

    const traits = ['openness',  'agreeableness', 'emotional_stability', 'conscientiousness', 'extraversion'];
    const currentTrait = InputSanitizer.sanitizeString(trait);
    
    let getTraitVals = `
      SELECT Personality.${currentTrait} AS traitVal, ThisGenreRatings.rating
      FROM Personality 
      NATURAL JOIN 
      (SELECT PersonalityRatings.userId, PersonalityRatings.rating 
        FROM PersonalityRatings 
        NATURAL JOIN
        (SELECT * FROM MovieGenres WHERE genreId = ?) AS ThisGenreMovies
      ) AS ThisGenreRatings
      ORDER BY Personality.${currentTrait};
    `;
    let [traitRate, fieldsTV] = await connection.execute(getTraitVals, [`${currentGenre.genreId}`]);

    const traitRateVars = {traitVal: 'metric', rating: 'metric'};
    const stats = new Statistics(traitRate, traitRateVars);
    const regression = stats.linearRegression('traitVal', 'rating');

    res.render('personality_genre', {
        genres: genres, traits: traits,
        currentGenre: currentGenre, currentTrait: currentTrait,
        regression: {coefficient: regression.correlationCoefficient.toPrecision(3), 
          pointStart: regression.regressionSecond.beta1, pointEnd: 10*regression.regressionSecond.beta2 + regression.regressionSecond.beta1},
        data: traitRate.map(pair => [pair.traitVal,pair.rating,'X'])
    });
  } catch (err) {
    console.error('Error from correlate/', err);
    res.render('error', { message: 'Error in correlate', error: err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;