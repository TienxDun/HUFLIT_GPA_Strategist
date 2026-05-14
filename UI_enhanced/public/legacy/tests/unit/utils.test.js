/**
 * Unit tests for utils.js
 * Tests portal text parsing and other utilities
 */

import { parsePortalText } from '../../js/core/utils.js';
import { describe, it, expect, passCount, failCount } from '../utils/test-helpers.js';

// ==========================================
// Test Suites
// ==========================================

describe('parsePortalText', () => {
  it('should parse basic semester data', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Triết học Mác - Lênin 3.0 7.0 3.00 B
2 1010444 Tiếng Anh 1 4.0 8.5 4.00 A
    `;
    
    const result = parsePortalText(portalString);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('HK01 (2023-2024)');
    expect(result[0].courses).toHaveLength(2);
    expect(result[0].courses[0].name).toBe('Triết học Mác - Lênin');
    expect(result[0].courses[0].credits).toBe(3.0);
    expect(result[0].courses[0].grade).toBe('B');
    expect(result[0].courses[1].grade).toBe('A');
  });

  it('should parse multiple semesters', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Triết học 3.0 7.0 3.00 B

Năm học: 2023-2024 - Học kỳ: HK02
1 1010444 Tiếng Anh 4.0 8.5 4.00 A
    `;
    
    const result = parsePortalText(portalString);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('HK01 (2023-2024)');
    expect(result[1].name).toBe('HK02 (2023-2024)');
  });

  it('should handle A+ grade', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Môn học 3.0 9.5 4.00 A+
    `;
    
    const result = parsePortalText(portalString);
    
    expect(result[0].courses[0].grade).toBe('A'); // A+ mapped to A
  });

  it('should detect retakes', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Triết học 3.0 4.0 2.00 D

Năm học: 2023-2024 - Học kỳ: HK02
1 1010443 Triết học 3.0 7.0 3.00 B
    `;
    
    const result = parsePortalText(portalString);
    
    // First instance should not be retake
    expect(result[0].courses[0].isRetake).toBeFalsy();
    
    // Second instance should be retake
    expect(result[1].courses[0].isRetake).toBeTruthy();
    expect(result[1].courses[0].oldGrade).toBe('D');
  });

  it('should skip courses with * in name', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Giáo dục quốc phòng * 3.0 7.0 3.00 B
2 1010444 Triết học 3.0 7.0 3.00 B
    `;
    
    const result = parsePortalText(portalString);
    
    expect(result[0].courses).toHaveLength(1);
    expect(result[0].courses[0].name).toBe('Triết học');
  });

  it('should handle ungraded courses', () => {
    const portalString = `
Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Môn học 3.0 Chưa nhập điểm
    `;
    
    const result = parsePortalText(portalString);
    
    expect(result[0].courses).toHaveLength(1);
    expect(result[0].courses[0].grade).toBe('');
    expect(result[0].courses[0].credits).toBe(3.0);
  });

  it('should return empty array for invalid input', () => {
    const result = parsePortalText('');
    expect(result).toHaveLength(0);
    
    const result2 = parsePortalText('just some random text');
    expect(result2).toHaveLength(0);
  });

  it('should parse real-world format', () => {
    const portalString = `Năm học: 2023-2024 - Học kỳ: HK01
1 1010443 Triết học Mác - Lênin 3.0 7.0 3.00 B
2 1010444 Tiếng Anh 1 4.0 8.5 4.00 A
3 1010445 Toán cao cấp 3.0 6.5 2.50 C+
Năm học: 2023-2024 - Học kỳ: HK02
1 1010446 Vật lý đại cương 3.0 5.0 1.50 D+
2 1010443 Triết học Mác - Lênin 3.0 8.0 3.50 B+`;
    
    const result = parsePortalText(portalString);
    
    expect(result).toHaveLength(2);
    expect(result[0].courses).toHaveLength(3);
    expect(result[1].courses).toHaveLength(2);
    
    // Check retake detection
    const retake = result[1].courses.find(c => c.name === 'Triết học Mác - Lênin');
    expect(retake.isRetake).toBeTruthy();
    expect(retake.oldGrade).toBe('B');
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
