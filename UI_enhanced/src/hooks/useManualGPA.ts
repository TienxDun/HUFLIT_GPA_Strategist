"use client";

import { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { Semester, Course, calculateManualGPA, GPAResult, parsePortalText, GRADE_MAP } from "@/lib/gpa-engine";
import { toast } from "sonner";

const STORAGE_KEY = "huflit-manual-gpa-state";
const OLD_STORAGE_KEY = "manualGPAData";

export const useManualGPA = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialGPA, setInitialGPA] = useState<number>(0);
  const [initialCredits, setInitialCredits] = useState<number>(0);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.semesters && Array.isArray(data.semesters)) {
          setInitialGPA(data.initialGPA || 0);
          setInitialCredits(data.initialCredits || 0);
          setSemesters(data.semesters);
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ initialGPA, initialCredits, semesters }));
    }
  }, [initialGPA, initialCredits, semesters, isLoaded]);

  const deferredSemesters = useDeferredValue(semesters);
  const deferredInitialGPA = useDeferredValue(initialGPA);
  const deferredInitialCredits = useDeferredValue(initialCredits);

  const result: GPAResult = useMemo(() => {
    return calculateManualGPA(deferredSemesters, deferredInitialGPA, deferredInitialCredits);
  }, [deferredInitialGPA, deferredInitialCredits, deferredSemesters]);

  // Yearly Summary Logic
  const getYear = (name: string) => {
    const match = name.match(/\((\d{4}-\d{4})\)/);
    return match ? match[1] : null;
  };

  const yearlyStats = useMemo(() => {
    const stats: Record<string, { 
      points: number; 
      credits: number; 
      passedCredits: number;
      failedCredits: number;
      cumulativeCredits: number;
      cumulativeGPA: number;
    }> = {};

    deferredSemesters.forEach((sem, sIdx) => {
      // Priority: Detected year from name > Fallback to group by every 3 semesters
      const year = getYear(sem.name) || `Năm ${Math.floor(sIdx / 3) + 1}`;
      const sStats = result.semesterStats[sIdx];
      
      if (!sStats) return;

      if (!stats[year]) {
        stats[year] = { 
          points: 0, 
          credits: 0, 
          passedCredits: 0, 
          failedCredits: 0,
          cumulativeCredits: 0,
          cumulativeGPA: 0
        };
      }
      
      sem.courses.forEach((c) => {
        const gInfo = GRADE_MAP[c.grade];
        if (gInfo) {
          const credits = c.credits || 0;
          stats[year].points += gInfo.gpa * credits;
          stats[year].credits += credits;
          
          if (gInfo.gpa > 0) {
            stats[year].passedCredits += credits;
          } else {
            stats[year].failedCredits += credits;
          }
        }
      });

      // Update cumulative to the latest semester of this year
      stats[year].cumulativeCredits = sStats.cumulativeCredits;
      stats[year].cumulativeGPA = sStats.cumulativeGPA;
    });
    return stats;
  }, [deferredSemesters, result.semesterStats]);

  const updateInitialGPA = useCallback((val: number) => setInitialGPA(val), []);
  const updateInitialCredits = useCallback((val: number) => setInitialCredits(val), []);

  const updateSemesterName = useCallback((idx: number, name: string) => {
    setSemesters(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], name };
      return next;
    });
  }, []);

  const addSemester = useCallback(() => {
    setSemesters(prev => [
      ...prev,
      { name: `Học kỳ ${prev.length + 1}`, courses: [{ name: "", credits: 3, grade: "", isRetake: false }] }
    ]);
  }, []);

  const removeSemester = useCallback((idx: number) => {
    setSemesters(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const addCourse = useCallback((semIdx: number) => {
    setSemesters(prev => {
      const next = [...prev];
      next[semIdx] = {
        ...next[semIdx],
        courses: [...next[semIdx].courses, { name: "", credits: 3, grade: "", isRetake: false }]
      };
      return next;
    });
  }, []);

  const updateCourse = useCallback((semIdx: number, courseIdx: number, field: keyof Course, value: any) => {
    setSemesters(prev => {
      const next = [...prev];
      const nextCourses = [...next[semIdx].courses];
      nextCourses[courseIdx] = { ...nextCourses[courseIdx], [field]: value };
      next[semIdx] = { ...next[semIdx], courses: nextCourses };
      return next;
    });
  }, []);

  const removeCourse = useCallback((semIdx: number, courseIdx: number) => {
    setSemesters(prev => {
      const next = [...prev];
      const nextCourses = next[semIdx].courses.filter((_, i) => i !== courseIdx);
      
      if (nextCourses.length === 0) {
        return prev.filter((_, i) => i !== semIdx);
      }
      
      next[semIdx] = { ...next[semIdx], courses: nextCourses };
      return next;
    });
  }, []);

  const resetData = useCallback(() => {
    setInitialGPA(0);
    setInitialCredits(0);
    setSemesters([]);
    toast.success("Đã đặt lại dữ liệu.");
  }, []);

  const importFromPortal = useCallback((text: string) => {
    const imported = parsePortalText(text);
    if (imported.length > 0) {
      const totalCourses = imported.reduce((acc, sem) => acc + sem.courses.length, 0);
      setInitialGPA(0);
      setInitialCredits(0);
      setSemesters(imported);
      toast.success(`Phân tích thành công!`, {
        description: `Đã nạp ${imported.length} học kỳ với ${totalCourses} môn học vào hệ thống.`
      });
      return true;
    } else {
      toast.error("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại nội dung dán.");
      return false;
    }
  }, []);

  return {
    isLoaded,
    initialGPA,
    initialCredits,
    semesters,
    result,
    yearlyStats,
    getYear,
    updateInitialGPA,
    updateInitialCredits,
    updateSemesterName,
    addSemester,
    removeSemester,
    addCourse,
    updateCourse,
    removeCourse,
    resetData,
    importFromPortal
  };
};
