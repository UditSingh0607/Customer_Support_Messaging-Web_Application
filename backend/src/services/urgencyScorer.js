/**
 * Urgency Scoring Service
 * Calculates urgency score based on multiple weighted dimensions
 */

// A. Content keywords with scores
const KEYWORDS = {
    CRITICAL: {
        score: 40,
        keywords: [
            'loan disbursed',
            'loan disbursement',
            'money not received',
            'approved',
            'rejected',
            'fraud',
            'unauthorized',
            'hacked',
            'stolen',
            'someone used',
            'don\'t recognize',
        ],
    },
    HIGH: {
        score: 25,
        keywords: [
            'account locked',
            'cannot access',
            'payment failed',
            'repayment',
            'overdue',
            'error',
            'crb',
            'batch number',
            'batch no',
            'delayed',
            'disappointed',
            'desperately',
        ],
    },
    MEDIUM: {
        score: 15,
        keywords: [
            'dispute',
            'incorrect',
            'update information',
            'how to',
            'help me',
            'validate',
            'clarify',
            'reason',
            'review',
        ],
    },
    STANDARD: {
        score: 5,
        keywords: [], // default score
    },
};

// B. Time sensitivity keywords
const TIME_SENSITIVITY = {
    URGENT: { score: 15, keywords: ['immediately', 'urgent', 'asap', 'today', 'now', 'right away', 'instantly', 'desperate'] },
    SOON: { score: 10, keywords: ['soon', 'quickly', 'tomorrow'] },
    NORMAL: { score: 5, keywords: ['when possible', 'thanks'] },
};

/**
 * Calculate content keyword score
 */
function calculateContentScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    let score = 0;
    let matchedKeywords = [];

    // Check CRITICAL keywords
    for (const keyword of KEYWORDS.CRITICAL.keywords) {
        if (lowerMessage.includes(keyword)) {
            score = Math.max(score, KEYWORDS.CRITICAL.score);
            matchedKeywords.push(keyword);
        }
    }

    // Check HIGH keywords
    for (const keyword of KEYWORDS.HIGH.keywords) {
        if (lowerMessage.includes(keyword)) {
            // Additive scoring if multiple categories match (capped at 45)
            if (score < KEYWORDS.CRITICAL.score) {
                score = Math.max(score, KEYWORDS.HIGH.score);
            } else if (!matchedKeywords.includes(keyword)) {
                score = Math.min(45, score + 5);
            }
            matchedKeywords.push(keyword);
        }
    }

    // Check MEDIUM keywords
    for (const keyword of KEYWORDS.MEDIUM.keywords) {
        if (lowerMessage.includes(keyword)) {
            if (score === 0) {
                score = KEYWORDS.MEDIUM.score;
            } else if (!matchedKeywords.includes(keyword)) {
                score = Math.min(50, score + 2);
            }
            matchedKeywords.push(keyword);
        }
    }

    // Default score if no keywords matched
    if (score === 0) {
        score = KEYWORDS.STANDARD.score;
    }

    return { score, matchedKeywords };
}

/**
 * Calculate time sensitivity score
 */
function calculateTimeSensitivityScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    let score = 0;
    let matchedKeywords = [];

    // Check URGENT time keywords
    for (const keyword of TIME_SENSITIVITY.URGENT.keywords) {
        if (lowerMessage.includes(keyword)) {
            score = Math.max(score, TIME_SENSITIVITY.URGENT.score);
            matchedKeywords.push(keyword);
        }
    }

    // Check SOON keywords
    for (const keyword of TIME_SENSITIVITY.SOON.keywords) {
        if (lowerMessage.includes(keyword)) {
            if (score === 0) {
                score = TIME_SENSITIVITY.SOON.score;
            } else if (!matchedKeywords.includes(keyword)) {
                score = Math.min(20, score + 5);
            }
            matchedKeywords.push(keyword);
        }
    }

    return { score, matchedKeywords };
}

/**
 * Calculate message frequency score based on customer history
 */
