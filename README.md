# MovieLens Dataset Exploration and Analysis Platform

This platform provides an interactive web interface for exploring and analyzing the MovieLens dataset, which includes information on all the movies contained in the dataset. The project utilizes a Python script for data cleaning and preparation, ensuring compatibility with SQL databases and handling cases with missing information. We are using Docker containers to host both the frontend and the database backend, as well as making deployment straightforward and automated through a bash script.

## Features

The website is divided into three main sections:

### Movies

- **Overview**: Displays a paginated list of movies, including title, crew information, and release date. Each page shows 30 movies.
- **Customization**: Users can toggle the visibility of columns to customize the display of movie information.
- **Detailed View**: Clicking on a movie reveals additional details, such as the `movieId`, average rating, genres, and a distribution graph of its ratings. All ratings are displayed, including user ID, rating, and rating date.

### Genres

- **Overview**: Shows all genres available in the database along with their average ratings.
- **Analytics**: Features a graph displaying the frequency of movies per genre and their rating distribution. Users can filter the graph by toggling genres on and off.
- **Detailed View**: Selecting a genre displays a list of movies belonging to that genre, similar to the Movies tab, allowing for in-depth exploration of genre-specific content.

### Predict Performance

- **Functionality**: This feature calculates and predicts a movie's expected rating based on the tags associated with it and its preview ratings.

### SETUP AND RUN INSTRUCTIONS
- From the root folder (where this README.md lies), compile and run the web-app with the respective commands to be able to view the webpage from http://localhost:3000.
> chmod +x run.sh
> ./run.sh