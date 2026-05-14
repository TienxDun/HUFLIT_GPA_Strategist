import { GRADE_SCALE, GPA_RANKS, GRADE_MAP } from "./constants";
import { Semester, GPAResult } from "./types";

export function findGradeInfo(grade: string) {
  return GRADE_MAP[grade];
}

export function roundGPA(gpa: number): number {
  return Math.round(gpa * 100) / 100;
}

export function classifyGPA(gpa: number): string {
  const rounded = parseFloat(gpa.toFixed(2));
  for (const rank of Object.values(GPA_RANKS)) {
    if (rounded >= rank.min && rounded <= rank.max + 0.001) {
      return rank.label;
    }
  }
  return GPA_RANKS.WEAK.label;
}

export function calculateManualGPA(
  semesters: Semester[],
  initialGPA: number = 0,
  initialCredits: number = 0
): GPAResult {
  const baseCredits = Math.max(0, initialCredits || 0);
  const baseGPA = Math.max(0, initialGPA || 0);

  const state = {
    totalPoints: baseGPA * baseCredits,
    totalCredits: baseCredits,
  };

  const semesterStats: GPAResult["semesterStats"] = [];

  if (!Array.isArray(semesters)) return { gpa: 0, totalCredits: 0, totalPoints: 0, rank: "N/A", semesterStats: [] };

  semesters.forEach((semester, sIdx) => {
    if (!semester?.courses?.length) {
      semesterStats.push({
        name: semester?.name || `Học kỳ ${sIdx + 1}`,
        gpa: 0,
        credits: 0,
        passedCredits: 0,
        failedCredits: 0,
        cumulativeGPA: state.totalCredits > 0 ? state.totalPoints / state.totalCredits : 0,
        cumulativeCredits: state.totalCredits,
        isWarning: false
      });
      return;
    }

    let semPoints = 0;
    let semCredits = 0;
    let passedCreditsInSem = 0;
    let failedCreditsInSem = 0;

    semester.courses.forEach((course) => {
      const gradeInfo = findGradeInfo(course.grade);
      if (!gradeInfo) return;

      const courseCredits = course.credits || 0;
      
      semPoints += gradeInfo.gpa * courseCredits;
      semCredits += courseCredits;

      if (gradeInfo.gpa > 0) {
        passedCreditsInSem += courseCredits;
      } else {
        failedCreditsInSem += courseCredits;
      }

      if (course.isRetake) {
        const oldGradeInfo = findGradeInfo(course.oldGrade || '');
        if (oldGradeInfo) {
          const newGPA = gradeInfo.gpa;
          const oldGPA = oldGradeInfo.gpa;
          const isOldF = oldGPA === 0;

          if (isOldF) {
            if (newGPA > 0) {
              state.totalPoints += newGPA * courseCredits;
              state.totalCredits += courseCredits;
            }
          } else {
            if (newGPA > oldGPA) {
              state.totalPoints += (newGPA - oldGPA) * courseCredits;
            }
          }
        } else {
          // Fallback: treat as new course if isRetake is true but oldGrade is missing
          if (gradeInfo.gpa > 0) {
            state.totalPoints += gradeInfo.gpa * courseCredits;
            state.totalCredits += courseCredits;
          }
        }
      } else {
        if (gradeInfo.gpa > 0) {
          state.totalPoints += gradeInfo.gpa * courseCredits;
          state.totalCredits += courseCredits;
        }
      }
    });

    const semGPA = semCredits > 0 ? semPoints / semCredits : 0;
    const threshold = sIdx === 0 ? 0.8 : 1.0;
    const isWarning = semCredits > 0 && semGPA < threshold;

    semesterStats.push({
      name: semester.name || `HK ${sIdx + 1}`,
      gpa: roundGPA(semGPA),
      credits: semCredits,
      passedCredits: passedCreditsInSem,
      failedCredits: failedCreditsInSem,
      cumulativeCredits: state.totalCredits,
      cumulativeGPA: state.totalCredits > 0 ? roundGPA(state.totalPoints / state.totalCredits) : 0,
      isWarning
    });
  });

  const finalCumulativeGpa = state.totalCredits > 0 ? state.totalPoints / state.totalCredits : 0;

  return {
    gpa: roundGPA(finalCumulativeGpa),
    totalCredits: state.totalCredits,
    totalPoints: roundGPA(state.totalPoints),
    rank: classifyGPA(finalCumulativeGpa),
    semesterStats
  };
}

export function calculateTargetResult(
  currentGPA: number,
  currentCredits: number,
  targetGPA: number,
  newCredits: number,
  retakes: { oldGrade: number; credits: number; targetGrade?: number }[] = []
) {
  let removedPoints = 0;
  let retakeTotalCredits = 0;
  let creditsFromF = 0;
  let lockedRetakePoints = 0;
  let lockedRetakeCredits = 0;

  for (const item of retakes) {
    const oldGrade = item.oldGrade;
    const creds = item.credits;
    if (!isNaN(oldGrade) && !isNaN(creds)) {
      removedPoints += oldGrade * creds;
      retakeTotalCredits += creds;
      if (oldGrade === 0) {
        creditsFromF += creds;
      }

      if (item.targetGrade !== undefined && !isNaN(item.targetGrade)) {
        lockedRetakePoints += item.targetGrade * creds;
        lockedRetakeCredits += creds;
      }
    }
  }

  const currentTotalPoints = currentGPA * currentCredits;
  const effectiveCurrentPoints = currentTotalPoints - removedPoints + lockedRetakePoints;
  const totalFutureCredits = currentCredits + newCredits + creditsFromF;
  const targetTotalPoints = targetGPA * totalFutureCredits;

  const requiredPoints = targetTotalPoints - effectiveCurrentPoints;
  const totalEffortCredits = newCredits + (retakeTotalCredits - lockedRetakeCredits);
  const requiredGPA = totalEffortCredits > 0 
    ? requiredPoints / totalEffortCredits 
    : (requiredPoints > 0.001 ? Infinity : 0);

  return {
    requiredGPA: roundGPA(requiredGPA),
    requiredPoints: roundGPA(requiredPoints),
    totalFutureCredits,
    effectiveCurrentPoints: roundGPA(effectiveCurrentPoints),
    targetTotalPoints: roundGPA(targetTotalPoints),
    newCredits,
    totalEffortCredits,
  };
}
