"use client";

import { AlertCircle, TrendingUp, Share2 } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { RoadmapComputed } from "@/hooks/useRoadmapState";
import {
  getStatusTextColor,
  getStatusBorderColor,
  isStatusNegative,
  getStatusLabel,
  getDisplayGPA,
  getDisplayLabel,
} from "@/lib/roadmap-utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface ResultHeroCardProps {
  result: RoadmapComputed["result"];
  status: RoadmapComputed["status"];
  maxPossibleGPA: number;
  targetGPA: number;
  currentCredits: number;
  onShare?: () => void;
}

export const ResultHeroCard = memo(({ result, status, maxPossibleGPA, targetGPA, currentCredits, onShare }: ResultHeroCardProps) => {
  const textColor = getStatusTextColor(status);
  const borderColor = getStatusBorderColor(status);
  const isNegative = isStatusNegative(status);

  return (
    <div className={`relative px-4 py-2.5 sm:px-5 sm:py-2.5 border shadow-sm overflow-hidden bg-white transition-all duration-700 rounded-[2rem] flex flex-col items-center text-center space-y-4 ${borderColor}`}>
      {onShare && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="hidden sm:flex absolute top-3 right-3 sm:top-4 sm:right-4 h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-2 sm:px-3 gap-1.5 border border-blue-100/50 shadow-sm transition-all active:scale-95 group"
          title="Chia sẻ lộ trình này"
        >
          <Share2 className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Chia sẻ</span>
        </Button>
      )}
      <GPADisplay status={status} requiredGPA={result.requiredGPA} textColor={textColor} />
      <StatusBadge status={status} maxPossibleGPA={maxPossibleGPA} textColor={textColor} isNegative={isNegative} />
      <StatsRow result={result} status={status} maxPossibleGPA={maxPossibleGPA} targetGPA={targetGPA} currentCredits={currentCredits} />
    </div>
  );
});

ResultHeroCard.displayName = "ResultHeroCard";

interface GPADisplayProps {
  status: ResultHeroCardProps["status"];
  requiredGPA: number;
  textColor: string;
}

const GPADisplay = memo(({ status, requiredGPA, textColor }: GPADisplayProps) => {
  const displayVal = getDisplayGPA(status, requiredGPA);
  const isNumeric = !isNaN(Number(displayVal));

  return (
    <div className="space-y-1">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
        {getDisplayLabel(status)}
      </div>
      <div className={`${isNumeric ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"} font-black tracking-tighter py-0.5 ${textColor}`}>
        {isNumeric ? (
          <AnimatedNumber value={requiredGPA} precision={2} />
        ) : (
          displayVal
        )}
      </div>
    </div>
  );
});

interface StatusBadgeProps {
  status: ResultHeroCardProps["status"];
  maxPossibleGPA: number;
  textColor: string;
  isNegative: boolean;
}

const StatusBadge = memo(({ status, maxPossibleGPA, textColor, isNegative }: StatusBadgeProps) => {
  const label = getStatusLabel(status, maxPossibleGPA);
  const parts = label.split(' • ');

  return (
    <div className={`flex items-center justify-center gap-2 ${textColor}`}>
      {isNegative ? <AlertCircle className="h-4 w-4 shrink-0" /> : <TrendingUp className="h-4 w-4 shrink-0" />}
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-center sm:text-left">
        {parts.map((part, i) => (
          <div key={i} className="flex items-center">
            <span className="font-black text-[10px] uppercase tracking-[0.15em] leading-tight">
              {part}
            </span>
            {i === 0 && parts.length > 1 && (
              <span className="hidden sm:inline mx-1 opacity-50">•</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

interface StatsRowProps {
  result: ResultHeroCardProps["result"];
  status: ResultHeroCardProps["status"];
  maxPossibleGPA: number;
  targetGPA: number;
  currentCredits: number;
}

const StatsRow = memo(({ result, status, maxPossibleGPA, targetGPA, currentCredits }: StatsRowProps) => {
  const isImpossible = status === "impossible";

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-3 gap-1 sm:gap-4 w-full pt-4 border-t border-slate-100">
        <StatItem
          label="TC Hiện tại"
          value={currentCredits}
          subtitle="Đã tích lũy"
        />
        <StatItem
          label="TC Sẽ học"
          value={result.totalEffortCredits}
          subtitle="Mới & cải thiện"
        />
        <StatItem
          label={isImpossible ? "GPA Tối đa" : "GPA Mục tiêu"}
          value={isImpossible ? maxPossibleGPA : targetGPA}
          precision={2}
          subtitle={isImpossible ? "Khả năng cao nhất" : "Mục tiêu ra trường"}
        />
      </div>
      
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng tín chỉ khi tốt nghiệp:</span>
        <span className="text-[10px] font-black text-blue-600">
          <AnimatedNumber value={result.totalFutureCredits} suffix=" TC" />
        </span>
      </div>
    </div>
  );
});

interface StatItemProps {
  label: string;
  value: number;
  precision?: number;
  subtitle: string;
}

const StatItem = memo(({ label, value, precision = 0, subtitle }: StatItemProps) => {
  return (
    <div className="space-y-0">
      <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">{label}</div>
      <div className="text-2xl font-black text-slate-900 leading-none py-1">
        <AnimatedNumber value={value} precision={precision} />
      </div>
      <div className="text-[10px] text-slate-400 font-bold leading-tight">{subtitle}</div>
    </div>
  );
});

