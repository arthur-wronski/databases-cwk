import csv
from datetime import datetime

#script is used to preprocess all the csv files as they need to be in a specific format before SQL import
# also clean instances of repeat rows or missing data

def preprocess_movies(file_path):
    #using a set to remove any potential duplicate instances
    genres_set = set()
    movie_genres = []

    with open(file_path, newline='', mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            movie_id = row['movieId']
            title = row['title']
            genres_str = row['genres']
            #reformats the genres to be in a list rather than being in a string with separator
            genres_list = genres_str.split('|')
            for genre in genres_list:
                genres_set.add(genre)
            movie_genres.append((movie_id, title, genres_list))

    genres_list = list(genres_set)
    #assigns id to each genre present in dataset for referencing in movie_genres table
    genre_to_id = {genre: i + 1 for i, genre in enumerate(genres_list)}

    with open("../data/cleaned_movies.csv", 'w', newline='', encoding='utf-8') as movies_outfile:
        #cleaned movies will just have movie Id and title, 
        # rest of info like genre or crew will be fetched through other tables referencing movieId
        writer = csv.writer(movies_outfile)
        writer.writerow(['movieId', 'title'])
        for movie_id, title, _ in movie_genres:
            writer.writerow([movie_id, title])

    with open("../data/genres.csv", 'w', newline='', encoding='utf-8') as genres_outfile:
        # maps newly created genreId to the actual name of the genre
        writer = csv.writer(genres_outfile)
        writer.writerow(['genreId', 'name'])
        for genre, id in genre_to_id.items():
            writer.writerow([id, genre])

    with open("../data/movie_genres.csv", 'w', newline='', encoding='utf-8') as movie_genres_outfile:
        #maps movieId to all of that movie's genres(using genreId)
        writer = csv.writer(movie_genres_outfile)
        writer.writerow(['movieId', 'genreId'])
        for movie_id, _, genres in movie_genres:
            for genre in genres:
                writer.writerow([movie_id, genre_to_id[genre]])

def preprocess_ratings(file_path):
    #only thing it does is convert timestamp in epoch ms to normal yyyy-mm-dd format
    with open(file_path, newline='', mode='r', encoding='utf-8') as infile, \
         open("../data/cleaned_ratings.csv", 'w', newline='', encoding='utf-8') as outfile:
        reader = csv.DictReader(infile)
        writer = csv.writer(outfile)
        writer.writerow(['userId', 'movieId', 'rating', 'date'])
        for row in reader:
            timestamp = int(row['timestamp'])
            #converts timestamp to date
            date = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
            writer.writerow([row['userId'], row['movieId'], row['rating'], date])

def preprocess_crew(links_file_path, crew_file_path, cleaned_crew_file_path):
    # had to use links file to map the id's in crew to the id's used in all our other csv files
    tmdb_to_movie_id = {}
    with open(links_file_path, newline='', mode='r', encoding='utf-8') as links_file:
        links_reader = csv.DictReader(links_file)
        #populates dict with all the mappings we are interested in
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
                release_date = datetime.strptime(row.get('release_date'), '%Y-%m-%d').date()
                crew_writer.writerow({
                    'movieId': movie_id,
                    'Director': row['Director'],
                    'TopTwoActors': row['Top Two Actors'],
                    'releaseDate': release_date if release_date else '' 
                })
def preprocess_personalities(file_path):
    #use dict to remove identical rows or rows with same userID as can't have duplicate keys
    user_personalities = {}

    with open(file_path, newline='', mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)

        for row in reader:
            user_id = row['userId']
            personality_ratings = ','.join([row['openness'], row['agreeableness'], row['emotional_stability'], row['conscientiousness'], row['extraversion']])
            
            user_personalities[user_id] = personality_ratings
    
    with open("../data/cleaned_personalities.csv", 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(['userID', 'openness', 'agreeableness', 'emotional_stability', 'conscientiousness', 'extraversion'])
        for user_id, ratings in user_personalities.items():
            ratings_list = ratings.split(',')
            writer.writerow([user_id] + ratings_list)

def clean_ratings(input_file, output_file, allowed_ids):
    #due to personality ratings table referencing personality table in DB architecture
    #ratings file can't have any userIds or movieIDs not present in personality file
    allowed_user_ids, allowed_movie_ids = allowed_ids
    #avoid duplicated user Id's
    processed_user_ids = set() 

    with open(input_file, newline='', mode='r', encoding='utf-8') as infile, \
         open(output_file, 'w', newline='', encoding='utf-8') as outfile:

        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
        writer.writeheader()

        for row in reader:
            if row['userId'] in allowed_user_ids and row['movieId'] in allowed_movie_ids:
                if row['userId'] not in processed_user_ids:
                    writer.writerow(row)
                    processed_user_ids.add(row['userId']) 


def get_allowed_ids(personality_file, movie_genres_file):
    #essentially just stores all the userIds and movieIds present in personality file and avoids duplicates
    allowed_user_ids = set()
    with open(personality_file, newline='', mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            allowed_user_ids.add(row['userId'])
    
    allowed_movie_ids = set()
    with open(movie_genres_file, newline='', mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            allowed_movie_ids.add(row['movieId'])
    
    return allowed_user_ids, allowed_movie_ids



preprocess_movies("../data/movies.csv")
preprocess_personalities("../data/streamlined_personality.csv")
preprocess_ratings("../data/ratings.csv")
preprocess_crew("../data/links.csv", "../data/crew.csv", "../data/cleaned_crew.csv")
clean_ratings("../data/streamlined_ratings.csv", "../data/cleaned_streamlined_ratings.csv", get_allowed_ids("../data/streamlined_personality.csv", "../data/movie_genres.csv"))