/**
 * Urgency Scoring Service - Version 2.1 (Scoring 2.1)
 * Recalibrated for better distribution and higher sensitivity to Branch support needs
 */

// A. Content intent phrases
const INTENT_PHRASES = {
    CRITICAL: {
        score: 45, // Boosted from 40
        phrases: [
            'someone used',
            'identity theft',
            'unauthorized transaction',
            'money not received',
            'loan disbursed but',
            'no money sent',
            'never received',
            'not received',
            'hacked',
            'security breach',
            'stolen'
        ],
    },
    HIGH: {
        score: 30, // Boosted from 25
        keywords: [
            'batch number',
            'batch no',
            'crb',
            'clearance',
            'account locked',
            'cannot access',
            'payment failed',
            'repayment',
            'overdue',
            'rejected',
            'denied',
            'delayed',
            'error',
            'urgently',
            'desperately'
        ],
    },
    MEDIUM: {
        score: 15,
        keywords: [
            'approved',
            'dispute',
            'incorrect',
            'update',
            'how to',
            'help me',
            'reason',
            'review',
            'status',
            'validat'
        ],
    },
    STANDARD: {
        score: 5,
        keywords: [],
    },
};

// B. De-escalation signals (Negative points)
const DEESCALATION = [
    'not urgent',
    'no rush',
    'whenever you can',
    'no hurry',
    'just checking',
    'fyi'
];

// C. Time sensitivity keywords
const TIME_SENSITIVITY = {
    URGENT: { score: 15, keywords: ['immediately', 'urgent', 'asap', 'today', 'now', 'right away', 'instantly', 'desperate'] },
    SOON: { score: 10, keywords: ['soon', 'quickly', 'tomorrow'] },
};

// D. Money context filters
const MONEY_CONTEXT = ['amount', 'paid', 'charged', 'debited', 'credited', 'balance', 'loan', 'repayment', 'money', 'cash', 'ksh', 'sh'];

/**
 * Calculate content score based on intent phrases and keywords
 */
function calculateContentScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    let score = 0;
    let matchedTerms = [];

    // Check CRITICAL phrases
    for (const phrase of INTENT_PHRASES.CRITICAL.phrases) {
        if (lowerMessage.includes(phrase)) {
            score = Math.max(score, INTENT_PHRASES.CRITICAL.score);
            matchedTerms.push(phrase);
        }
    }

    // Check HIGH keywords (with word boundaries)
    for (const keyword of INTENT_PHRASES.HIGH.keywords) {
        if (new RegExp(`\\b${keyword}\\b`).test(lowerMessage)) {
            if (score < INTENT_PHRASES.CRITICAL.score) {
                score = Math.max(score, INTENT_PHRASES.HIGH.score);
            } else if (!matchedTerms.includes(keyword)) {
                score = Math.min(55, score + 10); // More aggressive additive scoring
            }
            matchedTerms.push(keyword);
        }
    }

    // Check MEDIUM keywords
    for (const keyword of INTENT_PHRASES.MEDIUM.keywords) {
        if (new RegExp(`\\b${keyword}\\b`).test(lowerMessage)) {
            if (score === 0) {
                score = INTENT_PHRASES.MEDIUM.score;
            } else if (!matchedTerms.includes(keyword)) {
                score = Math.min(60, score + 5);
            }
            matchedTerms.push(keyword);
        }
    }

    if (score === 0) score = INTENT_PHRASES.STANDARD.score;

    return { score, matchedTerms };
}

/**
 * Calculate de-escalation penalty
 */
function calculateDeescalationPenalty(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    for (const phrase of DEESCALATION) {
        if (lowerMessage.includes(phrase)) {
            return { penalty: -20, phrase }; // Slightly higher penalty to neutralize louder messages
        }
    }
    return { penalty: 0, phrase: null };
}

/**
 * Calculate time sensitivity score
 */
function calculateTimeSensitivityScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();

    // Skip time sensitivity if de-escalated
    const deescalation = calculateDeescalationPenalty(messageBody);
    if (deescalation.penalty < 0) return { score: 0, matched: [] };

    let score = 0;
    let matched = [];

    for (const keyword of TIME_SENSITIVITY.URGENT.keywords) {
        if (new RegExp(`\\b${keyword}\\b`).test(lowerMessage)) {
            score = Math.max(score, TIME_SENSITIVITY.URGENT.score);
            matched.push(keyword);
        }
    }

    if (score < 15) {
        for (const keyword of TIME_SENSITIVITY.SOON.keywords) {
            if (new RegExp(`\\b${keyword}\\b`).test(lowerMessage)) {
                score = Math.max(score, TIME_SENSITIVITY.SOON.score);
                matched.push(keyword);
            }
        }
    }

    return { score, matched };
}

