'use strict';
const express = require('express');
const router = express.Router();
const pool = require('./db'); // retrieve pool from db.js
const InputSanitizer = require('./inputsanitizer'); // import sanitizer
const fs = require('fs');
const path = require('path');

// Function to load the movie posters data
const loadPostersData = () => {
    const postersDataPath = path.join(__dirname, '..', 'data', 'selected_movies_data.json');
    return JSON.parse(fs.readFileSync(postersDataPath, 'utf8'));
};

// Function to load the links CSV and create a mapping of movieId to tmdbId
const loadLinksMapping = () => {
  const linksPath = path.join(__dirname, '..', 'data', 'links.csv');
  const data = fs.readFileSync(linksPath, 'utf8');
  const lines = data.split('\n');
  const mapping = {};
  lines.forEach(line => {
      let [movieId, imdbId, tmdbId] = line.split(',');
      if (tmdbId) tmdbId = tmdbId.trim(); // Trim the tmdbId to remove whitespace and carriage returns
      if (imdbId) imdbId = imdbId.trim(); // Optionally trim imdbId as well
      mapping[movieId] = { imdbId, tmdbId };
  });
  return mapping;
};

const postersData = loadPostersData();
const linksMapping = loadLinksMapping();

router.get('/:movieId', async function(req, res) {
  let connection;
  try {
      connection = await pool.getConnection();
      const movieId = InputSanitizer.sanitizeString(req.params.movieId || '%');

      // Check if the mapping exists
      const link = linksMapping[movieId];

      const tmdbId = link ? link.tmdbId : null;
      const poster = postersData.find(p => p.tmdb_id.toString() === tmdbId);

        // select the chosen movie using its primary key
    const getMovie = `
    SELECT * 
    FROM Movies INNER JOIN Crew ON Movies.movieId=Crew.movieId 
    WHERE Movies.movieId = ? 
    LIMIT 1;
  `;
  const [rowsMovie, fieldsM] = await connection.execute(getMovie, [`${movieId}`]);
  const movie = rowsMovie[0]; // only one as primary

    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      const formattedDate = date.toLocaleDateString('en-GB');
      movie.releaseDate = formattedDate;
    }

    // select the genres of this movie
    const getGenres = `
      SELECT Genres.genreId, Genres.name 
      FROM Genres INNER JOIN 
        (SELECT * FROM MovieGenres WHERE MovieGenres.movieId=?) AS MovieGenresSubset
      ON MovieGenresSubset.genreId=Genres.genreId;
    `;
    const [genres, fieldsG] = await connection.execute(getGenres, [`${movieId}`]);
    
    // select all the users who viewed this movie
    let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
    if (itemNum < 0) itemNum = 0;
    const getViewers = `
      SELECT userId, rating, watchDate 
      FROM Viewer WHERE movieId=? 
      LIMIT ?,30;
    `;
    const [viewers, fieldsV] = await connection.execute(getViewers, [`${movieId}`, `${itemNum}`]);
    if (viewers.length < 30) itemNum -= 30;

    let ratingFrequencies = [0,0,0,0,0,0,0,0,0,0];
    let rating = 0;
    for (var i=0; i<viewers.length; i++){
      rating += viewers[i].rating / viewers.length;
      ratingFrequencies[parseInt(viewers[i].rating * 2.0)-1] += 1;
    }
    rating = rating.toPrecision(3);

    viewers.forEach(viewer => {
      if (viewer.watchDate) {
        // Converting date to dd/mm/yyyy format
        const date = new Date(viewer.watchDate);
        const formattedDate = date.toLocaleDateString('en-GB'); // 'en-GB' uses dd/mm/yyyy format
        viewer.watchDate = formattedDate;
      }
    });

    // send output to response frontend
    res.render('filmInfo', { movie: movie, genres: genres, viewers: viewers, rating: rating, ratingFrequencies: ratingFrequencies, itemNum: itemNum });
  } catch (err) {
    console.error('Error from filmInfo/', err);
    res.render('error', { message: 'from filmInfo/', error: err});
  } finally {
    if (connection) connection.release();
  }

  // select the genres of this movie
  const getGenres = `
    SELECT Genres.genreId, Genres.name 
    FROM Genres INNER JOIN 
      (SELECT * FROM MovieGenres WHERE MovieGenres.movieId=?) AS MovieGenresSubset
    ON MovieGenresSubset.genreId=Genres.genreId;
  `;
  const [genres, fieldsG] = await connection.execute(getGenres, [`${movieId}`]);
  
  // select all the users who viewed this movie
  let itemNum = parseInt(InputSanitizer.sanitizeString(req.query.itemNum || '0'));
  if (itemNum < 0) itemNum = 0;
  const getViewers = `
    SELECT userId, rating, watchDate 
    FROM Viewer WHERE movieId=? 
    LIMIT ?,30;
  `;
  const [viewers, fieldsV] = await connection.execute(getViewers, [`${movieId}`, `${itemNum}`]);
  if (viewers.length < 30) itemNum -= 30;

  let ratingFrequencies = [0,0,0,0,0,0,0,0,0,0];
  let rating = 0;
  for (var i=0; i<viewers.length; i++){
    rating += viewers[i].rating / viewers.length;
    ratingFrequencies[parseInt(viewers[i].rating * 2.0)-1] += 1;
  }
  rating = rating.toPrecision(3);

  viewers.forEach(viewer => {
    if (viewer.watchDate) {
      // Converting date to dd/mm/yyyy format
      const date = new Date(viewer.watchDate);
      const formattedDate = date.toLocaleDateString('en-GB'); // 'en-GB' uses dd/mm/yyyy format
      viewer.watchDate = formattedDate;
    }
  });

        // After fetching movie details, add the poster URL to the movie object
        if (poster) {
            movie.posterUrl = `https://image.tmdb.org/t/p/w500${poster.poster_path}`;
        }

        // Continue with rendering the response as before
        res.render('filmInfo', {
            movie: movie,
            genres: genres,
            viewers: viewers,
            rating: rating,
            ratingFrequencies: ratingFrequencies.join(','),
            itemNum: itemNum
        });
    } catch (err) {
        console.error('Error from filmInfo/', err);
        res.render('error', { message: 'from filmInfo/', error: err });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
