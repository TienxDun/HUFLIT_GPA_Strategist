import { GRADE_SCALE, APP_CONFIG, NON_IMPROVABLE_GRADES } from "./constants";
import { Semester, Course, GradeCombination, RetakeSuggestion } from "./types";
import { findGradeInfo } from "./calculators";

export function generateGradeCombinations(credits: number, targetPoints: number): GradeCombination[] {
  const combinations: GradeCombination[] = [];
  const grades = GRADE_SCALE
    .filter(g => g.gpa > 0 && g.grade !== 'A+')
    .map(g => ({ 
      grade: g.grade, 
      gpa: g.gpa
    }));
  
  const allPossible: GradeCombination[] = [];
  for (let i = 0; i < grades.length; i++) {
    for (let j = i; j < grades.length; j++) {
      const combination = calculateCombination(grades[i], grades[j], credits, targetPoints);
      if (combination) {
        if (combination.c1 === 1 || combination.c2 === 1) {
          continue;
        }

        const gap = Math.abs(combination.g1.gpa - combination.g2.gpa);
        if (gap <= 2.0) {
          allPossible.push(combination);
        }
      }
    }
  }
  
  const uniqueOutcomes = new Map<string, GradeCombination>();
  allPossible.forEach(c => {
    let key: string;
    if (c.c2 === 0) {
      key = `${c.g1.grade}:ALL`;
    } else if (c.c1 === 0) {
      key = `${c.g2.grade}:ALL`;
    } else {
      key = `${c.g1.grade}-${c.c1}:${c.g2.grade}-${c.c2}`;
    }

    if (!uniqueOutcomes.has(key)) {
      uniqueOutcomes.set(key, c);
    }
  });

  return Array.from(uniqueOutcomes.values())
    .sort((a, b) => {
      const totalCredits = a.c1 + a.c2;
      const totalCreditsB = b.c1 + b.c2;
      
      const effectiveGPAA = totalCredits > 0 ? a.totalPoints / totalCredits : 0;
      const effectiveGPAB = totalCreditsB > 0 ? b.totalPoints / totalCreditsB : 0;
      
      if (Math.abs(effectiveGPAA - effectiveGPAB) > 0.01) {
        return effectiveGPAA - effectiveGPAB;
      }
      
      const gapA = Math.abs(a.g1.gpa - a.g2.gpa);
      const gapB = Math.abs(b.g1.gpa - b.g2.gpa);
      return gapA - gapB;
    });
}

export function calculateCombination(g1: { grade: string; gpa: number }, g2: { grade: string; gpa: number }, credits: number, targetPoints: number): GradeCombination | null {
  let c1 = 0;
  let found = false;
  
  if (Math.abs(g1.gpa - g2.gpa) < 0.01) {
    if (credits * g1.gpa >= targetPoints - 0.01) {
      c1 = 0;
      found = true;
    }
  } else {
    const numerator = targetPoints - (credits * g2.gpa);
    const denominator = g1.gpa - g2.gpa;
    
    let minC1 = Math.ceil(numerator / denominator - 0.0001);
    if (minC1 < 0) minC1 = 0;
    
    if (minC1 <= credits) {
      c1 = minC1;
      found = true;
    }
  }
  
  if (!found) return null;
  
  const c2 = credits - c1;
  const totalPoints = (c1 * g1.gpa) + (c2 * g2.gpa);
  
  return { g1, c1, g2, c2, totalPoints };
}

export function generateScenarioText(combination: GradeCombination | null, totalEffortCredits: number = 0, isImpossible: boolean = false): string {
  if (isImpossible) {
    if (totalEffortCredits === 0) return "Cần thêm môn học cải thiện hoặc đăng ký tín chỉ mới để nâng điểm.";
    return "Mục tiêu này cần bổ sung thêm môn học cải thiện hoặc tăng số tín chỉ đăng ký mới.";
  }
  
  if (!combination) return "Hãy thiết lập số tín chỉ và mục tiêu để xem kịch bản.";
  
  const { g1, c1, g2, c2 } = combination;
  const textParts = [];
  
  const avgCred = APP_CONFIG.AVG_CREDITS_PER_COURSE;
  
  if (c1 > 0) {
    const num1 = Math.ceil(c1 / avgCred);
    textParts.push(`${num1} môn ${g1.grade}`);
  }
  
  if (c2 > 0) {
    const num2 = Math.ceil(c2 / avgCred);
    textParts.push(`${num2} môn ${g2.grade}`);
  }
  
  if (textParts.length === 0) return "Bạn đã đạt mục tiêu.";
  
  return `Bạn cần đạt ít nhất ${textParts.join(' và ')} trong thời gian tới.`;
}

export function generateRetakeSuggestions(deficitPoints: number, targetGPA: number, semesters: Semester[]): RetakeSuggestion[] {
  const candidates: any[] = [];
  
  for (const sem of semesters) {
    for (const course of sem.courses) {
      if (NON_IMPROVABLE_GRADES.includes(course.grade)) continue;
      
      const gradeInfo = findGradeInfo(course.grade);
      if (!gradeInfo) continue;
      
      const currentGPA = gradeInfo.gpa;
      const credits = course.credits || 0;
      
      if (credits < APP_CONFIG.MIN_CREDITS_FOR_RETAKE) continue;
      
      const gain = (APP_CONFIG.MAX_GPA - currentGPA) * credits;
      
      candidates.push({ ...course, currentGPA, gain });
    }
  }
  
  candidates.sort((a, b) => (b.gain / b.credits) - (a.gain / a.credits) || b.gain - a.gain);
  
  const allSuggestions: RetakeSuggestion[] = [];
  const seenKeys = new Set<string>();

  function addSuggestion(courses: any[]) {
    const sortedNames = courses.map(c => c.name).sort();
    const key = sortedNames.join('|');
    if (seenKeys.has(key)) return;
    
    const totalGain = courses.reduce((acc, c) => acc + c.gain, 0);
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    
    if (totalGain >= deficitPoints) {
      allSuggestions.push({ courses, totalGain, totalCredits });
      seenKeys.add(key);
    }
  }

  for (const c of candidates) {
    addSuggestion([c]);
  }

  for (let i = 0; i < Math.min(candidates.length, 15); i++) {
    for (let j = i + 1; j < Math.min(candidates.length, 15); j++) {
      addSuggestion([candidates[i], candidates[j]]);
    }
  }

  if (allSuggestions.length < 10) {
    for (let i = 0; i < Math.min(candidates.length, 10); i++) {
      for (let j = i + 1; j < Math.min(candidates.length, 10); j++) {
        for (let k = j + 1; k < Math.min(candidates.length, 10); k++) {
          addSuggestion([candidates[i], candidates[j], candidates[k]]);
        }
      }
    }
  }

  return allSuggestions
    .sort((a, b) => {
      const diffA = a.totalGain - deficitPoints;
      const diffB = b.totalGain - deficitPoints;
      if (Math.abs(diffA - diffB) > 0.5) return diffA - diffB;
      return a.totalCredits - b.totalCredits;
    })
    .slice(0, 5);
}
