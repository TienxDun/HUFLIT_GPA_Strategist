import { GRADE_SCALE } from './constants.js';

export function getYearInfo(semName) {
    // Try to find year pattern like (2023-2024)
    const yearMatch = semName.match(/\((\d{4}-\d{4})\)/);
    if (yearMatch) {
        return { id: yearMatch[1], label: `Năm học ${yearMatch[1]}` };
    }
    
    // Try to find "Học kỳ X"
    const numMatch = semName.match(/Học kỳ (\d+)/i);
    if (numMatch) {
        const num = parseInt(numMatch[1]);
        const yearNum = Math.ceil(num / 3); // Assume 3 semesters per year
        return { id: `year_${yearNum}`, label: `Năm thứ ${yearNum}` };
    }

    return { id: 'other', label: 'Khác' };
}

export function calculateYearlyStats(semesters) {
    const stats = {};
    
    semesters.forEach(sem => {
        const yearInfo = getYearInfo(sem.name);
        if (!stats[yearInfo.id]) {
            stats[yearInfo.id] = {
                label: yearInfo.label,
                points: 0,
                credits: 0,
                semesterCount: 0
            };
        }
        
        sem.courses.forEach(c => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === c.grade);
            if (gradeInfo) {
                const gpa = gradeInfo.gpa;
                const credits = parseFloat(c.credits) || 0;
                stats[yearInfo.id].points += gpa * credits;
                stats[yearInfo.id].credits += credits;
            }
        });
        stats[yearInfo.id].semesterCount++;
    });
    
    return stats;
}

