import { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';

/**
 * Custom hook to manage Socket.IO connection and events
 */
export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = getSocket();
        setSocket(socketInstance);

        const handleConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);

        // Set initial connection state
        setIsConnected(socketInstance.connected);

        return () => {
            socketInstance.off('connect', handleConnect);
            socketInstance.off('disconnect', handleDisconnect);
        };
    }, []);

    return { socket, isConnected };
};

export default useSocket;
