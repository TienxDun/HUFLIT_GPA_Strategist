import { describe, it, expect } from 'vitest';
import {
  roundGPA,
  classifyGPA,
  findGradeInfo,
  calculateManualGPA,
  calculateTargetResult
} from '../../../lib/gpa/calculators';
import { Semester } from '../../../lib/gpa/types';

// ============================================================================
// 1. BASIC UTILS
// ============================================================================

describe('roundGPA', () => {
  it('should round to 2 decimal places (standard)', () => {
    expect(roundGPA(3.456)).toBe(3.46);
    expect(roundGPA(3.454)).toBe(3.45);
    expect(roundGPA(3.0)).toBe(3.0);
    expect(roundGPA(0)).toBe(0);
  });

  it('should handle floating point precision (0.1 + 0.2 problem)', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in IEEE 754
    expect(roundGPA(0.1 + 0.2)).toBe(0.3);
  });

  it('should handle the .x05 midpoint correctly', () => {
    // Math.round(3.145 * 100) = Math.round(314.4999...) = 314
    expect(roundGPA(3.145)).toBe(3.15); // Or 3.14? This tests IEEE 754 rounding behavior
  });
});

describe('classifyGPA', () => {
  it('should classify exact boundary values correctly', () => {
    expect(classifyGPA(4.0)).toBe('Xuất sắc');
    expect(classifyGPA(3.6)).toBe('Xuất sắc');
    expect(classifyGPA(3.59)).toBe('Giỏi');
    expect(classifyGPA(3.2)).toBe('Giỏi');
    expect(classifyGPA(3.19)).toBe('Khá');
    expect(classifyGPA(2.5)).toBe('Khá');
    expect(classifyGPA(2.49)).toBe('Trung bình');
    expect(classifyGPA(2.0)).toBe('Trung bình');
    expect(classifyGPA(1.99)).toBe('Yếu');
    expect(classifyGPA(1.0)).toBe('Yếu');
    expect(classifyGPA(0.99)).toBe('Kém');
    expect(classifyGPA(0.0)).toBe('Kém');
  });

  it('should handle GPA = 0 (all F scenario)', () => {
    expect(classifyGPA(0)).toBe('Kém');
  });

  it('should handle negative GPA (invalid input)', () => {
    // Negative GPA is invalid. Should still return a rank without crashing.
    const result = classifyGPA(-1);
    expect(typeof result).toBe('string');
  });

  it('[POTENTIAL BUG] classifyGPA vs roundGPA consistency at boundaries', () => {
    // roundGPA uses Math.round(x*100)/100
    // classifyGPA uses parseFloat(x.toFixed(2))
    // These two methods can produce DIFFERENT results for the same input!
    const testValue = 3.595;
    const rounded = roundGPA(testValue);
    const classified = classifyGPA(testValue);
    // If roundGPA gives 3.60 → should be "Xuất sắc"
    // If classifyGPA internally rounds differently → might be "Giỏi"
    // Both should agree on the classification
    expect(classifyGPA(rounded)).toBe(classified);
  });
});

describe('findGradeInfo', () => {
  it('should find all valid grades', () => {
    const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
    validGrades.forEach(grade => {
      expect(findGradeInfo(grade)).toBeDefined();
    });
  });

  it('should return undefined for invalid grades', () => {
    expect(findGradeInfo('')).toBeUndefined();
    expect(findGradeInfo('E')).toBeUndefined();
    expect(findGradeInfo('a+')).toBeUndefined(); // case-sensitive
  });
});

// ============================================================================
// 2. calculateManualGPA - BASIC SCENARIOS
// ============================================================================

