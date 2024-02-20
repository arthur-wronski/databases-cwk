import React, { useState, useEffect } from 'react';
import MovieList from './MovieList';
import SearchBar from './SearchBar';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="bg-gray-200 min-h-screen">
            <div className="container mx-auto px-4">
                <h1 className="text-center text-6xl font-semibold mb-8 text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>MovieLens Dashboard</h1>
                <SearchBar onSearch={handleSearch} />
                <MovieList searchTerm={searchTerm} />
            </div>
        </div>
    );
}
export default App;