function calculateFrequencyScore(messageCount, recentMessages, currentTimestamp = new Date()) {
    let score = 0;

    // If no recent messages, no frequency bonus
    if (!recentMessages || recentMessages.length === 0) return 0;

    const referenceTime = new Date(currentTimestamp);
    const lastMsgTime = new Date(recentMessages[0].created_at);

    // Calculate time difference in minutes
    const timeDiffMinutes = (referenceTime.getTime() - lastMsgTime.getTime()) / (1000 * 60);

    // If sent within last 30 mins → +10 (indicates high frustration)
    if (timeDiffMinutes > 0 && timeDiffMinutes < 30) {
        score = 10;
    }
    // If sent within last 24 hours → +5
    else if (timeDiffMinutes > 0 && timeDiffMinutes < 1440) {
        score = 5;
    }

    return score;
}

/**
 * Extract and score financial amounts from message
 */
function calculateFinancialAmountScore(messageBody) {
    // Regex to find currency amounts (supports formats like: 10000, 10,000, $10000, ₹10000, Ksh 500)
    const amountRegex = /(?:₹|Rs\.?|\$|USD|INR|Ksh|Sh\.?)\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?/gi;
    const matches = messageBody.match(amountRegex);

    if (!matches) {
        // Check for plain numbers that might be amounts in context
        const plainNumbers = messageBody.match(/\b\d{3,}\b/g);
        if (plainNumbers) {
            const maxPlain = Math.max(...plainNumbers.map(n => parseInt(n)));
            if (maxPlain > 100) return { score: 10, amount: maxPlain };
        }
        return { score: 0, amount: null };
    }

    // Extract numeric values
    const amounts = matches.map((match) => {
        const numStr = match.replace(/[₹Rs.$,KshSh\s]/gi, '');
        return parseFloat(numStr);
    });

    // Get the highest amount
    const maxAmount = Math.max(...amounts);

    let score = 0;
    if (maxAmount >= 20000) {
        score = 30;
    } else if (maxAmount >= 5000) {
        score = 20;
    } else if (maxAmount >= 1000) {
        score = 15;
    } else if (maxAmount > 0) {
        score = 10;
    }

    return { score, amount: maxAmount };
}

/**
 * Calculate customer tier score
 */
function calculateCustomerTierScore(customerData) {
    // Default all customers → +10 (giving more weight to the fact it's a customer)
    return 10;
}

/**
 * Map total score to urgency level
 */
function mapScoreToLevel(totalScore) {
    if (totalScore >= 70) return 'CRITICAL';
    if (totalScore >= 45) return 'HIGH';
    if (totalScore >= 20) return 'MEDIUM';
    return 'LOW';
}

/**
 * Main function to calculate urgency score
 */
async function calculateUrgencyScore(messageBody, userId, recentMessages = [], currentTimestamp = new Date()) {
    const reasons = [];

    // A. Content keywords (0-45)
    const contentResult = calculateContentScore(messageBody);
    const contentScore = contentResult.score;
    if (contentResult.matchedKeywords.length > 0) {
        reasons.push(
            `Content: ${[...new Set(contentResult.matchedKeywords)].join(', ')} (+${contentScore})`
        );
    }

    // B. Time sensitivity (0-20)
    const timeResult = calculateTimeSensitivityScore(messageBody);
    const timeScore = timeResult.score;
    if (timeResult.matchedKeywords.length > 0) {
        reasons.push(
            `Time: ${[...new Set(timeResult.matchedKeywords)].join(', ')} (+${timeScore})`
        );
    }

    // C. Message frequency (0-10)
    const frequencyScore = calculateFrequencyScore(
        recentMessages.length,
        recentMessages,
        currentTimestamp
    );
    if (frequencyScore > 0) {
        reasons.push(`Freq (+${frequencyScore})`);
    }

    // D. Financial amount (0-30)
    const financialResult = calculateFinancialAmountScore(messageBody);
    const financialScore = financialResult.score;
    if (financialResult.amount) {
        reasons.push(
            `Amt: ${financialResult.amount} (+${financialScore})`
        );
    }

    // E. Customer tier (default 10)
    const tierScore = calculateCustomerTierScore(null);
    reasons.push(`Tier (+${tierScore})`);

    // Calculate total score
    const totalScore =
        contentScore + timeScore + frequencyScore + financialScore + tierScore;

    // Map to urgency level
    const urgencyLevel = mapScoreToLevel(totalScore);

    return {
        urgency_score: totalScore,
        urgency_level: urgencyLevel,
        urgency_reason: reasons.join(' | '),
    };
}

module.exports = {
    calculateUrgencyScore,
};
