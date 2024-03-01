'use strict';

var express = require('express');
var router = express.Router();

// dummy data 
const previousRatings = [3, 4, 5, 2, 4, 3, 4, 5, 3, 2]; // previous ratings
const tags = ['funny', 'sad story', 'wow', 'funny', 'true story']; // tags

// Route to predict viewer ratings
router.get('/', function(req, res) {
    // prediction
    const predictedRatingFromRatings = predictRatingFromPreviousRatings(previousRatings);
    const predictedRatingFromTags = predictRatingFromTags(tags);
    const combinedPredictedRating = (predictedRatingFromRatings + predictedRatingFromTags) / 2; // Average prediction
    
    // Render predict.jade
    res.render('predict', { 
        title: 'Predict Performance', 
        predictedRatingFromRatings: predictedRatingFromRatings,
        predictedRatingFromTags: predictedRatingFromTags,
        combinedPredictedRating: combinedPredictedRating 
    });
});

function predictRatingFromPreviousRatings(previousRatings) {
    // This is just an average of previous ratings
    const sum = previousRatings.reduce((acc, rating) => acc + rating, 0);
    return sum / previousRatings.length;
}

function predictRatingFromTags(tags) {
    // Calculate the relevance score for tags (for simplicity, sum of ASCII values)
    const relevanceScore = tags.reduce((acc, tag) => {
        const tagScore = tag.split('').reduce((score, char) => score + char.charCodeAt(0), 0);
        return acc + tagScore;
    }, 0);
    
    // Normalize relevance score to a rating between 1 and 5
    const normalizedRating = (relevanceScore % 5) + 1;
    return normalizedRating;
}

module.exports = router;
