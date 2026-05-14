"use client";

import { Sparkles, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GRADE_SCALE, type GradeCombination, type RetakeSuggestion } from "@/lib/gpa-engine";
import type { RoadmapComputed } from "@/hooks/useRoadmapState";
import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";

interface ScenarioCardProps {
  scenarioText: string;
  combinations: GradeCombination[];
  result: RoadmapComputed["result"];
  retakeSuggestions: RetakeSuggestion[];
  hasManualData: boolean;
  missingScenarios: { label: string; credits: number; gainPerCredit: number }[];
  targetGPA: number;
  totalPointsGap: number;
  onAddRetakeSuggestion(suggestion: RetakeSuggestion): void;
  onSwitchTab?: (tab: string) => void;
}

export const ScenarioCard = memo(({
  scenarioText, combinations, result, retakeSuggestions, hasManualData, missingScenarios, targetGPA, totalPointsGap, onAddRetakeSuggestion, onSwitchTab,
}: ScenarioCardProps) => {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white rounded-2xl py-0 gap-0">
      <CardContent className="p-2.5 sm:p-3 space-y-2.5">
        <RecommendedScenario scenarioText={scenarioText} />
        {combinations.length > 1 && (
          <AlternativeCombinations combinations={combinations} result={result} targetGPA={targetGPA} />
        )}
        {result.requiredGPA > 4.0 && (
          <RescueSuggestions
            suggestions={retakeSuggestions}
            hasManualData={hasManualData}
            missingScenarios={missingScenarios}
            totalPointsGap={totalPointsGap}
            onAdd={onAddRetakeSuggestion}
            onSwitchTab={onSwitchTab}
          />
        )}
      </CardContent>
    </Card>
  );
});

ScenarioCard.displayName = "ScenarioCard";

const RecommendedScenario = memo(({ scenarioText }: { scenarioText: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Sparkles className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-1">Kịch bản khuyến nghị</div>
        <div className="text-sm font-bold text-slate-800 leading-snug tracking-tight">{scenarioText}</div>
      </div>
    </motion.div>
  );
});

RecommendedScenario.displayName = "RecommendedScenario";

interface AlternativeCombinationsProps {
  combinations: GradeCombination[];
  result: RoadmapComputed["result"];
  targetGPA: number;
}

const AlternativeCombinations = memo(({ combinations, result, targetGPA }: AlternativeCombinationsProps) => {
  return (
    <div className="space-y-3 pt-4 pb-2 border-t border-slate-50">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Phương án thay thế</div>
          <Badge variant="secondary" className="bg-slate-100/80 text-slate-500 text-[9px] font-black h-4 px-1.5 border-none rounded-md">
            {combinations.length}
          </Badge>
        </div>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
        {combinations.map((combo, i) => (
          <CombinationCard key={i} combo={combo} index={i} result={result} targetGPA={targetGPA} />
        ))}
      </div>
    </div>
  );
});

AlternativeCombinations.displayName = "AlternativeCombinations";

interface CombinationCardProps {
  combo: GradeCombination;
  index: number;
  result: RoadmapComputed["result"];
  targetGPA: number;
}

const CombinationCard = memo(({ combo: c, index: i, result, targetGPA }: CombinationCardProps) => {
  const earnedPoints = (targetGPA * result.totalFutureCredits) - result.requiredPoints + (c.g1.gpa * c.c1 + c.g2.gpa * c.c2);
  const totalPoints = targetGPA * result.totalFutureCredits;
  const isBest = i === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      className="group/combo p-2 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[9px] font-black py-0.5 px-2 rounded-lg uppercase tracking-widest">
            PHƯƠNG ÁN {i + 1}
          </Badge>
          {isBest && (
            <Badge className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase border-none h-4.5 px-2 tracking-widest">
              KHUYÊN DÙNG
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1 w-1 rounded-full ${isBest ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-[10px] font-black text-slate-600 tabular-nums">
            {earnedPoints.toFixed(2)} <span className="text-slate-400 font-bold">/ {totalPoints.toFixed(2)}đ</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {c.c1 > 0 && c.c2 > 0 ? (
          <>
            <GradeBlock grade={c.g1.grade} credits={c.c1} />
            <Plus className="h-3.5 w-3.5 text-slate-200 shrink-0" strokeWidth={2.5} />
            <GradeBlock grade={c.g2.grade} credits={c.c2} />
          </>
        ) : (
          <SingleGradeBlock grade={c.c1 > 0 ? c.g1.grade : c.g2.grade} credits={c.c1 + c.c2} />
        )}
      </div>
    </motion.div>
  );
});

CombinationCard.displayName = "CombinationCard";

type GradeLevel = "excellent" | "good" | "average" | "poor" | "fail";

function getGradeLevel(grade: string): GradeLevel {
  if (grade === "A" || grade === "A+") return "excellent";
  if (grade === "B+" || grade === "B") return "good";
  if (grade === "C+" || grade === "C") return "average";
  if (grade === "D+" || grade === "D") return "poor";
  return "fail";
}

const GRADE_THEME: Record<GradeLevel, {
  bg: string; border: string; badge: string; badgeText: string;
  gradeText: string; label: string;
}> = {
  excellent: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-500",
    badgeText: "text-white",
    gradeText: "text-emerald-700",
    label: "Xuất sắc",
  },
  good: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-500",
    badgeText: "text-white",
    gradeText: "text-blue-700",
    label: "Tốt",
  },
  average: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-500",
    badgeText: "text-white",
    gradeText: "text-amber-700",
    label: "Trung bình",
  },
  poor: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-500",
    badgeText: "text-white",
    gradeText: "text-orange-700",
    label: "Yếu",
  },
  fail: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-500",
    badgeText: "text-white",
    gradeText: "text-rose-700",
    label: "Kém",
  },
};

