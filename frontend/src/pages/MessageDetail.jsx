import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import CustomerInfo from '../components/CustomerInfo';
import MessageHistory from '../components/MessageHistory';
import CannedResponsePicker from '../components/CannedResponsePicker';
import ReplyBox from '../components/ReplyBox';
import { getStatusColor } from '../utils/urgencyColors';

/**
 * MessageDetail page - view and respond to a specific message
 */
const MessageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agentName, setAgentName] = useState('');
    const [cannedResponse, setCannedResponse] = useState('');

    useEffect(() => {
        fetchMessageData();
    }, [id]);

    const fetchMessageData = async () => {
        try {
            setLoading(true);
            const response = await messagesAPI.getById(id);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching message:', error);
            alert('Failed to load message');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!agentName.trim()) {
            alert('Please enter your name');
            return;
        }

        try {
            await messagesAPI.claim(id, agentName);
            await fetchMessageData();
            alert('Message claimed successfully');
        } catch (error) {
            console.error('Error claiming message:', error);
            alert('Failed to claim message');
        }
    };

    const handleSendResponse = async (responseText) => {
        if (!agentName.trim()) {
            alert('Please enter your name');
            return;
        }

        try {
            await messagesAPI.respond(id, agentName, responseText);
            await fetchMessageData();
            setCannedResponse('');
            alert('Response sent successfully');
        } catch (error) {
            console.error('Error sending response:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading message...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Message not found
                    </div>
                </div>
            </div>
        );
    }

    const { message, customer, history } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-md"
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Message #{message.id}
                                </h1>
                                <p className="text-gray-600">
                                    From Customer #{message.user_id}
                                </p>
                            </div>
                            <UrgencyBadge
                                level={message.urgency_level}
                                score={message.urgency_score}
                                showScore={true}
                            />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    message.status
                                )}`}
                            >
                                {message.status}
                            </span>
                            {message.assigned_to && (
                                <span className="text-sm text-gray-600">
                                    👤 Assigned to: <strong>{message.assigned_to}</strong>
                                </span>
                            )}
                        </div>

                        {message.urgency_reason && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700">
                                    <strong>Urgency Factors:</strong> {message.urgency_reason}
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Customer Message:</p>
                            <p className="text-gray-800 text-lg">{message.message_body}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Received: {new Date(message.created_at).toLocaleString()}
                            </p>
                        </div>

                        {message.response && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-2">Agent Response:</p>
                                <p className="text-gray-800">{message.response}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Responded by {message.assigned_to} at{' '}
                                    {new Date(message.responded_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Customer Info */}
                    <div className="lg:col-span-1">
                        <CustomerInfo customer={customer} messageCount={history?.length} />
                    </div>

                    {/* Right Column - Actions and History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Agent Name Input */}
                        {!message.response && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Name (Agent)
                                </label>
                                <input
                                    type="text"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {message.status === 'UNREAD' && (
                                    <button
                                        onClick={handleClaim}
                                        className="mt-3 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                                    >
                                        Claim This Message
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Canned Responses */}
                        {!message.response && (
                            <CannedResponsePicker onSelect={setCannedResponse} />
                        )}

                        {/* Reply Box */}
                        {!message.response && (
                            <ReplyBox
                                onSend={handleSendResponse}
                                initialValue={cannedResponse}
                            />
                        )}

                        {/* Message History */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <MessageHistory messages={history} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;
