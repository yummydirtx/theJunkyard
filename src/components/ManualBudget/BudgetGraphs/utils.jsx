/**
 * Generates a random color in HSL format
 */
export const generateRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(60 + Math.random() * 40);
    const l = Math.floor(40 + Math.random() * 30);
    return `hsl(${h}, ${s}%, ${l}%)`;
};

/**
 * Formats a number as USD currency
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

/**
 * Validates if a string is in YYYY-MM format
 */
export const isValidMonth = (month) => {
    return month && /^\d{4}-\d{2}$/.test(month);
};
