CREATE DATABASE IF NOT EXISTS MovieLens;
USE MovieLens;

CREATE TABLE IF NOT EXISTS Viewer (
userId INT,
movieId INT,
rating DECIMAL(2,1),
watchDate DATE,
PRIMARY KEY (userId, movieId)
);

CREATE TABLE IF NOT EXISTS Movies (
    movieId INT PRIMARY KEY,
    title VARCHAR(255)
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
    tagId INT AUTO_INCREMENT,
    userId INT,
    movieId INT,
    tag VARCHAR(100),
    PRIMARY KEY (tagId),
    INDEX(userId, movieId) 
);


CREATE TABLE IF NOT EXISTS Links (
    movieId INT,
    imdbId VARCHAR(10),
    tmdbId INT,
    PRIMARY KEY (movieId),
    FOREIGN KEY (movieId) REFERENCES Movies(movieId)
);

CREATE TABLE IF NOT EXISTS Crew (
    tmdbId INT,
    title VARCHAR(255),
    Director VARCHAR(100),
    TopTwoActors TEXT,
    release_date DATE,
    PRIMARY KEY (tmdbId),
    FOREIGN KEY (tmdbId) REFERENCES MovieLinks(tmdbId)
);

LOAD DATA INFILE '/var/lib/mysql-files/crew.csv'
INTO TABLE Crew
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(tmdbId, title, Director, TopTwoActors, release_date);

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_links.csv'
INTO TABLE Links
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(movieId, imdbId, tmdbId);

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_ratings.csv'
INTO TABLE Viewer
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE '/var/lib/mysql-files/cleaned_movies.csv'
INTO TABLE Movies
FIELDS TERMINATED BY ','
OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(movieId, title);

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
