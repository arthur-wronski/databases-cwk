import React from 'react';

const movies = [
    { title: 'Inception', year: 2010, rating: 8.8 },
    { title: 'The Matrix', year: 1999, rating: 8.7 },
    { title: 'Interstellar', year: 2014, rating: 8.6 },
    { title: 'The Dark Knight', year: 2008, rating: 9.0 },
    { title: 'Fight Club', year: 1999, rating: 8.8 },
    { title: 'Pulp Fiction', year: 1994, rating: 8.9 },
    { title: 'Forrest Gump', year: 1994, rating: 8.8 },
    { title: 'The Shawshank Redemption', year: 1994, rating: 9.3 },
    { title: 'The Godfather', year: 1972, rating: 9.2 },
    { title: 'The Empire Strikes Back', year: 1980, rating: 8.7 },
    { title: 'The Lord of the Rings: The Return of the King', year: 2003, rating: 8.9 },
    { title: 'Gladiator', year: 2000, rating: 8.5 },
    { title: 'Jurassic Park', year: 1993, rating: 8.1 },
    { title: 'Avatar', year: 2009, rating: 7.8 },
    { title: 'Titanic', year: 1997, rating: 7.8 },
];


function MovieList({ searchTerm }) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Year
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Rating
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {movies
                        .filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((movie, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-100">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {movie.title}
                                </th>
                                <td className="px-6 py-4">
                                    {movie.year}
                                </td>
                                <td className="px-6 py-4">
                                    {movie.rating}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}

export default MovieList;
