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
            <div className="min-h-screen bg-branch-light flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-branch-blue"></div>
                    <p className="mt-4 text-branch-navy font-medium">Connecting to support database...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-branch-light p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium">
                        System Error: Message not found.
                    </div>
                </div>
            </div>
        );
    }

    const { message, customer, history } = data;

    return (
        <div className="min-h-screen bg-branch-light p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 px-5 py-2.5 bg-white text-branch-navy font-bold rounded-lg hover:bg-slate-50 border border-slate-200 transition-all shadow-sm flex items-center gap-2"
                    >
                        <span className="text-lg">←</span> Dashboard
                    </button>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-branch-navy tracking-tight mb-2">
                                    Message <span className="text-branch-gray font-normal">#{message.id}</span>
                                </h1>
                                <p className="text-branch-gray font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-branch-blue"></span>
                                    Customer ID: {message.user_id}
                                </p>
                            </div>
                            <UrgencyBadge
                                level={message.urgency_level}
                                score={message.urgency_score}
                                showScore={true}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                                    message.status
                                )}`}
                            >
                                {message.status.replace('_', ' ')}
                            </span>
                            {message.assigned_to && (
                                <span className="text-sm text-branch-gray font-medium flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <span className="opacity-60 text-lg">👤</span> Assigned to: <strong className="text-branch-navy">{message.assigned_to}</strong>
                                </span>
                            )}
                        </div>

                        {message.urgency_reason && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
                                <p className="text-sm text-branch-navy leading-relaxed">
                                    <strong className="text-branch-gray uppercase tracking-widest text-[10px] mr-2">Urgency Analysis:</strong> {message.urgency_reason}
                                </p>
                            </div>
                        )}

                        <div className="bg-branch-light rounded-xl p-6 border border-slate-100">
                            <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-3">Incoming Message Content</p>
                            <p className="text-branch-navy text-xl leading-relaxed font-medium">{message.message_body}</p>
                            <p className="text-xs text-branch-gray mt-4 font-medium italic">
                                Timestamp: {new Date(message.created_at).toLocaleString()}
                            </p>
                        </div>

                        {message.response && (
                            <div className="mt-6 bg-slate-50 border border-branch-blue border-opacity-20 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-branch-blue"></div>
                                <p className="text-[10px] font-bold text-branch-blue uppercase tracking-widest mb-3">Official Response</p>
                                <p className="text-branch-navy leading-relaxed">{message.response}</p>
                                <p className="text-xs text-branch-gray mt-4 font-medium italic">
                                    Sent by {message.assigned_to} at{' '}
                                    {new Date(message.responded_at).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column - Customer Info */}
                    <div className="lg:col-span-1">
                        <CustomerInfo customer={customer} messageCount={history?.length} />
                    </div>

                    {/* Right Column - Actions and History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Agent Name Input */}
                        {!message.response && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                                <label className="block text-xs font-bold text-branch-navy uppercase tracking-widest mb-4 opacity-70">
                                    Agent Identification
                                </label>
                                <input
                                    type="text"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="Enter your professional name"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-branch-blue focus:border-transparent transition-all placeholder-branch-gray"
                                />
                                {message.status === 'UNREAD' && (
                                    <button
                                        onClick={handleClaim}
                                        className="mt-6 w-full px-6 py-3 bg-branch-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Claim Assignment
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
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <h2 className="text-lg font-bold text-branch-navy mb-6">Interaction History</h2>
                            <MessageHistory messages={history} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;
