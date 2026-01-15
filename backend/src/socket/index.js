/**
 * Socket.IO event handlers
 */

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('✅ New client connected:', socket.id);

        // Handle agent joining
        socket.on('agent_join', (agentName) => {
            console.log(`Agent ${agentName} joined`);
            socket.agentName = agentName;
            socket.broadcast.emit('agent_joined', { agentName });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
            if (socket.agentName) {
                socket.broadcast.emit('agent_left', { agentName: socket.agentName });
            }
        });

        // Handle typing indicator
        socket.on('typing', (data) => {
            socket.broadcast.emit('agent_typing', data);
        });
    });

    console.log('✅ Socket.IO initialized');
}

module.exports = { initializeSocket };