describe('calculateManualGPA - Basic Scenarios', () => {
  it('should calculate correctly for a single semester', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [
        { name: 'Toán', credits: 3, grade: 'A' },   // 4.0 * 3 = 12
        { name: 'Lý', credits: 2, grade: 'B' },     // 3.0 * 2 = 6
      ]
    }];
    const result = calculateManualGPA(semesters);
    // GPA = 18 / 5 = 3.6
    expect(result.gpa).toBe(3.6);
    expect(result.totalCredits).toBe(5);
    expect(result.rank).toBe('Xuất sắc');
  });

  it('should calculate cumulative GPA across multiple semesters', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'A' }] // 4.0 * 3 = 12
      },
      {
        name: 'HK2',
        courses: [{ name: 'Lý', credits: 3, grade: 'C' }] // 2.0 * 3 = 6
      }
    ];
    const result = calculateManualGPA(semesters);
    // Total: points=18, credits=6, GPA=3.0
    expect(result.gpa).toBe(3.0);
    expect(result.totalCredits).toBe(6);
    expect(result.semesterStats[0].gpa).toBe(4.0);
    expect(result.semesterStats[1].gpa).toBe(2.0);
    expect(result.semesterStats[1].cumulativeGPA).toBe(3.0);
  });

  it('should handle initialGPA and initialCredits correctly', () => {
    const semesters: Semester[] = [{
      name: 'HK3',
      courses: [{ name: 'Môn mới', credits: 3, grade: 'A' }] // 4.0 * 3 = 12
    }];
    // Initial: 3.0 GPA * 30 credits = 90 points
    const result = calculateManualGPA(semesters, 3.0, 30);
    // Total: points=90+12=102, credits=30+3=33, GPA=102/33≈3.09
    expect(result.gpa).toBe(3.09);
    expect(result.totalCredits).toBe(33);
  });
});

// ============================================================================
// 3. calculateManualGPA - RETAKE SCENARIOS (Bug Hunting)
// ============================================================================

describe('calculateManualGPA - Retake (Improvement)', () => {
  it('should handle standard improvement (C → A) correctly', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'C' }] // 2.0*3=6, credits=3
      },
      {
        name: 'HK2',
        courses: [
          { name: 'Toán (cải thiện)', credits: 3, grade: 'A', isRetake: true, oldGrade: 'C' }
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // HK1 adds: points=6, credits=3
    // HK2 retake: (4.0-2.0)*3=6 added to points. No credits change.
    // Cumulative: points=12, credits=3, GPA=4.0
    expect(result.gpa).toBe(4.0);
    expect(result.totalCredits).toBe(3);
  });

  it('should NOT change cumulative when retake grade is LOWER than old grade', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'B' }] // 3.0*3=9
      },
      {
        name: 'HK2',
        courses: [
          { name: 'Toán (cải thiện)', credits: 3, grade: 'D', isRetake: true, oldGrade: 'B' }
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // newGPA (1.0) < oldGPA (3.0) → no change to cumulative
    // GPA stays 3.0 (from HK1)
    expect(result.gpa).toBe(3.0);
    expect(result.totalCredits).toBe(3);
  });

  it('[BUG?] Retake with isRetake=true but NO oldGrade → course disappears from cumulative', () => {
    // This is a potential BUG:
    // When isRetake=true but oldGrade is undefined/empty:
    //   - findGradeInfo('') returns undefined
    //   - oldGradeInfo check fails
    //   - Falls through retake branch WITHOUT adding to cumulative
    //   - The course vanishes from cumulative GPA entirely!
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [
        { name: 'Toán', credits: 3, grade: 'A', isRetake: true }
        // oldGrade is undefined → this course's points/credits WON'T be added to cumulative
      ]
    }];
    const result = calculateManualGPA(semesters);

    // EXPECTED: Should still contribute to cumulative (A = 4.0*3 = 12 points, 3 credits)
    // ACTUAL BUG: gpa=0, totalCredits=0, totalPoints=0 — course is completely ignored!
    // The semester GPA still shows correctly (4.0), but cumulative is broken.
    expect(result.semesterStats[0].gpa).toBe(4.0);
    expect(result.semesterStats[0].credits).toBe(3);

    // This assertion WILL FAIL if the bug exists:
    expect(result.gpa).toBe(4.0);
    expect(result.totalCredits).toBe(3);
  });
});

