"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  calculateTargetResult,
  generateGradeCombinations,
  generateScenarioText,
  generateRetakeSuggestions,
  calculateManualGPA,
  GRADE_SCALE,
  findGradeInfo,
  type GradeCombination,
  type RetakeSuggestion,
} from "@/lib/gpa-engine";
import { getResultStatus, type ResultStatus } from "@/lib/roadmap-utils";

const MANUAL_STORAGE_KEY = "huflit-manual-gpa-state";
const ROADMAP_STORAGE_KEY = "huflit-roadmap-state";

export interface RetakeItem {
  id: string;
  oldGrade: number;
  credits: number;
  name?: string;
  targetGrade?: number;
}

export interface InitialRoadmapData {
  gpa: number;
  credits: number;
  targetGPA?: number;
  remainingCredits?: number;
  pendingRetakes?: RetakeItem[];
}

export interface RoadmapState {
  currentGPA: number;
  currentCredits: number;
  targetGPA: number;
  remainingCredits: number;
  retakes: RetakeItem[];
}

export interface RoadmapActions {
  setCurrentGPA(v: number): void;
  setCurrentCredits(v: number): void;
  setTargetGPA(v: number): void;
  setRemainingCredits(v: number): void;
  setTotalGraduationCredits(total: number): void;
  syncFromManual(): void;
  addRetake(): void;
  removeRetake(id: string): void;
  updateRetake(id: string, field: string, value: unknown): void;
  addRetakesFromSuggestion(suggestion: RetakeSuggestion): void;
  toggleRetakeFromManual(course: { name: string; credits: number; grade: string }): void;
}

export interface RoadmapComputed {
  result: ReturnType<typeof calculateTargetResult>;
  maxPossibleGPA: number;
  combinations: GradeCombination[];
  scenarioText: string;
  retakeSuggestions: RetakeSuggestion[];
  status: ResultStatus;
  hasManualData: boolean;
  missingScenarios: { label: string; credits: number; gainPerCredit: number }[];
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  totalPointsGap: number;
}

