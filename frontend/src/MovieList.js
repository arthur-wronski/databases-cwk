import React from 'react';
import { Table } from 'flowbite-react';

// Dummy data for the sake of example
const movies = [
    { title: 'Inception', year: 2010, rating: 8.8 },
    { title: 'The Matrix', year: 1999, rating: 8.7 },
    { title: 'Interstellar', year: 2014, rating: 8.6 },
    // Add more movies here
];

function MovieList({ searchTerm }) {
    return (
        <div className="overflow-x-auto">
            <Table hoverable={true}>
                <Table.Head>
                    <Table.HeadCell>
                        Name
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Year
                    </Table.HeadCell>
                    <Table.HeadCell>
                        Rating
                    </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                    {movies
                        .filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((movie, index) => (
                            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                    {movie.title}
                                </Table.Cell>
                                <Table.Cell>
                                    {movie.year}
                                </Table.Cell>
                                <Table.Cell>
                                    {movie.rating}
                                </Table.Cell>
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
        </div>
    );
}

export default MovieList;