export function calculateManualGPA(semesters, initialGPA, initialCredits) {
    let totalPoints = initialGPA * initialCredits;
    let totalCredits = initialCredits;

    semesters.forEach(sem => {
        sem.courses.forEach(course => {
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            const credits = parseFloat(course.credits) || 0;

            // Add current course - F grades don't count towards total credits
            totalPoints += gpa * credits;
            if (gpa > 0) {
                totalCredits += credits;
            }

            // Handle Retake Logic
            if (course.isRetake) {
                const oldGradeInfo = GRADE_SCALE.find(g => g.grade === course.oldGrade);
                const oldGpa = oldGradeInfo ? oldGradeInfo.gpa : 0;
                
                // Subtract old course effect - only if old grade was passing
                totalPoints -= oldGpa * credits;
                if (oldGpa > 0) {
                    totalCredits -= credits;
                }
            }
        });
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    
    let rank = 'Yếu';
    if (gpa >= 3.6) rank = 'Xuất sắc';
    else if (gpa >= 3.2) rank = 'Giỏi';
    else if (gpa >= 2.5) rank = 'Khá';
    else if (gpa >= 2.0) rank = 'Trung bình';

    return { gpa, totalCredits, totalPoints, rank };
}

export function generateRetakeSuggestions(deficitPoints, targetGPA, manualSemesters) {
    // 1. Gather all valid candidates from manualSemesters
    const candidates = [];
    
    manualSemesters.forEach(sem => {
        sem.courses.forEach(course => {
            // Skip if grade is A or A+ (GPA 4.0)
            const gradeInfo = GRADE_SCALE.find(g => g.grade === course.grade);
            if (!gradeInfo || gradeInfo.gpa >= 4.0) return;
            
            // Skip if ignored (name contains *)
            if (course.name && course.name.includes('*')) return;

            const currentGPA = gradeInfo.gpa;
            const credits = parseFloat(course.credits) || 0;
            
            // Skip if credits < 2 (Minimum credits requirement)
            if (credits < 2.0) return;

            // Calculate Potential Gain
            let gain = 0;
            if (currentGPA > 0) {
                gain = (4.0 - currentGPA) * credits;
            } else {
                gain = (4.0 - targetGPA) * credits;
            }
            
            candidates.push({
                ...course,
                semName: sem.name,
                currentGPA,
                gain
            });
        });
    });

    // 2. Find Combinations
    const suggestions = [];
    
    const validCandidates = candidates.filter(c => {
        const creds = parseFloat(c.credits);
        return !isNaN(creds) && creds >= 2.0;
    });

    validCandidates.sort((a, b) => b.gain - a.gain);
    
    // A. Single Courses
    for (const c of validCandidates) {
        if (c.gain >= deficitPoints) {
            suggestions.push({
                courses: [c],
                totalGain: c.gain,
                totalCredits: parseFloat(c.credits)
            });
        }
    }
    
    // B. Pairs (Limit to top 50 candidates)
    const topCandidates = validCandidates.slice(0, 50);
    for (let i = 0; i < topCandidates.length; i++) {
        for (let j = i + 1; j < topCandidates.length; j++) {
            const c1 = topCandidates[i];
            const c2 = topCandidates[j];
            
            if (c1.id === c2.id) continue;
            if (parseFloat(c1.credits) < 2.0 || parseFloat(c2.credits) < 2.0) continue;

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
    
    suggestions.sort((a, b) => {
        if (a.courses.length !== b.courses.length) return a.courses.length - b.courses.length;
        if (a.totalCredits !== b.totalCredits) return a.totalCredits - b.totalCredits;
        return b.totalGain - a.totalGain;
    });
    
    return suggestions.slice(0, 5);
}

export function calculateTargetResult(currentGPA, currentCredits, targetGPA, newCredits, retakes) {
    // retakes: array of { oldGrade, credits }
    
    let removedPoints = 0;
    let retakeCreditsTotal = 0;
    let retakeCreditsFromF = 0;
    
    retakes.forEach(item => {
        const oldGrade = item.oldGrade;
        const credits = item.credits;
        
        if (!isNaN(oldGrade) && !isNaN(credits)) {
            removedPoints += oldGrade * credits;
            retakeCreditsTotal += credits;
            
            if (oldGrade === 0) {
                retakeCreditsFromF += credits;
            }
        }
    });

    const currentTotalPoints = currentGPA * currentCredits;
    const effectiveCurrentPoints = currentTotalPoints - removedPoints;
    const totalFutureCredits = currentCredits + newCredits + retakeCreditsFromF;
    const targetTotalPoints = targetGPA * totalFutureCredits;
    
    const requiredPoints = targetTotalPoints - effectiveCurrentPoints;
    const requiredGPA = newCredits > 0 ? (requiredPoints / newCredits) : 0;

    return {
        requiredGPA,
        requiredPoints,
        totalFutureCredits,
        effectiveCurrentPoints,
        targetTotalPoints,
        newCredits
    };
}

export function generateGradeCombinations(credits, targetPoints) {
    const combinations = [];
    // Filter out F grade for combinations as it doesn't help achieving targets usually
    const grades = GRADE_SCALE.filter(g => g.gpa > 0).map(g => ({ grade: g.grade, gpa: g.gpa, color: getGradeColor(g.grade) }));
    
    // We look for combinations of two grades that satisfy the target points
    // c1 * g1 + c2 * g2 >= targetPoints
    // c1 + c2 = credits
    
    for (let i = 0; i < grades.length; i++) {
        for (let j = i; j < grades.length; j++) {
            const g1 = grades[i];
            const g2 = grades[j];
            
            // We want to find integer c1 such that:
            // c1 * g1.gpa + (credits - c1) * g2.gpa >= targetPoints
            // c1(g1.gpa - g2.gpa) >= targetPoints - credits * g2.gpa
            
            let c1 = 0;
            let found = false;
            
            if (Math.abs(g1.gpa - g2.gpa) < 0.01) {
                if (credits * g1.gpa >= targetPoints - 0.01) {
                    c1 = 0; // All credits to g2 (which is same as g1)
                    found = true;
                }
            } else {
                // g1.gpa > g2.gpa (since array is sorted desc)
                const numerator = targetPoints - (credits * g2.gpa);
                const denominator = g1.gpa - g2.gpa;
                
                // We need c1 >= numerator / denominator
                let minC1 = Math.ceil(numerator / denominator - 0.0001);
                if (minC1 < 0) minC1 = 0;
                
                if (minC1 <= credits) {
                    c1 = minC1;
                    found = true;
                }
            }
            
            if (found) {
                const c2 = credits - c1;
                const totalPoints = (c1 * g1.gpa) + (c2 * g2.gpa);
                
                combinations.push({
                    g1: g1,
                    c1: c1,
                    g2: g2,
                    c2: c2,
                    totalPoints: totalPoints
                });
            }
        }
    }
    
    // Sort by total points (closer to target is better)
    return combinations.sort((a, b) => a.totalPoints - b.totalPoints);
}

function getGradeColor(grade) {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'info';
    if (grade.startsWith('D')) return 'warning';
    return 'danger';
}
