"use client";

import { memo } from "react";
import { GraduationCap, Plus, Trash2, History } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Semester, Course } from "@/lib/gpa-engine";
import CourseRow from "./CourseRow";

interface SemesterCardProps {
  sem: Semester;
  sIdx: number;
  onUpdateName: (idx: number, name: string) => void;
  onRemoveSemester: (idx: number) => void;
  onAddCourse: (semIdx: number) => void;
  onUpdateCourse: (semIdx: number, courseIdx: number, field: keyof Course, value: any) => void;
  onRemoveCourse: (semIdx: number, courseIdx: number) => void;
  isOnlySemester: boolean;
  semStats?: {
    gpa: number;
    isWarning: boolean;
    passedCredits: number;
    failedCredits: number;
    cumulativeCredits: number;
    cumulativeGPA: number;
  };
}

const SemesterCard = memo(({
  sem,
  sIdx,
  onUpdateName,
  onRemoveSemester,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  isOnlySemester,
  semStats
}: SemesterCardProps) => {

  return (
    <div className="space-y-4">
      <Card className="ring-0 border border-slate-200 bg-white/80 backdrop-blur-xl shadow-xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 gap-0 py-0">
        <CardHeader className="bg-white border-b border-slate-100 py-3 !pb-3 px-4 flex flex-row items-center justify-between group/header transition-all hover:bg-slate-50/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm shrink-0 group-hover/header:scale-105 transition-transform duration-300">
              <GraduationCap className="h-4 w-4" />
            </div>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Học kỳ {String(sIdx + 1).padStart(2, '0')}</span>
                <div className="h-3 w-px bg-slate-200 hidden sm:block" />
              </div>
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  value={sem.name}
                  onChange={(e) => onUpdateName(sIdx, e.target.value)}
                  className="bg-transparent border-none text-sm font-black text-slate-800 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto w-full placeholder:text-slate-400 truncate"
                  placeholder="Tên học kỳ..."
                />
                {semStats?.isWarning && (
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" title="Cảnh báo học tập" />
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ms-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={isOnlySemester}
              onClick={() => onRemoveSemester(sIdx)}
              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-0 group-hover/header:opacity-100"
              aria-label={`Xóa học kỳ ${sIdx + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm mx-1 mt-2">
            <Table>
              <TableHeader className="bg-slate-50/50 border-b border-slate-200">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider ps-2 sm:ps-6 py-2">Môn học</TableHead>
                  <TableHead className="w-[15%] sm:w-[15%] text-[10px] font-semibold uppercase text-slate-500 tracking-wider text-center py-2 px-1">Tín</TableHead>
                  <TableHead className="w-[18%] text-[10px] font-semibold uppercase text-slate-500 tracking-wider text-center py-2 px-1">Điểm</TableHead>
                  <TableHead className="w-[15%] text-[10px] font-semibold uppercase text-slate-500 tracking-wider text-center py-2 px-1">
                    <span className="hidden sm:inline">Học Lại</span>
                    <span className="sm:hidden">HL</span>
                  </TableHead>
                  <TableHead className="w-[8%] text-right pe-2 sm:pe-5 py-2"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sem.courses.map((course, cIdx) => (
                  <CourseRow
                    key={cIdx}
                    course={course}
                    sIdx={sIdx}
                    cIdx={cIdx}
                    onUpdate={onUpdateCourse}
                    onRemove={onRemoveCourse}
                  />
                ))}
              </TableBody>
            </Table>

            <div className="py-2 bg-slate-50/30 border-t border-slate-100 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddCourse(sIdx)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 font-bold text-xs gap-2 h-8 px-4 rounded-lg transition-all"
                aria-label="Thêm môn học mới"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm môn học
              </Button>
            </div>
          </div>

          {semStats && (
            <div className="px-1 pt-1.5">
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-2 grid grid-cols-2 lg:grid-cols-5 gap-2">
                <div className="flex flex-col items-center justify-center py-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Tín chỉ đạt</span>
                  <span className="text-sm font-bold text-emerald-600">{semStats.passedCredits}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-0.5 border-l border-slate-200/60">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${semStats.failedCredits > 0 ? "text-rose-400" : "text-slate-400"}`}>Tín chỉ rớt</span>
                  <span className={`text-sm font-bold ${semStats.failedCredits > 0 ? "text-rose-500" : "text-slate-500"}`}>{semStats.failedCredits}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-0.5 border-l border-slate-200/60">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${semStats.isWarning ? "text-rose-400" : "text-blue-400"}`}>GPA Học kỳ</span>
                  <span className={`text-sm font-bold ${semStats.isWarning ? "text-rose-500" : "text-blue-600"}`}>{semStats.gpa.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-0.5 border-l border-slate-200/60">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">TC Tích lũy</span>
                  <span className="text-sm font-bold text-slate-700">{semStats.cumulativeCredits}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-0.5 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-semibold text-blue-100/80 uppercase tracking-wider">GPA Tích lũy</span>
                  <span className="text-sm font-black text-white">{semStats.cumulativeGPA.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Year Summary - Pure Minimalism Style */}
        </CardContent>
      </Card>
    </div>
  );
});

SemesterCard.displayName = "SemesterCard";

export default SemesterCard;
