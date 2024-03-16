CREATE DATABASE IF NOT EXISTS MovieLens;

USE MovieLens;

CREATE TABLE IF NOT EXISTS Movies (
    movieId INT PRIMARY KEY,
    title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Viewer (
    userId INT,
    movieId INT,
    rating DECIMAL(2,1),
    watchDate DATE,
    PRIMARY KEY (userId, movieId),
    FOREIGN KEY (movieId) REFERENCES Movies(movieId)
);

CREATE TABLE IF NOT EXISTS Genres (
    genreId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS MovieGenres (
    movieId INT,
    genreId INT,
    PRIMARY KEY (movieId, genreId),
    FOREIGN KEY (movieId) REFERENCES Movies(movieId),
    FOREIGN KEY (genreId) REFERENCES Genres(genreId)
);

CREATE TABLE IF NOT EXISTS Tags (
    userId INT,
    movieId INT,
    tag VARCHAR(100),
    PRIMARY KEY (userId, movieId, tag),
    FOREIGN KEY (movieId) REFERENCES Movies(movieId),
    FOREIGN KEY (userId) REFERENCES Viewer(userId),
    INDEX(userId, movieId)
);

CREATE TABLE IF NOT EXISTS Crew (
    movieId INT PRIMARY KEY,
    Director VARCHAR(100),
    TopTwoActors TEXT,
    releaseDate DATE ,
    FOREIGN KEY (movieId) REFERENCES Movies(movieId)
);

CREATE TABLE IF NOT EXISTS Personality (
    userId VARCHAR(255) PRIMARY KEY,
    openness DECIMAL(2,1),
    agreeableness DECIMAL(2,1),
    emotional_stability DECIMAL(2,1),
    conscientiousness DECIMAL(2,1),
    extraversion DECIMAL(2,1)
);

CREATE TABLE IF NOT EXISTS PersonalityRatings (
    userId VARCHAR(255),
    movieId INT,
    PRIMARY KEY (userId, movieId),
    rating DECIMAL(2,1),
    FOREIGN KEY (userId) REFERENCES Personality(userId),
    FOREIGN KEY (movieId) REFERENCES MovieGenres(movieId)
);

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_movies.csv'
INTO TABLE Movies
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(movieId, title);

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_ratings.csv'
INTO TABLE Viewer
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/genres.csv'
INTO TABLE Genres
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(genreId, name);

LOAD DATA INFILE '/var/lib/mysql-files/movie_genres.csv'
INTO TABLE MovieGenres
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(movieId, genreId);

LOAD DATA INFILE '/var/lib/mysql-files/tags.csv'
INTO TABLE Tags
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(userId, movieId, tag, @dummy);

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_crew.csv'
INTO TABLE Crew
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_personalities.csv'
INTO TABLE Personality
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_streamlined_ratings.csv'
INTO TABLE PersonalityRatings
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

