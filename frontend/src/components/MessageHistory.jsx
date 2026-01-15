import React from 'react';
import { getStatusColor } from '../utils/urgencyColors';

/**
 * MessageHistory component - displays conversation history for a customer
 */
const MessageHistory = ({ messages }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (!messages || messages.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                No message history available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Message History ({messages.length})
            </h3>
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                msg.status
                            )}`}
                        >
                            {msg.status}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDate(msg.created_at)}
                        </span>
                    </div>

                    <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                            Customer Message:
                        </p>
                        <p className="text-gray-800">{msg.message_body}</p>
                    </div>

                    {msg.response && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                                Agent Response ({msg.assigned_to}):
                            </p>
                            <p className="text-gray-800">{msg.response}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Responded at: {formatDate(msg.responded_at)}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MessageHistory;
