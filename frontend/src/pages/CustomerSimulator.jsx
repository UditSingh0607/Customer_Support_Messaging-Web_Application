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
        <div className="min-h-screen bg-branch-light p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 px-6 py-2.5 bg-white text-branch-navy font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        ← Back to Agent Command Center
                    </button>

                    <h1 className="text-4xl font-black text-branch-navy tracking-tight mb-3">
                        Customer <span className="text-branch-blue">Simulator</span>
                    </h1>
                    <p className="text-branch-gray font-medium text-lg max-w-lg mx-auto">
                        Utility for generating synthetic customer interactions and testing escalation protocols.
                    </p>
                </div>

                {/* Message Form */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-10">
                    <h2 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-8 opacity-70">
                        Signal Generator
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-branch-navy uppercase tracking-widest mb-3">
                                Target Client Identifier
                            </label>
                            <input
                                type="number"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter Target ID (e.g., 1001)"
                                className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-branch-blue focus:border-transparent transition-all bg-slate-50 text-branch-navy font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-branch-navy uppercase tracking-widest mb-3">
                                Payload Content
                            </label>
                            <textarea
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                placeholder="Enter synthetic customer message payload..."
                                rows={5}
                                className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-branch-blue focus:border-transparent resize-none bg-slate-50 text-branch-navy leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="w-full px-8 py-4 bg-branch-navy text-white font-black uppercase tracking-widest rounded-xl hover:bg-branch-slate disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                        >
                            {sending ? 'Transmitting...' : 'Dispatch Signal'}
                        </button>
                    </div>
                </div>

                {/* Example Messages */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-10">
                    <h2 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-6 opacity-70">
                        Template Library
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {exampleMessages.map((msg, index) => (
                            <button
                                key={index}
                                onClick={() => setMessageBody(msg)}
                                className="w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-branch-blue hover:shadow-md transition-all group"
                            >
                                <p className="text-sm text-branch-navy font-medium group-hover:text-branch-blue">{msg}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customer Messages History */}
                {userId && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                        <h2 className="text-xs font-bold text-branch-navy uppercase tracking-widest mb-8 opacity-70">
                            Transmission Log (Client #{userId})
                        </h2>

                        {loadingMessages ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-branch-blue"></div>
                                <p className="mt-4 text-branch-gray font-bold uppercase tracking-widest text-xs">Accessing Logs...</p>
                            </div>
                        ) : customerMessages.length === 0 ? (
                            <p className="text-branch-gray text-center py-12 font-medium italic">
                                No historical data found for this identifier.
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {customerMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="border border-slate-100 bg-slate-50 rounded-xl p-6 transition-all hover:bg-white hover:border-branch-blue hover:shadow-sm"
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
                                                {new Date(msg.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-[10px] font-bold text-branch-gray uppercase tracking-widest mb-2 opacity-60">
                                                CLIENT_PAYLOAD
                                            </p>
                                            <p className="text-branch-navy font-medium">{msg.message_body}</p>
                                        </div>

                                        {msg.response && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 border-opacity-50 bg-white bg-opacity-50 rounded-b-xl -mx-6 -mb-6 px-6 pb-6">
                                                <p className="text-[10px] font-bold text-branch-blue uppercase tracking-widest mb-2">
                                                    SUPPORT_RESPONSE <span className="text-branch-gray font-normal">by {msg.assigned_to}</span>
                                                </p>
                                                <p className="text-branch-slate text-sm leading-relaxed">{msg.response}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 text-[10px] font-black text-branch-gray uppercase tracking-tighter flex gap-4">
                                            <span>PRIORITY: {msg.urgency_level}</span>
                                            <span>VECTOR_SCORE: {msg.urgency_score}</span>
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
