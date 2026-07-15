/**
 * Storage Utilities — honest thin wrappers around plain localStorage.
 *
 * NOTE: These functions write PLAINTEXT to localStorage. There is NO
 * encryption. They were previously named "Encrypted" which was misleading
 * and dangerous if anyone later stored sensitive data assuming encryption.
 *
 * Only non-sensitive values are stored here (a remembered email address and
 * UI theme preferences). Never store secrets, tokens, or passwords with these.
 */

/**
 * Stores a value in localStorage (plaintext, NOT encrypted)
 * @param {string} key - The storage key
 * @param {string} value - The value to store
 */
export const setLocalItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Retrieves a value from localStorage (plaintext, NOT encrypted)
 * @param {string} key - The storage key
 * @returns {string|null} The stored value or null if not found
 */
export const getLocalItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return null;
  }
};

/**
 * Removes an item from localStorage
 * @param {string} key - The storage key
 */
export const removeLocalItem = (key) => {
  localStorage.removeItem(key);
};