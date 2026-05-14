"use client";

import { memo } from "react";
import { Feedback } from "@/lib/api/feedback";
import { FeedbackCard } from "./FeedbackCard";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, RefreshCw } from "lucide-react";

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const FeedbackList = memo(({ feedbacks, isLoading, onRefresh }: FeedbackListProps) => {
  if (isLoading && feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <MessageSquare className="h-8 w-8 text-slate-200" />
        <div className="text-center">
          <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Chưa có góp ý nào</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-slate-300" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Cộng đồng đóng góp
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            {feedbacks.length} ý kiến
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-all disabled:opacity-50 border-none cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {feedbacks.map((fb, idx) => (
            <motion.div
              key={`${fb.timestamp}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                duration: 0.2,
                delay: Math.min(idx * 0.03, 0.2) 
              }}
            >
              <FeedbackCard feedback={fb} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});



FeedbackList.displayName = "FeedbackList";
