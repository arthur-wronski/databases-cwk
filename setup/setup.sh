#!/bin/bash
echo "Starting script..."

# Ensure this script is run from its containing directory
cd "$(dirname "$0")"

# Preprocess data
echo "Running Python preprocessing script..."
python cleaning.py

# Start the Docker environment
echo "Starting Docker containers..."
docker-compose up -d

# Ensure MySQL is fully up and running
echo "Waiting for MySQL to be ready..."
while ! docker exec mysql_container mysqladmin --user=root --password=your_root_password ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 2
done

# Copy preprocessed CSV files into the MySQL container
echo "Copying CSV files into the MySQL container..."
docker cp ../data/. mysql_container:/var/lib/mysql-files/

# Execute SQL scripts to initialize the database
echo "Executing SQL scripts..."
docker exec mysql_container mysql -u root -pyour_root_password < init.sql

# Building and running the Docker container for app2
echo "Building and running Docker container for app2..."
cd ../app2
docker build -t db-app .
docker run -p 3000:3000 -d --name app-cont db-app

# Connect the app2 container to the specified network
echo "Connecting app-cont to the network..."
docker network connect network app-cont

# Assuming you want to connect the MySQL container to the same network
echo "Connecting mysql_container to the network..."
docker network connect network mysql_container

echo "Setup completed."
