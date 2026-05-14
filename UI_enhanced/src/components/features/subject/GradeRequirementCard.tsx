"use client";

import React, { useMemo } from "react";

interface GradeRequirementCardProps {
  grade: string;
  gpa: number;
  requiredFinal: number;
}

export function GradeRequirementCard({ grade, gpa, requiredFinal }: GradeRequirementCardProps) {
  const isImpossible = requiredFinal > 10;
  const isAlreadyAchieved = requiredFinal <= 0;
  const percentage = Math.min(100, Math.max(0, (requiredFinal / 10) * 100));

  const styles = useMemo(() => {
    if (isAlreadyAchieved) {
      return {
        barColor: "bg-emerald-400",
        cardClass: "bg-emerald-50 border-emerald-200",
        gradeRingClass: "border-emerald-300 text-emerald-700 bg-emerald-50",
        scoreFontClass: "text-emerald-600",
        labelClass: "text-emerald-700",
        scoreDisplay: "Đã đạt",
        labelDisplay: "Đã đảm bảo"
      };
    }
    
    if (isImpossible) {
      return {
        barColor: "bg-slate-300",
        cardClass: "bg-slate-100/50 border-slate-200 opacity-60 grayscale-[0.3]",
        gradeRingClass: "border-slate-300 text-slate-400 bg-slate-100",
        scoreFontClass: "text-slate-400",
        labelClass: "text-slate-500",
        scoreDisplay: "—",
        labelDisplay: "Không khả thi"
      };
    }

    // Normal states based on difficulty (percentage)
    let barColor = "bg-orange-500";
    if (percentage <= 40) barColor = "bg-emerald-400";
    else if (percentage <= 65) barColor = "bg-blue-500";
    else if (percentage <= 85) barColor = "bg-amber-400";

    return {
      barColor,
      cardClass: "bg-slate-50 border-slate-200",
      gradeRingClass: "border-slate-300 text-slate-700 bg-slate-50",
      scoreFontClass: "text-slate-900",
      labelClass: "text-slate-600",
      scoreDisplay: requiredFinal.toFixed(2),
      labelDisplay: "Cần đạt / 10"
    };
  }, [isAlreadyAchieved, isImpossible, percentage, requiredFinal]);

  return (
    <div className={`p-2.5 rounded-2xl border flex flex-col gap-2 hover:scale-[1.01] hover:shadow-md transition-all duration-300 ${styles.cardClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center h-8 w-8 shrink-0 rounded-full font-semibold text-[11px] bg-white shadow-sm border-2 ${styles.gradeRingClass}`}>
            {grade}
          </span>
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-medium text-slate-700 leading-none">GPA {gpa.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className={`font-semibold text-base leading-none ${styles.scoreFontClass}`}>
            {styles.scoreDisplay}
          </span>
          <span className={`text-[10px] font-medium uppercase tracking-widest ${styles.labelClass}`}>
            {styles.labelDisplay}
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.barColor}`}
          style={{ width: isAlreadyAchieved || isImpossible ? "100%" : `${percentage}%` }}
        />
      </div>
    </div>
  );
}
