"use client";

import { useState, useEffect, memo } from "react";
import { Compass, RefreshCcw, BookOpen, GraduationCap, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RetakeList } from "./RetakeList";
import type { RoadmapState, RoadmapActions, RoadmapComputed } from "@/hooks/useRoadmapState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface GoalSetupCardProps {
  state: RoadmapState;
  actions: RoadmapActions;
  computed: RoadmapComputed;
  expandedSteps: Record<number, boolean>;
  onToggleStep: (step: number) => void;
  onToggleAll: () => void;
  onShare?: () => void;
}

const GPA_MILESTONES = [2.0, 2.5, 3.2, 3.6];

export const GoalSetupCard = memo(({ state, actions, computed, expandedSteps, onToggleStep, onToggleAll, onShare }: GoalSetupCardProps) => {
  const { currentGPA, currentCredits, targetGPA, remainingCredits, retakes } = state;
  const isAnyExpanded = Object.values(expandedSteps).some(Boolean);


  return (
    <Card className="border-slate-200 bg-white shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden border gap-0 py-0">
      <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden xs:flex bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm shrink-0">
              <Compass className="h-4 w-4 text-blue-600" />
            </div>
            <CardTitle className="text-[13px] sm:text-sm text-slate-800 font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              Thiết lập mục tiêu
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="sm:hidden h-7 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white border-blue-100/50 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl px-2 gap-1.5 active:scale-95 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span>Chia sẻ</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAll}
              className="h-7 text-[9px] font-black uppercase tracking-[0.05em] text-slate-500 bg-white border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all rounded-xl px-2 gap-1 active:scale-95 shadow-sm"
            >
              {isAnyExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>Thu gọn</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>Mở</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-2 pt-3 space-y-1.5 relative">
        <StartingPointStep
          currentGPA={currentGPA}
          currentCredits={currentCredits}
          onGPAChange={actions.setCurrentGPA}
          onCreditsChange={actions.setCurrentCredits}
          onSync={actions.syncFromManual}
          isExpanded={expandedSteps[1]}
          onToggle={() => onToggleStep(1)}
        />

        <TargetGPAStep
          targetGPA={targetGPA}
          onSelect={actions.setTargetGPA}
          isExpanded={expandedSteps[2]}
          onToggle={() => onToggleStep(2)}
        />

        <EffortPlanStep
          currentCredits={currentCredits}
          remainingCredits={remainingCredits}
          onTotalChange={actions.setTotalGraduationCredits}
          onRemainingChange={actions.setRemainingCredits}
          isExpanded={expandedSteps[3]}
          onToggle={() => onToggleStep(3)}
        />

        <ImprovementStep
          retakes={retakes}
          onAddRetake={actions.addRetake}
          onRemoveRetake={actions.removeRetake}
          onUpdateRetake={actions.updateRetake}
          manualImprovableCourses={computed.manualImprovableCourses}
          onToggleFromManual={actions.toggleRetakeFromManual}
          isExpanded={expandedSteps[4]}
          onToggle={() => onToggleStep(4)}
        />
      </CardContent>
    </Card>
  );
});

GoalSetupCard.displayName = "GoalSetupCard";

interface StartingPointStepProps {
  currentGPA: number;
  currentCredits: number;
  onGPAChange(v: number): void;
  onCreditsChange(v: number): void;
  onSync(): void;
  isExpanded: boolean;
  onToggle(): void;
}

const StartingPointStep = memo(({ currentGPA, currentCredits, onGPAChange, onCreditsChange, onSync, isExpanded, onToggle }: StartingPointStepProps) => {
  const [gpaStr, setGpaStr] = useState(currentGPA === 0 ? "" : currentGPA.toString());
  const [creditsStr, setCreditsStr] = useState(currentCredits === 0 ? "" : currentCredits.toString());

  useEffect(() => {
    if (parseFloat(gpaStr) !== currentGPA) setGpaStr(currentGPA === 0 ? "" : currentGPA.toString());
  }, [currentGPA, gpaStr]);

  useEffect(() => {
    if (parseInt(creditsStr) !== currentCredits) setCreditsStr(currentCredits === 0 ? "" : currentCredits.toString());
  }, [currentCredits, creditsStr]);

  return (
    <div className={`bg-white border border-slate-100 rounded-[1.5rem] shadow-sm relative z-10 transition-all duration-300 overflow-hidden ${isExpanded ? "p-2.5" : "p-2.5"}`}>
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5 overflow-hidden shrink">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md shrink-0 border transition-all duration-300 ${isExpanded ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 border-blue-400/50" : "bg-blue-50/80 text-blue-500 border-blue-100 shadow-none"}`}>
            <span className="text-xs font-black">1</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Label className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap truncate cursor-pointer transition-colors duration-300 ${isExpanded ? "text-slate-700" : "text-slate-500"}`}>
              Dữ liệu tích lũy
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isExpanded && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/30 whitespace-nowrap shadow-sm"
            >
              {currentGPA.toFixed(2)} GPA • {currentCredits} TC
            </motion.span>
          )}
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSync();
                  toast.success("Đã đồng bộ dữ liệu thành công", {
                    description: "Thông tin GPA và tín chỉ đã được cập nhật từ tab Nhập điểm.",
                    duration: 2000,
                  });
                }}
                className="h-7 text-[8px] font-black text-blue-600 uppercase tracking-wider hover:bg-blue-50 rounded-xl px-2 gap-1 border border-blue-100/50 shrink-0"
              >
                <RefreshCcw className="h-2.5 w-2.5" strokeWidth={3} />
              </Button>
              <ChevronUp className="h-3 w-3 text-slate-300" />
            </div>
          ) : (
            <ChevronDown className="h-3 w-3 text-slate-300" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
              <div className="space-y-1.5">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={4.0}
                  value={gpaStr}
                  onChange={e => {
                    const s = e.target.value;
                    setGpaStr(s);
                    const val = s === "" ? 0 : parseFloat(s);
                    if (!isNaN(val)) onGPAChange(Math.min(4.0, Math.max(0, val)));
                  }}
                  placeholder="0.00"
                  className="h-9 text-[13px] font-black text-blue-600 bg-white border-slate-200 rounded-xl focus:ring-blue-500/20 text-center"
                />
                <div className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider leading-tight">Điểm GPA hiện tại</div>
              </div>
              <div className="space-y-1.5">
                <Input
                  type="number"
                  min={0}
                  max={300}
                  value={creditsStr}
                  onChange={e => {
                    const s = e.target.value;
                    setCreditsStr(s);
                    const val = s === "" ? 0 : parseInt(s);
                    if (!isNaN(val)) onCreditsChange(Math.min(300, Math.max(0, val)));
                  }}
                  placeholder="0"
                  className="h-9 text-[13px] font-black text-blue-600 bg-white border-slate-200 rounded-xl focus:ring-blue-500/20 text-center"
                />
                <div className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-wider leading-tight">Số tín chỉ tích lũy</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface TargetGPAStepProps {
  targetGPA: number;
  onSelect(v: number): void;
  isExpanded: boolean;
  onToggle(): void;
}