const GradeBlock = memo(({ grade, credits }: { grade: string; credits: number }) => {
  const level = getGradeLevel(grade);
  const theme = GRADE_THEME[level];

  return (
    <div className={`flex-1 flex items-center justify-between px-2.5 h-8 ${theme.bg} border ${theme.border} rounded-xl transition-all duration-200 hover:shadow-sm`}>
      <span className={`text-[15px] font-black tracking-tighter ${theme.gradeText}`}>{grade}</span>
      <div className={`flex items-center gap-1 px-1.5 py-0.5 ${theme.badge} rounded-lg shadow-sm`}>
        <span className={`text-[10px] font-black ${theme.badgeText} tabular-nums`}>{credits}</span>
        <span className={`text-[9px] font-black ${theme.badgeText} opacity-80 uppercase tracking-widest`}>TC</span>
      </div>
    </div>
  );
});

GradeBlock.displayName = "GradeBlock";

const SingleGradeBlock = memo(({ grade, credits }: { grade: string; credits: number }) => {
  const level = getGradeLevel(grade);
  const theme = GRADE_THEME[level];

  return (
    <div className={`w-full flex items-center justify-between px-3 h-8 ${theme.bg} border ${theme.border} rounded-xl transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center gap-2">
        <span className={`text-[17px] font-black tracking-tighter ${theme.gradeText}`}>{grade}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Toàn bộ tín chỉ còn lại</span>
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 ${theme.badge} rounded-lg shadow-sm`}>
        <span className={`text-[10px] font-black ${theme.badgeText} tabular-nums`}>{credits}</span>
        <span className={`text-[9px] font-black ${theme.badgeText} opacity-80 uppercase tracking-widest`}>TC</span>
      </div>
    </div>
  );
});

SingleGradeBlock.displayName = "SingleGradeBlock";

interface RescueSuggestionsProps {
  suggestions: RetakeSuggestion[];
  hasManualData: boolean;
  missingScenarios: { label: string; credits: number; gainPerCredit: number }[];
  totalPointsGap: number;
  onAdd(suggestion: RetakeSuggestion): void;
  onSwitchTab?: (tab: string) => void;
}

