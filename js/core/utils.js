import { GRADE_SCALE } from './constants.js';

export function parsePortalText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const semesters = [];
    let currentSemester = null;

    for (const line of lines) {
        // Check for Semester Header
        // "Năm học: 2023-2024 - Học kỳ: HK01"
        const semMatch = line.match(/Năm học:\s*(\d{4}-\d{4})\s*-\s*Học kỳ:\s*(HK\d+)/i);
        if (semMatch) {
            currentSemester = {
                name: `${semMatch[2]} (${semMatch[1]})`, // HK01 (2023-2024)
                courses: []
            };
            semesters.push(currentSemester);
            continue;
        }

        // Check for Course Line (Graded)
        // Regex to find: Credits (float), Grade10 (float), Grade4 (float), GradeChar (Letters+opt +)
        // Matches: 3.0 7.0 3.00 B
        // Updated regex to correctly handle '+' grades by using lookahead (?=\s|$) instead of \b
        const courseMatch = line.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]\+?)(?=\s|$)/);
        
        // Check for Course Line (Ungraded)
        // Matches: Credits (float) followed by "Chưa nhập điểm" or "Chưa khảo sát"
        const ungradedMatch = line.match(/(\d+(?:\.\d+)?)\s+(?=Chưa nhập điểm|Chưa khảo sát)/);

        if (courseMatch && currentSemester) {
            // Extract parts
            const matchIndex = courseMatch.index;
            const prefix = line.substring(0, matchIndex).trim();
            
            // Try to extract name from prefix "STT Code Name"
            // Remove STT (digits) and Code (alphanumeric)
            // Example: "1 1010443 Triết học Mác - Lênin"
            let courseName = prefix;
            
            // Regex to remove STT and Code: ^\d+\s+\w+\s+
            const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
            if (nameMatch) {
                courseName = nameMatch[1].trim();
            }

            // Skip courses with '*' in the name (e.g. "Giáo dục quốc phòng *")
            if (courseName.includes('*')) {
                continue;
            }

            const credits = parseFloat(courseMatch[1]);
            let gradeChar = courseMatch[4];

            // Map A+ to A (since A+ is not in standard scale but appears in portal)
            if (gradeChar === 'A+') {
                gradeChar = 'A';
            }

            // Validate grade char against GRADE_SCALE
            const isValidGrade = GRADE_SCALE.some(g => g.grade === gradeChar);

            // Additional check: Credits should be reasonable (e.g. < 20) to avoid matching course codes
            if (isValidGrade && credits < 20) {
                currentSemester.courses.push({
                    name: courseName,
                    credits: credits,
                    grade: gradeChar,
                    isRetake: false,
                    oldGrade: 'D'
                });
            }
        } else if (ungradedMatch && currentSemester) {
            // Handle Ungraded Course
            const credits = parseFloat(ungradedMatch[1]);
            const matchIndex = ungradedMatch.index;
            const prefix = line.substring(0, matchIndex).trim();
            
            let courseName = prefix;
            const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
            if (nameMatch) {
                courseName = nameMatch[1].trim();
            }
            
            // Skip courses with '*' in the name
            if (courseName.includes('*')) {
                continue;
            }
            
            if (credits < 20) {
                currentSemester.courses.push({
                    name: courseName,
                    credits: credits,
                    grade: "", // Empty grade
                    isRetake: false,
                    oldGrade: ""
                });
            }
        }
    }

    // Post-processing: Detect Retakes based on Chronological Order
    // 1. Flatten courses with metadata
    const allCourses = [];
    semesters.forEach((sem, semIdx) => {
        // Parse semester value for sorting: "HK01 (2023-2024)"
        let semValue = 0;
        const match = sem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
        if (match) {
            const hk = parseInt(match[1]);
            const year = parseInt(match[2]);
            semValue = year * 10 + hk;
        } else {
            // Fallback: use index if format doesn't match
            semValue = semIdx; 
        }

        sem.courses.forEach(course => {
            allCourses.push({
                course: course,
                semValue: semValue,
                semIdx: semIdx
            });
        });
    });

    // 2. Sort by Semester Value (Oldest First)
    allCourses.sort((a, b) => a.semValue - b.semValue);

    // 3. Detect Retakes
    const courseHistory = new Map(); // Name -> Grade

    allCourses.forEach(item => {
        const name = item.course.name;
        if (courseHistory.has(name)) {
            // Found a previous instance
            item.course.isRetake = true;
            item.course.oldGrade = courseHistory.get(name);
        }
        // Update history with current grade
        courseHistory.set(name, item.course.grade);
    });

    return semesters;
}
