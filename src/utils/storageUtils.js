import CryptoJS from 'crypto-js';

// Use a static encryption key for client-side encryption
// In production, this should be derived from user-specific data
const ENCRYPTION_KEY = 'synergy-ems-storage-key-v1';

/**
 * Encrypts and stores a value in localStorage
 * @param {string} key - The storage key
 * @param {string} value - The value to encrypt and store
 */
export const setEncryptedItem = (key, value) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Error encrypting localStorage item:', error);
    // Fallback to plain storage if encryption fails
    localStorage.setItem(key, value);
  }
};

/**
 * Retrieves and decrypts a value from localStorage
 * @param {string} key - The storage key
 * @returns {string|null} The decrypted value or null if not found
 */
export const getEncryptedItem = (key) => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    // Try to decrypt - if it fails, it might be plain text (legacy)
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || encrypted; // Return encrypted if decryption fails (legacy data)
    } catch {
      // If decryption fails, return as-is (might be plain text from before encryption)
      return encrypted;
    }
  } catch (error) {
    console.error('Error decrypting localStorage item:', error);
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
