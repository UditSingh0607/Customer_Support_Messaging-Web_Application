import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageCard from '../components/MessageCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import useMessages from '../hooks/useMessages';
import { messagesAPI } from '../services/api';

/**
 * Dashboard page - main agent portal view
 */
const Dashboard = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const { messages, loading, error, refetch } = useMessages(filters);

    const displayMessages = searchResults || messages;

    const handleSearch = async (query) => {
        if (!query) {
            setSearchResults(null);
            return;
        }

        setSearching(true);
        try {
            const response = await messagesAPI.search(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
            alert('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setSearchResults(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Branch Customer Support
                            </h1>
                            <p className="text-gray-600 mt-1">Agent Portal Dashboard</p>
                        </div>
                        <button
                            onClick={() => navigate('/customer')}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-md"
                        >
                            🧪 Customer Simulator
                        </button>
                    </div>

                    {/* Search Bar */}
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* Filter Bar */}
                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-600">Total Messages</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {displayMessages.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-600">Critical</p>
                        <p className="text-2xl font-bold text-red-600">
                            {displayMessages.filter((m) => m.urgency_level === 'CRITICAL').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-600">Unread</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {displayMessages.filter((m) => m.status === 'UNREAD').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <p className="text-sm text-gray-600">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">
                            {displayMessages.filter((m) => m.status === 'RESOLVED').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="max-w-7xl mx-auto">
                {loading || searching ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">
                            {searching ? 'Searching...' : 'Loading messages...'}
                        </p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                ) : displayMessages.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg">No messages found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {displayMessages.map((message) => (
                            <MessageCard key={message.id} message={message} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
