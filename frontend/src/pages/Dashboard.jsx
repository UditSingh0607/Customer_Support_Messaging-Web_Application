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
        <div className="min-h-screen bg-branch-light p-6 md:p-12">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-branch-navy tracking-tight">
                            Branch <span className="text-branch-blue">Support</span>
                        </h1>
                        <p className="text-branch-gray mt-2 text-lg">Agent Command Center</p>
                    </div>
                    <button
                        onClick={() => navigate('/customer')}
                        className="px-6 py-3 bg-branch-navy text-white font-semibold rounded-lg hover:bg-branch-slate transition-all shadow-sm flex items-center gap-2"
                    >
                        <span>🧪</span> Customer Simulator
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* Filter Bar */}
                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-branch-gray uppercase tracking-wider mb-1">Total Messages</p>
                        <p className="text-3xl font-bold text-branch-navy">
                            {displayMessages.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-branch-gray uppercase tracking-wider mb-1">Critical Priority</p>
                        <p className="text-3xl font-bold text-branch-error">
                            {displayMessages.filter((m) => m.urgency_level === 'CRITICAL').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-branch-gray uppercase tracking-wider mb-1">Pending Unread</p>
                        <p className="text-3xl font-bold text-branch-blue">
                            {displayMessages.filter((m) => m.status === 'UNREAD').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <p className="text-sm font-medium text-branch-gray uppercase tracking-wider mb-1">Successfully Resolved</p>
                        <p className="text-3xl font-bold text-branch-success">
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
