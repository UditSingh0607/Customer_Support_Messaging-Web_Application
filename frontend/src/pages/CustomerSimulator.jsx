import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messagesAPI, customersAPI } from '../services/api';
import { getStatusColor } from '../utils/urgencyColors';

/**
 * CustomerSimulator page - allows simulating customer messages
 */
const CustomerSimulator = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [sending, setSending] = useState(false);
    const [customerMessages, setCustomerMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const exampleMessages = [
        'My loan was approved but I have not received the money yet. This is urgent!',
        'I cannot access my account. Please help immediately.',
        'When will my loan of ₹50000 be disbursed?',
        'There is an unauthorized transaction of ₹15000 in my account!',
        'My payment of ₹5000 failed. Can you help?',
        'How do I update my information?',
        'I need to dispute a charge on my account.',
    ];

    const handleSendMessage = async () => {
        if (!userId || !messageBody) {
            alert('Please enter both User ID and message');
            return;
        }

        setSending(true);
        try {
            await messagesAPI.create(parseInt(userId), messageBody);
            alert('Message sent successfully!');
            setMessageBody('');
            loadCustomerMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const loadCustomerMessages = async () => {
        if (!userId) return;

        setLoadingMessages(true);
        try {
            const response = await customersAPI.getMessages(parseInt(userId));
            setCustomerMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadCustomerMessages();
        }
    }, [userId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    >
                        ← Back to Agent Portal
                    </button>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Customer Simulator
                    </h1>
                    <p className="text-gray-600">
                        Simulate customer messages to test the support system
                    </p>
                </div>

                {/* Message Form */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Send a Message
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Customer ID (User ID)
                            </label>
                            <input
                                type="number"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter customer ID (e.g., 1001)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                placeholder="Type your message here..."
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </div>

                {/* Example Messages */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Example Messages (Click to Use)
                    </h2>
                    <div className="space-y-2">
                        {exampleMessages.map((msg, index) => (
                            <button
                                key={index}
                                onClick={() => setMessageBody(msg)}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all"
                            >
                                <p className="text-sm text-gray-700">{msg}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customer Messages History */}
                {userId && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Your Messages (Customer #{userId})
                        </h2>

                        {loadingMessages ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <p className="mt-2 text-gray-600">Loading messages...</p>
                            </div>
                        ) : customerMessages.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No messages yet. Send your first message above!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {customerMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="border border-gray-200 rounded-lg p-4"
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
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">
                                                Your Message:
                                            </p>
                                            <p className="text-gray-800">{msg.message_body}</p>
                                        </div>

                                        {msg.response && (
                                            <div className="mt-3 pt-3 border-t border-gray-300 bg-green-50 rounded p-3">
                                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                                    Agent Response ({msg.assigned_to}):
                                                </p>
                                                <p className="text-gray-800">{msg.response}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Responded at:{' '}
                                                    {new Date(msg.responded_at).toLocaleString()}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-2 text-xs text-gray-500">
                                            Urgency: {msg.urgency_level} (Score: {msg.urgency_score})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSimulator;
