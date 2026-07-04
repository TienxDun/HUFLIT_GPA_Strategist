import { describe, it, expect } from 'vitest';
import { parsePortalText } from '../../../lib/gpa/parser';

describe('parsePortalText', () => {
  it('should correctly recognize A+ grade from portal text', () => {
    const portalText = `
Năm học: 2023-2024 - Học kỳ: HK01
1 123456 Môn học 1 3.0 3.0 3.0 A+
2 234567 Môn học 2 3.0 3.0 3.0 A
`;
    const semesters = parsePortalText(portalText);
    expect(semesters).toHaveLength(1);
    expect(semesters[0].courses).toHaveLength(2);
    
    // Check first course (A+)
    expect(semesters[0].courses[0].grade).toBe('A+');
    expect(semesters[0].courses[0].name).toBe('Môn học 1');
    
    // Check second course (A)
    expect(semesters[0].courses[1].grade).toBe('A');
    expect(semesters[0].courses[1].name).toBe('Môn học 2');
  });

  it('should correctly handle retake logic with A+', () => {
    const portalText = `
Năm học: 2022-2023 - Học kỳ: HK01
1 123456 Môn cũ 3.0 3.0 3.0 D
Năm học: 2023-2024 - Học kỳ: HK01
1 123456 Môn cũ 3.0 3.0 3.0 A+
`;
    const semesters = parsePortalText(portalText);
    expect(semesters).toHaveLength(2);
    
    const retakeCourse = semesters[1].courses[0];
    expect(retakeCourse.grade).toBe('A+');
    expect(retakeCourse.isRetake).toBe(true);
    expect(retakeCourse.oldGrade).toBe('D');
  });

  it('should correctly parse course code and equivalent course notes', () => {
    const portalText = `
Năm học: 2023-2024 - Học kỳ: HK01
5 1521133 Viết tiếng Anh 3 3.0 5.5 2.00 C
Năm học: 2025-2026 - Học kỳ: HK01
2 1510313 Kỹ năng Viết bài luận tiếng Anh 3.0 5.5 2.00 C Tương đương: Viết tiếng Anh 3 (1521133)
`;
    const semesters = parsePortalText(portalText);
    expect(semesters).toHaveLength(2);
    
    // First course
    const firstCourse = semesters[0].courses[0];
    expect(firstCourse.code).toBe('1521133');
    expect(firstCourse.name).toBe('Viết tiếng Anh 3');
    expect(firstCourse.isRetake).toBe(false);

    // Equivalent course
    const equivCourse = semesters[1].courses[0];
    expect(equivCourse.code).toBe('1510313');
    expect(equivCourse.name).toBe('Kỹ năng Viết bài luận tiếng Anh');
    expect(equivCourse.equivalentName).toBe('Viết tiếng Anh 3');
    expect(equivCourse.equivalentCode).toBe('1521133');
    
    // Assert retake detection worked through equivalence
    expect(equivCourse.isRetake).toBe(true);
    expect(equivCourse.oldGrade).toBe('C');
  });
});
