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
});
