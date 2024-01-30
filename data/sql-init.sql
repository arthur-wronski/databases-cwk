CREATE DATABASE IF NOT EXISTS MovieLens;
USE MovieLens;

CREATE TABLE IF NOT EXISTS Viewer (
    userId INT,
    movieId INT,
    rating DECIMAL(2,1),
    timestamp BIGINT,
    PRIMARY KEY (userId, movieId)
);