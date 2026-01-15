import React, { useState, useEffect } from 'react';
import { cannedResponsesAPI } from '../services/api';

/**
 * CannedResponsePicker component - allows selecting pre-written responses
 */
const CannedResponsePicker = ({ onSelect }) => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        fetchCannedResponses();
    }, []);

    const fetchCannedResponses = async () => {
        try {
            const response = await cannedResponsesAPI.getAll();
            setResponses(response.data);
        } catch (error) {
            console.error('Error fetching canned responses:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['ALL', ...new Set(responses.map((r) => r.category))];

    const filteredResponses =
        selectedCategory === 'ALL'
            ? responses
            : responses.filter((r) => r.category === selectedCategory);

    const handleSelect = async (response) => {
        try {
            await cannedResponsesAPI.markUsed(response.id);
            onSelect(response.message_text);
        } catch (error) {
            console.error('Error marking response as used:', error);
            onSelect(response.message_text);
        }
    };

    if (loading) {
        return <div className="text-gray-500">Loading responses...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Canned Responses
            </h3>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Response List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredResponses.map((response) => (
                    <button
                        key={response.id}
                        onClick={() => handleSelect(response)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
                    >
                        <p className="font-semibold text-gray-800 text-sm mb-1">
                            {response.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {response.message_text}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">{response.category}</span>
                            <span className="text-xs text-gray-400">
                                Used {response.usage_count} times
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CannedResponsePicker;
