import { useState, useEffect, useCallback } from 'react';
import { messagesAPI } from '../services/api';
import { useSocket } from './useSocket';

/**
 * Custom hook to manage messages with real-time updates
 */
export const useMessages = (filters = {}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { socket } = useSocket();

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await messagesAPI.getAll(filters);
            setMessages(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            console.log('New message received:', message);
            setMessages((prev) => [message, ...prev]);
        };

        const handleMessageUpdated = (message) => {
            console.log('Message updated:', message);
            setMessages((prev) =>
                prev.map((msg) => (msg.id === message.id ? message : msg))
            );
        };

        const handleMessageResponded = (message) => {
            console.log('Message responded:', message);
            setMessages((prev) =>
                prev.map((msg) => (msg.id === message.id ? message : msg))
            );
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_updated', handleMessageUpdated);
        socket.on('message_responded', handleMessageResponded);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_updated', handleMessageUpdated);
            socket.off('message_responded', handleMessageResponded);
        };
    }, [socket]);

    return {
        messages,
        loading,
        error,
        refetch: fetchMessages,
    };
};

export default useMessages;
