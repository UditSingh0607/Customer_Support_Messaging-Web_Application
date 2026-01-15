const db = require('../db');
const { calculateUrgencyScore } = require('./urgencyScorer');

/**
 * Create a new message with urgency calculation
 */
async function createMessage(userId, messageBody) {
    try {
        // Get recent messages from this user for frequency calculation
        const recentMessagesResult = await db.query(
            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );
        const recentMessages = recentMessagesResult.rows;

        // Calculate urgency score
        const urgencyData = await calculateUrgencyScore(
            messageBody,
            userId,
            recentMessages
        );

        // Insert message
        const result = await db.query(
            `INSERT INTO messages 
       (user_id, message_body, urgency_score, urgency_level, urgency_reason, status) 
       VALUES ($1, $2, $3, $4, $5, 'UNREAD') 
       RETURNING *`,
            [
                userId,
                messageBody,
                urgencyData.urgency_score,
                urgencyData.urgency_level,
                urgencyData.urgency_reason,
            ]
        );

        // Update customer total_messages count
        await db.query(
            `INSERT INTO customers (user_id, total_messages) 
       VALUES ($1, 1) 
       ON CONFLICT (user_id) 
       DO UPDATE SET total_messages = customers.total_messages + 1`,
            [userId]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error creating message:', error);
        throw error;
    }
}

/**
 * Get all messages with optional filters
 */
async function getMessages(filters = {}) {
    try {
        let query = 'SELECT * FROM messages WHERE 1=1';
        const params = [];
        let paramCount = 1;

        // Filter by status
        if (filters.status) {
            query += ` AND status = $${paramCount}`;
            params.push(filters.status);
            paramCount++;
        }

        // Filter by urgency level
        if (filters.urgency) {
            query += ` AND urgency_level = $${paramCount}`;
            params.push(filters.urgency);
            paramCount++;
        }

        // Filter by assigned agent
        if (filters.assigned_to) {
            query += ` AND assigned_to = $${paramCount}`;
            params.push(filters.assigned_to);
            paramCount++;
        }

        // Order by urgency score (highest first) and creation time
        query += ' ORDER BY urgency_score DESC, created_at DESC';

        // Add limit if specified
        if (filters.limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
}

/**
 * Get a single message by ID with customer info
 */
async function getMessageById(messageId) {
    try {
        const messageResult = await db.query(
            'SELECT * FROM messages WHERE id = $1',
            [messageId]
        );

        if (messageResult.rows.length === 0) {
            return null;
        }

        const message = messageResult.rows[0];

        // Get customer info
        const customerResult = await db.query(
            'SELECT * FROM customers WHERE user_id = $1',
            [message.user_id]
        );

        // Get message history for this customer
        const historyResult = await db.query(
            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC',
            [message.user_id]
        );

        return {
            message,
            customer: customerResult.rows[0] || null,
            history: historyResult.rows,
        };
    } catch (error) {
        console.error('Error getting message by ID:', error);
        throw error;
    }
}

/**
 * Claim a message (assign to agent)
 */
async function claimMessage(messageId, agentName) {
    try {
        const result = await db.query(
            `UPDATE messages 
       SET assigned_to = $1, status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [agentName, messageId]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error claiming message:', error);
        throw error;
    }
}

/**
 * Respond to a message
 */
async function respondToMessage(messageId, agentName, responseText) {
    try {
        const result = await db.query(
            `UPDATE messages 
       SET response = $1, 
           assigned_to = $2, 
           status = 'RESOLVED', 
           responded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
            [responseText, agentName, messageId]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error responding to message:', error);
        throw error;
    }
}

/**
 * Get messages for a specific customer
 */
async function getCustomerMessages(userId) {
    try {
        const result = await db.query(
            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting customer messages:', error);
        throw error;
    }
}

module.exports = {
    createMessage,
    getMessages,
    getMessageById,
    claimMessage,
    respondToMessage,
    getCustomerMessages,
};
