import { formatDistanceToNow, format, isPast } from 'date-fns';

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        return 'Unknown';
    }
};

/**
 * Format a date as absolute time (e.g., "Dec 26, 2025 6:05 PM")
 */
export const formatAbsoluteTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, 'MMM dd, yyyy h:mm a');
    } catch (error) {
        return 'Unknown';
    }
};

/**
 * Calculate time remaining until a future date
 * Returns null if date is in the past
 */
export const getTimeRemaining = (date: string | Date): string | null => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isPast(dateObj)) {
            return null;
        }
        return formatDistanceToNow(dateObj, { addSuffix: false });
    } catch (error) {
        return null;
    }
};

/**
 * Calculate countdown in seconds until a future date
 * Returns 0 if date is in the past
 */
export const getCountdownSeconds = (date: string | Date): number => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diff = dateObj.getTime() - now.getTime();
        return diff > 0 ? Math.floor(diff / 1000) : 0;
    } catch (error) {
        return 0;
    }
};

/**
 * Format seconds into human-readable countdown (e.g., "2h 15m 30s")
 */
export const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
};

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Parse JSON string safely
 */
export const safeJsonParse = <T = any>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json);
    } catch (error) {
        return fallback;
    }
};

/**
 * Get status color based on boolean value
 */
export const getStatusColor = (isActive: boolean): string => {
    return isActive ? 'text-green-500' : 'text-red-500';
};

/**
 * Get status badge color classes
 */
export const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        denied: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Format violation type to human-readable text
 */
export const formatViolationType = (type: string): string => {
    const typeMap: Record<string, string> = {
        blocked_app_attempt: 'Blocked App Access Attempt',
        blocked_url_attempt: 'Blocked URL Access Attempt',
        uninstall_attempt: 'App Uninstall Attempt',
        settings_change_attempt: 'Settings Change Attempt',
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format request type to human-readable text
 */
export const formatRequestType = (type: string): string => {
    const typeMap: Record<string, string> = {
        disable_restriction: 'Disable Restriction',
        uninstall_app: 'Uninstall App',
        change_settings: 'Change Settings',
    };
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
