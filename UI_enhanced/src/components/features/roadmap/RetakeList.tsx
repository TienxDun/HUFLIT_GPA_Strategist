"use client";

import { X, PlusCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADE_SCALE } from "@/lib/gpa-engine";
import type { RetakeItem } from "@/hooks/useRoadmapState";
import { GradeSuggestionDialog } from "./GradeSuggestionDialog";


interface RetakeListProps {
  retakes: RetakeItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  onToggleFromManual(course: { name: string; credits: number; grade: string }): void;
}

export function RetakeList({
  retakes,
  onAdd,
  onRemove,
  onUpdate,
  manualImprovableCourses,
  onToggleFromManual,
}: RetakeListProps) {
  return (
    <div className="pt-1 border-t border-slate-100 space-y-2">
      {/* Suggestions Section */}
      {manualImprovableCourses.length > 0 && (
        <div className="bg-blue-50/30 p-2.5 rounded-2xl border border-blue-100/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[9px] font-bold text-blue-600 uppercase tracking-tight">
              Gợi ý từ bảng điểm ({manualImprovableCourses.length})
            </Label>
            <GradeSuggestionDialog 
              courses={manualImprovableCourses} 
              retakes={retakes} 
              onToggle={onToggleFromManual} 
            />
          </div>
          <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
            {manualImprovableCourses.map((c, i) => {
              const isAdded = retakes.some(r => r.name === c.name);
              return (
                <button
                  key={i}
                  onClick={() => onToggleFromManual(c)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-bold transition-all w-full group/btn cursor-pointer ${
                    isAdded
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 -translate-y-0.5"
                      : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      c.grade === "F" ? "bg-rose-500" : "bg-amber-500"
                    }`} />
                    <span className="truncate pr-2">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">{c.credits}TC</span>
                    <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                      isAdded 
                        ? "bg-white/20 text-white" 
                        : (c.grade === "F" ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500")
                    }`}>
                      {c.grade}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Retake List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
            Môn đã chọn ({retakes.length})
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="h-7 text-[9px] font-black text-blue-600 uppercase tracking-tight bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl px-2 gap-1 shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="h-3 w-3" strokeWidth={3} /> Thêm môn
          </Button>
        </div>

        <div className="space-y-2">
          {retakes.length > 0 ? (
            <>
              <RetakeTableHeader />
              <div className="max-h-[160px] overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                {retakes.map(r => (
                  <RetakeRow key={r.id} retake={r} onRemove={onRemove} onUpdate={onUpdate} />
                ))}
              </div>
              <RetakeTotalRow retakes={retakes} />
            </>
          ) : (
            <div className="p-2 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/30">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter italic opacity-70">
                Chưa có môn cải thiện
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RetakeTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-1 px-1 mb-1">
      <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Điểm cũ</div>
      <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Tín chỉ</div>
      <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Dự kiến</div>
      <div className="col-span-1" />
    </div>
  );
}

interface RetakeRowProps {
  retake: RetakeItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
}

function RetakeRow({ retake: r, onRemove, onUpdate }: RetakeRowProps) {
  const oldGradeLabel = GRADE_SCALE.find(g => g.gpa === r.oldGrade)?.grade ?? "D";

  return (
    <div className="grid grid-cols-12 gap-1 items-center bg-white p-1 rounded-2xl border border-slate-100/70 group transition-all hover:border-blue-200 hover:shadow-sm relative overflow-hidden">
      <div className="col-span-3">
        <Select
          value={oldGradeLabel}
          onValueChange={val => {
            const gInfo = GRADE_SCALE.find(g => g.grade === val);
            if (gInfo) onUpdate(r.id, "oldGrade", gInfo.gpa);
          }}
        >
          <SelectTrigger className="h-7 w-full text-[10px] font-bold bg-white border-slate-100 text-rose-500 rounded-lg focus:ring-0 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["F", "D", "D+", "C", "C+"].map(grade => (
              <SelectItem key={grade} value={grade} className="text-[10px] font-bold">{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-3">
        <Input
          type="number"
          value={r.credits}
          onChange={e => onUpdate(r.id, "credits", parseInt(e.target.value) || 0)}
          className="h-7 w-full text-center text-[10px] font-bold bg-white border-slate-100 rounded-lg px-1 focus:ring-0"
        />
      </div>

      <div className="col-span-5">
        <Select
          value={r.targetGrade !== undefined ? String(r.targetGrade) : "auto"}
          onValueChange={val => {
            if (!val) return;
            const targetGrade = val === "auto" ? undefined : parseFloat(val);
            onUpdate(r.id, "targetGrade", targetGrade);
          }}
        >
          <SelectTrigger className={`h-7 w-full text-[10px] font-bold border rounded-lg focus:ring-0 justify-center cursor-pointer ${r.targetGrade !== undefined ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-500"}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto" className="text-[10px] font-bold italic">Tự động</SelectItem>
            {GRADE_SCALE.filter(g => g.gpa > 0).map(g => (
              <SelectItem key={g.grade} value={String(g.gpa)} className="text-[10px] font-bold">{g.grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(r.id)}
          className="h-6 w-6 text-slate-400 hover:text-rose-500 rounded-md transition-all active:scale-95"
        >
          <X className="h-3 w-3" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}

function RetakeTotalRow({ retakes }: { retakes: RetakeItem[] }) {
  const total = retakes.reduce((acc, r) => acc + (r.credits || 0), 0);
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200 mt-2">
      <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest">Tổng tín chỉ cải thiện</span>
      <span className="text-[11px] font-black text-blue-600 tabular-nums">{total} TC</span>
    </div>
  );
}
