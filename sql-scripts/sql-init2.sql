USE MovieLens;

LOAD DATA INFILE '/var/lib/mysql-files/ratings.csv' 
INTO TABLE Viewer 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
