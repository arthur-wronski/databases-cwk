run python script 

CREATE TABLE IF NOT EXISTS Movies (
    movieId INT,
    title VARCHAR(100),
    genres VARCHAR[] DEFAULT '{}',
    PRIMARY KEY (movieId)
);

COPY Movies (movieId, title, genres)
FROM '/var/lib/postgresql/data/clean_movies.csv' 
CSV
HEADER
DELIMITER ','
QUOTE '"'
ESCAPE ''''
;

SELECT * FROM Movies LIMIT 10;