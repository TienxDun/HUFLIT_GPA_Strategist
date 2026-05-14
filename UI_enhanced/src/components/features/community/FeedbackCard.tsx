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
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700 leading-tight">{feedback.name}</span>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{feedback.timestamp}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${config.color} text-[9px] font-bold tracking-tight`}>
          <Icon className="h-2.5 w-2.5" />
          {config.label}
        </div>
      </div>
      <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
        {feedback.content}
      </p>
    </div>
  );
});



FeedbackCard.displayName = "FeedbackCard";
