/**
 * GPA Calculation Logic
 * Pure functions for calculating GPA and related metrics
 */

import { GRADE_SCALE } from './constants.js';
import { APP_CONFIG, NON_IMPROVABLE_GRADES, GPA_RANKS } from './app-constants.js';

// ==========================================
// Type Definitions
// ==========================================

/**
 * @typedef {Object} Course
 * @property {string} name - Course name
 * @property {number} credits - Course credits
 * @property {string} grade - Letter grade (A, B+, etc.)
 * @property {boolean} [isRetake] - Whether this is a retake
 * @property {string} [oldGrade] - Previous grade if retake
 */

/**
 * @typedef {Object} Semester
 * @property {string} name - Semester name
 * @property {Course[]} courses - List of courses
 */

/**
 * @typedef {Object} GPAResult
 * @property {number} gpa - Calculated GPA
 * @property {number} totalCredits - Total earned credits
 * @property {number} totalPoints - Total grade points
 * @property {string} rank - Academic rank classification
 */

/**
 * @typedef {Object} TargetResult
 * @property {number} requiredGPA - GPA needed to achieve target
 * @property {number} requiredPoints - Points needed
 * @property {number} totalFutureCredits - Total credits after completing
 * @property {number} effectiveCurrentPoints - Current points after retakes
 * @property {number} targetTotalPoints - Total points needed for target
 * @property {number} newCredits - New credits to take
 * @property {number} totalEffortCredits - Total credits to study (new + retake)
 */

/**
 * @typedef {Object} RetakeSuggestion
 * @property {Course[]} courses - Courses to retake
 * @property {number} totalGain - Total point gain
 * @property {number} totalCredits - Total credits of retake courses
 */

/**
 * @typedef {Object} GradeCombination
 * @property {Object} g1 - First grade info
 * @property {number} c1 - Credits for first grade
 * @property {Object} g2 - Second grade info
 * @property {number} c2 - Credits for second grade
 * @property {number} totalPoints - Total points from combination
 */

// ==========================================
// Helper Functions
// ==========================================

/**
 * Find grade information by letter grade
 * @param {string} grade - Letter grade
 * @returns {Object|undefined} Grade info from GRADE_SCALE
 */
function findGradeInfo(grade) {
  return GRADE_SCALE.find(g => g.grade === grade);
}

/**
 * Get GPA value for a letter grade
 * @param {string} grade - Letter grade
 * @returns {number} GPA value (0-4.0)
 */
function getGPAPoints(grade) {
  const info = findGradeInfo(grade);
  return info ? info.gpa : 0;
}

/**
 * Round GPA to 2 decimal places
 * @param {number} gpa - Raw GPA value
 * @returns {number} Rounded GPA
 */
function roundGPA(gpa) {
  return Math.round(gpa * 100) / 100;
}

/**
 * Classify GPA into academic rank
 * @param {number} gpa - GPA value
 * @returns {string} Rank label
 */
function classifyGPA(gpa) {
  const rounded = parseFloat(gpa.toFixed(2));
  
  for (const rank of Object.values(GPA_RANKS)) {
    if (rounded >= rank.min && rounded <= rank.max + 0.001) {
      return rank.label;
    }
  }
  return GPA_RANKS.WEAK.label;
}

/**
 * Get color class for a grade
 * @param {string} grade - Letter grade
 * @returns {string} Bootstrap color class
 */
export function getGradeColor(grade) {
  if (!grade) return 'secondary';
  if (grade.startsWith('A')) return 'success';
  if (grade.startsWith('B')) return 'primary';
  if (grade.startsWith('C')) return 'info';
  if (grade.startsWith('D')) return 'warning';
  return 'danger';
}

// ==========================================
// Core Calculation Functions
// ==========================================

/**
 * Calculate GPA from semester data
 * @param {Semester[]} semesters - Array of semesters
 * @param {number} initialGPA - Starting GPA
 * @param {number} initialCredits - Starting credits
 * @returns {GPAResult} Calculation result
 */
export function calculateManualGPA(semesters, initialGPA, initialCredits) {
  const state = createCalculationState(initialGPA, initialCredits);
  
  for (const semester of semesters) {
    processSemester(semester, state);
  }
  
  return finalizeCalculation(state);
}

/**
 * Initialize calculation state
 * @param {number} initialGPA - Starting GPA
 * @param {number} initialCredits - Starting credits
 * @returns {Object} Calculation state object
 */
function createCalculationState(initialGPA, initialCredits) {
  const credits = Math.max(0, parseFloat(initialCredits) || 0);
  const gpa = Math.max(0, parseFloat(initialGPA) || 0);
  
  return {
    totalPoints: gpa * credits,
    totalCredits: credits,
    courseCount: 0
  };
}

