import React, { useState } from 'react';

/**
 * SearchBar component - allows searching messages
 */
const SearchBar = ({ onSearch, placeholder = 'Search messages or customer ID...' }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-4 pl-12 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-branch-blue focus:border-transparent shadow-sm text-branch-navy placeholder-branch-gray transition-all"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                </div>
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>
        </form>
    );
};

export default SearchBar;
