/**
 * App-wide constants and configuration
 * Centralized configuration for maintainability
 */

/** @typedef {Object} AppConfig */
export const APP_CONFIG = {
  // GPA Range
  MAX_GPA: 4.0,
  MIN_GPA: 0.0,
  MIN_PASS_GPA: 1.0,
  
  // Credits
  AVG_CREDITS_PER_COURSE: 3,
  MIN_CREDITS_FOR_RETAKE: 2,
  MAX_CREDITS_TOTAL: 200,
  
  // UI
  DEBOUNCE_DELAY: 500,
  ANIMATION_DURATION: 300,
  CHART_UPDATE_DELAY: 50,
  
  // Animation
  COUNT_UP_DURATION: 800,
  PULSE_ANIMATION_DURATION: 2000,
  
  // Feedback
  MAX_FEEDBACK_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Validation
  MAX_COURSE_NAME_LENGTH: 100,
  MAX_SEMESTER_NAME_LENGTH: 50
};

/** @typedef {Object} StorageKeys */
export const STORAGE_KEYS = {
  MANUAL_STATE: 'manualState',
  TARGET_STATE: 'targetState',
  THEME: 'theme',

  COURSE_GRADE_STATE: 'courseGradeState',
  SCALE_ORDER: 'HUFLIT_SCALE_ORDER'
};

/** @typedef {Object} DOMSelectors */
export const DOM_SELECTORS = {
  // Target GPA Tab
  CURRENT_GPA_INPUT: '#current-gpa',
  CURRENT_CREDITS_INPUT: '#current-credits',
  TARGET_GPA_INPUT: '#target-gpa',
  NEW_CREDITS_INPUT: '#new-credits',
  TOTAL_CREDITS_INPUT: '#total-credits',
  CALC_TARGET_BTN: '#calc-target-btn',
  TARGET_RESULT_CONTAINER: '#target-result-container',
  RETAKE_TOGGLE: '#retake-toggle',
  RETAKE_AREA: '#retake-area',
  RETAKE_LIST: '#retake-list',
  ADD_RETAKE_BTN: '#add-retake-btn',
  BTN_SWITCH_TO_TOTAL: '#btn-switch-to-total',
  BTN_SWITCH_TO_NEW: '#btn-switch-to-new',
  NEW_CREDITS_GROUP: '#new-credits-group',
  TOTAL_CREDITS_GROUP: '#total-credits-group',
  SHARE_TARGET_BTN: '#share-target-btn',
  EXPORT_PDF_BTN: '#export-pdf-btn',
  
  // Manual Calc Tab
  ADD_SEMESTER_BTN: '#add-semester-btn',
  MANUAL_SEMESTER_LIST: '#manual-semester-list',
  RESET_MANUAL_BTN: '#reset-manual-btn',
  MANUAL_INITIAL_GPA: '#manual-initial-gpa',
  MANUAL_INITIAL_CREDITS: '#manual-initial-credits',
  PROCESS_IMPORT_BTN: '#process-import-btn',
  IMPORT_TEXT_AREA: '#import-text-area',
  APPLY_MANUAL_TO_TARGET_BTN: '#apply-manual-to-target-btn',
  MANUAL_GPA_DISPLAY: '#manual-gpa',
  MANUAL_CREDITS_DISPLAY: '#manual-credits',
  MANUAL_RANK_DISPLAY: '#manual-rank',
  
  // Course Grade Tab
  PROCESS_SCORE_INPUT: '#process-score-input',
  PROCESS_SCORE_RANGE: '#process-score-range',
  ACCUMULATED_SCORE_DISPLAY: '#accumulated-score',
  SCORE_TO_PASS_DISPLAY: '#score-to-pass',
  COURSE_GRADE_RESULTS: '#course-grade-results',
  
  // Grade Scale Tab
  GRADE_SCALE_TABLE_BODY: '#grade-scale-table-body',
  CLASSIFICATION_TABLE_BODY: '#classification-table-body',
  SCALE_LIST_CONTAINER: '#scale-list-container',
  TOGGLE_SORT_BTN: '#toggle-sort-scale-btn',
  
  // Theme
  THEME_TOGGLE_MOBILE: '#theme-toggle-mobile',
  THEME_TOGGLE_DESKTOP: '#theme-toggle-desktop',
  THEME_TOGGLE: '#theme-toggle',
  
  // Contact
  CONTACT_FLOATING_WRAPPER: '#contact-floating-wrapper',
  CLOSE_CONTACT_BTN: '#close-contact-btn',
  
  // Feedback
  FEEDBACK_FORM: '#feedback-form',
  SUBMIT_FEEDBACK_BTN: '#submit-feedback-btn',
  FEEDBACK_LIST_TAB: '#feedback-list-tab',
  REFRESH_FEEDBACK_BTN: '#refresh-feedback-btn',
  FEEDBACK_IMAGE_INPUT: '#feedback-image',
  FEEDBACK_IMAGE_PREVIEW: '#feedback-image-preview',
  FEEDBACK_LIST_CONTAINER: '#feedback-list-container',
  
  // News
  NEWS_FILTERS: '.news-filters .filter-btn',
  NEWS_CARDS: '.news-card',
  LOAD_HANDBOOK_BTN: '#load-handbook-btn',
  HANDBOOK_PLACEHOLDER: '#handbook-placeholder',
  HANDBOOK_IFRAME: '#handbook-iframe',
  
  // Visit Count
  VISIT_COUNT_CONTAINERS: '.visit-count-container',
  VISIT_COUNT_VALUES: '.visit-count-value',
  

};

