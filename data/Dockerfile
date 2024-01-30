# Use an official MySQL image as a base image
FROM mysql:8

# Set environment variables for MySQL configuration
ENV MYSQL_ALLOW_EMPTY_PASSWORD: true
ENV MYSQL_DATABASE: MovieLens

# Copy SQL files into the Docker container
COPY ./sql-init.sql /docker-entrypoint-initdb.d/
COPY ./sql-init2.sql /docker-entrypoint-initdb.d/

# Expose the MySQL port
EXPOSE 3001
