import React from 'react';
import { useNavigate } from 'react-router-dom';
import UrgencyBadge from './UrgencyBadge';
import { getStatusColor, getUrgencyColor } from '../utils/urgencyColors';

/**
 * MessageCard component - displays a message in the list
 */
const MessageCard = ({ message }) => {
    const navigate = useNavigate();
    const urgencyColors = getUrgencyColor(message.urgency_level);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            onClick={() => navigate(`/messages/${message.id}`)}
            className={`bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:border-branch-blue hover:shadow-md transition-all duration-200 animate-fade-in`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-branch-navy font-bold text-lg border border-slate-200">
                        {message.user_id}
                    </div>
                    <div>
                        <h3 className="font-bold text-branch-navy text-lg">
                            Customer <span className="text-branch-gray font-normal">#{message.user_id}</span>
                        </h3>
                        <p className="text-sm text-branch-gray font-medium">{formatDate(message.created_at)}</p>
                    </div>
                </div>
                <UrgencyBadge level={message.urgency_level} score={message.urgency_score} />
            </div>

            <p className="text-branch-slate mb-4 line-clamp-2 text-base leading-relaxed">{message.message_body}</p>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                        message.status
                    )}`}
                >
                    {message.status.replace('_', ' ')}
                </span>
                {message.assigned_to && (
                    <span className="text-sm text-branch-gray font-medium flex items-center gap-1">
                        <span className="opacity-60 text-lg">👤</span> {message.assigned_to}
                    </span>
                )}
            </div>

            {message.urgency_reason && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-branch-gray leading-tight">
                        <span className="font-bold text-branch-navy">CONTEXT:</span>{' '}
                        {message.urgency_reason}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MessageCard;