describe('calculateManualGPA - Retake F (Học lại)', () => {
  it('should add credits when retaking from F → pass', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'F' }] // 0*3=0, NOT in cumulative
      },
      {
        name: 'HK2',
        courses: [
          { name: 'Toán (học lại)', credits: 3, grade: 'B', isRetake: true, oldGrade: 'F' }
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // F → B: isOldF=true, newGPA>0 → add 3.0*3=9 points, 3 credits
    expect(result.gpa).toBe(3.0);
    expect(result.totalCredits).toBe(3);
  });

  it('should NOT add credits when retaking F → F again', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'F' }]
      },
      {
        name: 'HK2',
        courses: [
          { name: 'Toán (học lại)', credits: 3, grade: 'F', isRetake: true, oldGrade: 'F' }
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // F → F: isOldF=true, newGPA=0 → nothing added
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });
});

// ============================================================================
// 4. calculateManualGPA - EDGE CASES & COMPLEX SCENARIOS
// ============================================================================

describe('calculateManualGPA - Edge Cases', () => {
  it('should handle empty semesters array', () => {
    const result = calculateManualGPA([]);
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.semesterStats).toHaveLength(0);
  });

  it('should handle null input without crashing', () => {
    // @ts-expect-error testing runtime safety
    const result = calculateManualGPA(null);
    expect(result.gpa).toBe(0);
  });

  it('should handle semester with empty courses array', () => {
    const semesters: Semester[] = [{ name: 'HK1', courses: [] }];
    const result = calculateManualGPA(semesters);
    expect(result.semesterStats).toHaveLength(1);
    expect(result.semesterStats[0].gpa).toBe(0);
    expect(result.semesterStats[0].credits).toBe(0);
  });

  it('should handle course with invalid grade string', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [{ name: 'Toán', credits: 3, grade: 'INVALID' }]
    }];
    const result = calculateManualGPA(semesters);
    // findGradeInfo returns undefined → course is skipped entirely
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });

  it('should handle course with 0 credits', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [{ name: 'Toán', credits: 0, grade: 'A' }]
    }];
    const result = calculateManualGPA(semesters);
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
  });

  it('should handle all-F semester correctly (no cumulative credits)', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [
        { name: 'Toán', credits: 3, grade: 'F' },
        { name: 'Lý', credits: 2, grade: 'F' },
      ]
    }];
    const result = calculateManualGPA(semesters);
    // F courses: gpa=0, NOT added to cumulative
    expect(result.semesterStats[0].gpa).toBe(0);
    expect(result.semesterStats[0].credits).toBe(5); // semester credits still counted
    expect(result.semesterStats[0].failedCredits).toBe(5);
    expect(result.semesterStats[0].passedCredits).toBe(0);
    expect(result.totalCredits).toBe(0); // BUT cumulative credits = 0
  });

  it('should set isWarning flag correctly', () => {
    // Semester 1 (sIdx=0): warning threshold = 0.8
    // Semester 2+ (sIdx>0): warning threshold = 1.0
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'D' }] // GPA = 1.0 ≥ 0.8 → no warning
      },
      {
        name: 'HK2',
        courses: [{ name: 'Lý', credits: 3, grade: 'D' }] // GPA = 1.0 ≥ 1.0 → no warning
      }
    ];
    const result = calculateManualGPA(semesters);
    expect(result.semesterStats[0].isWarning).toBe(false);
    expect(result.semesterStats[1].isWarning).toBe(false);

    // Now test with F grades → GPA = 0 → should trigger warnings
    const semesters2: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'F' }] // GPA=0 < 0.8 → warning
      },
      {
        name: 'HK2',
        courses: [{ name: 'Lý', credits: 3, grade: 'F' }] // GPA=0 < 1.0 → warning
      }
    ];
    const result2 = calculateManualGPA(semesters2);
    expect(result2.semesterStats[0].isWarning).toBe(true);
    expect(result2.semesterStats[1].isWarning).toBe(true);
  });

  it('should handle mixed retake + new courses in same semester', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'C' }] // 2.0*3=6, credits=3
      },
      {
        name: 'HK2',
        courses: [
          { name: 'Toán (cải thiện)', credits: 3, grade: 'A', isRetake: true, oldGrade: 'C' },
          { name: 'Anh văn', credits: 2, grade: 'B' }, // new: 3.0*2=6
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // HK1: cumulative points=6, credits=3
    // HK2 retake: diff=(4.0-2.0)*3=6, cumulative points=12
    // HK2 new: cumulative points=12+6=18, credits=3+2=5
    // Final: 18/5 = 3.6
    expect(result.gpa).toBe(3.6);
    expect(result.totalCredits).toBe(5);
  });

  it('should protect against negative initialGPA and initialCredits', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [{ name: 'Toán', credits: 3, grade: 'A' }]
    }];
    const result = calculateManualGPA(semesters, -5, -10);
    // Math.max(0, -5) = 0, Math.max(0, -10) = 0
    expect(result.gpa).toBe(4.0);
    expect(result.totalCredits).toBe(3);
  });
});

