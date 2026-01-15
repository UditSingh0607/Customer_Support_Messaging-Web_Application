import React, { useState } from 'react';

/**
 * ReplyBox component - text area for composing replies
 */
const ReplyBox = ({ onSend, initialValue = '', placeholder = 'Type your response...' }) => {
    const [message, setMessage] = useState(initialValue);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        setSending(true);
        try {
            await onSend(message);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Update message when initialValue changes (from canned response)
    React.useEffect(() => {
        if (initialValue) {
            setMessage(initialValue);
        }
    }, [initialValue]);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Compose Response
            </h3>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />

            <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                    {message.length} characters
                </span>
                <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                    {sending ? 'Sending...' : 'Send Response'}
                </button>
            </div>
        </div>
    );
};

export default ReplyBox;
