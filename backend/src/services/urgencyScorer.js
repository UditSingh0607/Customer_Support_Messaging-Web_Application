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
            'loan approved',
            'loan rejected',
            'fraud',
            'unauthorized',
            'hacked',
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
        ],
    },
    MEDIUM: {
        score: 15,
        keywords: ['dispute', 'incorrect', 'update information', 'how to'],
    },
    STANDARD: {
        score: 5,
        keywords: [], // default score
    },
};

// B. Time sensitivity keywords
const TIME_SENSITIVITY = {
    URGENT: { score: 15, keywords: ['immediately', 'urgent', 'asap', 'today'] },
    SOON: { score: 10, keywords: ['soon', 'quickly'] },
    NORMAL: { score: 5, keywords: ['when possible'] },
};

/**
 * Calculate content keyword score
 */
function calculateContentScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    let score = 0;
    let matchedKeywords = [];

    // Check CRITICAL keywords first
    for (const keyword of KEYWORDS.CRITICAL.keywords) {
        if (lowerMessage.includes(keyword)) {
            score = Math.max(score, KEYWORDS.CRITICAL.score);
            matchedKeywords.push(keyword);
        }
    }

    // Check HIGH keywords
    if (score < KEYWORDS.CRITICAL.score) {
        for (const keyword of KEYWORDS.HIGH.keywords) {
            if (lowerMessage.includes(keyword)) {
                score = Math.max(score, KEYWORDS.HIGH.score);
                matchedKeywords.push(keyword);
            }
        }
    }

    // Check MEDIUM keywords
    if (score < KEYWORDS.HIGH.score) {
        for (const keyword of KEYWORDS.MEDIUM.keywords) {
            if (lowerMessage.includes(keyword)) {
                score = Math.max(score, KEYWORDS.MEDIUM.score);
                matchedKeywords.push(keyword);
            }
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
    if (score < TIME_SENSITIVITY.URGENT.score) {
        for (const keyword of TIME_SENSITIVITY.SOON.keywords) {
            if (lowerMessage.includes(keyword)) {
                score = Math.max(score, TIME_SENSITIVITY.SOON.score);
                matchedKeywords.push(keyword);
            }
        }
    }

    // Check NORMAL keywords
    if (score === 0) {
        for (const keyword of TIME_SENSITIVITY.NORMAL.keywords) {
            if (lowerMessage.includes(keyword)) {
                score = TIME_SENSITIVITY.NORMAL.score;
                matchedKeywords.push(keyword);
            }
        }
    }

    return { score, matchedKeywords };
}

/**
 * Calculate message frequency score based on customer history
 */
function calculateFrequencyScore(messageCount, recentMessages) {
    let score = 0;
    const now = new Date();

    // Count messages in last 1 hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const messagesLastHour = recentMessages.filter(
        (msg) => new Date(msg.created_at) > oneHourAgo
    ).length;

    // Count messages in last 24 hours
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const messagesLastDay = recentMessages.filter(
        (msg) => new Date(msg.created_at) > oneDayAgo
    ).length;

    // 3+ messages in last 1 hour → +10
    if (messagesLastHour >= 3) {
        score = 10;
    }
    // 2+ messages in last 24 hours → +7
    else if (messagesLastDay >= 2) {
        score = 7;
    }

    return score;
}

/**
 * Extract and score financial amounts from message
 */
function calculateFinancialAmountScore(messageBody) {
    // Regex to find currency amounts (supports formats like: 10000, 10,000, $10000, ₹10000)
    const amountRegex = /(?:₹|Rs\.?|\$|USD|INR)?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?/gi;
    const matches = messageBody.match(amountRegex);

    if (!matches) {
        return { score: 0, amount: null };
    }

    // Extract numeric values
    const amounts = matches.map((match) => {
        const numStr = match.replace(/[₹Rs.$,\s]/gi, '');
        return parseFloat(numStr);
    });

    // Get the highest amount
    const maxAmount = Math.max(...amounts);

    let score = 0;
    if (maxAmount >= 10000) {
        score = 25;
    } else if (maxAmount >= 1000) {
        score = 15;
    } else if (maxAmount >= 100) {
        score = 10;
    } else if (maxAmount > 0) {
        score = 5;
    }

    return { score, amount: maxAmount };
}

/**
 * Calculate customer tier score
 */
function calculateCustomerTierScore(customerData) {
    // Default all customers → +5
    // In future, this can be enhanced based on customer status, loan history, etc.
    return 5;
}

/**
 * Map total score to urgency level
 */
function mapScoreToLevel(totalScore) {
    if (totalScore >= 80) return 'CRITICAL';
    if (totalScore >= 50) return 'HIGH';
    if (totalScore >= 25) return 'MEDIUM';
    return 'LOW';
}

/**
 * Main function to calculate urgency score
 */
async function calculateUrgencyScore(messageBody, userId, recentMessages = []) {
    const reasons = [];

    // A. Content keywords (0-40)
    const contentResult = calculateContentScore(messageBody);
    const contentScore = contentResult.score;
    if (contentResult.matchedKeywords.length > 0) {
        reasons.push(
            `Content keywords: ${contentResult.matchedKeywords.join(', ')} (+${contentScore})`
        );
    }

    // B. Time sensitivity (0-15)
    const timeResult = calculateTimeSensitivityScore(messageBody);
    const timeScore = timeResult.score;
    if (timeResult.matchedKeywords.length > 0) {
        reasons.push(
            `Time sensitivity: ${timeResult.matchedKeywords.join(', ')} (+${timeScore})`
        );
    }

    // C. Message frequency (0-10)
    const frequencyScore = calculateFrequencyScore(
        recentMessages.length,
        recentMessages
    );
    if (frequencyScore > 0) {
        reasons.push(`High message frequency (+${frequencyScore})`);
    }

    // D. Financial amount (0-25)
    const financialResult = calculateFinancialAmountScore(messageBody);
    const financialScore = financialResult.score;
    if (financialResult.amount) {
        reasons.push(
            `Financial amount: ₹${financialResult.amount} (+${financialScore})`
        );
    }

    // E. Customer tier (default 5)
    const tierScore = calculateCustomerTierScore(null);
    reasons.push(`Customer tier (+${tierScore})`);

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