// ============================================================================
// 5. calculateManualGPA - CUMULATIVE STATS VERIFICATION
// ============================================================================

describe('calculateManualGPA - Cumulative Stats Accuracy', () => {
  it('should track cumulativeGPA correctly across 3 semesters', () => {
    const semesters: Semester[] = [
      {
        name: 'HK1',
        courses: [{ name: 'Toán', credits: 3, grade: 'A' }] // 4.0*3=12
      },
      {
        name: 'HK2',
        courses: [{ name: 'Lý', credits: 3, grade: 'C' }]  // 2.0*3=6
      },
      {
        name: 'HK3',
        courses: [{ name: 'Hóa', credits: 3, grade: 'B' }]  // 3.0*3=9
      },
    ];
    const result = calculateManualGPA(semesters);

    expect(result.semesterStats[0].cumulativeGPA).toBe(4.0);           // 12/3
    expect(result.semesterStats[1].cumulativeGPA).toBe(3.0);           // 18/6
    expect(result.semesterStats[2].cumulativeGPA).toBe(3.0);           // 27/9
    expect(result.gpa).toBe(3.0);
  });

  it('should calculate passedCredits and failedCredits per semester', () => {
    const semesters: Semester[] = [{
      name: 'HK1',
      courses: [
        { name: 'Toán', credits: 3, grade: 'A' },   // passed
        { name: 'Lý', credits: 2, grade: 'F' },     // failed
        { name: 'Hóa', credits: 3, grade: 'B+' },   // passed
      ]
    }];
    const result = calculateManualGPA(semesters);
    expect(result.semesterStats[0].passedCredits).toBe(6);
    expect(result.semesterStats[0].failedCredits).toBe(2);
    expect(result.semesterStats[0].credits).toBe(8); // total semester credits
    expect(result.totalCredits).toBe(6); // cumulative only counts passed
  });
});

// ============================================================================
// 6. calculateTargetResult
// ============================================================================

