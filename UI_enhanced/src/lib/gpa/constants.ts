export const GRADE_SCALE = [
  { grade: 'A+', min: 9.0, max: 10.0, gpa: 4.0 },
  { grade: 'A', min: 8.5, max: 8.9, gpa: 4.0 },
  { grade: 'B+', min: 8.0, max: 8.4, gpa: 3.5 },
  { grade: 'B', min: 7.0, max: 7.9, gpa: 3.0 },
  { grade: 'C+', min: 6.0, max: 6.9, gpa: 2.5 },
  { grade: 'C', min: 5.5, max: 5.9, gpa: 2.0 },
  { grade: 'D+', min: 5.0, max: 5.4, gpa: 1.5 },
  { grade: 'D', min: 4.0, max: 4.9, gpa: 1.0 },
  { grade: 'F', min: 0.0, max: 3.9, gpa: 0.0 },
];

export const GRADE_MAP = Object.fromEntries(GRADE_SCALE.map(g => [g.grade, g]));

export const APP_CONFIG = {
  MAX_GPA: 4.0,
  MIN_GPA: 0.0,
  MIN_PASS_GPA: 1.0,
  AVG_CREDITS_PER_COURSE: 3,
  MIN_CREDITS_FOR_RETAKE: 2,
};

export const GPA_RANKS = {
  EXCELLENT: { label: 'Xuất sắc', min: 3.6, max: 4.0, color: 'success' },
  GOOD: { label: 'Giỏi', min: 3.2, max: 3.59, color: 'primary' },
  FAIR: { label: 'Khá', min: 2.5, max: 3.19, color: 'info' },
  AVERAGE: { label: 'Trung bình', min: 2.0, max: 2.49, color: 'warning' },
  WEAK: { label: 'Yếu', min: 1.0, max: 1.99, color: 'secondary' },
  POOR: { label: 'Kém', min: 0.0, max: 0.99, color: 'danger' },
};

export const NON_IMPROVABLE_GRADES = ['A+', 'A', 'B+', 'B'];
