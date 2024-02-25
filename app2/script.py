import csv

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

    with open("../data/movies.csv", 'w', newline='', encoding='utf-8') as movies_outfile:
        writer = csv.writer(movies_outfile)
        writer.writerow(['movieId', 'title'])
        for movie_id, title, genres in movie_genres: 
            writer.writerow([movie_id, title])

    with open("../data/genres.csv", 'w', newline='', encoding='utf-8') as genres_outfile:
        writer = csv.writer(genres_outfile)
        writer.writerow(['genreId', 'name'])
        for genre, id in genre_to_id.items():
            writer.writerow([id, genre])

    with open("../data/movie_genres.csv", 'w', newline='', encoding='utf-8') as movie_genres_outfile:
        writer = csv.writer(movie_genres_outfile)
        writer.writerow(['movieId', 'genreId'])
        for movie_id, title, genres in movie_genres:
            for genre in genres:
                writer.writerow([movie_id, genre_to_id[genre]])

preprocess_movies("../data/movies.csv")