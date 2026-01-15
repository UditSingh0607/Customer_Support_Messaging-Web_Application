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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-6 opacity-70">
                Response Repository
            </h3>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${selectedCategory === category
                            ? 'bg-branch-navy text-white border-branch-navy shadow-md'
                            : 'bg-white text-branch-gray border-slate-200 hover:border-branch-blue hover:text-branch-blue'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Response List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {filteredResponses.map((response) => (
                    <button
                        key={response.id}
                        onClick={() => handleSelect(response)}
                        className="w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-branch-blue hover:shadow-md transition-all group"
                    >
                        <p className="font-bold text-branch-navy text-sm mb-2 group-hover:text-branch-blue">
                            {response.title}
                        </p>
                        <p className="text-xs text-branch-gray line-clamp-2 leading-relaxed">
                            {response.message_text}
                        </p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 border-opacity-50">
                            <span className="text-[10px] font-bold text-branch-gray uppercase tracking-widest">{response.category}</span>
                            <span className="text-[10px] font-medium text-branch-gray opacity-60">
                                Frequency: {response.usage_count}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CannedResponsePicker;
