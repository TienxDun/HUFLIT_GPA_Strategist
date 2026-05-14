"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GPAResult, Semester, findGradeInfo } from "@/lib/gpa-engine";

interface ManualStatsProps {
  result: GPAResult;
  semesters: Semester[];
  onSwitchToRoadmap?: (data: any) => void;
}

const ManualStats = memo(({ result, semesters, onSwitchToRoadmap }: ManualStatsProps) => {
  const handleSwitchToRoadmap = () => {
    let remainingCredits = 0;
    let pendingRetakes: any[] = [];

    semesters.forEach(sem => {
      sem.courses.forEach(c => {
        if (!c.grade || c.grade === "") {
          if (c.isRetake) {
            const oldG = findGradeInfo(c.oldGrade || "D");
            pendingRetakes.push({
              id: Math.random().toString(),
              name: c.name,
              credits: c.credits,
              oldGrade: oldG?.gpa || 1.0
            });
          } else {
            remainingCredits += c.credits;
          }
        }
      });
    });

    onSwitchToRoadmap?.({
      gpa: result.gpa,
      credits: result.totalCredits,
      remainingCredits,
      pendingRetakes
    });
  };

  return (
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 py-0">
      <CardContent className="p-3 space-y-3.5">
        {/* GPA Display */}
        <div className="text-center py-1 relative">
          <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full -z-10"></div>
          <div className="text-[11px] font-bold text-blue-600/80 uppercase tracking-[0.2em] mb-1">GPA TÍCH LŨY MỚI</div>
          <div className={`text-2xl sm:text-3xl font-black leading-none tracking-tighter drop-shadow-sm ${
            result.gpa >= 3.6 ? "text-emerald-500" :
            result.gpa >= 3.2 ? "text-blue-600" :
            result.gpa >= 2.5 ? "text-amber-500" : "text-rose-500"
          }`}>
            {result.gpa.toFixed(2)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 pt-2.5 pb-0 border-t border-slate-200">
          <div className="flex flex-col items-center justify-center space-y-0.5 py-1 border-r border-slate-200">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Tín chỉ</div>
            <div className="text-xl font-bold text-slate-800">{result.totalCredits}</div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-1 py-1">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Xếp loại</div>
            <div className={`text-lg font-bold whitespace-nowrap ${
              result.rank === "Xuất sắc" ? "text-emerald-500" :
              result.rank === "Giỏi" ? "text-blue-600" :
              result.rank === "Khá" ? "text-amber-500" : "text-slate-700"
            }`}>
              {result.rank}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSwitchToRoadmap}
          className="w-full h-9 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
        >
          Tìm Lộ trình Học Tập
        </Button>
      </CardContent>
    </Card>
  );
});

ManualStats.displayName = "ManualStats";

export default ManualStats;
