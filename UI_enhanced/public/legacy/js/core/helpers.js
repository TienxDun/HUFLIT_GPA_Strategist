/**
 * Common Helper Functions
 * Shared utilities used across the application
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {*} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
  if (text == null) return '';
  
  const str = String(text);
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce function with configurable delay
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format number with fixed decimals
 * @param {number} num - Number to format
 * @param {number} [decimals=2] - Decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '';
  return Number(num).toFixed(decimals);
}

/**
 * Detect mobile device
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