/** @typedef {Object} CSSClasses */
export const CSS_CLASSES = {
  // Visibility
  ACTIVE: 'active',
  D_NONE: 'd-none',
  SHOW: 'show',
  FADE: 'fade',
  
  // Form States
  IS_VALID: 'is-valid',
  IS_INVALID: 'is-invalid',
  
  // Colors
  TEXT_SUCCESS: 'text-success',
  TEXT_PRIMARY: 'text-primary',
  TEXT_DANGER: 'text-danger',
  TEXT_WARNING: 'text-warning',
  TEXT_INFO: 'text-info',
  TEXT_SECONDARY: 'text-secondary',
  
  BG_SUCCESS: 'bg-success',
  BG_PRIMARY: 'bg-primary',
  BG_DANGER: 'bg-danger',
  BG_WARNING: 'bg-warning',
  BG_INFO: 'bg-info',
  BG_LIGHT: 'bg-light',
  BG_WHITE: 'bg-white',
  
  // Components
  CARD: 'card',
  CARD_HEADER: 'card-header',
  CARD_BODY: 'card-body',
  BTN: 'btn',
  BTN_PRIMARY: 'btn-primary',
  FORM_CONTROL: 'form-control',
  FORM_SELECT: 'form-select',
  
  // Animation
  ANI_FADE_IN_UP: 'ani-fade-in-up',
  HOVER_TRANSLATE_Y: 'hover-translate-y',
  ANIMATE_PULSE: 'animate-pulse',
  
  // Custom
  MANUAL_INPUT: 'manual-input',
  SEMESTER_HEADER_BADGES: 'semester-header-badges'
};

/** @typedef {Object} FeedbackTypes */
export const FEEDBACK_TYPES = {
  FEATURE_REQUEST: 'feature_request',
  BUG_REPORT: 'bug_report',
  IMPROVEMENT: 'improvement',
  OTHER: 'other'
};

/** @typedef {Object} FeedbackTypeInfo */
export const FEEDBACK_TYPE_LABELS = {
  [FEEDBACK_TYPES.FEATURE_REQUEST]: 'Tính năng mới',
  [FEEDBACK_TYPES.BUG_REPORT]: 'Báo lỗi',
  [FEEDBACK_TYPES.IMPROVEMENT]: 'Cải tiến',
  [FEEDBACK_TYPES.OTHER]: 'Khác'
};

/** @typedef {Object} CreditModes */
export const CREDIT_MODES = {
  NEW: 'new',
  TOTAL: 'total'
};

/** @typedef {Object} GPARanks */
export const GPA_RANKS = {
  EXCELLENT: { label: 'Xuất sắc', min: 3.6, max: 4.0, color: 'success' },
  GOOD: { label: 'Giỏi', min: 3.2, max: 3.59, color: 'primary' },
  FAIR: { label: 'Khá', min: 2.5, max: 3.19, color: 'info' },
  AVERAGE: { label: 'Trung bình', min: 2.0, max: 2.49, color: 'warning' },
  WEAK: { label: 'Yếu', min: 1.0, max: 1.99, color: 'secondary' },
  POOR: { label: 'Kém', min: 0.0, max: 0.99, color: 'danger' }
};

/** @typedef {Object} CourseProcessRatios */
export const COURSE_PROCESS_RATIOS = {
  RATIO_30_70: { process: 0.3, final: 0.7, value: '0.3', label: '30/70' },
  RATIO_40_60: { process: 0.4, final: 0.6, value: '0.4', label: '40/60' },
  RATIO_50_50: { process: 0.5, final: 0.5, value: '0.5', label: '50/50' }
};

/** @typedef {Object} ExternalURLs */
export const EXTERNAL_URLS = {
  GOAT_COUNTER: 'https://tienxdun.goatcounter.com/counter/TOTAL.json',
  IMGUR_UPLOAD: 'https://api.imgur.com/3/image'
};

/**
 * Non-improvable grades (cannot retake these)
 * @type {string[]}
 */
export const NON_IMPROVABLE_GRADES = ['A+', 'A', 'B+', 'B'];

/**
 * Animation delays for staggered animations
 * @type {number[]}
 */
export const ANIMATION_DELAYS = [0.1, 0.2, 0.3, 0.4, 0.5];

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth < 768;
}

/**
 * Get appropriate debounce delay based on device
 * @returns {number}
 */
export function getDebounceDelay() {
  return isMobileDevice() ? 200 : APP_CONFIG.DEBOUNCE_DELAY;
}
