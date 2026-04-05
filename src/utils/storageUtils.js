/**
 * Storage Utilities — thin wrappers around localStorage.
 *
 * Previously this module used CryptoJS with a hardcoded key shipped in the
 * client bundle, which provided zero security (the key was visible in DevTools).
 * Replaced with plain localStorage since the only stored value is a
 * non-sensitive remembered email address.
 *
 * The API surface (setEncryptedItem / getEncryptedItem / removeEncryptedItem)
 * is preserved so callers don't need changes.
 */

/**
 * Stores a value in localStorage
 * @param {string} key - The storage key
 * @param {string} value - The value to store
 */
export const setEncryptedItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

/**
 * Retrieves a value from localStorage
 * @param {string} key - The storage key
 * @returns {string|null} The stored value or null if not found
 */
export const getEncryptedItem = (key) => {
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
export const removeEncryptedItem = (key) => {
  localStorage.removeItem(key);
};
