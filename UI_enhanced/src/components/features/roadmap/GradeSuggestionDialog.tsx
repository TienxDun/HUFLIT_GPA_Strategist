"use client";

import { Lightbulb, Plus, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

interface Course {
  name: string;
  credits: number;
  grade: string;
  gpa: number;
}

interface GradeSuggestionDialogProps {
  courses: Course[];
  retakes: { name?: string }[];
  onToggle: (course: { name: string; credits: number; grade: string }) => void;
}

export function GradeSuggestionDialog({ courses, retakes, onToggle }: GradeSuggestionDialogProps) {
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    return courses.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.grade.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    filteredCourses.forEach(c => {
      if (!groups[c.grade]) groups[c.grade] = [];
      groups[c.grade].push(c);
    });
    return Object.entries(groups).sort((a, b) => {
      // Sort by grade value (GPA) ascending
      const gpaA = courses.find(c => c.grade === a[0])?.gpa || 0;
      const gpaB = courses.find(c => c.grade === b[0])?.gpa || 0;
      return gpaA - gpaB;
    });
  }, [filteredCourses, courses]);

  return (
    <Dialog>
      <DialogTrigger render={
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[9px] font-black text-blue-600 uppercase tracking-tight bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl px-2 gap-1 shadow-sm transition-all"
        >
          <Lightbulb className="h-3 w-3" strokeWidth={3} /> Xem tất cả
        </Button>
      } />

      <DialogContent className="sm:max-w-2xl w-[92vw] h-[85vh] rounded-[2rem] border border-slate-100 shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
        <div className="p-6 sm:p-8 space-y-6 shrink-0 border-b border-slate-50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-60">
              <Lightbulb className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cải thiện điểm số</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Gợi ý từ bảng điểm
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
              Chọn các môn có điểm thấp để đưa vào lộ trình cải thiện GPA.
            </DialogDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm môn học hoặc điểm số..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 bg-slate-50 border-slate-100 rounded-2xl text-sm font-medium focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar">
          <div className="space-y-8 pb-4">
            {groupedCourses.length > 0 ? (
              groupedCourses.map(([grade, group]) => (
                <div key={grade} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[11px] font-black border-none ${
                      grade === 'F' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      ĐIỂM {grade}
                    </Badge>
                    <div className="h-px flex-1 bg-slate-50" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{group.length} môn</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.map((c, i) => {
                      const isAdded = retakes.some(r => r.name === c.name);
                      return (
                        <button
                          key={i}
                          onClick={() => onToggle(c)}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left group/card cursor-pointer ${
                            isAdded
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                              : "bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:bg-blue-50/30"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 truncate pr-2">
                            <span className="text-[13px] font-bold truncate leading-tight">{c.name}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdded ? "text-blue-100" : "text-slate-400"}`}>
                              {c.credits} Tín chỉ
                            </span>
                          </div>
                          <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                            isAdded ? "bg-white/20" : "bg-slate-50 group-hover/card:bg-blue-100/50"
                          }`}>
                            {isAdded ? (
                              <Check className="h-4 w-4" strokeWidth={3} />
                            ) : (
                              <Plus className={`h-4 w-4 ${grade === 'F' ? 'text-rose-500' : 'text-amber-500'}`} strokeWidth={3} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Không tìm thấy môn học nào</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
