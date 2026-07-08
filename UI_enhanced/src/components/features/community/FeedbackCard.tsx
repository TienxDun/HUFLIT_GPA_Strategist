"use client";

import { memo } from "react";
import { Feedback } from "@/lib/api/feedback";
import { User, Bug, Lightbulb, Zap, HelpCircle } from "lucide-react";

interface FeedbackCardProps {
  feedback: Feedback;
}

export const FeedbackCard = memo(({ feedback }: FeedbackCardProps) => {
  const getBadgeConfig = (type: string) => {
    switch (type) {
      case "feature_request":
        return { label: "Tính năng", color: "text-blue-500 bg-blue-50 border-blue-100/50", icon: Zap };
      case "bug_report":
        return { label: "Báo lỗi", color: "text-rose-500 bg-rose-50 border-rose-100/50", icon: Bug };
      case "improvement":
        return { label: "Cải tiến", color: "text-emerald-500 bg-emerald-50 border-emerald-100/50", icon: Lightbulb };
      default:
        return { label: "Khác", color: "text-slate-500 bg-slate-50 border-slate-100/50", icon: HelpCircle };
    }
  };

  const config = getBadgeConfig(feedback.type);
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-300">
            <User className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[13px] font-bold text-slate-700 leading-tight">{feedback.name}</span>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{feedback.timestamp}</span>
          </div>
        </div>
        <div className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-0.5 ${config.color} text-[9px] font-bold tracking-tight`}>
          <Icon className="h-2.5 w-2.5" />
          {config.label}
        </div>
      </div>
      <p className="text-[13px] font-medium leading-relaxed text-slate-500">
        {feedback.content}
      </p>
    </div>
  );
});



FeedbackCard.displayName = "FeedbackCard";