describe('calculateTargetResult', () => {
  it('should calculate required GPA for basic scenario', () => {
    // Current: 2.5 GPA, 60 credits (points=150)
    // Target: 3.0 GPA, 15 new credits
    // Target points = 3.0 * (60+15) = 225
    // Required points = 225 - 150 = 75
    // Required GPA = 75 / 15 = 5.0 (impossible, > 4.0)
    const result = calculateTargetResult(2.5, 60, 3.0, 15);
    expect(result.requiredGPA).toBe(5.0);
    expect(result.totalFutureCredits).toBe(75);
  });

  it('should factor in retakes from non-F grades', () => {
    // Current: 2.0 GPA, 30 credits (points=60)
    // Retake 1 course: 3 credits, oldGrade=1.0 (D), locked targetGrade=3.0 (B)
    // Target: 2.5 GPA, 9 new credits
    //
    // removedPoints = 1.0*3 = 3
    // lockedRetakePoints = 3.0*3 = 9
    // effectiveCurrentPoints = 60 - 3 + 9 = 66
    // totalFutureCredits = 30 + 9 + 0 = 39  (creditsFromF=0)
    // targetTotalPoints = 2.5 * 39 = 97.5
    // requiredPoints = 97.5 - 66 = 31.5
    // totalEffortCredits = 9 + (3 - 3) = 9
    // requiredGPA = 31.5 / 9 = 3.5
    const result = calculateTargetResult(2.0, 30, 2.5, 9, [
      { oldGrade: 1.0, credits: 3, targetGrade: 3.0 }
    ]);
    expect(result.requiredGPA).toBe(3.5);
    expect(result.effectiveCurrentPoints).toBe(66);
  });

  it('should factor in retakes from F (adds credits)', () => {
    // Current: 3.0 GPA, 30 credits (points=90)
    // Retake 1 F course: 3 credits, oldGrade=0
    // Target: 3.0 GPA, 6 new credits
    //
    // removedPoints = 0
    // creditsFromF = 3
    // totalFutureCredits = 30 + 6 + 3 = 39
    // targetTotalPoints = 3.0 * 39 = 117
    // requiredPoints = 117 - 90 = 27
    // totalEffortCredits = 6 + 3 = 9
    // requiredGPA = 27 / 9 = 3.0
    const result = calculateTargetResult(3.0, 30, 3.0, 6, [
      { oldGrade: 0, credits: 3 }
    ]);
    expect(result.requiredGPA).toBe(3.0);
    expect(result.totalFutureCredits).toBe(39);
  });

  it('should handle 0 new credits with only retakes', () => {
    // Current: 2.0 GPA, 30 credits (points=60)
    // No new courses, only retake: 3 credits, D(1.0)
    // Target: 2.5 GPA
    //
    // totalFutureCredits = 30 + 0 + 0 = 30
    // targetTotalPoints = 2.5 * 30 = 75
    // removedPoints = 1.0 * 3 = 3
    // effectiveCurrentPoints = 60 - 3 = 57
    // requiredPoints = 75 - 57 = 18
    // totalEffortCredits = 0 + (3 - 0) = 3
    // requiredGPA = 18 / 3 = 6.0 (impossible)
    const result = calculateTargetResult(2.0, 30, 2.5, 0, [
      { oldGrade: 1.0, credits: 3 }
    ]);
    expect(result.requiredGPA).toBe(6.0);
    expect(result.totalEffortCredits).toBe(3);
  });

  it('should handle case when target is already met', () => {
    const result = calculateTargetResult(3.5, 60, 3.0, 0);
    expect(result.requiredGPA).toBe(0);
  });
});

// ============================================================================
// 7. INTEGRATION TESTS - Real HUFLIT Portal Data
// Verified against: GPA_RULES.md, FAILED_GRADE_ANALYSIS.md, PORTAL_SAMPLE.md
// ============================================================================

