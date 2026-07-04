import { GRADE_SCALE } from "./constants";
import { Semester, Course } from "./types";

export function parsePortalText(text: string): Semester[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const semesters: Semester[] = [];
  let currentSemester: Semester | null = null;

  for (const line of lines) {
    const semMatch = line.match(/Năm học:\s*(\d{4}-\d{4})\s*-\s*Học kỳ:\s*(HK\d+)/i);
    if (semMatch) {
      currentSemester = {
        name: `${semMatch[2]} (${semMatch[1]})`,
        courses: []
      };
      semesters.push(currentSemester);
      continue;
    }

    const courseMatch = line.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]\+?)(?=\s|$)/);
    const ungradedMatch = line.match(/(\d+(?:\.\d+)?)\s+(?=Chưa nhập điểm|Chưa khảo sát)/);

    if (courseMatch && currentSemester) {
      const matchIndex = courseMatch.index || 0;
      const prefix = line.substring(0, matchIndex).trim();
      let courseName = prefix;
      let courseCode = "";
      const nameMatch = prefix.match(/^\d+\s+(\w+)\s+(.+)$/);
      if (nameMatch) {
        courseCode = nameMatch[1].trim();
        courseName = nameMatch[2].trim();
      } else {
        const fallbackMatch = prefix.match(/^\d+\s+(.+)$/);
        if (fallbackMatch) {
          courseName = fallbackMatch[1].trim();
        }
      }

      if (courseName.includes('*')) continue;

      const credits = parseFloat(courseMatch[1]);
      const gradeChar = courseMatch[4];

      const suffix = line.substring(matchIndex + courseMatch[0].length).trim();
      const equivMatch = suffix.match(/(?:Tương đương|Thay thế|Môn thay thế):\s*([^\(]+?)\s*\((\w+)\)/i);
      let equivalentName: string | undefined = undefined;
      let equivalentCode: string | undefined = undefined;
      if (equivMatch) {
        equivalentName = equivMatch[1].trim();
        equivalentCode = equivMatch[2].trim();
      }

      const isValidGrade = GRADE_SCALE.some(g => g.grade === gradeChar);

      if (isValidGrade && credits < 20) {
        currentSemester.courses.push({
          name: courseName,
          code: courseCode || undefined,
          credits: credits,
          grade: gradeChar,
          isRetake: false,
          oldGrade: 'D',
          equivalentCode,
          equivalentName
        });
      }
    } else if (ungradedMatch && currentSemester) {
      const credits = parseFloat(ungradedMatch[1]);
      const matchIndex = ungradedMatch.index || 0;
      const prefix = line.substring(0, matchIndex).trim();
      let courseName = prefix;
      let courseCode = "";
      const nameMatch = prefix.match(/^\d+\s+(\w+)\s+(.+)$/);
      if (nameMatch) {
        courseCode = nameMatch[1].trim();
        courseName = nameMatch[2].trim();
      } else {
        const fallbackMatch = prefix.match(/^\d+\s+(.+)$/);
        if (fallbackMatch) {
          courseName = fallbackMatch[1].trim();
        }
      }
      
      if (courseName.includes('*')) continue;
      
      const suffix = line.substring(matchIndex + ungradedMatch[0].length).trim();
      const equivMatch = suffix.match(/(?:Tương đương|Thay thế|Môn thay thế):\s*([^\(]+?)\s*\((\w+)\)/i);
      let equivalentName: string | undefined = undefined;
      let equivalentCode: string | undefined = undefined;
      if (equivMatch) {
        equivalentName = equivMatch[1].trim();
        equivalentCode = equivMatch[2].trim();
      }
      
      if (credits < 20) {
        currentSemester.courses.push({
          name: courseName,
          code: courseCode || undefined,
          credits: credits,
          grade: "",
          isRetake: false,
          oldGrade: "",
          equivalentCode,
          equivalentName
        });
      }
    }
  }

  const allCourses: { course: Course; semValue: number }[] = [];
  semesters.map((sem, semIdx) => {
    let semValue = semIdx;
    const match = sem.name.match(/HK(\d+)\s*\((\d{4})-(\d{4})\)/);
    if (match) {
      const hk = parseInt(match[1]);
      const year = parseInt(match[2]);
      semValue = year * 10 + hk;
    }
    sem.courses.forEach(course => {
      allCourses.push({ course, semValue });
    });
  });

  allCourses.sort((a, b) => a.semValue - b.semValue);
  const gradeHistoryByName = new Map<string, string>();
  const gradeHistoryByCode = new Map<string, string>();

  allCourses.forEach(item => {
    const course = item.course;
    let oldGrade: string | undefined = undefined;

    if (course.equivalentCode && gradeHistoryByCode.has(course.equivalentCode)) {
      oldGrade = gradeHistoryByCode.get(course.equivalentCode);
    } else if (course.equivalentName && gradeHistoryByName.has(course.equivalentName)) {
      oldGrade = gradeHistoryByName.get(course.equivalentName);
    } else if (course.code && gradeHistoryByCode.has(course.code)) {
      oldGrade = gradeHistoryByCode.get(course.code);
    } else if (gradeHistoryByName.has(course.name)) {
      oldGrade = gradeHistoryByName.get(course.name);
    }

    if (oldGrade !== undefined) {
      course.isRetake = true;
      course.oldGrade = oldGrade;
    }

    if (course.code) gradeHistoryByCode.set(course.code, course.grade);
    gradeHistoryByName.set(course.name, course.grade);

    if (course.equivalentCode) gradeHistoryByCode.set(course.equivalentCode, course.grade);
    if (course.equivalentName) gradeHistoryByName.set(course.equivalentName, course.grade);
  });

  return semesters;
}
