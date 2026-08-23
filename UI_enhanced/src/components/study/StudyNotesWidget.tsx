"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  X, 
  Copy, 
  Trash2, 
  Check, 
  Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface StudyNotesWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "huflit_study_notes";

export const StudyNotesWidget = ({ isOpen, onClose }: StudyNotesWidgetProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNoteContent(saved);
      } else {
        setNoteContent(
          "📝 Ghi chú nhanh trong buổi học:\n- Công thức cần nhớ:\n- Bài tập cần nộp trước thứ 6:\n- Câu hỏi cần hỏi giảng viên:"
        );
      }
    } catch {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteContent(val);
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch {}
  };

  const handleCopy = () => {
    if (!noteContent) return;
    navigator.clipboard.writeText(noteContent);
    setIsCopied(true);
    toast.success("Đã sao chép ghi chú vào bộ nhớ tạm");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm("Bạn có chắc chắn muốn xoá toàn bộ ghi chú này không?")) {
      setNoteContent("");
      localStorage.removeItem(STORAGE_KEY);
      toast.info("Đã xoá ghi chú");
    }
  };

  if (!isOpen) return null;

  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 30, scale: 0.95 }}
        className="fixed top-20 right-4 sm:right-6 z-50 w-[340px] max-w-[calc(100vw-32px)] h-[380px] flex flex-col rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-2xl text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold tracking-tight">Ghi chép nhanh</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Sao chép toàn bộ"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
              title="Xoá nội dung"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-3">
          <textarea
            value={noteContent}
            onChange={handleChange}
            placeholder="Viết ghi chú nhanh hoặc công thức ở đây (tự động lưu)..."
            className="w-full h-full bg-transparent text-xs leading-relaxed text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none font-mono selection:bg-blue-600/40"
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400/80" />
            Tự động lưu vào máy
          </span>
          <span>
            {wordCount} từ • {charCount} ký tự
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