function loadSavedState(): Partial<RoadmapState> | null {
  try {
    const saved = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return null;
}

export function useRoadmapState(initialData?: InitialRoadmapData | null) {
  const saved = loadSavedState();

  const [currentGPA, setCurrentGPA] = useState<number>(
    initialData?.gpa ?? saved?.currentGPA ?? 0
  );
  const [currentCredits, setCurrentCredits] = useState<number>(
    initialData?.credits ?? saved?.currentCredits ?? 0
  );
  const [targetGPA, setTargetGPA] = useState<number>(saved?.targetGPA ?? 0);
  const [remainingCredits, setRemainingCredits] = useState<number>(
    initialData?.remainingCredits ?? saved?.remainingCredits ?? 0
  );
  const [retakes, setRetakes] = useState<RetakeItem[]>(
    initialData?.pendingRetakes ?? saved?.retakes ?? []
  );
  const [manualVersion, setManualVersion] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify({
      currentGPA, currentCredits, targetGPA, remainingCredits, retakes,
    }));
  }, [isLoaded, currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  // Listen for manual data changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === MANUAL_STORAGE_KEY) {
        setManualVersion(v => v + 1);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setCurrentGPA(initialData.gpa);
    setCurrentCredits(initialData.credits);
    setRemainingCredits(initialData.remainingCredits || 0);
    setRetakes(initialData.pendingRetakes || []);
    
    if (initialData.targetGPA !== undefined && initialData.targetGPA > 0) {
      setTargetGPA(initialData.targetGPA);
    } else {
      const milestones = [2.0, 2.5, 3.2, 3.6];
      const nextTarget = milestones.find(m => m > initialData.gpa) || 0;
      setTargetGPA(nextTarget);
    }
  }, [initialData]);

  const result = useMemo(
    () => calculateTargetResult(currentGPA, currentCredits, targetGPA, remainingCredits, retakes),
    [currentGPA, currentCredits, targetGPA, remainingCredits, retakes]
  );

  const maxPossibleGPA = useMemo(() => {
    if (!result || result.totalFutureCredits === 0) return currentGPA;
    const pointsToReplace = retakes.reduce((acc, r) => acc + r.oldGrade * r.credits, 0);
    const effectiveCurrentPoints = currentGPA * currentCredits - pointsToReplace;
    const fixedTargetPoints = retakes
      .filter(r => r.targetGrade !== undefined)
      .reduce((acc, r) => acc + r.targetGrade! * r.credits, 0);
    const maxEffortPoints = result.totalEffortCredits * 4.0;
    return (effectiveCurrentPoints + fixedTargetPoints + maxEffortPoints) / result.totalFutureCredits;
  }, [currentGPA, currentCredits, retakes, result]);

  const combinations = useMemo(() => {
    if (result.requiredGPA > 4.0 || result.requiredGPA <= 0) return [];
    return generateGradeCombinations(result.totalEffortCredits, result.requiredPoints);
  }, [result]);

  const scenarioText = useMemo(() => {
    const isImpossible = result.requiredGPA > 4.0 ||
      (result.totalEffortCredits === 0 && currentGPA < targetGPA);
    const combo = combinations.length > 0 ? combinations[0] : null;
    return generateScenarioText(combo, result.totalEffortCredits, isImpossible);
  }, [combinations, result, currentGPA, targetGPA]);

  const retakeSuggestions = useMemo(() => {
    if (result.requiredGPA <= 4.0) return [];
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const { semesters } = JSON.parse(saved);
      const deficit = result.requiredPoints - 4.0 * result.totalEffortCredits;
      return generateRetakeSuggestions(deficit, targetGPA, semesters);
    } catch { return []; }
  }, [result, targetGPA, manualVersion]);

  const status = useMemo(
    () => getResultStatus(result.requiredGPA, result.totalEffortCredits, currentGPA, targetGPA),
    [result, currentGPA, targetGPA]
  );

  const hasManualData = useMemo(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      return data && data.semesters && data.semesters.length > 0;
    } catch { return false; }
  }, [manualVersion]);

  const missingScenarios = useMemo(() => {
    // If target is already met, no missing scenarios
    if (result.requiredGPA <= 4.0 && result.requiredGPA >= 0) return [];

    // Even if future credits are 0, we can calculate a deficit based on current cumulative GPA vs target
    const targetPointsAtGraduation = targetGPA * result.totalFutureCredits;
    const maxPossiblePointsAtGraduation = maxPossibleGPA * result.totalFutureCredits;
    
    // The deficit is how many total grade points we are missing to hit the target at graduation
    const pointsGap = targetPointsAtGraduation - maxPossiblePointsAtGraduation;
    
    if (pointsGap <= 0) return [];

    // Different retake strategies
    const strategies = [
      { label: "D lên A", gain: 3.0 },
      { label: "D+ lên A", gain: 2.5 },
      { label: "C lên A", gain: 2.0 },
      { label: "C+ lên A", gain: 1.5 },
    ];

    return strategies.map(s => ({
      label: s.label,
      credits: Math.ceil(pointsGap / s.gain),
      gainPerCredit: s.gain,
    })).filter(s => s.credits > 0);
  }, [result, targetGPA, maxPossibleGPA]);

  const totalPointsGap = useMemo(() => {
    if (result.requiredGPA <= 4.0 && result.requiredGPA >= 0) return 0;
    const targetPoints = targetGPA * result.totalFutureCredits;
    const maxPossiblePoints = maxPossibleGPA * result.totalFutureCredits;
    return Math.max(0, targetPoints - maxPossiblePoints);
  }, [result, targetGPA, maxPossibleGPA]);

  const manualImprovableCourses = useMemo(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (!saved) return [];
    try {
      const { semesters } = JSON.parse(saved);
      const candidates: { name: string; credits: number; grade: string; gpa: number }[] = [];
      const seen = new Set<string>();

      semesters.forEach((sem: any) => {
        sem.courses.forEach((c: any) => {
          const gInfo = findGradeInfo(c.grade);
          if (gInfo && gInfo.gpa < 3.0 && !seen.has(c.name)) {
            candidates.push({ name: c.name, credits: c.credits, grade: c.grade, gpa: gInfo.gpa });
            seen.add(c.name);
          }
        });
      });
      return candidates.sort((a, b) => a.gpa - b.gpa);
    } catch { return []; }
  }, [manualVersion]);

  const syncFromManual = useCallback(() => {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    
    // Clear everything if no saved data exists
    if (!saved) {
      setCurrentGPA(0);
      setCurrentCredits(0);
      setTargetGPA(0);
      setRemainingCredits(0);
      setRetakes([]);
      setManualVersion(v => v + 1);
      return;
    }

    try {
      const { semesters, initialGPA, initialCredits } = JSON.parse(saved);
      
      // Determine if there's actual data to sync
      const hasSemesters = semesters && semesters.length > 0;
      const hasInitialValues = initialGPA > 0 || initialCredits > 0;

      if (!hasSemesters && !hasInitialValues) {
        setCurrentGPA(0);
        setCurrentCredits(0);
        setTargetGPA(0);
        setRemainingCredits(0);
        setRetakes([]);
        setManualVersion(v => v + 1);
        return;
      }

      const calcResult = calculateManualGPA(semesters, initialGPA, initialCredits);
      setCurrentGPA(calcResult.gpa);
      setCurrentCredits(calcResult.totalCredits);
      setManualVersion(v => v + 1);

      // Sync retakes and remaining credits
      const manualRetakes: RetakeItem[] = [];
      let manualRemainingCredits = 0;
      
      if (hasSemesters) {
        semesters.forEach((sem: any) => {
          sem.courses.forEach((c: any) => {
            // Course without grade
            if (!c.grade || c.grade === "") {
              if (c.isRetake) {
                const gInfo = findGradeInfo(c.oldGrade || "D");
                manualRetakes.push({
                  id: Math.random().toString(),
                  oldGrade: gInfo?.gpa || 1.0,
                  credits: c.credits,
                  name: c.name,
                });
              } else {
                // New course planned but not yet graded
                manualRemainingCredits += c.credits;
              }
            }
          });
        });
      }
      
      // Always sync to ensure consistency
      setRetakes(manualRetakes);
      setRemainingCredits(manualRemainingCredits);

      // Auto-suggest next target GPA milestone based on new cumulative GPA
      const milestones = [2.0, 2.5, 3.2, 3.6];
      const nextTarget = milestones.find(m => m > calcResult.gpa) || 0;
      setTargetGPA(nextTarget);

    } catch (err) {
      // In case of parsing error, clear the state for safety
      setCurrentGPA(0);
      setCurrentCredits(0);
      setTargetGPA(0);
      setRemainingCredits(0);
      setRetakes([]);
    }
  }, []);

  const addRetake = useCallback(() =>
    setRetakes(prev => [...prev, { id: Math.random().toString(), oldGrade: 1.0, credits: 3, targetGrade: undefined }]), []);

  const removeRetake = useCallback((id: string) =>
    setRetakes(prev => prev.filter(r => r.id !== id)), []);

  const updateRetake = useCallback((id: string, field: string, value: unknown) =>
    setRetakes(prev => prev.map(r => r.id === id ? { ...r, [field]: value ?? undefined } : r)), []);

  const setTotalGraduationCredits = useCallback((total: number) =>
    setRemainingCredits(Math.max(0, total - currentCredits)), [currentCredits]);

  const addRetakesFromSuggestion = useCallback((suggestion: RetakeSuggestion) => {
    const newItems: RetakeItem[] = suggestion.courses.map(c => {
      const gInfo = findGradeInfo(c.grade);
      return { id: Math.random().toString(), oldGrade: gInfo?.gpa || 1.0, credits: c.credits, name: c.name };
    });
    setRetakes(prev => [...prev, ...newItems]);
  }, []);

  const toggleRetakeFromManual = useCallback((course: { name: string; credits: number; grade: string }) => {
    const isAlreadyAdded = retakes.some(r => r.name === course.name);
    if (isAlreadyAdded) {
      setRetakes(prev => prev.filter(r => r.name !== course.name));
    } else {
      const gInfo = findGradeInfo(course.grade);
      setRetakes(prev => [...prev, {
        id: Math.random().toString(),
        oldGrade: gInfo?.gpa || 1.0,
        credits: course.credits,
        name: course.name,
      }]);
    }
  }, [retakes]);

  const state: RoadmapState = useMemo(() => ({ 
    currentGPA, currentCredits, targetGPA, remainingCredits, retakes 
  }), [currentGPA, currentCredits, targetGPA, remainingCredits, retakes]);

  const actions: RoadmapActions = useMemo(() => ({
    setCurrentGPA,
    setCurrentCredits,
    setTargetGPA,
    setRemainingCredits,
    setTotalGraduationCredits,
    syncFromManual,
    addRetake,
    removeRetake,
    updateRetake,
    addRetakesFromSuggestion,
    toggleRetakeFromManual,
  }), [setTotalGraduationCredits, syncFromManual, addRetake, removeRetake, updateRetake, addRetakesFromSuggestion, toggleRetakeFromManual]);

  const computed: RoadmapComputed = useMemo(() => ({
    result,
    maxPossibleGPA,
    combinations,
    scenarioText,
    retakeSuggestions,
    status,
    hasManualData,
    missingScenarios,
    manualImprovableCourses,
    totalPointsGap,
  }), [result, maxPossibleGPA, combinations, scenarioText, retakeSuggestions, status, hasManualData, missingScenarios, manualImprovableCourses, totalPointsGap]);

  return { state, actions, computed };
}
