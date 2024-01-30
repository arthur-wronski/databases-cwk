# from databases-cwk directory

docker run -d --name db-cont -e MYSQL_ROOT_PASSWORD=db-pass -e MYSQL_DATABASE=MovieLens -p 3001:3001 mysql:latest

docker exec -it db-cont mysql -u root -p
db-pass

# this will give you the path from which you are allowed to import the csv file
SHOW VARIABLES LIKE 'secure_file_priv'; 

# exits mySQL
exit 

# copies data file in
docker cp ../databases-cwk/data/. db-cont:/var/lib/mysql-files/
docker cp ../databases-cwk/data/. db-cont:/var/lib/mysql/csv_data

# enters sql to add db
docker exec -it db-cont mysql -u root -p
db-pass

# from sql shell run
USE MovieLens;

CREATE TABLE IF NOT EXISTS Viewer (
    userId INT,
    movieId INT,
    rating DECIMAL(2,1),
    timestamp BIGINT,
    PRIMARY KEY (userId, movieId)
);

# will need to do this for each table
LOAD DATA INFILE '/var/lib/mysql-files/ratings.csv' 
INTO TABLE Viewer 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

# check Viewer table contains loaded data
SELECT * FROM Viewer LIMIT 10;

# exit mySQL
exit

# run the web application
docker build -t db-app .
docker run -p 3000:3000 -d --name app-cont db-app

# check app is running and check name of db-app container
docker ps

docker network create network

docker network connect network db-cont
docker network connect network app-cont
