"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description = "Hành động này sẽ xóa dữ liệu và không thể hoàn tác.",
  itemName,
  confirmText = "Xóa vĩnh viễn",
  cancelText = "Hủy bỏ",
}: ConfirmDeleteModalProps) => {
  // Global Escape key to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="confirm-delete-modal-wrapper" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 450, damping: 30 }}
            className="relative z-10 w-full max-w-[380px] rounded-3xl bg-[#15171e]/98 backdrop-blur-2xl border border-rose-500/25 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_20px_rgba(244,63,94,0.15)] text-white select-none overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

            {/* Header / Icon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-2">
              <h3 className="text-base font-extrabold text-white tracking-wide">
                {title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {description}
              </p>
              {Boolean(itemName) && (
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-rose-300 truncate">
                  &ldquo;{itemName}&rdquo;
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer text-center"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer text-center"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
