"use client";

import { useState, useCallback } from "react";
import { GRADE_SCALE } from "@/lib/gpa-engine";

export function useSubjectCalculator() {
  const [ratio, setRatio] = useState<number>(0.4);
  const [processScore, setProcessScore] = useState<number>(5);

  const handleScoreChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | number) => {
    let val: number;
    if (typeof e === "number") {
      val = e;
    } else {
      val = parseFloat(e.target.value);
    }

    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 10) val = 10;
    setProcessScore(val);
  }, []);

  const finalRatio = 1 - ratio;
  const accumulatedScore = processScore * ratio;
  const minFinalToPass = Math.max(0, (4.0 - accumulatedScore) / finalRatio);

  const calculateRequiredFinal = useCallback((minTotal: number) => {
    return (minTotal - accumulatedScore) / finalRatio;
  }, [accumulatedScore, finalRatio]);

  const validScales = GRADE_SCALE.filter((g) => g.gpa > 0).sort((a, b) => b.min - a.min);

  return {
    ratio,
    setRatio,
    processScore,
    handleScoreChange,
    accumulatedScore,
    minFinalToPass,
    calculateRequiredFinal,
    validScales,
    finalRatio
  };
}
