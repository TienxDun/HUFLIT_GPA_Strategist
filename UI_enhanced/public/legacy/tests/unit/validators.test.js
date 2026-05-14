/**
 * Unit tests for validators.js
 * Tests all input validation functions
 */

import {
  validateGPA,
  validateCredits,
  validateCourseName,
  validateSemesterName,
  validateGrade,
  validateProcessScore,
  validateRetake,
  validateEmail,
  validateFeedbackContent,
  validateFile,
  combineValidations
} from '../../js/core/validators.js';
import { describe, it, expect, passCount, failCount } from '../utils/test-helpers.js';

// ==========================================
// Test Suites
// ==========================================

describe('validateGPA', () => {
  it('should accept valid GPA', () => {
    const result = validateGPA(3.5);
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe(3.5);
  });

  it('should accept GPA at boundaries', () => {
    expect(validateGPA(0).valid).toBeTruthy();
    expect(validateGPA(4.0).valid).toBeTruthy();
  });

  it('should reject GPA above 4.0', () => {
    const result = validateGPA(4.5);
    expect(result.valid).toBeFalsy();
    expect(result.error).toBeTruthy();
  });

  it('should reject GPA below 0', () => {
    const result = validateGPA(-1);
    expect(result.valid).toBeFalsy();
  });

  it('should reject non-numeric GPA', () => {
    const result = validateGPA('abc');
    expect(result.valid).toBeFalsy();
  });

  it('should handle empty values', () => {
    expect(validateGPA('').valid).toBeTruthy();
    expect(validateGPA(null).valid).toBeTruthy();
    expect(validateGPA(undefined).valid).toBeTruthy();
    expect(validateGPA('').value).toBe(0);
  });

  it('should parse string numbers', () => {
    const result = validateGPA('3.5');
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe(3.5);
  });
});

describe('validateCredits', () => {
  it('should accept valid credits', () => {
    const result = validateCredits(15);
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe(15);
  });

  it('should accept zero credits', () => {
    const result = validateCredits(0);
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe(0);
  });

  it('should reject negative credits', () => {
    const result = validateCredits(-5);
    expect(result.valid).toBeFalsy();
  });

  it('should reject credits above max', () => {
    const result = validateCredits(250);
    expect(result.valid).toBeFalsy();
  });

  it('should respect custom min/max', () => {
    const result = validateCredits(5, { min: 10, max: 20 });
    expect(result.valid).toBeFalsy();
    
    const result2 = validateCredits(15, { min: 10, max: 20 });
    expect(result2.valid).toBeTruthy();
  });
});

describe('validateCourseName', () => {
  it('should accept valid name', () => {
    const result = validateCourseName('Triết học Mác - Lênin');
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe('Triết học Mác - Lênin');
  });

  it('should trim whitespace', () => {
    const result = validateCourseName('  Math 101  ');
    expect(result.value).toBe('Math 101');
  });

  it('should reject overly long names', () => {
    const longName = 'a'.repeat(101);
    const result = validateCourseName(longName);
    expect(result.valid).toBeFalsy();
  });

  it('should handle empty string', () => {
    const result = validateCourseName('');
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe('');
  });
});

describe('validateSemesterName', () => {
  it('should accept valid name', () => {
    const result = validateSemesterName('Học kỳ 1');
    expect(result.valid).toBeTruthy();
  });

  it('should reject empty name', () => {
    const result = validateSemesterName('');
    expect(result.valid).toBeFalsy();
  });

  it('should reject whitespace-only name', () => {
    const result = validateSemesterName('   ');
    expect(result.valid).toBeFalsy();
  });
});

describe('validateGrade', () => {
  it('should accept valid grades', () => {
    expect(validateGrade('A').valid).toBeTruthy();
    expect(validateGrade('B+').valid).toBeTruthy();
    expect(validateGrade('C').valid).toBeTruthy();
    expect(validateGrade('F').valid).toBeTruthy();
  });

  it('should accept empty grade', () => {
    const result = validateGrade('');
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe('');
  });

  it('should reject invalid grades', () => {
    const result = validateGrade('Z');
    expect(result.valid).toBeFalsy();
  });
});

describe('validateProcessScore', () => {
  it('should accept valid scores', () => {
    expect(validateProcessScore(7.5).valid).toBeTruthy();
    expect(validateProcessScore(0).valid).toBeTruthy();
    expect(validateProcessScore(10).valid).toBeTruthy();
  });

  it('should reject scores above 10', () => {
    const result = validateProcessScore(11);
    expect(result.valid).toBeFalsy();
  });

  it('should reject negative scores', () => {
    const result = validateProcessScore(-1);
    expect(result.valid).toBeFalsy();
  });
});

describe('validateRetake', () => {
  it('should accept valid retake data', () => {
    const result = validateRetake({ oldGrade: 2.0, credits: 3 });
    expect(result.valid).toBeTruthy();
  });

  it('should reject invalid retake data', () => {
    const result = validateRetake(null);
    expect(result.valid).toBeFalsy();
  });

  it('should reject invalid old grade', () => {
    const result = validateRetake({ oldGrade: 'abc', credits: 3 });
    expect(result.valid).toBeFalsy();
  });
});

describe('validateEmail', () => {
  it('should accept valid email', () => {
    const result = validateEmail('test@example.com');
    expect(result.valid).toBeTruthy();
  });

  it('should accept empty email', () => {
    const result = validateEmail('');
    expect(result.valid).toBeTruthy();
    expect(result.value).toBe('');
  });

  it('should reject invalid email', () => {
    const result = validateEmail('not-an-email');
    expect(result.valid).toBeFalsy();
  });
});

describe('validateFeedbackContent', () => {
  it('should accept valid content', () => {
    const result = validateFeedbackContent('This is a valid feedback with enough length.');
    expect(result.valid).toBeTruthy();
  });

  it('should reject empty content', () => {
    const result = validateFeedbackContent('');
    expect(result.valid).toBeFalsy();
  });

  it('should reject short content', () => {
    const result = validateFeedbackContent('Short');
    expect(result.valid).toBeFalsy();
  });

  it('should reject overly long content', () => {
    const longContent = 'a'.repeat(2001);
    const result = validateFeedbackContent(longContent);
    expect(result.valid).toBeFalsy();
  });
});

describe('combineValidations', () => {
  it('should combine valid results', () => {
    const result = combineValidations({
      gpa: { valid: true, value: 3.5 },
      credits: { valid: true, value: 60 }
    });
    
    expect(result.valid).toBeTruthy();
    expect(result.values.gpa).toBe(3.5);
    expect(result.values.credits).toBe(60);
    expect(result.errors.length).toBe(0);
  });

  it('should combine invalid results', () => {
    const result = combineValidations({
      gpa: { valid: false, error: 'Invalid GPA' },
      credits: { valid: true, value: 60 }
    });
    
    expect(result.valid).toBeFalsy();
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('gpa: Invalid GPA');
  });
});

// ==========================================
// Test Summary
// ==========================================

console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(50));

if (failCount > 0) {
  process.exit(1);
}
