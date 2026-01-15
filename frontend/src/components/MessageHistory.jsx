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
        <div className="space-y-6">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative group transition-all hover:bg-white hover:border-branch-blue hover:shadow-sm"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(
                                msg.status
                            )}`}
                        >
                            {msg.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-branch-gray uppercase tracking-widest">
                            {formatDate(msg.created_at)}
                        </span>
                    </div>

                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-2 opacity-60">
                            Client Message
                        </p>
                        <p className="text-branch-navy font-medium leading-relaxed">{msg.message_body}</p>
                    </div>

                    {msg.response && (
                        <div className="mt-4 pt-4 border-t border-slate-200 border-opacity-50">
                            <p className="text-[10px] font-bold text-branch-blue uppercase tracking-widest mb-2">
                                Support Response <span className="text-branch-gray font-normal">by {msg.assigned_to}</span>
                            </p>
                            <p className="text-branch-slate text-sm leading-relaxed">{msg.response}</p>
                            <p className="text-[10px] text-branch-gray mt-2 font-medium italic opacity-60">
                                Dispatched: {formatDate(msg.responded_at)}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MessageHistory;
