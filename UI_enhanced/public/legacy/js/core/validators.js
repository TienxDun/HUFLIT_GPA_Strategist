/**
 * Input validation utilities
 * Centralized validation for data integrity
 */

import { APP_CONFIG } from './app-constants.js';
import { GRADE_SCALE } from './constants.js';

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the input is valid
 * @property {*} value - The parsed/cleaned value (if valid)
 * @property {string} [error] - Error message (if invalid)
 */

/**
 * Validate GPA input
 * @param {*} value - Input value
 * @returns {ValidationResult}
 */
export function validateGPA(value) {
  if (value === '' || value === null || value === undefined) {
    return { valid: true, value: 0 };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'GPA phải là một số' };
  }
  
  if (num < APP_CONFIG.MIN_GPA) {
    return { valid: false, error: `GPA không thể nhỏ hơn ${APP_CONFIG.MIN_GPA}` };
  }
  
  if (num > APP_CONFIG.MAX_GPA) {
    return { valid: false, error: `GPA không thể lớn hơn ${APP_CONFIG.MAX_GPA}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate credits input
 * @param {*} value - Input value
 * @param {Object} [options] - Validation options
 * @param {number} [options.min=0] - Minimum value
 * @param {number} [options.max=200] - Maximum value
 * @returns {ValidationResult}
 */
export function validateCredits(value, options = {}) {
  const { min = 0, max = APP_CONFIG.MAX_CREDITS_TOTAL } = options;
  
  if (value === '' || value === null || value === undefined) {
    return { valid: true, value: 0 };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Số tín chỉ phải là một số' };
  }
  
  if (num < min) {
    return { valid: false, error: `Số tín chỉ không thể nhỏ hơn ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Số tín chỉ không thể lớn hơn ${max}` };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate course name
 * @param {string} name - Course name
 * @returns {ValidationResult}
 */
export function validateCourseName(name) {
  if (name === null || name === undefined) {
    return { valid: true, value: '' };
  }
  
  const trimmed = String(name).trim();
  
  if (trimmed.length > APP_CONFIG.MAX_COURSE_NAME_LENGTH) {
    return { 
      valid: false, 
      error: `Tên môn học không thể dài hơn ${APP_CONFIG.MAX_COURSE_NAME_LENGTH} ký tự` 
    };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate semester name
 * @param {string} name - Semester name
 * @returns {ValidationResult}
 */
export function validateSemesterName(name) {
  if (!name || String(name).trim().length === 0) {
    return { valid: false, error: 'Tên học kỳ không được để trống' };
  }
  
  const trimmed = String(name).trim();
  
  if (trimmed.length > APP_CONFIG.MAX_SEMESTER_NAME_LENGTH) {
    return { 
      valid: false, 
      error: `Tên học kỳ không thể dài hơn ${APP_CONFIG.MAX_SEMESTER_NAME_LENGTH} ký tự` 
    };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate grade character
 * @param {string} grade - Grade character (A, B+, etc.)
 * @returns {ValidationResult}
 */
export function validateGrade(grade) {
  if (!grade || grade === '') {
    return { valid: true, value: '' };
  }
  
  const isValid = GRADE_SCALE.some(g => g.grade === grade);
  
  if (!isValid) {
    return { valid: false, error: `Điểm "${grade}" không hợp lệ` };
  }
  
  return { valid: true, value: grade };
}

/**
 * Validate process score (0-10)
 * @param {*} value - Input value
 * @returns {ValidationResult}
 */
export function validateProcessScore(value) {
  if (value === '' || value === null || value === undefined) {
    return { valid: true, value: 0 };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Điểm phải là một số' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Điểm không thể âm' };
  }
  
  if (num > 10) {
    return { valid: false, error: 'Điểm không thể lớn hơn 10' };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate retake data
 * @param {Object} retake - Retake data
 * @param {number} retake.oldGrade - Old grade GPA value
 * @param {number} retake.credits - Credits
 * @returns {ValidationResult}
 */
export function validateRetake(retake) {
  if (!retake || typeof retake !== 'object') {
    return { valid: false, error: 'Dữ liệu học lại không hợp lệ' };
  }
  
  const gradeValidation = validateGPA(retake.oldGrade);
  if (!gradeValidation.valid) {
    return { valid: false, error: `Điểm cũ: ${gradeValidation.error}` };
  }
  
  const creditsValidation = validateCredits(retake.credits, { min: 1, max: 20 });
  if (!creditsValidation.valid) {
    return { valid: false, error: `Tín chỉ: ${creditsValidation.error}` };
  }
  
  return { 
    valid: true, 
    value: {
      oldGrade: gradeValidation.value,
      credits: creditsValidation.value
    }
  };
}

/**
 * Validate email address
 * @param {string} email - Email address
 * @returns {ValidationResult}
 */
export function validateEmail(email) {
  if (!email || String(email).trim().length === 0) {
    return { valid: true, value: '' }; // Email is optional
  }
  
  const trimmed = String(email).trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Email không hợp lệ' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate feedback content
 * @param {string} content - Feedback content
 * @returns {ValidationResult}
 */
export function validateFeedbackContent(content) {
  if (!content || String(content).trim().length === 0) {
    return { valid: false, error: 'Nội dung góp ý không được để trống' };
  }
  
  const trimmed = String(content).trim();
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Nội dung góp ý quá ngắn (tối thiểu 10 ký tự)' };
  }
  
  if (trimmed.length > 2000) {
    return { valid: false, error: 'Nội dung góp ý quá dài (tối đa 2000 ký tự)' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate file for upload
 * @param {File} file - File object
 * @param {Object} [options] - Validation options
 * @param {number} [options.maxSize=5242880] - Maximum file size in bytes (default 5MB)
 * @param {string[]} [options.allowedTypes=['image/jpeg', 'image/png', 'image/gif']] - Allowed MIME types
 * @returns {ValidationResult}
 */
export function validateFile(file, options = {}) {
  const { 
    maxSize = APP_CONFIG.MAX_FEEDBACK_IMAGE_SIZE,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;
  
  if (!file) {
    return { valid: false, error: 'Không có file nào được chọn' };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { valid: false, error: `File quá lớn. Kích thước tối đa là ${maxSizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Định dạng file không được hỗ trợ. Các định dạng được chấp nhận: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true, value: file };
}

/**
 * Run multiple validations and return combined result
 * @param {Object} validations - Object with validation results
 * @returns {{valid: boolean, errors: string[], values: Object}}
 */
export function combineValidations(validations) {
  const errors = [];
  const values = {};
  let valid = true;
  
  for (const [key, result] of Object.entries(validations)) {
    if (!result.valid) {
      valid = false;
      errors.push(`${key}: ${result.error}`);
    } else {
      values[key] = result.value;
    }
  }
  
  return { valid, errors, values };
}
