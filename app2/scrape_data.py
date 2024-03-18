import asyncio
import json
import os

import aiohttp
import pandas as pd
from dotenv import load_dotenv

TMDB_API_KEY = 'e88c5436cbcf0301d32556f967d83f45'

REQUESTS_SEMAPHORE = asyncio.Semaphore(40)

async def fetch_movie_details(session, tmdb_id, index, total):
    async with REQUESTS_SEMAPHORE:
        print(f"Fetching details for TMDB ID {tmdb_id} ({index + 1}/{total})...")
        url = (f'https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={TMDB_API_KEY}'
               f'&language=en-US&append_to_response=credits,keywords')
        async with session.get(url) as response:
            if response.status != 200:
                return None
            return await response.json()

async def gather_data():
    movies_csv = './data/movies.csv'
    links_csv = './data/links.csv'

    movies_df = pd.read_csv(movies_csv)
    links_df = pd.read_csv(links_csv)

    merged_df = movies_df.merge(links_df, on='movieId')

    formatted_movies = []
    total = len(merged_df)

    async with aiohttp.ClientSession() as session:
        tasks = [
            asyncio.create_task(fetch_movie_details(session, row['tmdbId'], index, total))
            for index, (_, row) in enumerate(merged_df.iterrows())
        ]

        responses = await asyncio.gather(*tasks)

        for response, row in zip(responses, merged_df.itertuples()):
            if not response:
                continue

            formatted_movie = {
                'id': row.movieId,
                'title': response['title'],
                'imdb_id': str(row.imdbId),  
                'tmdb_id': row.tmdbId,
                'poster_path': response['poster_path']
            }
            formatted_movies.append(formatted_movie)

    with open('./data/selected_movies_data.json', 'w') as outfile:
        json.dump(formatted_movies, outfile, indent=4)

    print("Formatted movie data saved")

def main():
    asyncio.run(gather_data())

if __name__ == '__main__':
    main()
