"use client";

import { memo } from "react";

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

  return (
    <div className="w-full py-4 px-4 bg-transparent border-t border-slate-100">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between opacity-60">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Tổng kết {year}</h3>
          <div className="h-[0.5px] flex-1 bg-slate-200 mx-4"></div>
        </div>
        
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6 sm:gap-y-2">
          {[
            { label: "TC Đạt", value: data.passedCredits, color: "text-emerald-600" },
            { label: "TC Rớt", value: data.failedCredits, color: "text-rose-500" },
            { label: "GPA Năm", value: (data.points / (data.credits || 1)).toFixed(2), color: "text-slate-900" },
            { label: "TC Tích lũy", value: data.cumulativeCredits, color: "text-slate-900" },
            { label: "GPA Tích lũy", value: data.cumulativeGPA.toFixed(2), color: "text-blue-600" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className={`text-sm font-black ${item.color} tracking-tight`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

YearSummaryCard.displayName = "YearSummaryCard";

export default YearSummaryCard;