const RescueSuggestions = memo(({ suggestions, hasManualData, missingScenarios, totalPointsGap, onAdd, onSwitchTab }: RescueSuggestionsProps) => {
  const primaryMissing = missingScenarios.length > 0 ? missingScenarios[0].credits : 0;

  return (
    <div className="space-y-2 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <AlertCircle className="h-4 w-4" strokeWidth={2} />
          <span className="font-bold uppercase text-[11px] tracking-wider">Cứu vãn lộ trình</span>
        </div>
      </div>

      {missingScenarios.length > 0 ? (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-2.5 border-b border-slate-100 bg-white/80 backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Khoảng cách mục tiêu</span>
              {suggestions.length > 0 ? (
                <Badge className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none text-[9px] font-black px-2.5 h-4.5 rounded-full shadow-sm shadow-indigo-200 uppercase tracking-wider">
                  CÓ THỂ CỨU VÃN
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none text-[9px] font-bold px-2.5 h-4.5 rounded-full shadow-sm shadow-orange-200 uppercase tracking-wider">
                  CẦN CẢI THIỆN
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl flex items-center justify-between shadow-sm group/gap">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tín chỉ thiếu (~A)</span>
                <div className="flex items-baseline gap-1 ml-2">
                  <span className="text-base font-black text-rose-500 tracking-tighter group-hover/gap:scale-110 transition-transform tabular-nums">{primaryMissing}</span>
                  <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">TC</span>
                </div>
              </div>
              <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl flex items-center justify-between shadow-sm group/gap">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Điểm tổng thiếu</span>
                <div className="flex items-baseline gap-1 ml-2">
                  <span className="text-base font-black text-rose-500 tracking-tighter group-hover/gap:scale-110 transition-transform tabular-nums">{totalPointsGap.toFixed(2)}</span>
                  <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">ĐIỂM</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-medium text-slate-400 leading-tight italic opacity-80">
              * Bạn cần bổ sung tối thiểu lượng điểm/tín chỉ trên để đạt GPA mục tiêu.
            </p>
          </div>

          <div className="p-2.5 space-y-2 bg-slate-50/30">
            <div className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-indigo-100" />
              Phương án đề xuất
              <div className="h-px flex-1 bg-indigo-100" />
            </div>

            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <RescueSuggestionRow key={idx} suggestion={s} onAdd={onAdd} index={idx} />
                ))
              ) : (
                <div className="p-6 text-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                  <button
                    onClick={() => onSwitchTab?.('manual')}
                    className="group/manual text-[10px] font-black text-slate-400 uppercase tracking-widest italic hover:text-blue-600 transition-colors"
                  >
                    {hasManualData
                      ? "Không tìm thấy môn học cũ phù hợp để cải thiện."
                      : <>Vui lòng nhập dữ liệu ở <span className="text-blue-500 underline underline-offset-4 group-hover/manual:text-blue-700">tab Nhập điểm</span> để nhận gợi ý.</>}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-blue-50/50 border border-blue-100/50 rounded-xl">
              <div className="mt-1 h-1 w-1 rounded-full bg-blue-400 shrink-0" />
              <p className="text-[10px] font-medium text-blue-700/80 leading-relaxed">
                Nếu không muốn học lại, hãy cân nhắc <span className="font-bold text-blue-800">giảm mục tiêu GPA</span> hoặc <span className="font-bold text-blue-800">tăng số tín chỉ</span> dự kiến ở phần thiết lập.
              </p>
            </div>
          </div>
        </div>
      ) : (
        !hasManualData && (
          <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              NHẬP DỮ LIỆU BẢNG ĐIỂM ĐỂ NHẬN GỢI Ý CẢI THIỆN TỐI ƯU
            </p>
          </div>
        )
      )}
    </div>
  );
});

RescueSuggestions.displayName = "RescueSuggestions";

interface RescueSuggestionRowProps {
  suggestion: RetakeSuggestion;
  onAdd(suggestion: RetakeSuggestion): void;
  index: number;
}

const RescueSuggestionRow = memo(({ suggestion: s, onAdd, index }: RescueSuggestionRowProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 hover:shadow-indigo-500/5 hover:shadow-lg transition-all duration-300 overflow-hidden group/row"
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-4.5 w-4.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black border border-indigo-100 shadow-sm">
              {index + 1}
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              CẢI THIỆN {s.courses.length} MÔN
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black h-5 px-1.5 tracking-widest">
              +{s.totalGain.toFixed(2)}Đ
            </Badge>
            <Button
              onClick={() => onAdd(s)}
              className="h-6 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all border-none shadow-sm active:scale-95"
            >
              Áp dụng
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          {s.courses.map((course, cIdx) => (
            <div key={cIdx} className="flex items-center justify-between bg-slate-50/30 p-1 rounded-lg border border-slate-50/50 group-hover/row:bg-white transition-colors">
              <div className="flex flex-col gap-0.5 max-w-[65%]">
                <span className="text-[12px] font-bold text-slate-700 truncate">{course.name}</span>
                <span className="text-[10px] font-medium text-slate-400">{course.credits} tín chỉ</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-rose-500/80">{course.grade}</span>
                  <div className="h-[1px] w-2.5 bg-slate-300 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-0.5 border-t border-r border-slate-300 rotate-45" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">A</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-100">
                  +{((4.0 - (GRADE_SCALE.find(g => g.grade === course.grade)?.gpa || 0)) * course.credits).toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

RescueSuggestionRow.displayName = "RescueSuggestionRow";
