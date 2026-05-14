/**
 * Template Utilities
 * Safe HTML templating with XSS protection
 */

import { escapeHtml as escapeHtmlHelper } from '../../core/helpers.js';

// Re-export from helpers for backward compatibility
export { escapeHtmlHelper as escapeHtml };

/**
 * Create a DOM element from HTML string
 * @param {string} html - HTML string
 * @returns {Element} Created element
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/**
 * Create a document fragment from HTML string
 * @param {string} html - HTML string
 * @returns {DocumentFragment}
 */
export function createFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

/**
 * Template literal tag with automatic HTML escaping
 * Use ${raw(value)} to skip escaping
 * 
 * @param {string[]} strings - Template strings
 * @param {...*} values - Template values
 * @returns {string} Processed HTML string
 * 
 * @example
 * const name = '<script>alert("xss")</script>';
 * const html = html`<div>${name}</div>`; // Escaped
 * const html2 = html`<div>${raw('<b>Bold</b>')}</div>`; // Not escaped
 */
export function html(strings, ...values) {
  const result = strings.reduce((acc, str, i) => {
    const value = values[i];
    
    if (value === undefined || value === null) {
      return acc + str;
    }
    
    // Handle RawHtml objects (check by property to avoid instanceof issues)
    if (value && typeof value === 'object' && value._isRawHtml === true) {
      return acc + str + value.content;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return acc + str + value.map(v => 
        (v && typeof v === 'object' && v._isRawHtml === true) ? v.content : escapeHtmlHelper(v)
      ).join('');
    }
    
    // Default: escape
    return acc + str + escapeHtmlHelper(value);
  }, '');
  
  return String(result);
}

/**
 * Raw HTML wrapper - marks content as safe HTML
 */
class RawHtml {
  constructor(content) {
    this.content = String(content);
    this._isRawHtml = true;
  }
}

/**
 * Mark string as raw HTML (won't be escaped)
 * @param {string} content - HTML content
 * @returns {RawHtml} RawHtml object
 */
export function raw(content) {
  // If already a RawHtml, return as-is
  if (content && typeof content === 'object' && content._isRawHtml === true) {
    return content;
  }
  // If null/undefined, return empty RawHtml
  if (content == null) {
    return new RawHtml('');
  }
  return new RawHtml(String(content));
}

/**
 * Join multiple HTML strings
 * @param {string[]} items - Array of HTML strings
 * @param {string} [separator=''] - Separator
 * @returns {RawHtml} Combined HTML
 */
export function joinHtml(items, separator = '') {
  return raw(items.join(separator));
}

/**
 * Conditional rendering helper
 * @param {boolean} condition - Condition to check
 * @param {string} ifTrue - HTML if true
 * @param {string} [ifFalse=''] - HTML if false
 * @returns {RawHtml} Result HTML
 */
export function when(condition, ifTrue, ifFalse = '') {
  return raw(condition ? ifTrue : ifFalse);
}

/**
 * Map array to HTML strings
 * @param {Array} items - Array to map
 * @param {Function} fn - Mapper function
 * @returns {RawHtml} Combined HTML
 */
export function mapHtml(items, fn) {
  if (!Array.isArray(items)) return raw('');
  return raw(items.map(fn).join(''));
}

/**
 * Render a list with optional empty state
 * @param {Array} items - Array to render
 * @param {Function} itemFn - Item render function
 * @param {string} [emptyHtml=''] - HTML when empty
 * @returns {RawHtml} Combined HTML
 */
export function renderList(items, itemFn, emptyHtml = '') {
  if (!items || items.length === 0) {
    return raw(emptyHtml);
  }
  return mapHtml(items, itemFn);
}

/**
 * Create CSS class string from conditions
 * @param {...(string|Object)} classes - Class strings or condition objects
 * @returns {string} Combined class string
 * 
 * @example
 * classNames('btn', { active: isActive, 'btn-primary': true })
 * // => 'btn active btn-primary' (if isActive is true)
 */
export function classNames(...classes) {
  const result = [];
  
  for (const cls of classes) {
    if (typeof cls === 'string') {
      if (cls) result.push(cls);
    } else if (cls && typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key);
      }
    }
  }
  
  return result.join(' ');
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
 * Format GPA display
 * @param {number} gpa - GPA value
 * @returns {string} Formatted GPA
 */
export function formatGPA(gpa) {
  return formatNumber(gpa, 2);
}

/**
 * Create data attributes string
 * @param {Object} attrs - Data attributes object
 * @returns {string} Data attributes string
 */
export function dataAttrs(attrs) {
  if (!attrs) return '';
  
  return Object.entries(attrs)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `data-${kebabCase(k)}="${escapeHtmlHelper(v)}"`)
    .join(' ');
}

/**
 * Convert camelCase to kebab-case
 * @param {string} str - Input string
 * @returns {string} Kebab-case string
 */
function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Sanitize HTML by removing script tags and dangerous attributes
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags
  const scripts = div.querySelectorAll('script');
  scripts.forEach(s => s.remove());
  
  // Remove event handlers
  const allElements = div.querySelectorAll('*');
  allElements.forEach(el => {
    const attrs = el.attributes;
    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i];
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
  });
  
  return div.innerHTML;
}

/**
 * Create a safe URL
 * @param {string} url - URL to check
 * @returns {string|null} Safe URL or null
 */
export function safeUrl(url) {
  if (!url) return null;
  
  // Allow only http, https, mailto, tel
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const parsed = new URL(url, window.location.href);
  
  if (allowedProtocols.includes(parsed.protocol)) {
    return parsed.href;
  }
  
  return null;
}

// Default export with all utilities
export default {
  escapeHtml: escapeHtmlHelper,
  createElement,
  createFragment,
  html,
  raw,
  joinHtml,
  when,
  mapHtml,
  renderList,
  classNames,
  formatNumber,
  formatGPA,
  dataAttrs,
  sanitizeHtml,
  safeUrl
};