/**
 * Process a semester
 * @param {Semester} semester - Semester data
 * @param {Object} state - Calculation state
 */
function processSemester(semester, state) {
  if (!semester?.courses?.length) return;
  
  for (const course of semester.courses) {
    processCourse(course, state);
  }
}

/**
 * Process a single course
 * @param {Course} course - Course data
 * @param {Object} state - Calculation state
 */
function processCourse(course, state) {
  const gradeInfo = findGradeInfo(course.grade);
  if (!gradeInfo) return;
  
  const credits = parseFloat(course.credits) || 0;
  
  if (course.isRetake) {
    processRetake(course, gradeInfo, credits, state);
  } else {
    processRegularCourse(gradeInfo, credits, state);
  }
  
  state.courseCount++;
}

/**
 * Process a retake course
 * @param {Course} course - Course with retake flag
 * @param {Object} newGradeInfo - New grade information
 * @param {number} credits - Course credits
 * @param {Object} state - Calculation state
 */
function processRetake(course, newGradeInfo, credits, state) {
  const oldGradeInfo = findGradeInfo(course.oldGrade);
  if (!oldGradeInfo) return;
  
  const newGPA = newGradeInfo.gpa;
  const oldGPA = oldGradeInfo.gpa;
  
  if (newGPA > oldGPA) {
    state.totalPoints += (newGPA - oldGPA) * credits;
    
    if (oldGPA === 0 && newGPA > 0) {
      state.totalCredits += credits;
    }
  }
}

/**
 * Process a regular course
 * @param {Object} gradeInfo - Grade information
 * @param {number} credits - Course credits
 * @param {Object} state - Calculation state
 */
function processRegularCourse(gradeInfo, credits, state) {
  state.totalPoints += gradeInfo.gpa * credits;
  if (gradeInfo.gpa > 0) {
    state.totalCredits += credits;
  }
}

/**
 * Finalize calculation and return result
 * @param {Object} state - Calculation state
 * @returns {GPAResult} Final result
 */
function finalizeCalculation(state) {
  const gpa = state.totalCredits > 0 
    ? state.totalPoints / state.totalCredits 
    : 0;
  
  return {
    gpa: roundGPA(gpa),
    totalCredits: state.totalCredits,
    totalPoints: roundGPA(state.totalPoints),
    rank: classifyGPA(gpa)
  };
}

// ==========================================
// Target GPA Functions
// ==========================================

/**
 * Calculate required GPA to reach target
 * @param {number} currentGPA - Current GPA
 * @param {number} currentCredits - Current earned credits
 * @param {number} targetGPA - Target GPA
 * @param {number} newCredits - New credits to take
 * @param {Array<{oldGrade: number, credits: number}>} retakes - Retake items
 * @returns {TargetResult} Calculation result
 */
export function calculateTargetResult(currentGPA, currentCredits, targetGPA, newCredits, retakes = []) {
  const retakeData = calculateRetakeImpact(retakes);
  
  const currentTotalPoints = currentGPA * currentCredits;
  const effectiveCurrentPoints = currentTotalPoints - retakeData.removedPoints;
  const totalFutureCredits = currentCredits + newCredits + retakeData.creditsFromF;
  const targetTotalPoints = targetGPA * totalFutureCredits;
  
  const requiredPoints = targetTotalPoints - effectiveCurrentPoints;
  const totalEffortCredits = newCredits + retakeData.totalCredits;
  const requiredGPA = totalEffortCredits > 0 ? (requiredPoints / totalEffortCredits) : 0;

  return {
    requiredGPA: roundGPA(requiredGPA),
    requiredPoints: roundGPA(requiredPoints),
    totalFutureCredits,
    effectiveCurrentPoints: roundGPA(effectiveCurrentPoints),
    targetTotalPoints: roundGPA(targetTotalPoints),
    newCredits,
    totalEffortCredits
  };
}

/**
 * Calculate impact of retakes
 * @param {Array<{oldGrade: number, credits: number}>} retakes - Retake items
 * @returns {Object} Impact data
 */
function calculateRetakeImpact(retakes) {
  let removedPoints = 0;
  let totalCredits = 0;
  let creditsFromF = 0;
  
  for (const item of retakes) {
    const oldGrade = parseFloat(item.oldGrade);
    const credits = parseFloat(item.credits);
    
    if (!isNaN(oldGrade) && !isNaN(credits)) {
      removedPoints += oldGrade * credits;
      totalCredits += credits;
      
      if (oldGrade === 0) {
        creditsFromF += credits;
      }
    }
  }
  
  return { removedPoints, totalCredits, creditsFromF };
}

// ==========================================
// Retake Suggestion Functions
// ==========================================

