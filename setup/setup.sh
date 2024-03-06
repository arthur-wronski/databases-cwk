#!/bin/bash
echo "Starting script..."

# Navigate to the script's directory
cd "$(dirname "$0")"

# Step 1: Run Python script to preprocess data and generate CSV files
echo "Running Python preprocessing script..."
python script.py

# Step 2: Start Docker containers using docker-compose
echo "Starting Docker containers..."
docker-compose up -d

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! docker exec mysql_container mysqladmin --user=root --password=your_root_password --host "127.0.0.1" ping --silent &> /dev/null ; do
    echo "Waiting for database connection..."
    sleep 2
done

# Step 3: Copy the generated CSV files into the MySQL container
echo "Copying CSV files into the MySQL container..."
docker cp ../data/. mysql_container:/var/lib/mysql-files/

# Step 4: Execute SQL scripts
echo "Executing SQL scripts..."
#docker exec -i mysql_container mysql -u root -p your_root_password MovieLens < init.sql
docker exec mysql_container mysql -u root -pyour_root_password MovieLens < init.sql


echo "Data import and SQL script execution completed."
