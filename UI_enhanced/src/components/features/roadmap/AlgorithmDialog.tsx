"use client";

import { Info, Calculator } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RetakeItem, RoadmapComputed } from "@/hooks/useRoadmapState";

interface AlgorithmDialogProps {
  currentGPA: number;
  currentCredits: number;
  targetGPA: number;
  remainingCredits: number;
  retakes: RetakeItem[];
  result: RoadmapComputed["result"];
}

export const AlgorithmDialog = memo(({
  currentGPA, currentCredits, targetGPA, remainingCredits, retakes, result,
}: AlgorithmDialogProps) => {
  const retakePointsTotal = retakes.reduce((acc, r) => acc + r.oldGrade * r.credits, 0);
  const effectiveCurrentPoints = currentGPA * currentCredits - retakePointsTotal;
  const extraRetakeCredits = result.totalFutureCredits - currentCredits - remainingCredits;

  return (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger render={
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-blue-600 font-bold text-[11px] uppercase tracking-wider h-8 rounded-xl group transition-all"
          >
            <Calculator className="h-3.5 w-3.5 mr-2 opacity-50 group-hover:opacity-100 transition-all" />
            Chi tiết thuật toán & Đối soát
          </Button>
        } />

        <DialogContent className="sm:max-w-xl w-[92vw] max-h-[90vh] rounded-[2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 overflow-y-auto bg-white flex flex-col gap-6">
          <DialogHeader />

          <div className="space-y-6">
            <AlgorithmStep
              number="01"
              title="Điểm hiện có"
              rows={[
                { label: "Điểm TL hiện tại:", value: (currentGPA * currentCredits).toFixed(2), op: "" },
                { label: "Điểm cải thiện:", value: retakePointsTotal.toFixed(2), op: "-", muted: true },
                { label: "Điểm hiện có (X):", value: effectiveCurrentPoints.toFixed(2), op: "=", bold: true },
              ]}
            />
            <AlgorithmStep
              number="02"
              title="Tín chỉ tương lai"
              rows={[
                { label: "TC hiện có:", value: currentCredits, op: "" },
                { label: "TC mới:", value: remainingCredits, op: "+" },
                { label: "TC bù rớt:", value: extraRetakeCredits, op: "+" },
                { label: "TC tương lai (Y):", value: result.totalFutureCredits, op: "=", bold: true },
              ]}
            />
            <AlgorithmStep
              number="03"
              title="Nỗ lực cần thiết"
              rows={[
                { label: "Mục tiêu × Y:", value: (targetGPA * result.totalFutureCredits).toFixed(2), op: "" },
                { label: "Điểm hiện có (X):", value: effectiveCurrentPoints.toFixed(2), op: "-", muted: true },
                { label: "Nỗ lực cần (Z):", value: result.requiredPoints.toFixed(2), op: "=", bold: true },
              ]}
            />
            <AlgorithmStep
              number="04"
              title="Kết quả trung bình"
              rows={[
                { label: "Nỗ lực cần (Z):", value: result.requiredPoints.toFixed(2), op: "" },
                { label: "TC nỗ lực:", value: result.totalEffortCredits, op: "/" },
                { label: "GPA CẦN ĐẠT:", value: result.requiredGPA === Infinity ? "KHÔNG THỂ" : result.requiredGPA.toFixed(2), op: "=", bold: true, highlight: true },
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

AlgorithmDialog.displayName = "AlgorithmDialog";

const DialogHeader = memo(() => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 opacity-60">
        <Info className="h-3.5 w-3.5" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Cơ chế tính toán</span>
      </div>
      <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
        Thuật toán lộ trình & Đối soát
      </DialogTitle>
      <DialogDescription className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
        Kiểm tra chi tiết các bước tính toán để đảm bảo lộ trình chính xác.
      </DialogDescription>
    </div>
  );
});

DialogHeader.displayName = "DialogHeader";

interface AlgorithmRow {
  label: string;
  value: string | number;
  op: string;
  muted?: boolean;
  bold?: boolean;
  highlight?: boolean;
}

interface AlgorithmStepProps {
  number: string;
  title: string;
  rows: AlgorithmRow[];
}

const AlgorithmStep = memo(({ number, title, rows }: AlgorithmStepProps) => {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-blue-600">{number}.</span> {title}
      </div>
      <div className="font-mono text-[13px] text-slate-600 space-y-1 border-l border-slate-100 pl-4 py-0.5">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          const rowClass = row.highlight
            ? "text-blue-600 font-black text-base"
            : row.bold
            ? "text-slate-900 font-bold"
            : row.muted
            ? "text-slate-400"
            : "";

          return (
            <div
              key={i}
              className={`flex items-baseline justify-between gap-2 ${rowClass} ${isLast ? "pt-1.5 border-t border-dashed border-slate-200 mt-1" : ""}`}
            >
              <span className="truncate">{row.label}</span>
              <span className={`shrink-0 tabular-nums ${row.highlight ? "" : ""}`}>
                <span className={`inline-block w-4 text-center mr-1 ${isLast && !row.highlight ? "text-slate-400" : "opacity-70"}`}>
                  {row.op}
                </span>
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

AlgorithmStep.displayName = "AlgorithmStep";
