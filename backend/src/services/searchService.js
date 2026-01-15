const db = require('../db');

/**
 * Search messages using PostgreSQL full-text search
 */
async function searchMessages(searchQuery) {
    try {
        // Use PostgreSQL full-text search with GIN index
        const result = await db.query(
            `SELECT *, 
              ts_rank(to_tsvector('english', message_body), plainto_tsquery('english', $1)) as rank
       FROM messages 
       WHERE to_tsvector('english', message_body) @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC, created_at DESC
       LIMIT 50`,
            [searchQuery]
        );

        return result.rows;
    } catch (error) {
        console.error('Error searching messages:', error);
        throw error;
    }
}

/**
 * Search messages by customer ID
 */
async function searchByCustomerId(userId) {
    try {
        const result = await db.query(
            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error('Error searching by customer ID:', error);
        throw error;
    }
}

/**
 * Combined search - searches both message text and customer ID
 */
async function combinedSearch(query) {
    try {
        // Try to parse as customer ID (number)
        const userId = parseInt(query);

        if (!isNaN(userId)) {
            // If it's a valid number, search by customer ID
            return await searchByCustomerId(userId);
        } else {
            // Otherwise, do full-text search
            return await searchMessages(query);
        }
    } catch (error) {
        console.error('Error in combined search:', error);
        throw error;
    }
}

module.exports = {
    searchMessages,
    searchByCustomerId,
    combinedSearch,
};
