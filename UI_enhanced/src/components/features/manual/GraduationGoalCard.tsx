"use client";

import { memo, useState, useEffect, useMemo, useRef } from "react";
import { 
  GraduationCap, 
  ChevronDown, 
  ArrowRight,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  calculateGraduationAnalysis, 
  GRADUATION_TARGETS, 
  DEFAULT_HUFLIT_CREDITS,
  HUFLIT_CREDIT_PRESETS,
  getRecommendedGraduationTarget,
  type GraduationAnalysis 
} from "@/lib/gpa/graduation-calculator";
import { GPAResult, Semester } from "@/lib/gpa-engine";
import { type InitialRoadmapData } from "@/hooks/useRoadmapState";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface GraduationGoalCardProps {
  result: GPAResult;
  semesters: Semester[];
  onSwitchToRoadmap?: (data: InitialRoadmapData) => void;
  className?: string;
}

const STORAGE_TARGET_GPA_KEY = "huflit-manual-grad-target-gpa";
const STORAGE_TOTAL_CREDITS_KEY = "huflit-manual-grad-total-credits";

const GraduationGoalCard = memo(({
  result,
  semesters,
  onSwitchToRoadmap,
  className
}: GraduationGoalCardProps) => {
  const [totalGradCredits, setTotalGradCredits] = useState<number>(DEFAULT_HUFLIT_CREDITS);
  const [targetGPA, setTargetGPA] = useState<number>(3.2);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hasUserChosenTarget, setHasUserChosenTarget] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [customCreditsInput, setCustomCreditsInput] = useState<string>(DEFAULT_HUFLIT_CREDITS.toString());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem(STORAGE_TARGET_GPA_KEY);
      const savedCredits = localStorage.getItem(STORAGE_TOTAL_CREDITS_KEY);
      if (savedTarget) {
        setTargetGPA(parseFloat(savedTarget));
        setHasUserChosenTarget(true);
      }
      if (savedCredits) {
        const parsed = parseInt(savedCredits, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setTotalGradCredits(parsed);
          setCustomCreditsInput(parsed.toString());
        }
      }
    } catch { }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Auto-suggest next optimal target if user hasn't explicitly set one
  useEffect(() => {
    if (!hasUserChosenTarget && result.totalCredits > 0) {
      const recommended = getRecommendedGraduationTarget(result.gpa);
      setTargetGPA(recommended);
    }
  }, [result.gpa, result.totalCredits, hasUserChosenTarget]);

  const handleSelectTarget = (val: number) => {
    setTargetGPA(val);
    setHasUserChosenTarget(true);
    try {
      localStorage.setItem(STORAGE_TARGET_GPA_KEY, val.toString());
    } catch { }
  };

  const handleSelectCredits = (creds: number) => {
    setTotalGradCredits(creds);
    setCustomCreditsInput(creds.toString());
    setIsDropdownOpen(false);
    try {
      localStorage.setItem(STORAGE_TOTAL_CREDITS_KEY, creds.toString());
    } catch { }
  };

  const handleSaveCustomCredits = () => {
    const parsed = parseInt(customCreditsInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      handleSelectCredits(Math.min(250, Math.max(50, parsed)));
    } else {
      setCustomCreditsInput(totalGradCredits.toString());
      setIsDropdownOpen(false);
    }
  };

  const analysis: GraduationAnalysis = useMemo(() => {
    return calculateGraduationAnalysis(
      result.gpa,
      result.totalCredits,
      targetGPA,
      totalGradCredits,
      semesters
    );
  }, [result.gpa, result.totalCredits, targetGPA, totalGradCredits, semesters]);

  const handleGoToRoadmap = () => {
    onSwitchToRoadmap?.({
      gpa: result.gpa,
      credits: result.totalCredits,
      targetGPA: targetGPA,
      remainingCredits: analysis.remainingCredits,
      pendingRetakes: []
    });
  };

  return (
    <Card className={`ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 py-0 relative ${className || ""}`}>
      {/* Header: Clean & Consistent with other cards */}
      <CardHeader 
        className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between space-y-0 select-none cursor-pointer rounded-t-xl"
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm text-blue-600 shrink-0">
            <GraduationCap className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">
            Mục tiêu Tốt nghiệp
          </CardTitle>
        </div>

        <button 
          type="button"
          className={`p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          aria-label="Thu gọn hoặc mở rộng"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 space-y-3.5">
          {/* Row 1: Credit Progress Info with Click-to-Edit Denominator */}
          <div className="space-y-2 pb-0.5" ref={dropdownRef}>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <span>Đã học:</span>
                <b className="text-slate-800 font-bold">
                  <AnimatedNumber value={analysis.completedCredits} precision={0} />
                </b>
                <span className="text-slate-400">/</span>

                {/* Trigger Button on Total Credits */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(prev => !prev);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-all cursor-pointer shadow-xs active:scale-95 group"
                  title="Bấm để đổi số tín chỉ tốt nghiệp theo ngành của bạn"
                >
                  <span className="border-b border-dashed border-blue-400 group-hover:border-blue-600">
                    <AnimatedNumber value={analysis.totalCredits} precision={0} /> TC
                  </span>
                  <ChevronDown className={`h-3 w-3 text-blue-500 group-hover:text-blue-700 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="font-bold text-blue-600">
                <AnimatedNumber value={analysis.progressPercent} precision={0} suffix="%" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${analysis.progressPercent}%` }}
              />
            </div>

            {/* In-flow Expandable Selector: 100% inside parent card with comfortable legible sizing */}
            {isDropdownOpen && (
              <div className="p-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Chọn chuẩn tín chỉ ra trường
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-1.5">
                  {[
                    { value: 130, title: "130 TC", badge: null, desc: "Khối Ngôn ngữ, Du lịch, Luật" },
                    { value: 135, title: "135 TC", badge: null, desc: "Khối Kinh tế, QTKD (Chuẩn mới)" },
                    { value: 140, title: "140 TC", badge: null, desc: "Khối CNTT, Kỹ thuật, Khóa cũ" },
                  ].map((p) => {
                    const isSelected = totalGradCredits === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleSelectCredits(p.value)}
                        className={`w-full text-left py-2 px-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500/20"
                            : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Radio Indicator */}
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800 text-xs whitespace-nowrap">{p.title}</span>
                              {p.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 whitespace-nowrap leading-none">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium leading-tight whitespace-nowrap mt-0.5">
                              {p.desc}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600 shrink-0 ms-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input Card */}
                <div className={`p-2 rounded-xl border transition-all ${
                  !HUFLIT_CREDIT_PRESETS.includes(totalGradCredits as any)
                    ? "bg-white border-blue-500 ring-1 ring-blue-500/20 shadow-xs"
                    : "bg-white/80 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        !HUFLIT_CREDIT_PRESETS.includes(totalGradCredits as any) ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                      }`}>
                        {!HUFLIT_CREDIT_PRESETS.includes(totalGradCredits as any) && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Tự nhập:</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={customCreditsInput}
                        onChange={(e) => setCustomCreditsInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveCustomCredits()}
                        placeholder="135"
                        className="w-16 h-7 px-2 text-center bg-white text-slate-900 font-black rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-xs shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomCredits}
                        className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Target Degree Selection Buttons (4 tiers) */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {Object.values(GRADUATION_TARGETS).map((t) => {
              const isSelected = Math.abs(targetGPA - t.minGPA) < 0.01;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleSelectTarget(t.minGPA)}
                  className={`py-1.5 px-0.5 rounded-xl text-[11px] font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  <span className="whitespace-nowrap leading-tight">{t.label}</span>
                  <span className={`text-[9px] font-semibold leading-none ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                    ≥{t.minGPA.toFixed(1)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Metric Dashboard Box */}
          <div className={`p-3 rounded-2xl border ${
            analysis.status === "NEEDS_RETAKES"
              ? "bg-amber-50/70 border-amber-200"
              : analysis.status === "ALREADY_ACHIEVED"
              ? "bg-emerald-50/70 border-emerald-200"
              : "bg-slate-50/80 border-slate-200"
          }`}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Col 1: Target GPA & Suggestion */}
              <div className="space-y-1 border-r border-slate-200/80 pr-2">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  GPA CẦN ĐẠT
                </div>

                <div className={`text-xl font-black leading-none py-0.5 flex items-baseline gap-0.5 ${
                  analysis.status === "NEEDS_RETAKES" ? "text-amber-600" :
                  analysis.status === "ALREADY_ACHIEVED" ? "text-emerald-600" : "text-blue-600"
                }`}>
                  {analysis.status === "NEEDS_RETAKES" ? (
                    "> 4.00"
                  ) : analysis.status === "ALREADY_ACHIEVED" ? (
                    "Đạt chuẩn"
                  ) : (
                    <>
                      <AnimatedNumber value={analysis.requiredFutureGPA} precision={2} />
                      <span className="text-[11px] font-semibold text-slate-400">/4.0</span>
                    </>
                  )}
                </div>

                <div className="text-[10px] font-bold text-slate-600 truncate" title={analysis.gradeSuggestionText}>
                  {analysis.gradeBadgeText}
                </div>
              </div>

              {/* Col 2: Remaining Credits & Approx Courses */}
              <div className="space-y-1 pl-1">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  CÒN THIẾU
                </div>
                <div className="text-xl font-black text-slate-800 leading-none py-0.5 flex items-baseline gap-0.5">
                  <AnimatedNumber value={analysis.remainingCredits} precision={0} />
                  <span className="text-[11px] font-semibold text-slate-400">TC</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  Ước tính: ~<AnimatedNumber value={analysis.approxCoursesRemaining} precision={0} /> môn
                </div>
              </div>
            </div>

            {/* Retake suggestion link if needed */}
            {analysis.status === "NEEDS_RETAKES" && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between text-[10px] font-medium text-amber-800">
                <span>⚠️ Cần cải thiện ~{analysis.approxRetakeCourses} môn D/C</span>
                <button
                  type="button"
                  onClick={handleGoToRoadmap}
                  className="font-bold underline hover:text-amber-900 ml-1 cursor-pointer"
                >
                  Xem chi tiết
                </button>
              </div>
            )}
          </div>

          {/* Quick link button to Roadmap */}
          <div className="pt-0.5">
            <Button
              variant="outline"
              onClick={handleGoToRoadmap}
              className="w-full h-9 rounded-xl font-bold text-xs text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95 gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Mở Lộ trình chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

GraduationGoalCard.displayName = "GraduationGoalCard";

export default GraduationGoalCard;
