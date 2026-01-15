import React from 'react';
import { getUrgencyColor } from '../utils/urgencyColors';

/**
 * UrgencyBadge component - displays urgency level with color coding
 */
const UrgencyBadge = ({ level, score, showScore = false }) => {
    const colors = getUrgencyColor(level);

    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
            >
                {level}
            </span>
            {showScore && (
                <span className="text-sm text-gray-600 font-medium">
                    Score: {score}
                </span>
            )}
        </div>
    );
};

export default UrgencyBadge;
