import React from 'react';

/**
 * FilterBar component - allows filtering messages by status and urgency
 */
const FilterBar = ({ filters, onFilterChange }) => {
    const urgencyLevels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const statuses = ['ALL', 'UNREAD', 'IN_PROGRESS', 'RESOLVED'];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Urgency Filter */}
                <div>
                    <label className="block text-xs font-bold text-branch-navy uppercase tracking-widest mb-4 opacity-70">
                        Priority Level
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
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${(level === 'ALL' && !filters.urgency) ||
                                    filters.urgency === level
                                    ? 'bg-branch-navy text-white border-branch-navy shadow-md'
                                    : 'bg-white text-branch-gray border-slate-200 hover:border-branch-blue hover:text-branch-blue'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-bold text-branch-navy uppercase tracking-widest mb-4 opacity-70">
                        Message Status
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
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${(status === 'ALL' && !filters.status) ||
                                    filters.status === status
                                    ? 'bg-branch-navy text-white border-branch-navy shadow-md'
                                    : 'bg-white text-branch-gray border-slate-200 hover:border-branch-blue hover:text-branch-blue'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
