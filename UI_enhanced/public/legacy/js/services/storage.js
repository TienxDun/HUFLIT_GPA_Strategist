/**
 * LocalStorage wrapper with error handling
 * Provides safe storage operations with fallback
 */

import { STORAGE_KEYS } from '../core/app-constants.js';

/**
 * Get item from localStorage
 * @template T
 * @param {string} key - Storage key
 * @param {T} [defaultValue=null] - Default value if not found
 * @returns {T|null} Stored value or default
 */
export function getItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Storage get error for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || 
        (error.message && error.message.includes('quota'))) {
      console.error('Storage quota exceeded');
      cleanupOldData();
    } else {
      console.error(`Storage set error for key "${key}":`, error);
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Storage remove error for key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export function clear() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

/**
 * Get all storage keys
 * @returns {string[]} Array of keys
 */
export function getKeys() {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Storage keys error:', error);
    return [];
  }
}

/**
 * Get storage size in bytes
 * @returns {number} Total size in bytes
 */
export function getSize() {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length * 2;
      }
    }
    return total;
  } catch (error) {
    console.error('Storage size error:', error);
    return 0;
  }
}

/**
 * Check if storage is available
 * @returns {boolean}
 */
export function isAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Cleanup old/unused data to free space
 * @private
 */
function cleanupOldData() {
  const nonEssentialKeys = [
    STORAGE_KEYS.HAS_SEEN_GUIDE,
    STORAGE_KEYS.COURSE_GRADE_STATE,
    STORAGE_KEYS.SCALE_ORDER
  ];
  
  for (const key of nonEssentialKeys) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore errors
    }
  }
}

/**
 * Storage utility object
 */
const Storage = {
  get: getItem,
  set: setItem,
  remove: removeItem,
  clear,
  keys: getKeys,
  size: getSize,
  isAvailable
};

export default Storage;
