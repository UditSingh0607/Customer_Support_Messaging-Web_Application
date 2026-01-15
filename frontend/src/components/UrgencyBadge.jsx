import React from 'react';
import { getUrgencyColor } from '../utils/urgencyColors';

/**
 * UrgencyBadge component - displays urgency level with color coding
 */
const UrgencyBadge = ({ level, score, showScore = false }) => {
    const colors = getUrgencyColor(level);

    return (
        <div className="flex items-center gap-3">
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${colors.bg} ${colors.text} ${colors.border.replace('border-', 'border-opacity-30 border-')}`}
            >
                {level}
            </span>
            {showScore && (
                <span className="text-xs text-branch-gray font-bold uppercase tracking-tighter">
                    Intensity: <span className="text-branch-navy">{score}</span>
                </span>
            )}
        </div>
    );
};

export default UrgencyBadge;