const TargetGPAStep = memo(({ targetGPA, onSelect, isExpanded, onToggle }: TargetGPAStepProps) => {
  const [valStr, setValStr] = useState(targetGPA === 0 ? "" : targetGPA.toString());

  useEffect(() => {
    if (parseFloat(valStr) !== targetGPA) setValStr(targetGPA === 0 ? "" : targetGPA.toString());
  }, [targetGPA, valStr]);

  const handleInputChange = (raw: string) => {
    setValStr(raw);
    const val = parseFloat(raw);
    if (isNaN(val)) return onSelect(0);
    onSelect(Math.min(4.0, Math.max(0, val)));
  };

  return (
    <div className={`bg-blue-50/30 border border-blue-100/50 rounded-[1.5rem] shadow-sm relative z-10 transition-all duration-300 overflow-hidden ${isExpanded ? "p-2.5" : "p-2.5"}`}>
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md shrink-0 border transition-all duration-300 ${isExpanded ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 border-blue-400/50" : "bg-blue-50/80 text-blue-500 border-blue-100 shadow-none"}`}>
            <span className="text-xs font-black">2</span>
          </div>
          <Label className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors duration-300 ${isExpanded ? "text-slate-700" : "text-slate-500"}`}>
            Mục tiêu mong muốn
          </Label>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isExpanded && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-black text-blue-600 bg-white/80 px-2 py-1 rounded-lg border border-blue-100/30 whitespace-nowrap shadow-sm"
            >
              {targetGPA.toFixed(2)} GPA
            </motion.span>
          )}
          {isExpanded ? <ChevronUp className="h-3 w-3 text-blue-300" /> : <ChevronDown className="h-3 w-3 text-blue-300" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white/60 p-2 pt-3.5 rounded-2xl border border-blue-100/30 space-y-3">
              <div className="relative group">
                <Input
                  type="number"
                  step="0.05"
                  min={0}
                  max={4.0}
                  value={valStr}
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder="GPA mục tiêu"
                  className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-xl h-10 shadow-sm transition-all group-hover:border-blue-200"
                />
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-full border border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap pointer-events-none shadow-sm">GPA mục tiêu</div>
              </div>

              <div className="grid grid-cols-4 h-8 bg-white/50 rounded-lg p-0.5 border border-slate-200/50">
                {GPA_MILESTONES.map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`h-full text-[10px] font-black transition-all rounded-md cursor-pointer ${targetGPA === val
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600 hover:bg-white/30"
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setValStr(val.toString());
                      onSelect(val);
                    }}
                  >
                    {val.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface EffortPlanStepProps {
  currentCredits: number;
  remainingCredits: number;
  onTotalChange(total: number): void;
  onRemainingChange(v: number): void;
  isExpanded: boolean;
  onToggle(): void;
}

const EffortPlanStep = memo(({ currentCredits, remainingCredits, onTotalChange, onRemainingChange, isExpanded, onToggle }: EffortPlanStepProps) => {
  const totalVal = currentCredits + remainingCredits;
  const [totalStr, setTotalStr] = useState(totalVal === 0 ? "" : totalVal.toString());
  const [remStr, setRemStr] = useState(remainingCredits === 0 ? "" : remainingCredits.toString());

  useEffect(() => {
    if (parseInt(totalStr) !== totalVal) setTotalStr(totalVal === 0 ? "" : totalVal.toString());
  }, [totalVal, totalStr]);

  useEffect(() => {
    if (parseInt(remStr) !== remainingCredits) setRemStr(remainingCredits === 0 ? "" : remainingCredits.toString());
  }, [remainingCredits, remStr]);

  return (
    <div className={`bg-white border border-slate-100 rounded-[1.5rem] shadow-sm relative z-10 transition-all duration-300 overflow-hidden ${isExpanded ? "p-2.5" : "p-2.5"}`}>
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md shrink-0 border transition-all duration-300 ${isExpanded ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 border-blue-400/50" : "bg-blue-50/80 text-blue-500 border-blue-100 shadow-none"}`}>
            <span className="text-xs font-black">3</span>
          </div>
          <Label className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors duration-300 ${isExpanded ? "text-slate-700" : "text-slate-500"}`}>
            Kế hoạch nỗ lực
          </Label>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isExpanded && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/30 whitespace-nowrap shadow-sm"
            >
              {remainingCredits} TC CÒN LẠI
            </motion.span>
          )}
          {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-300" /> : <ChevronDown className="h-3 w-3 text-slate-300" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50/50 p-2 pt-3.5 rounded-2xl border border-slate-100/50 space-y-3">
              <Tabs defaultValue="remaining" className="w-full gap-3 flex flex-col">
                <TabsContent value="total" className="mt-0">
                  <div className="relative group">
                    <Input
                      type="number"
                      min={0}
                      max={300}
                      value={totalStr}
                      onChange={e => {
                        const s = e.target.value;
                        setTotalStr(s);
                        if (s === "") return onRemainingChange(0);
                        const val = parseInt(s);
                        if (!isNaN(val)) onTotalChange(Math.min(300, Math.max(0, val)));
                      }}
                      placeholder="Ví dụ: 140"
                      className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-xl h-10 shadow-sm transition-all group-hover:border-blue-200"
                    />
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-full border border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap pointer-events-none shadow-sm">Tổng tín chỉ toàn khóa</div>
                  </div>
                </TabsContent>

                <TabsContent value="remaining" className="mt-0">
                  <div className="relative group">
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      value={remStr}
                      onChange={e => {
                        const s = e.target.value;
                        setRemStr(s);
                        const val = s === "" ? 0 : parseInt(s);
                        if (!isNaN(val)) onRemainingChange(Math.min(200, Math.max(0, val)));
                      }}
                      placeholder="Ví dụ: 30"
                      className="text-center text-lg font-black text-blue-700 bg-white border-2 border-blue-100 focus:ring-blue-500/20 rounded-xl h-10 shadow-sm transition-all group-hover:border-blue-200"
                    />
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-full border border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-widest whitespace-nowrap pointer-events-none shadow-sm">Số tín chỉ dự kiến học</div>
                  </div>
                </TabsContent>

                <TabsList className="grid w-full grid-cols-2 h-7 bg-white/50 rounded-lg p-0.5 border border-slate-200/50 order-last">
                  <TabsTrigger value="remaining" className="text-[9px] font-semibold uppercase tracking-tighter rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-6">
                    <BookOpen className="h-3 w-3 mr-1.5" /> Còn lại
                  </TabsTrigger>
                  <TabsTrigger value="total" className="text-[9px] font-semibold uppercase tracking-tighter rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-6">
                    <GraduationCap className="h-3 w-3 mr-1.5" /> Tổng cộng
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

interface ImprovementStepProps {
  retakes: RoadmapState["retakes"];
  onAddRetake(): void;
  onRemoveRetake(id: string): void;
  onUpdateRetake(id: string, field: string, value: unknown): void;
  manualImprovableCourses: { name: string; credits: number; grade: string; gpa: number }[];
  onToggleFromManual(course: { name: string; credits: number; grade: string }): void;
  isExpanded: boolean;
  onToggle(): void;
}

const ImprovementStep = memo(({ retakes, onAddRetake, onRemoveRetake, onUpdateRetake, manualImprovableCourses, onToggleFromManual, isExpanded, onToggle }: ImprovementStepProps) => {
  return (
    <div className={`bg-white border border-slate-100 rounded-[1.5rem] shadow-sm relative z-10 transition-all duration-300 overflow-hidden ${isExpanded ? "p-2.5" : "p-2.5"}`}>
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full shadow-md shrink-0 border transition-all duration-300 ${isExpanded ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 border-blue-400/50" : "bg-blue-50/80 text-blue-500 border-blue-100 shadow-none"}`}>
            <span className="text-xs font-black">4</span>
          </div>
          <Label className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors duration-300 ${isExpanded ? "text-blue-700" : "text-blue-500/80"}`}>
            Học cải thiện
          </Label>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isExpanded && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg border border-blue-100/30 whitespace-nowrap shadow-sm"
            >
              {retakes.length} MÔN CẢI THIỆN
            </motion.span>
          )}
          {isExpanded ? <ChevronUp className="h-3 w-3 text-blue-300" /> : <ChevronDown className="h-3 w-3 text-blue-300" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 8 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              <RetakeList
                retakes={retakes}
                onAdd={onAddRetake}
                onRemove={onRemoveRetake}
                onUpdate={onUpdateRetake}
                manualImprovableCourses={manualImprovableCourses}
                onToggleFromManual={onToggleFromManual}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
