"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Send, User, ChevronDown } from "lucide-react";
import { Feedback } from "@/lib/api/feedback";

interface FeedbackFormProps {
  onSend: (data: Omit<Feedback, "timestamp">) => Promise<boolean>;
  isSubmitting: boolean;
}

export const FeedbackForm = memo(({ onSend, isSubmitting }: FeedbackFormProps) => {
  const [formData, setFormData] = useState<Omit<Feedback, "timestamp">>({
    name: "",
    type: "improvement",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSend(formData);
    if (success) {
      setFormData({ ...formData, content: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tên */}
        <div className="group relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
            <User className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            placeholder="Tên (Ẩn danh)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-10 bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-3 text-[13px] font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-blue-300 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Loại */}
        <div className="group relative">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full h-10 bg-slate-50 border border-slate-200/60 rounded-xl px-3 text-[13px] font-bold text-slate-700 appearance-none focus:bg-white focus:border-blue-300 outline-none transition-all cursor-pointer shadow-sm"
          >
            <option value="improvement">Cải tiến</option>
            <option value="feature_request">Tính năng mới</option>
            <option value="bug_report">Báo lỗi</option>
            <option value="other">Khác</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <div className="relative group">
        <textarea
          placeholder="Nội dung đóng góp (tối thiểu 10 ký tự)..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={3}
          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-[13px] font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white focus:border-blue-300 outline-none transition-all resize-none shadow-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || formData.content.length < 10}
        className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all gap-2 active:scale-[0.98] disabled:opacity-30 disabled:active:scale-100"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Đang gửi...</span>
          </div>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            Gửi góp ý
          </>
        )}
      </Button>
    </form>
  );
});

FeedbackForm.displayName = "FeedbackForm";
