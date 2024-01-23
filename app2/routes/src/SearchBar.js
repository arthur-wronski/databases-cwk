import React, { useState } from 'react';
import { TextInput } from 'flowbite-react';

function SearchBar({ onSearch }) {
    const [term, setTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(term);
    };

    return (
        <form onSubmit={handleSubmit} className="text-center mb-8">
            <div style={{ width: '300px', margin: '0 auto' }}>
                <TextInput
                    id="search"
                    type="search"
                    placeholder="Search for a movie..."
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    size="lg"
                />
            </div>
        </form>
    );
}

export default SearchBar;
