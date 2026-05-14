export interface Course {
  name: string;
  credits: number;
  grade: string;
  isRetake?: boolean;
  oldGrade?: string;
}

export interface Semester {
  name: string;
  courses: Course[];
}

export interface GPAResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  rank: string;
  semesterStats: {
    name: string;
    gpa: number;
    credits: number;
    passedCredits: number;
    failedCredits: number;
    cumulativeCredits: number;
    cumulativeGPA: number;
    isWarning: boolean;
  }[];
}

export interface GradeCombination {
  g1: { grade: string; gpa: number };
  c1: number;
  g2: { grade: string; gpa: number };
  c2: number;
  totalPoints: number;
}

export interface RetakeSuggestion {
  courses: Course[];
  totalGain: number;
  totalCredits: number;
}
