const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const messagesRouter = require('./routes/messages');
const customersRouter = require('./routes/customers');
const cannedResponsesRouter = require('./routes/cannedResponses');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/messages', messagesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/canned-responses', cannedResponsesRouter);

// Initialize Socket.IO
initializeSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║  🚀 Branch Support Backend Server         ║
║  📡 Server running on port ${PORT}           ║
║  🌐 WebSocket ready for connections        ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
