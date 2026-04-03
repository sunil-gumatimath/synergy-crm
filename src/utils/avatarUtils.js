/**
 * Avatar utility functions
 * Generates initials-based avatars with gender-appropriate colors
 */

// Gender-based color schemes
const GENDER_COLORS = {
    male: {
        bg: '#3b82f6',      // Blue
        bgLight: '#dbeafe',
        text: '#1e40af'
    },
    female: {
        bg: '#ec4899',      // Pink
        bgLight: '#fce7f3',
        text: '#be185d'
    },
    other: {
        bg: '#8b5cf6',      // Purple (neutral)
        bgLight: '#ede9fe',
        text: '#6d28d9'
    }
};

/**
 * Get initials from a full name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Get avatar colors based on gender
 * @param {string} gender - 'male', 'female', or 'other'
 * @returns {Object} Color object with bg, bgLight, and text colors
 */
export const getAvatarColors = (gender) => {
    return GENDER_COLORS[gender] || GENDER_COLORS.other;
};

/**
 * Generate inline styles for avatar
 * @param {string} gender - 'male', 'female', or 'other'
 * @param {boolean} light - Use light background variant
 * @returns {Object} React style object
 */
export const getAvatarStyle = (gender, light = false) => {
    const colors = getAvatarColors(gender);
    return {
        backgroundColor: light ? colors.bgLight : colors.bg,
        color: light ? colors.text : '#ffffff'
    };
};

/**
 * Generate SVG data URL for initials avatar
 * @param {string} name - Full name
 * @param {string} gender - 'male', 'female', or 'other'
 * @returns {string} Data URL for SVG image
 */
export const generateAvatarSvg = (name, gender = 'other') => {
    const initials = getInitials(name);
    const colors = getAvatarColors(gender);

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="${colors.bg}"/>
      <text x="50" y="50" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="central">${initials}</text>
    </svg>
  `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default {
    getInitials,
    getAvatarColors,
    getAvatarStyle,
    generateAvatarSvg,
    GENDER_COLORS
};