/**
 * Calculate message frequency based on burst count in last hour
 */
function calculateFrustrationScore(recentMessages, currentTimestamp = new Date()) {
    if (!recentMessages || recentMessages.length < 1) return 0;

    const now = new Date(currentTimestamp).getTime();
    const lastHourCount = recentMessages.filter(m => {
        const t = new Date(m.created_at).getTime();
        return (now - t) < (60 * 60 * 1000) && (now - t) >= 0;
    }).length;

    if (lastHourCount >= 3) return 20; // Boosted frequency score
    if (lastHourCount >= 1) return 10;
    return 0;
}

/**
 * Context-aware financial amount scoring
 */
function calculateFinancialScore(messageBody) {
    const lowerMessage = messageBody.toLowerCase();
    const hasContext = MONEY_CONTEXT.some(k => lowerMessage.includes(k));

    const amountRegex = /(?:₹|Rs\.?|\$|USD|INR|Ksh|Sh\.?)\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?/gi;
    const matches = messageBody.match(amountRegex);

    let maxAmount = 0;
    if (matches) {
        const amounts = matches.map(m => parseFloat(m.replace(/[₹Rs.$,KshSh\s]/gi, '')));
        maxAmount = Math.max(...amounts);
    } else if (hasContext) {
        const plainNumbers = messageBody.match(/\b\d{3,}\b/g);
        if (plainNumbers) {
            maxAmount = Math.max(...plainNumbers.map(n => parseInt(n)));
        }
    }

    if (maxAmount === 0) return { score: 0, amount: null };

    let score = 0;
    if (maxAmount >= 20000) score = 30;
    else if (maxAmount >= 5000) score = 25;
    else if (maxAmount >= 1000) score = 20;
    else if (maxAmount > 0) score = 10;

    return { score, amount: maxAmount };
}

/**
 * Conditional Tier scoring
 */
function calculateTierScore(customerTier) {
    if (!customerTier) return 0;
    const tier = customerTier.toUpperCase();
    if (tier === 'VIP') return 10;
    if (tier === 'STANDARD') return 5;
    return 0;
}

/**
 * Map total score to level
 */
function mapScoreToLevel(totalScore) {
    if (totalScore >= 60) return 'CRITICAL'; // Lowered from 75
    if (totalScore >= 40) return 'HIGH';     // Lowered from 50
    if (totalScore >= 15) return 'MEDIUM';   // Lowered from 25
    return 'LOW';
}

/**
 * Main calculation function
 */
async function calculateUrgencyScore(messageBody, userId, recentMessages = [], currentTimestamp = new Date(), customerTier = 'STANDARD') {
    const reasons = [];

    // 1. Content (0-55+)
    const content = calculateContentScore(messageBody);
    if (content.matchedTerms.length > 0) {
        reasons.push(`Intent: ${[...new Set(content.matchedTerms)].join(', ')} (+${content.score})`);
    }

    // 2. De-escalation (Negative)
    const deescalation = calculateDeescalationPenalty(messageBody);
    if (deescalation.penalty < 0) {
        reasons.push(`Deescalation: ${deescalation.phrase} (${deescalation.penalty})`);
    }

    // 3. Time (0-15)
    const time = calculateTimeSensitivityScore(messageBody);
    if (time.matched.length > 0) {
        reasons.push(`Time: ${[...new Set(time.matched)].join(', ')} (+${time.score})`);
    }

    // 4. Frustration/Freq (0-20)
    const freqScore = calculateFrustrationScore(recentMessages, currentTimestamp);
    if (freqScore > 0) {
        reasons.push(`Burst Activity (+${freqScore})`);
    }

    // 5. Financial (0-30)
    const financial = calculateFinancialScore(messageBody);
    if (financial.amount) {
        reasons.push(`Money Context: ₹${financial.amount} (+${financial.score})`);
    }

    // 6. Tier (0-10)
    const tierScore = calculateTierScore(customerTier);
    if (tierScore > 0) {
        reasons.push(`Tier: ${customerTier} (+${tierScore})`);
    }

    // Final total
    const totalScore = Math.max(0, Math.min(100,
        content.score + deescalation.penalty + time.score + freqScore + financial.score + tierScore
    ));

    // Urgency Level
    const urgencyLevel = mapScoreToLevel(totalScore);

    // Confidence Metric
    const signalCount = [content.score > 5, time.score > 0, freqScore > 0, financial.score > 0].filter(Boolean).length;
    const confidence = signalCount >= 3 ? 'HIGH' : signalCount === 2 ? 'MEDIUM' : 'LOW';

    return {
        urgency_score: totalScore,
        urgency_level: urgencyLevel,
        urgency_reason: reasons.join(' | '),
        confidence
    };
}

module.exports = { calculateUrgencyScore };
