"use client";

import { motion } from "framer-motion";
import { Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommunityBanner({ onAddClick }: { onAddClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-blue-100/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-sky-50/50 p-4 shadow-sm backdrop-blur-sm sm:p-5"
    >
      {/* Decorative gradient glowing circles */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-indigo-400/10 blur-xl pointer-events-none" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 shadow-inner">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              <h4 className="text-sm font-bold text-slate-800">
                Góc Bản Tin Cộng Đồng
              </h4>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                Mở đóng góp công khai
              </span>
            </div>

            <p className="text-[11px] font-medium leading-relaxed text-slate-500 max-w-xl">
              Bảng tin học vụ này được duy trì bởi chính bạn! Hãy cùng chia sẻ những tin tức học tập, học bổng và hoạt động Đoàn - Hội để cùng xây dựng cộng đồng HUFLIT-ers năng động và hữu ích nhé.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            onClick={onAddClick}
            className="h-9 w-full sm:w-auto gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Đóng góp tin tức</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
