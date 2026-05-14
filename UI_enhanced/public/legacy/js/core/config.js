/**
 * Application Configuration
 * Centralized configuration for external services and APIs
 */

/** @typedef {Object} ApiConfig */
export const API_CONFIG = {
  // Google Apps Script for feedback submission
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz_KJF_96v5p0sML6y3wcKJqmGbTUJ2h4LSVZldnRDNn608mhvAumBy_3UGF6xZgURK/exec',
  
  // Imgur API for image uploads
  IMGUR_UPLOAD_URL: 'https://api.imgur.com/3/image',
  IMGUR_CLIENT_ID: 'e6133fc609825d1',
  
  // Analytics
  GOAT_COUNTER_URL: 'https://tienxdun.goatcounter.com/counter/TOTAL.json'
};

/** @typedef {Object} AppFeatures */
export const FEATURES = {
  FEEDBACK_ENABLED: true,
  IMAGE_UPLOAD_ENABLED: true,
  ANALYTICS_ENABLED: true,
  PDF_EXPORT_ENABLED: true,
  SHARE_ENABLED: true
};

/** @typedef {Object} UiConfig */
const UI_CONFIG = {
  DEBOUNCE_DELAY: 500,
  MOBILE_DEBOUNCE_DELAY: 200,
  ANIMATION_DURATION: 300,
  COUNT_UP_DURATION: 800,
  CHART_UPDATE_DELAY: 50,
  
  // File upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Feedback limits
  MIN_FEEDBACK_LENGTH: 10,
  MAX_FEEDBACK_LENGTH: 2000
};

export { UI_CONFIG };

export default {
  API: API_CONFIG,
  FEATURES,
  UI: UI_CONFIG
};
