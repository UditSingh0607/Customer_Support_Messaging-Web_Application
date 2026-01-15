const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/canned-responses
 * Get all canned responses
 */
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM canned_responses ORDER BY category, title'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting canned responses:', error);
        res.status(500).json({ error: 'Failed to get canned responses' });
    }
});

/**
 * POST /api/canned-responses/:id/use
 * Increment usage count for a canned response
 */
router.post('/:id/use', async (req, res) => {
    try {
        const responseId = parseInt(req.params.id);

        if (isNaN(responseId)) {
            return res.status(400).json({ error: 'Invalid response ID' });
        }

        await db.query(
            'UPDATE canned_responses SET usage_count = usage_count + 1 WHERE id = $1',
            [responseId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating canned response usage:', error);
        res.status(500).json({ error: 'Failed to update usage count' });
    }
});

module.exports = router;
