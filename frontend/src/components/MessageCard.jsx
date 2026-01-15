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
            className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${urgencyColors.border} animate-fade-in`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                        {message.user_id}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">
                            Customer #{message.user_id}
                        </h3>
                        <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                    </div>
                </div>
                <UrgencyBadge level={message.urgency_level} score={message.urgency_score} />
            </div>

            <p className="text-gray-700 mb-3 line-clamp-2">{message.message_body}</p>

            <div className="flex justify-between items-center">
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        message.status
                    )}`}
                >
                    {message.status}
                </span>
                {message.assigned_to && (
                    <span className="text-xs text-gray-600">
                        👤 {message.assigned_to}
                    </span>
                )}
            </div>

            {message.urgency_reason && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        <span className="font-semibold">Urgency factors:</span>{' '}
                        {message.urgency_reason}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MessageCard;
