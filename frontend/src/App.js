import React, { useState } from 'react';
import MovieList from './MovieList';
import SearchBar from './SearchBar';
import './App.css'; // Make sure to import the CSS file

function App() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="App bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-center text-6xl font-semibold mb-8 text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>MovieLens Dashboard</h1>
                <SearchBar onSearch={handleSearch} />
                <MovieList searchTerm={searchTerm} />
            </div>
        </div>
    );
}

export default App;
