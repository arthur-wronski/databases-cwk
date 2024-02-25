RUN THIS BEFORE OTHER READ ME:

run python script (cd into app2 and run: "py script.py)

docker cp ../data/. db-cont:/var/lib/mysql-files/

docker exec -it db-cont mysql -u root -p

USE MovieLens;

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

LOAD DATA INFILE '/var/lib/mysql-files/movies.csv'
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

SELECT * FROM Movies LIMIT 10;