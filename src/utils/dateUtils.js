export const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Use en-CA for YYYY-MM-DD format which works with date inputs
    return d.toLocaleDateString('en-CA');
};

export const formatDateForDisplay = (date, options = {}) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options
    });
};

export const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const getEndOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};
