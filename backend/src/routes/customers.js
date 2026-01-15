const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const db = require('../db');

/**
 * GET /api/customers/:id/messages
 * Get all messages for a specific customer
 */
router.get('/:id/messages', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid customer ID' });
        }

        const messages = await messageService.getCustomerMessages(userId);

        // Get customer info
        const customerResult = await db.query(
            'SELECT * FROM customers WHERE user_id = $1',
            [userId]
        );

        res.json({
            customer: customerResult.rows[0] || null,
            messages,
        });
    } catch (error) {
        console.error('Error getting customer messages:', error);
        res.status(500).json({ error: 'Failed to get customer messages' });
    }
});

module.exports = router;