/**
 * Generate retake suggestions when target is impossible
 * @param {number} deficitPoints - Points needed beyond max possible
 * @param {number} targetGPA - Target GPA
 * @param {Semester[]} manualSemesters - User's semester data
 * @returns {RetakeSuggestion[]} Array of suggestions
 */
export function generateRetakeSuggestions(deficitPoints, targetGPA, manualSemesters) {
  const candidates = gatherRetakeCandidates(manualSemesters, targetGPA);
  const suggestions = findRetakeCombinations(candidates, deficitPoints);
  
  return suggestions.slice(0, 5);
}

/**
 * Gather all valid retake candidates from user's history
 * @param {Semester[]} semesters - User's semesters
 * @param {number} targetGPA - Target GPA
 * @returns {Array} Candidate courses
 */
function gatherRetakeCandidates(semesters, targetGPA) {
  const candidates = [];
  
  for (const sem of semesters) {
    for (const course of sem.courses) {
      if (!isValidRetakeCandidate(course)) continue;
      
      const gradeInfo = findGradeInfo(course.grade);
      if (!gradeInfo) continue;
      
      const currentGPA = gradeInfo.gpa;
      const credits = parseFloat(course.credits) || 0;
      
      if (credits < APP_CONFIG.MIN_CREDITS_FOR_RETAKE) continue;
      
      const gain = calculatePotentialGain(currentGPA, credits, targetGPA);
      
      candidates.push({
        ...course,
        semName: sem.name,
        currentGPA,
        gain
      });
    }
  }
  
  return candidates;
}

/**
 * Check if a course is a valid retake candidate
 * @param {Course} course - Course to check
 * @returns {boolean}
 */
function isValidRetakeCandidate(course) {
  // Skip if grade is non-improvable (A, B+, B)
  if (NON_IMPROVABLE_GRADES.includes(course.grade)) return false;
  
  // Skip if name contains * (ignored courses)
  if (course.name?.includes('*')) return false;
  
  return true;
}

/**
 * Calculate potential gain from retaking
 * @param {number} currentGPA - Current GPA for course
 * @param {number} credits - Course credits
 * @param {number} targetGPA - Target GPA
 * @returns {number} Potential point gain
 */
function calculatePotentialGain(currentGPA, credits, targetGPA) {
  if (currentGPA > 0) {
    return (APP_CONFIG.MAX_GPA - currentGPA) * credits;
  }
  return (APP_CONFIG.MAX_GPA - targetGPA) * credits;
}

/**
 * Find valid retake combinations
 * @param {Array} candidates - Retake candidates
 * @param {number} deficitPoints - Points needed
 * @returns {RetakeSuggestion[]} Valid combinations
 */
function findRetakeCombinations(candidates, deficitPoints) {
  const suggestions = [];
  
  const validCandidates = candidates.filter(c => {
    const creds = parseFloat(c.credits);
    return !isNaN(creds) && creds >= APP_CONFIG.MIN_CREDITS_FOR_RETAKE;
  });
  
  validCandidates.sort((a, b) => b.gain - a.gain);
  
  // Single courses
  for (const c of validCandidates) {
    if (c.gain >= deficitPoints) {
      suggestions.push({
        courses: [c],
        totalGain: c.gain,
        totalCredits: parseFloat(c.credits)
      });
    }
  }
  
  // Pairs (limit to top 50)
  const topCandidates = validCandidates.slice(0, 50);
  for (let i = 0; i < topCandidates.length; i++) {
    for (let j = i + 1; j < topCandidates.length; j++) {
      const c1 = topCandidates[i];
      const c2 = topCandidates[j];
      
      if (c1.id === c2.id) continue;
      
      const pairGain = c1.gain + c2.gain;
      
      if (pairGain >= deficitPoints) {
        suggestions.push({
          courses: [c1, c2],
          totalGain: pairGain,
          totalCredits: parseFloat(c1.credits) + parseFloat(c2.credits)
        });
      }
    }
  }
  
  // Sort by course count, then credits, then gain
  suggestions.sort((a, b) => {
    if (a.courses.length !== b.courses.length) {
      return a.courses.length - b.courses.length;
    }
    if (a.totalCredits !== b.totalCredits) {
      return a.totalCredits - b.totalCredits;
    }
    return b.totalGain - a.totalGain;
  });
  
  return suggestions;
}

// ==========================================
// Grade Combination Functions
// ==========================================

/**
 * Generate possible grade combinations to achieve target
 * @param {number} credits - Total credits to achieve
 * @param {number} targetPoints - Points needed
 * @returns {GradeCombination[]} Valid combinations
 */
