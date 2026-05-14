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
      const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
      if (nameMatch) {
        courseName = nameMatch[1].trim();
      }

      if (courseName.includes('*')) continue;

      const credits = parseFloat(courseMatch[1]);
      let gradeChar = courseMatch[4];


      const isValidGrade = GRADE_SCALE.some(g => g.grade === gradeChar);

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
      const credits = parseFloat(ungradedMatch[1]);
      const matchIndex = ungradedMatch.index || 0;
      const prefix = line.substring(0, matchIndex).trim();
      let courseName = prefix;
      const nameMatch = prefix.match(/^\d+\s+\w+\s+(.+)$/);
      if (nameMatch) {
        courseName = nameMatch[1].trim();
      }
      
      if (courseName.includes('*')) continue;
      
      if (credits < 20) {
        currentSemester.courses.push({
          name: courseName,
          credits: credits,
          grade: "",
          isRetake: false,
          oldGrade: ""
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
  const courseHistory = new Map<string, string>();

  allCourses.forEach(item => {
    const name = item.course.name;
    if (courseHistory.has(name)) {
      item.course.isRetake = true;
      item.course.oldGrade = courseHistory.get(name);
    }
    courseHistory.set(name, item.course.grade);
  });

  return semesters;
}
