import csv
from datetime import datetime

def preprocess_movies(file_path):
    genres_set = set()
    movie_genres = []

    with open(file_path, newline='', mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            movie_id = row['movieId']
            title = row['title']
            genres_str = row['genres']
            genres_list = genres_str.split('|')
            for genre in genres_list:
                genres_set.add(genre)
            movie_genres.append((movie_id, title, genres_list))

    genres_list = list(genres_set)
    genre_to_id = {genre: i + 1 for i, genre in enumerate(genres_list)}

    with open("../data/cleaned_movies.csv", 'w', newline='', encoding='utf-8') as movies_outfile:
        writer = csv.writer(movies_outfile)
        writer.writerow(['movieId', 'title'])
        for movie_id, title, _ in movie_genres:
            writer.writerow([movie_id, title])

    with open("../data/genres.csv", 'w', newline='', encoding='utf-8') as genres_outfile:
        writer = csv.writer(genres_outfile)
        writer.writerow(['genreId', 'name'])
        for genre, id in genre_to_id.items():
            writer.writerow([id, genre])

    with open("../data/movie_genres.csv", 'w', newline='', encoding='utf-8') as movie_genres_outfile:
        writer = csv.writer(movie_genres_outfile)
        writer.writerow(['movieId', 'genreId'])
        for movie_id, _, genres in movie_genres:
            for genre in genres:
                writer.writerow([movie_id, genre_to_id[genre]])

def preprocess_ratings(file_path):
    with open(file_path, newline='', mode='r', encoding='utf-8') as infile, \
         open("../data/cleaned_ratings.csv", 'w', newline='', encoding='utf-8') as outfile:
        reader = csv.DictReader(infile)
        writer = csv.writer(outfile)
        writer.writerow(['userId', 'movieId', 'rating', 'date'])
        for row in reader:
            timestamp = int(row['timestamp'])
            date = datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d')
            writer.writerow([row['userId'], row['movieId'], row['rating'], date])

def preprocess_crew(links_file_path, crew_file_path, cleaned_crew_file_path):
    tmdb_to_movie_id = {}
    with open(links_file_path, newline='', mode='r', encoding='utf-8') as links_file:
        links_reader = csv.DictReader(links_file)
        for row in links_reader:
            if row['movieId']:  
                tmdb_to_movie_id[row['tmdbId']] = row['movieId']

    with open(crew_file_path, newline='', mode='r', encoding='utf-8') as crew_file, \
         open(cleaned_crew_file_path, 'w', newline='', encoding='utf-8') as cleaned_crew_file:
        crew_reader = csv.DictReader(crew_file)
        fieldnames = ['movieId', 'Director', 'TopTwoActors', 'releaseDate']
        crew_writer = csv.DictWriter(cleaned_crew_file, fieldnames=fieldnames)
        crew_writer.writeheader()
        for row in crew_reader:
            tmdb_id = row.get('movie_id')
            movie_id = tmdb_to_movie_id.get(tmdb_id) 
            if movie_id: 
                release_date = row.get('release_date')
                crew_writer.writerow({
                    'movieId': movie_id,
                    'Director': row['Director'],
                    'TopTwoActors': row['Top Two Actors'],
                    'releaseDate': release_date if release_date else '' 
                })




preprocess_movies("../data/movies.csv")
preprocess_ratings("../data/ratings.csv")
preprocess_crew("../data/links.csv", "../data/crew.csv", "../data/cleaned_crew.csv")
