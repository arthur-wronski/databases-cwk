#!/bin/bash
#Wrote this script to avoid manually intialising all the dockers and loading the data in the db

echo "Starting script..."

#cd to setup dir to access python script
cd setup/"$(dirname "$0")"

# Clean data to prepare for loading into SQL db
echo "Running Python preprocessing script..."
python cleaning.py

echo "Starting Docker containers..."
# Start the db container
docker-compose up -d

echo "Waiting for MySQL to be ready..."
while ! docker exec mysql_container mysqladmin --user=root --password=your_root_password ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 2
done

# Copy cleaned CSV files into the MySQL container
echo "Copying CSV files into the MySQL container..."
docker cp ../data/. mysql_container:/var/lib/mysql-files/

# Execute SQL scripts to initialize the database
echo "Executing SQL scripts..."
docker exec -i mysql_container mysql -u root -pyour_root_password < init.sql

echo "Creating the Docker network if it doesn't exist..."
docker network create network

# Building and running the Docker container for frontend
echo "Building and running Docker container for frontend..."
cd ../app2
docker build -t db-app .
docker run -p 3000:3000 -d --name app-cont db-app

# Connect app-cont container to the network
echo "Connecting app-cont to the network..."
docker network connect network app-cont

# Connect SQL container to same network so they are linked
echo "Connecting mysql_container to the network..."
docker network connect network mysql_container

#Setup should be completed and page ready to view at localhost:3000
echo "Setup completed."
