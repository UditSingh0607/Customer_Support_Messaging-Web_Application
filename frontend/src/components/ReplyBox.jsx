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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-6 opacity-70">
                Compose Official Response
            </h3>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                rows={6}
                className="w-full px-6 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-branch-blue focus:border-transparent resize-none text-branch-navy bg-slate-50 transition-all"
            />

            <div className="flex justify-between items-center mt-6">
                <span className="text-xs font-medium text-branch-gray uppercase tracking-widest">
                    {message.length} CHARACTERS
                </span>
                <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className="px-8 py-3 bg-branch-navy text-white font-bold rounded-xl hover:bg-branch-slate disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                    {sending ? (
                        <>
                            <span className="animate-spin">🌀</span> Processing...
                        </>
                    ) : 'Dispatch Response'}
                </button>
            </div>
        </div>
    );
};

export default ReplyBox;
