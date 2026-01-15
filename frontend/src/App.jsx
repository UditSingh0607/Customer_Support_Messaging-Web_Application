import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MessageDetail from './pages/MessageDetail';
import CustomerSimulator from './pages/CustomerSimulator';
import { initializeSocket } from './services/socket';
import './index.css';

// Initialize Socket.IO connection
initializeSocket();

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/messages/:id" element={<MessageDetail />} />
                <Route path="/customer" element={<CustomerSimulator />} />
            </Routes>
        </Router>
    );
}

export default App;
