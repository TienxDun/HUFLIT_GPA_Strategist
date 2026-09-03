"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  description = "Thao tác này không thể hoàn tác.",
  itemName,
  confirmText = "Xóa",
  cancelText = "Hủy",
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
        <div
          key="confirm-delete-modal-wrapper"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
        >
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto cursor-pointer"
            onClick={onClose}
          />

          {/* Minimalist Modern Dialog Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[340px] rounded-2xl bg-[#12141a]/96 backdrop-blur-md border border-white/10 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white select-none pointer-events-auto transform-gpu will-change-transform space-y-4"
          >
            {/* Content */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                {itemName ? (
                  <>
                    Bạn có chắc muốn xóa{" "}
                    <span className="text-slate-200 font-semibold">
                      &ldquo;{itemName}&rdquo;
                    </span>
                    ?
                  </>
                ) : (
                  description
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
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