describe('Integration - Portal Data Verification', () => {
  it('HK01 2023-2024: should match Portal GPA = 3.50, cumulative = 3.50', () => {
    // Courses with * (GDQP, GDTC) are excluded from GPA by the Portal.
    // Only non-* courses are included here.
    const semesters: Semester[] = [{
      name: 'HK01 2023-2024',
      courses: [
        { name: 'Triết học Mác - Lênin', credits: 3, grade: 'B' },    // 3.0*3=9
        { name: 'Tiếng Anh tổng quát 1', credits: 3, grade: 'A+' },   // 4.0*3=12
        { name: 'Nhập môn CNTT', credits: 2, grade: 'B' },            // 3.0*2=6
        { name: 'Nhập môn lập trình', credits: 4, grade: 'B' },       // 3.0*4=12
        { name: 'Toán rời rạc', credits: 3, grade: 'A+' },            // 4.0*3=12
        { name: 'Giải tích', credits: 3, grade: 'A+' },               // 4.0*3=12
      ]
    }];
    // Points = 63, Credits = 18, GPA = 63/18 = 3.50
    const result = calculateManualGPA(semesters);
    expect(result.semesterStats[0].gpa).toBe(3.5);
    expect(result.gpa).toBe(3.5);
    expect(result.totalCredits).toBe(18);
  });

  it('HK01+HK02 2023-2024: cumulative should match Portal GPA = 3.43', () => {
    const semesters: Semester[] = [
      {
        name: 'HK01 2023-2024',
        courses: [
          { name: 'Triết học Mác - Lênin', credits: 3, grade: 'B' },
          { name: 'Tiếng Anh tổng quát 1', credits: 3, grade: 'A+' },
          { name: 'Nhập môn CNTT', credits: 2, grade: 'B' },
          { name: 'Nhập môn lập trình', credits: 4, grade: 'B' },
          { name: 'Toán rời rạc', credits: 3, grade: 'A+' },
          { name: 'Giải tích', credits: 3, grade: 'A+' },
        ]
      },
      {
        name: 'HK02 2023-2024',
        courses: [
          // GDQP (*) excluded
          { name: 'KTCT Mác - Lênin', credits: 2, grade: 'B' },       // 3.0*2=6
          { name: 'Tiếng Anh tổng quát 2', credits: 3, grade: 'C+' }, // 2.5*3=7.5
          { name: 'Cơ sở dữ liệu', credits: 4, grade: 'B' },         // 3.0*4=12
          { name: 'Đại số tuyến tính', credits: 3, grade: 'A+' },     // 4.0*3=12
          { name: 'Kỹ thuật lập trình', credits: 4, grade: 'A' },     // 4.0*4=16
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // HK01: 63pts / 18TC = 3.50
    // HK02: 53.5pts / 16TC = 3.34
    // Cumulative: 116.5pts / 34TC = 3.4264... → 3.43
    expect(result.semesterStats[0].gpa).toBe(3.5);
    expect(result.semesterStats[1].gpa).toBe(3.34);
    expect(result.gpa).toBe(3.43);
    expect(result.totalCredits).toBe(34);
  });

  it('Semester with F: GPA HK includes F in denominator, cumulative excludes F', () => {
    // Based on FAILED_GRADE_ANALYSIS.md - HK01 2022-2023
    // Passed courses: 15TC, 29.5 points. F course: 2TC, 0 points.
    const semesters: Semester[] = [{
      name: 'HK01 2022-2023',
      courses: [
        { name: 'Passed courses bundle', credits: 15, grade: 'C' },
        // C=2.0 → 2.0*15=30. Actual is 29.5 but we can't get exactly 29.5
        // with a single grade. Let's use exact courses instead:
      ]
    }];
    // Simplified: test the PRINCIPLE that semesterGPA counts F, cumulative doesn't
    const semestersWithF: Semester[] = [{
      name: 'HK with F',
      courses: [
        { name: 'Môn đạt', credits: 3, grade: 'B' },  // 3.0*3=9
        { name: 'Môn rớt', credits: 2, grade: 'F' },   // 0*2=0
      ]
    }];
    const result = calculateManualGPA(semestersWithF);
    // Semester GPA = 9 / 5 = 1.80 (F counts in denominator) ← GPA_RULES rule
    expect(result.semesterStats[0].gpa).toBe(1.8);
    expect(result.semesterStats[0].credits).toBe(5); // total semester credits includes F
    // Cumulative = 9 / 3 = 3.0 (F excluded from cumulative) ← FAILED_GRADE_ANALYSIS rule
    expect(result.gpa).toBe(3.0);
    expect(result.totalCredits).toBe(3); // cumulative credits exclude F
  });

  it('Improvement (D+ → C): only delta points added, credits unchanged', () => {
    // Based on FAILED_GRADE_ANALYSIS.md - HK03 2024-2025
    // SV cải thiện Tư tưởng HCM: D+(1.5) → C(2.0), 2TC
    // Delta = (2.0 - 1.5) * 2 = 1.0 point added
    // Credits stay at 140 (unchanged)
    const semesters: Semester[] = [
      {
        name: 'Previous semesters',
        courses: [{ name: 'Tư tưởng HCM', credits: 2, grade: 'D+' }] // 1.5*2=3
      },
      {
        name: 'HK03 2024-2025',
        courses: [
          { name: 'Tư tưởng HCM (cải thiện)', credits: 2, grade: 'C', isRetake: true, oldGrade: 'D+' }
        ]
      }
    ];
    const result = calculateManualGPA(semesters);
    // HK1: points=3, credits=2
    // HK2 retake: delta=(2.0-1.5)*2=1.0, points=3+1=4, credits=2 (unchanged)
    // GPA = 4/2 = 2.0
    expect(result.gpa).toBe(2.0);
    expect(result.totalCredits).toBe(2); // credits don't change on improvement
    expect(result.totalPoints).toBe(4);  // 3 original + 1 delta
  });
});
