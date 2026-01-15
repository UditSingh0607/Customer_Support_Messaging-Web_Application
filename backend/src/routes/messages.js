const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const searchService = require('../services/searchService');

/**
 * POST /api/messages
 * Create a new message
 */
router.post('/', async (req, res) => {
    try {
        const { user_id, message_body } = req.body;

        if (!user_id || !message_body) {
            return res.status(400).json({
                error: 'user_id and message_body are required',
            });
        }

        const message = await messageService.createMessage(user_id, message_body);

        // Emit socket event for new message
        const io = req.app.get('io');
        if (io) {
            io.emit('new_message', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Failed to create message' });
    }
});

/**
 * GET /api/messages
 * Get all messages with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            urgency: req.query.urgency,
            assigned_to: req.query.assigned_to,
            limit: req.query.limit ? parseInt(req.query.limit) : null,
        };

        const messages = await messageService.getMessages(filters);
        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

/**
 * GET /api/messages/search
 * Search messages by text or customer ID
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Search query (q) is required' });
        }

        const results = await searchService.combinedSearch(q);
        res.json(results);
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({ error: 'Failed to search messages' });
    }
});

/**
 * GET /api/messages/:id
 * Get a single message with customer info and history
 */
router.get('/:id', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);

        if (isNaN(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        const data = await messageService.getMessageById(messageId);

        if (!data) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error getting message:', error);
        res.status(500).json({ error: 'Failed to get message' });
    }
});

/**
 * PUT /api/messages/:id/claim
 * Claim a message (assign to agent)
 */
router.put('/:id/claim', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const { agent_name } = req.body;

        if (isNaN(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        if (!agent_name) {
            return res.status(400).json({ error: 'agent_name is required' });
        }

        const message = await messageService.claimMessage(messageId, agent_name);

        // Emit socket event for message update
        const io = req.app.get('io');
        if (io) {
            io.emit('message_updated', message);
        }

        res.json(message);
    } catch (error) {
        console.error('Error claiming message:', error);
        res.status(500).json({ error: 'Failed to claim message' });
    }
});

/**
 * POST /api/messages/:id/respond
 * Respond to a message
 */
router.post('/:id/respond', async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const { agent_name, response_text } = req.body;

        if (isNaN(messageId)) {
            return res.status(400).json({ error: 'Invalid message ID' });
        }

        if (!agent_name || !response_text) {
            return res.status(400).json({
                error: 'agent_name and response_text are required',
            });
        }

        const message = await messageService.respondToMessage(
            messageId,
            agent_name,
            response_text
        );

        // Emit socket event for message response
        const io = req.app.get('io');
        if (io) {
            io.emit('message_responded', message);
        }

        res.json(message);
    } catch (error) {
        console.error('Error responding to message:', error);
        res.status(500).json({ error: 'Failed to respond to message' });
    }
});

module.exports = router;
