"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PortalImportDialog from "./PortalImportDialog";

interface WelcomeGuideProps {
  onAddSemester: () => void;
  onImportPortal: (text: string) => void;
}

export function WelcomeGuide({ onAddSemester, onImportPortal }: WelcomeGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Header card with welcome message */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-3.5 relative z-10">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight sm:text-2xl">
            Chào mừng bạn đến với HUFLIT GPA Strategist
          </h3>
          <p className="text-[13px] font-medium leading-relaxed text-slate-500 max-w-2xl sm:text-[15px]">
            Công cụ tính điểm GPA và lập lộ trình học tập dành cho sinh viên HUFLIT.
          </p>
        </div>
      </div>

      {/* Pathways Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pathway 1: Import from Portal */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col justify-between rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-lg shadow-blue-500/5 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                Cách 1: Đồng bộ Portal
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-bold text-amber-800">
                Xong trong 5s
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-800">
                Nhập dữ liệu tự động từ Portal
              </h4>
              <p className="text-[12px] sm:text-[13px] font-medium leading-relaxed text-slate-500">
                Tự động điền tất cả các học kỳ và môn học có sẵn trên Portal trường mà không cần nhập tay từng dòng môn học.
              </p>
            </div>

            {/* Quick guide list */}
            <div className="bg-white/80 rounded-2xl border border-slate-100 p-4 space-y-2.5 text-[11.5px] sm:text-[12.5px] text-slate-600 font-semibold shadow-inner leading-relaxed">
              <div className="flex gap-2">
                <span className="text-blue-500">1.</span>
                <span>Bấm nút nhập Portal và mở trang điểm HUFLIT.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500">2.</span>
                <span>Nhấn <kbd className="bg-slate-100 px-1 border rounded text-[10px] font-mono">Ctrl + A</kbd> rồi <kbd className="bg-slate-100 px-1 border rounded text-[10px] font-mono">Ctrl + C</kbd> để copy.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500">3.</span>
                <span>Dán vào ô nhập điểm và bấm "Bắt đầu phân tích".</span>
              </div>
            </div>
          </div>

          <div className="pt-5 z-10">
            <PortalImportDialog onImport={onImportPortal} triggerVariant="primary" />
          </div>
        </motion.div>

        {/* Pathway 2: Manual entry */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-5 shadow-lg shadow-slate-100/30 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-slate-500/5 blur-xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-0.5 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                Cách 2: Nhập thủ công
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-800">
                Tạo học kỳ & Tự điền điểm
              </h4>
              <p className="text-[12px] sm:text-[13px] font-medium leading-relaxed text-slate-500">
                Tự thêm học kỳ mới và điền điểm giả lập các môn học để tính toán thử điểm số mong muốn của bạn trong tương lai.
              </p>
            </div>

            <div className="bg-white/80 rounded-2xl border border-slate-100 p-4 space-y-2.5 text-[11.5px] sm:text-[12.5px] text-slate-600 font-semibold shadow-inner leading-relaxed">
              <div className="flex gap-2">
                <span className="text-slate-500">1.</span>
                <span>Điền GPA và Tín chỉ tích lũy trước đó ở cột bên trái (nếu có).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">2.</span>
                <span>Nhấn nút bên dưới để tạo học kỳ mới.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500">3.</span>
                <span>Nhập tên môn học, số tín chỉ và chọn điểm chữ mong muốn.</span>
              </div>
            </div>
          </div>

          <div className="pt-5 z-10">
            <Button
              onClick={onAddSemester}
              variant="outline"
              className="w-full h-11 border-slate-300 font-bold hover:bg-slate-50 transition-all rounded-xl text-sm cursor-pointer text-slate-700 hover:text-slate-900 shadow-sm"
            >
              <span>Thêm học kỳ & Nhập thủ công</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Helpful Quick Tip Card */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 flex flex-col space-y-1">
        <h5 className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wide">
          Mẹo lập Lộ trình học tập (Tab Lộ trình)
        </h5>
        <p className="text-[12px] sm:text-[13px] font-medium leading-relaxed text-amber-800/90">
          Sau khi có điểm, hãy chuyển sang tab Lộ trình (Roadmap) và điền GPA mục tiêu để hệ thống tự động tính điểm tối thiểu cần đạt ở các kỳ còn lại.
        </p>
      </div>
    </motion.div>
  );
}