export function generateGradeCombinations(credits, targetPoints) {
  const combinations = [];
  const grades = GRADE_SCALE
    .filter(g => g.gpa > 0)
    .map(g => ({ 
      grade: g.grade, 
      gpa: g.gpa, 
      color: getGradeColor(g.grade) 
    }));
  
  for (let i = 0; i < grades.length; i++) {
    for (let j = i; j < grades.length; j++) {
      const combination = calculateCombination(grades[i], grades[j], credits, targetPoints);
      if (combination) {
        combinations.push(combination);
      }
    }
  }
  
  return combinations.sort((a, b) => a.totalPoints - b.totalPoints);
}

/**
 * Calculate a specific grade combination
 * @param {Object} g1 - First grade
 * @param {Object} g2 - Second grade
 * @param {number} credits - Total credits
 * @param {number} targetPoints - Points needed
 * @returns {GradeCombination|null} Combination or null if invalid
 */
function calculateCombination(g1, g2, credits, targetPoints) {
  let c1 = 0;
  let found = false;
  
  if (Math.abs(g1.gpa - g2.gpa) < 0.01) {
    // Same GPA - distribute evenly
    if (credits * g1.gpa >= targetPoints - 0.01) {
      c1 = 0;
      if (credits !== 1) {
        found = true;
      }
    }
  } else {
    // Different GPA - calculate optimal split
    const numerator = targetPoints - (credits * g2.gpa);
    const denominator = g1.gpa - g2.gpa;
    
    let minC1 = Math.ceil(numerator / denominator - 0.0001);
    if (minC1 < 0) minC1 = 0;
    
    // Avoid 1 credit
    if (minC1 === 1) minC1 = 2;
    
    const c2Temp = credits - minC1;
    if (c2Temp === 1) {
      minC1 += 1;
    }
    
    if (minC1 <= credits) {
      c1 = minC1;
      found = true;
    }
  }
  
  if (!found) return null;
  
  const c2 = credits - c1;
  
  // Skip if either is 1 credit
  if (c1 === 1 || c2 === 1) return null;
  
  const totalPoints = (c1 * g1.gpa) + (c2 * g2.gpa);
  
  return {
    g1,
    c1,
    g2,
    c2,
    totalPoints
  };
}

/**
 * Generate human-readable scenario text from combination
 * @param {GradeCombination} combination - Grade combination
 * @returns {string|null} Scenario text
 */
export function generateScenarioText(combination) {
  if (!combination) return null;
  
  const { g1, c1, g2, c2 } = combination;
  const textParts = [];
  
  if (c1 > 0) {
    const num1 = Math.round(c1 / APP_CONFIG.AVG_CREDITS_PER_COURSE) || 1;
    textParts.push(`${num1} môn ${g1.grade}`);
  }
  
  if (c2 > 0) {
    const num2 = Math.round(c2 / APP_CONFIG.AVG_CREDITS_PER_COURSE) || 1;
    textParts.push(`${num2} môn ${g2.grade}`);
  }
  
  if (textParts.length === 0) return 'Duy trì phong độ hiện tại.';
  
  return `Bạn cần đạt khoảng ${textParts.join(' và ')} trong các học kỳ tới.`;
}

// ==========================================
// Year/Statistics Functions
// ==========================================

/**
 * Extract year information from semester name
 * @param {string} semName - Semester name
 * @returns {{id: string, label: string}} Year info
 */
export function getYearInfo(semName) {
  const yearMatch = semName.match(/\((\d{4}-\d{4})\)/);
  if (yearMatch) {
    return { id: yearMatch[1], label: `Năm học ${yearMatch[1]}` };
  }
  
  const numMatch = semName.match(/Học kỳ (\d+)/i);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    const yearNum = Math.ceil(num / 3);
    return { id: `year_${yearNum}`, label: `Năm thứ ${yearNum}` };
  }
  
  return { id: 'other', label: 'Khác' };
}

/**
 * Calculate yearly statistics
 * @param {Semester[]} semesters - Array of semesters
 * @returns {Object} Statistics by year
 */
export function calculateYearlyStats(semesters) {
  const stats = {};
  
  for (const sem of semesters) {
    const yearInfo = getYearInfo(sem.name);
    
    if (!stats[yearInfo.id]) {
      stats[yearInfo.id] = {
        label: yearInfo.label,
        points: 0,
        credits: 0,
        semesterCount: 0
      };
    }
    
    for (const c of sem.courses) {
      const gradeInfo = findGradeInfo(c.grade);
      if (gradeInfo) {
        const gpa = gradeInfo.gpa;
        const credits = parseFloat(c.credits) || 0;
        stats[yearInfo.id].points += gpa * credits;
        stats[yearInfo.id].credits += credits;
      }
    }
    
    stats[yearInfo.id].semesterCount++;
  }
  
  return stats;
}

// Export helper functions for testing
export const _testHelpers = {
  findGradeInfo,
  getGPAPoints,
  roundGPA,
  classifyGPA,
  getGradeColor
};

// Export classifyGPA for use in UI
export { classifyGPA };
