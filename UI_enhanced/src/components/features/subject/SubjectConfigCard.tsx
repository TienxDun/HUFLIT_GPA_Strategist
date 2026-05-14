"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

interface SubjectConfigCardProps {
  ratio: number;
  setRatio: (ratio: number) => void;
  processScore: number;
  handleScoreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accumulatedScore: number;
  minFinalToPass: number;
}

const RATIO_OPTIONS = [
  { value: 0.3, label: "30/70" },
  { value: 0.4, label: "40/60" },
  { value: 0.5, label: "50/50" }
];

export function SubjectConfigCard({
  ratio,
  setRatio,
  processScore,
  handleScoreChange,
  accumulatedScore,
  minFinalToPass
}: SubjectConfigCardProps) {
    const isImpossible = minFinalToPass > 10;
    const isPassed = minFinalToPass <= 0;
    const isHighEffort = minFinalToPass > 7.5 && !isImpossible;
    const scoreToPassDisplay = isImpossible ? "Không thể" : isPassed ? "Đã đạt" : minFinalToPass.toFixed(1);

    return (
      <Card className="w-full border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden gap-0 py-0">
        <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm">
              <Settings2 className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">Cấu hình môn học</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5 pt-4 px-4 pb-4">
          {/* Phần cấu hình tham số */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ps-1 flex items-center gap-2">
                Tỷ lệ (Quá trình / Cuối kỳ)
              </Label>
              <div className="flex p-1 bg-slate-100/50 backdrop-blur-md border border-slate-200/50 rounded-xl">
              {RATIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRatio(option.value)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    ratio === option.value
                      ? "bg-white text-blue-700 shadow-sm scale-[1.02]"
                      : "text-slate-500 hover:text-blue-600 hover:bg-white/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
  
          <div className="space-y-2">
            <div className="flex justify-between items-end ps-1">
              <Label htmlFor="process-score" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Điểm quá trình (Hệ 10)
              </Label>
            </div>
            <div className="p-2.5 bg-white/50 backdrop-blur-md border border-white/40 rounded-2xl space-y-2.5 shadow-inner">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={processScore}
                onChange={handleScoreChange}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-500"
              />
              <div className="relative group">
                <Input
                  id="process-score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={processScore || ""}
                  onChange={handleScoreChange}
                  className="text-center font-bold text-blue-700 text-lg h-10 bg-white border border-blue-50 shadow-sm rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-text group-hover:border-blue-200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none group-focus-within:text-blue-200">
                  ĐIỂM
                </div>
              </div>
            </div>
          </div>
          </div>
  
          {/* Phần hiển thị kết quả */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Điểm đã có</p>
                <p className="text-[10px] font-bold text-blue-500/70 tracking-tighter opacity-80">(Quá trình × Tỷ lệ)</p>
              </div>
              <span className="text-base font-bold text-blue-700">{accumulatedScore.toFixed(2)}</span>
            </div>
  
            <div className={`border p-2.5 rounded-xl flex items-center justify-between shadow-sm transition-all duration-300 ${
              isImpossible ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${
                  isImpossible ? "text-red-600" : "text-emerald-600"
                }`}>Điểm cần qua môn</p>
                <p className="text-[10px] font-bold text-slate-500/70 tracking-tighter opacity-80">(Thi cuối kỳ tối thiểu)</p>
              </div>
              <span className={`text-base font-bold ${
                isImpossible ? "text-red-700" : "text-emerald-700"
              }`}>{scoreToPassDisplay}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
}
