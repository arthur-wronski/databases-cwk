docker run -d --name (choose a container name) -e MYSQL_ROOT_PASSWORD=(choose a password) -e MYSQL_DATABASE=MovieLens -p 3306:3306 mysql:latest

docker exec -it (container name) mysql -u root -p

SHOW VARIABLES LIKE 'secure_file_priv'; (this will give you the path from which you are allowed to import the csv file)

exit (exits mySQL)

docker cp ../data/. (container name):(path from previous operation)

docker exec -it (container name) mysql -u root -p

USE MovieLens;

CREATE TABLE IF NOT EXISTS Viewer (
    userId INT,
    movieId INT,
    rating DECIMAL(2,1),
    timestamp BIGINT,
    PRIMARY KEY (userId, movieId)
);

LOAD DATA INFILE '(path to ratings.csv, e.g. /var/lib/mysql/csv_data/ratings.csv for me)' 
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



