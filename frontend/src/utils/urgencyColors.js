/**
 * Get color classes for urgency levels
 */
export const getUrgencyColor = (level) => {
    switch (level) {
        case 'CRITICAL':
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-500',
                badge: 'bg-red-500',
            };
        case 'HIGH':
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                border: 'border-orange-500',
                badge: 'bg-orange-500',
            };
        case 'MEDIUM':
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                border: 'border-yellow-500',
                badge: 'bg-yellow-500',
            };
        case 'LOW':
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                border: 'border-green-500',
                badge: 'bg-green-500',
            };
        default:
            return {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-500',
                badge: 'bg-gray-500',
            };
    }
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
    switch (status) {
        case 'UNREAD':
            return 'bg-blue-100 text-blue-800';
        case 'IN_PROGRESS':
            return 'bg-purple-100 text-purple-800';
        case 'RESOLVED':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};
