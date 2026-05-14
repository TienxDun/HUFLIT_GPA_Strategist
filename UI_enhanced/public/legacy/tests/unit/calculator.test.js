/**
 * Unit tests for calculator.js
 * Tests all GPA calculation functions
 */

import {
  calculateManualGPA,
  calculateTargetResult,
  generateRetakeSuggestions,
  generateGradeCombinations,
  generateScenarioText,
  getYearInfo,
  calculateYearlyStats,
  _testHelpers
} from '../../js/core/calculator.js';
import { describe, it, expect, passCount, failCount } from '../utils/test-helpers.js';

const { findGradeInfo, getGPAPoints, roundGPA, classifyGPA, getGradeColor } = _testHelpers;

// ==========================================
// Test Suites
// ==========================================

describe('Helper Functions', () => {
  it('findGradeInfo should return correct grade info', () => {
    const info = findGradeInfo('A');
    expect(info.gpa).toBe(4.0);
    expect(info.min).toBe(8.5);
  });

  it('findGradeInfo should return undefined for invalid grade', () => {
    const info = findGradeInfo('Z');
    expect(info).toBeFalsy();
  });

  it('getGPAPoints should return correct GPA', () => {
    expect(getGPAPoints('A')).toBe(4.0);
    expect(getGPAPoints('B+')).toBe(3.5);
    expect(getGPAPoints('F')).toBe(0);
  });

  it('roundGPA should round to 2 decimal places', () => {
    expect(roundGPA(3.456)).toBe(3.46);
    expect(roundGPA(3.454)).toBe(3.45);
  });

  it('classifyGPA should return correct rank', () => {
    expect(classifyGPA(3.8)).toBe('Xuất sắc');
    expect(classifyGPA(3.5)).toBe('Giỏi');
    expect(classifyGPA(2.8)).toBe('Khá');
    expect(classifyGPA(2.2)).toBe('Trung bình');
    expect(classifyGPA(1.5)).toBe('Yếu');
  });

  it('getGradeColor should return correct color', () => {
    expect(getGradeColor('A')).toBe('success');
    expect(getGradeColor('B+')).toBe('primary');
    expect(getGradeColor('C')).toBe('info');
    expect(getGradeColor('D')).toBe('warning');
    expect(getGradeColor('F')).toBe('danger');
  });
});

describe('calculateManualGPA', () => {
  it('should calculate GPA for single course', () => {
    const semesters = [{
      courses: [{ name: 'Môn 1', credits: 3, grade: 'A' }]
    }];
    
    const result = calculateManualGPA(semesters, 0, 0);
    
    expect(result.gpa).toBe(4.0);
    expect(result.totalCredits).toBe(3);
    expect(result.rank).toBe('Xuất sắc');
  });

  it('should calculate GPA for multiple courses', () => {
    const semesters = [{
      courses: [
        { name: 'Môn 1', credits: 3, grade: 'A' },    // 12 points
        { name: 'Môn 2', credits: 2, grade: 'B' },    // 6 points
      ]
    }];
    
    const result = calculateManualGPA(semesters, 0, 0);
    
    expect(result.gpa).toBeCloseTo(3.6, 2); // 18 / 5 = 3.6
    expect(result.totalCredits).toBe(5);
  });

  it('should handle initial GPA and credits', () => {
    const semesters = [{
      courses: [{ name: 'Môn 1', credits: 3, grade: 'A' }]  // 12 points
    }];
    
    // Initial: 60 credits at GPA 3.0 = 180 points
    // Total: 192 points / 63 credits = 3.05
    const result = calculateManualGPA(semesters, 3.0, 60);
    
    expect(result.totalCredits).toBe(63);
    expect(result.gpa).toBeCloseTo(3.05, 2);
  });

  it('should handle F grade (no credits)', () => {
    const semesters = [{
      courses: [{ name: 'Môn F', credits: 3, grade: 'F' }]
    }];
    
    const result = calculateManualGPA(semesters, 0, 0);
    
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });

  it('should handle empty semesters', () => {
    const result = calculateManualGPA([], 0, 0);
    
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });
});

describe('calculateManualGPA with retakes', () => {
  it('should improve GPA when retaking with higher grade', () => {
    const semesters = [{
      courses: [{
        name: 'Môn Cải Thiện',
        credits: 3,
        grade: 'B',      // 3.0
        isRetake: true,
        oldGrade: 'C'    // 2.0
      }]
    }];
    
    // Initial: C (2.0) * 3 = 6 points
    const result = calculateManualGPA(semesters, 2.0, 3);
    
    expect(result.gpa).toBe(3.0); // (6 - 6 + 9) / 3 = 3.0
  });

  it('should keep GPA when retaking with lower grade', () => {
    const semesters = [{
      courses: [{
        name: 'Môn Cải Thiện',
        credits: 3,
        grade: 'D',      // 1.0
        isRetake: true,
        oldGrade: 'C'    // 2.0
      }]
    }];
    
    const result = calculateManualGPA(semesters, 2.0, 3);
    
    expect(result.gpa).toBe(2.0); // Unchanged
  });

  it('should add credits when retaking from F', () => {
    const semesters = [{
      courses: [{
        name: 'Môn F',
        credits: 3,
        grade: 'C',      // 2.0
        isRetake: true,
        oldGrade: 'F'    // 0.0
      }]
    }];
    
    const result = calculateManualGPA(semesters, 0, 0);
    
    expect(result.gpa).toBe(2.0);
    expect(result.totalCredits).toBe(3); // Credits added
  });
});

