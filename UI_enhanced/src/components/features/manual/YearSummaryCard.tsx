"use client";

import { memo } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface YearSummaryCardProps {
  year: string;
  data: {
    passedCredits: number;
    failedCredits: number;
    points: number;
    credits: number;
    cumulativeCredits: number;
    cumulativeGPA: number;
  };
}

const YearSummaryCard = memo(({ year, data }: YearSummaryCardProps) => {
  if (!data) return null;

  const yearGPA = data.credits > 0 ? data.points / data.credits : 0;

  return (
    <div className="w-full py-4 px-4 bg-transparent border-t border-slate-100">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between opacity-60">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Tổng kết {year}</h3>
          <div className="h-[0.5px] flex-1 bg-slate-200 mx-4"></div>
        </div>
        
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-2">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TC Đạt</span>
            <span className="text-sm font-black text-emerald-600 tracking-tight">
              <AnimatedNumber value={data.passedCredits} precision={0} />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TC Rớt</span>
            <span className="text-sm font-black text-rose-500 tracking-tight">
              <AnimatedNumber value={data.failedCredits} precision={0} />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPA Năm</span>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              <AnimatedNumber value={yearGPA} precision={2} />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TC Tích lũy</span>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              <AnimatedNumber value={data.cumulativeCredits} precision={0} />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">GPA Tích lũy</span>
            <span className="text-sm font-black text-blue-600 tracking-tight">
              <AnimatedNumber value={data.cumulativeGPA} precision={2} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

YearSummaryCard.displayName = "YearSummaryCard";

export default YearSummaryCard;
