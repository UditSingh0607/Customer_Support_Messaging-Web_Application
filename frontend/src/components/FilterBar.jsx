import React from 'react';

/**
 * FilterBar component - allows filtering messages by status and urgency
 */
const FilterBar = ({ filters, onFilterChange }) => {
    const urgencyLevels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const statuses = ['ALL', 'UNREAD', 'IN_PROGRESS', 'RESOLVED'];

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Urgency Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Filter by Urgency
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {urgencyLevels.map((level) => (
                            <button
                                key={level}
                                onClick={() =>
                                    onFilterChange({
                                        ...filters,
                                        urgency: level === 'ALL' ? '' : level,
                                    })
                                }
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${(level === 'ALL' && !filters.urgency) ||
                                        filters.urgency === level
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Filter by Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() =>
                                    onFilterChange({
                                        ...filters,
                                        status: status === 'ALL' ? '' : status,
                                    })
                                }
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${(status === 'ALL' && !filters.status) ||
                                        filters.status === status
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
