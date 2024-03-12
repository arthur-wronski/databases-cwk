'use strict';
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjusted path since db.js is likely in the parent directory of routes
const InputSanitizer = require('../inputsanitizer'); // Adjust path as needed
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Adjusted paths to correctly reference the data folder from the current location
const postersDataPath = path.join(__dirname, '..', '..', 'data', 'selected_movies_data.json');
const postersData = JSON.parse(fs.readFileSync(postersDataPath, 'utf8'));

// Function to read CSV and return a Promise that resolves with the mapping
function readCsvMapping(filePath) {
    return new Promise((resolve, reject) => {
        const mapping = {};
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                mapping[row.movieId.toString()] = row.tmdbId || row.imdbId; // Convert movieId to string if necessary, prefer tmdbId, fallback to imdbId
            })
            .on('end', () => {
                resolve(mapping);
            })
            .on('error', reject);
    });
}

/* show more info about the chosen film */
router.get('/:movieId', async function(req, res) {
  let connection;

  try {
    connection = await pool.getConnection();
    const movieId = InputSanitizer.sanitizeString(req.params.movieId || '%');

    const linksCsvPath = path.join(__dirname, '..', '..', 'data', 'links.csv');
    // Read the Links CSV for mapping
    const linksMapping = await readCsvMapping(linksCsvPath);
    const tmdbId = linksMapping[movieId];

    // Find the poster data for this movie
    const moviePosterData = postersData.find(m => m.tmdb_id.toString() === tmdbId.toString());
    if (moviePosterData) {
        movie.posterUrl = `https://image.tmdb.org/t/p/w500${moviePosterData.poster_path}`;
    }

    // select the chosen movie using its primary key
    const getMovie = `SELECT * FROM Movies INNER JOIN Crew ON Movies.movieId=Crew.movieId WHERE Movies.movieId = ? LIMIT 1;`;
    const [rowsMovie] = await connection.execute(getMovie, [movieId]);
    let movie = rowsMovie[0]; // only one as primary
    if (!movie) {
      throw new Error('Movie not found');
    }

    if (movie.releaseDate) {
      movie.releaseDate = new Date(movie.releaseDate).toLocaleDateString('en-GB');
    }

    // select the genres of this movie
    const getGenres = `SELECT Genres.genreId, Genres.name FROM Genres INNER JOIN MovieGenres ON (MovieGenres.genreId=Genres.genreId) WHERE MovieGenres.movieId=?;`;
    const [genres] = await connection.execute(getGenres, [movieId]);

    // select all the users who viewed this movie
    let itemNum = parseInt(req.query.itemNum || '0', 10);
    itemNum = Math.max(itemNum, 0); // Ensure non-negative
    const getViewers = `SELECT userId, rating, watchDate FROM Viewer WHERE movieId=? LIMIT ?,30;`;
    const [viewers] = await connection.execute(getViewers, [movieId, itemNum]);

    let ratingFrequencies = new Array(10).fill(0);
    let rating = viewers.reduce((acc, viewer) => acc + viewer.rating, 0) / (viewers.length || 1);
    viewers.forEach(viewer => {
        ratingFrequencies[Math.round(viewer.rating * 2) - 1]++;
        viewer.watchDate = new Date(viewer.watchDate).toLocaleDateString('en-GB');
    });

    // Attach the poster URL to the movie object
    if (moviePosterData) {
        movie.posterUrl = `https://image.tmdb.org/t/p/w500${moviePosterData.poster_path}`;
    }

    // send output to response frontend
    res.render('filmInfo', {
      movie: movie,
      genres: genres,
      viewers: viewers,
      rating: rating.toFixed(3),
      ratingFrequencies: ratingFrequencies,
      itemNum: itemNum
    });
  } catch (err) {
    console.error('Error from filmInfo/', err);
    res.render('error', { message: 'Error from filmInfo/', error: err});
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
