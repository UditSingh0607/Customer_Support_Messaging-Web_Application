import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Messages API
export const messagesAPI = {
    // Create a new message
    create: (userId, messageBody) =>
        api.post('/api/messages', { user_id: userId, message_body: messageBody }),

    // Get all messages with optional filters
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.urgency) params.append('urgency', filters.urgency);
        if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
        if (filters.limit) params.append('limit', filters.limit);

        return api.get(`/api/messages?${params.toString()}`);
    },

    // Get a single message by ID
    getById: (id) => api.get(`/api/messages/${id}`),

    // Claim a message
    claim: (id, agentName) =>
        api.put(`/api/messages/${id}/claim`, { agent_name: agentName }),

    // Respond to a message
    respond: (id, agentName, responseText) =>
        api.post(`/api/messages/${id}/respond`, {
            agent_name: agentName,
            response_text: responseText,
        }),

    // Search messages
    search: (query) => api.get(`/api/messages/search?q=${encodeURIComponent(query)}`),
};

// Customers API
export const customersAPI = {
    // Get customer messages
    getMessages: (userId) => api.get(`/api/customers/${userId}/messages`),
};

// Canned Responses API
export const cannedResponsesAPI = {
    // Get all canned responses
    getAll: () => api.get('/api/canned-responses'),

    // Mark canned response as used
    markUsed: (id) => api.post(`/api/canned-responses/${id}/use`),
};

export default api;
