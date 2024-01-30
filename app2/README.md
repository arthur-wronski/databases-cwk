docker run -d --name (choose a container name) -e MYSQL_ROOT_PASSWORD=(choose a password) -e MYSQL_DATABASE=MovieLens -p 3306:3306 mysql:latest

docker cp ../data/. (container name):/var/lib/mysql/csv_data

docker exec -it (container name) mysql -u root -p

USE MovieLens;

CREATE TABLE IF NOT EXISTS Viewer (
    userId INT,
    movieId INT,
    rating DECIMAL(2,1),
    timestamp BIGINT,
    PRIMARY KEY (userId, movieId)
);

LOAD DATA INFILE '/var/lib/mysql/csv_data/ratings.csv' 
INTO TABLE Viewer 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

SELECT * FROM Viewer LIMIT 10; (this checks that the database is set up)

exit (exits SQL shell)

docker build -t db-app .
docker run -p 3000:3000 -d db-app

docker ps (check name of Ed's container)

docker network connect network (name of SQL container)
docker network connect network (name of Ed's container)




docker network create network



