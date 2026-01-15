const fs = require('fs');
const csv = require('csv-parser');
const db = require('../db');
const { calculateUrgencyScore } = require('../services/urgencyScorer');

/**
 * Import messages from Branch CSV file
 * Expected CSV format: User ID,Timestamp (UTC),Message Body
 */
async function importCSV(filePath) {
    const messages = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                messages.push(row);
            })
            .on('end', async () => {
                console.log(`📄 CSV file parsed. Found ${messages.length} messages.`);

                let successCount = 0;
                let errorCount = 0;

                for (const msg of messages) {
                    try {
                        // Parse CSV columns (Branch format)
                        const userId = parseInt(msg['User ID']);
                        const timestamp = msg['Timestamp (UTC)'];
                        const messageBody = msg['Message Body'];

                        if (!userId || !messageBody) {
                            console.error('⚠️  Skipping invalid row:', msg);
                            errorCount++;
                            continue;
                        }

                        // Get recent messages from this user for frequency calculation
                        const recentMessagesResult = await db.query(
                            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
                            [userId]
                        );
                        const recentMessages = recentMessagesResult.rows;

                        // Simulate a tier for this customer during historical import
                        // (Assigning some as VIP for demonstration purposes)
                        const tier = userId % 7 === 0 ? 'VIP' : 'STANDARD';

                        // Calculate urgency score
                        const urgencyData = await calculateUrgencyScore(
                            messageBody,
                            userId,
                            recentMessages,
                            timestamp, // Pass the CSV timestamp
                            tier
                        );

                        // Insert message with provided timestamp and confidence
                        await db.query(
                            `INSERT INTO messages 
               (user_id, message_body, urgency_score, urgency_level, urgency_reason, status, created_at, confidence) 
               VALUES ($1, $2, $3, $4, $5, 'UNREAD', $6, $7)`,
                            [
                                userId,
                                messageBody,
                                urgencyData.urgency_score,
                                urgencyData.urgency_level,
                                urgencyData.urgency_reason,
                                timestamp, // Use timestamp from CSV
                                urgencyData.confidence,
                            ]
                        );

                        // Insert or update customer total_messages count and tier
                        await db.query(
                            `INSERT INTO customers (user_id, total_messages, tier) 
               VALUES ($1, 1, $2) 
               ON CONFLICT (user_id) 
               DO UPDATE SET total_messages = customers.total_messages + 1, tier = $2`,
                            [userId, tier]
                        );

                        successCount++;
                        console.log(`✅ Imported message ${successCount}/${messages.length}`);
                    } catch (error) {
                        console.error('❌ Error importing message:', error);
                        errorCount++;
                    }
                }

                console.log(`
╔════════════════════════════════════════════╗
║  📊 CSV Import Complete                    ║
║  ✅ Success: ${successCount.toString().padEnd(28)} ║
║  ❌ Errors: ${errorCount.toString().padEnd(29)} ║
╚════════════════════════════════════════════╝
        `);

                resolve({ successCount, errorCount });
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Run import if called directly
if (require.main === module) {
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('Usage: node importCSV.js <path-to-csv-file>');
        process.exit(1);
    }

    importCSV(filePath)
        .then(() => {
            console.log('Import completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Import failed:', error);
            process.exit(1);
        });
}

module.exports = { importCSV };