describe('calculateTargetResult', () => {
  it('should calculate required GPA correctly', () => {
    // Current: 60 credits, GPA 3.0 = 180 points
    // Target: 90 credits, GPA 3.5 = 315 points
    // Need: 135 points from 30 new credits = 4.5 (impossible)
    
    const result = calculateTargetResult(3.0, 60, 3.5, 30, []);
    
    expect(result.totalFutureCredits).toBe(90);
    expect(result.requiredPoints).toBeCloseTo(135, 0);
    expect(result.requiredGPA).toBeGreaterThan(4.0);
  });

  it('should handle achievable target', () => {
    // Current: 60 credits, GPA 3.0 = 180 points
    // Target: 90 credits, GPA 3.2 = 288 points
    // Need: 108 points from 30 new credits = 3.6
    
    const result = calculateTargetResult(3.0, 60, 3.2, 30, []);
    
    expect(result.requiredGPA).toBeCloseTo(3.6, 1);
  });

  it('should handle already achieved target', () => {
    // Current GPA already higher than target
    const result = calculateTargetResult(3.5, 60, 3.0, 30, []);
    
    expect(result.requiredGPA).toBeLessThan(0);
  });

  it('should account for retakes', () => {
    const retakes = [{ oldGrade: 1.0, credits: 3 }]; // Remove 3 points
    
    const result = calculateTargetResult(3.0, 60, 3.5, 30, retakes);
    
    // Should need to make up for removed points
    expect(result.effectiveCurrentPoints).toBeCloseTo(177, 0); // 180 - 3
  });
});

describe('generateGradeCombinations', () => {
  it('should generate valid combinations', () => {
    const combinations = generateGradeCombinations(15, 45);
    
    expect(combinations.length).toBeGreaterThan(0);
    
    // All combinations should satisfy the requirement
    combinations.forEach(combo => {
      expect(combo.c1 + combo.c2).toBe(15);
      expect(combo.totalPoints).toBeGreaterThanOrEqual(45);
    });
  });

  it('should avoid 1-credit courses', () => {
    const combinations = generateGradeCombinations(3, 9);
    
    combinations.forEach(combo => {
      expect(combo.c1).not.toBe(1);
      expect(combo.c2).not.toBe(1);
    });
  });
});

describe('generateScenarioText', () => {
  it('should generate correct scenario text', () => {
    const combination = {
      g1: { grade: 'A' },
      c1: 9,
      g2: { grade: 'B' },
      c2: 6
    };
    
    const text = generateScenarioText(combination);
    
    expect(text).toBeTruthy();
    expect(text.includes('A')).toBeTruthy();
    expect(text.includes('B')).toBeTruthy();
  });

  it('should return default text for empty combination', () => {
    const text = generateScenarioText({ g1: null, c1: 0, g2: null, c2: 0 });
    
    expect(text).toBe('Duy trì phong độ hiện tại.');
  });
});

describe('getYearInfo', () => {
  it('should parse year from semester name', () => {
    const info = getYearInfo('HK01 (2023-2024)');
    
    expect(info.id).toBe('2023-2024');
    expect(info.label).toBe('Năm học 2023-2024');
  });

  it('should parse semester number', () => {
    const info = getYearInfo('Học kỳ 1');
    
    expect(info.id).toBe('year_1');
    expect(info.label).toBe('Năm thứ 1');
  });

  it('should return default for unknown format', () => {
    const info = getYearInfo('Unknown');
    
    expect(info.id).toBe('other');
    expect(info.label).toBe('Khác');
  });
});

describe('calculateYearlyStats', () => {
  it('should calculate yearly statistics', () => {
    const semesters = [
      {
        name: 'HK01 (2023-2024)',
        courses: [
          { name: 'Môn 1', credits: 3, grade: 'A' },  // 12 points
          { name: 'Môn 2', credits: 3, grade: 'B' }   // 9 points
        ]
      },
      {
        name: 'HK02 (2023-2024)',
        courses: [
          { name: 'Môn 3', credits: 2, grade: 'A' }   // 8 points
        ]
      }
    ];
    
    const stats = calculateYearlyStats(semesters);
    
    expect(stats['2023-2024']).toBeTruthy();
    expect(stats['2023-2024'].credits).toBe(8);
    expect(stats['2023-2024'].points).toBe(29);
    expect(stats['2023-2024'].semesterCount).toBe(2);
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
