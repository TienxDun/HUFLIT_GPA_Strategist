"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { CHANGELOG_DATA, ChangeType } from "@/constants/changelog";

interface ChangelogDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<
  ChangeType,
  { label: string; badgeClass: string }
> = {
  feat: {
    label: "MỚI",
    badgeClass: "text-emerald-700 bg-emerald-50 border border-emerald-200/80",
  },
  improve: {
    label: "CẢI TIẾN",
    badgeClass: "text-blue-700 bg-blue-50 border border-blue-200/80",
  },
  fix: {
    label: "SỬA LỖI",
    badgeClass: "text-amber-700 bg-amber-50 border border-amber-200/80",
  },
};

export const ChangelogDialog = memo(({ isOpen, onClose }: ChangelogDialogProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Đảm bảo luôn cuộn lên trên cùng khi mở modal
  useEffect(() => {
    if (isOpen) {
      const resetScroll = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      };
      resetScroll();
      const timer = setTimeout(resetScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(90dvh,720px)] w-[95vw] max-w-[620px] flex-col gap-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-0 shadow-2xl"
      >
        {/* Header hiện đại & sang trọng (Nền trắng đặc 100%) */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Nhật ký Cập nhật
            </DialogTitle>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              GPA Tools
            </span>
          </div>

          <DialogClose
            render={
              <button
                className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer active:scale-90"
                aria-label="Đóng"
              />
            }
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        {/* Danh sách thẻ phiên bản (Release Cards) trên nền đặc 100% không bị xuyên thấu */}
        <div
          ref={scrollContainerRef}
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/90 scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full focus:outline-none"
        >
          {CHANGELOG_DATA.map((release) => (
            <div
              key={release.version}
              className={`rounded-2xl p-4 sm:p-5 transition-all bg-white ${
                release.isLatest
                  ? "border-2 border-blue-500/30 shadow-[0_4px_24px_rgba(37,99,235,0.08)] ring-1 ring-blue-500/10"
                  : "border border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              {/* Header của thẻ phiên bản: Version Badge + Tag + Ngày tháng */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-[12.5px] sm:text-[13px] px-2.5 py-0.5 rounded-md border tracking-wide select-all ${
                      release.isLatest
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    {release.version}
                  </span>

                  {release.isLatest && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Bản mới nhất
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                  {release.date}
                </span>
              </div>

              {/* Tên đợt cập nhật */}
              <h4 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 tracking-tight mt-3 mb-2">
                {release.title}
              </h4>

              {/* Tóm tắt điểm nhấn nếu có */}
              {release.highlight && (
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[12px] text-blue-900 font-medium leading-relaxed mb-3">
                  {release.highlight}
                </div>
              )}

              {/* Danh sách thay đổi: Chữ bên trái căn thẳng hàng 100%, Badge chuyển sang bên phải */}
              <div className="space-y-2 pt-1">
                {release.changes.map((change, cIdx) => {
                  const config = TYPE_CONFIG[change.type];
                  return (
                    <div
                      key={cIdx}
                      className="flex items-start justify-between gap-3 text-[12.5px] leading-relaxed py-0.5 group"
                    >
                      {/* Cụm trái: Bullet dot cố định + Nội dung mô tả gióng thẳng hàng 100% từ lề trái */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            release.isLatest ? "bg-blue-500" : "bg-slate-400"
                          }`}
                        />
                        <span className="text-slate-700">
                          {change.description}
                        </span>
                      </div>

                      {/* Cụm phải: Badge loại thay đổi nằm ở lề bên phải (không còn ở bên trái) */}
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded font-bold shrink-0 select-none ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hiện đại (Nền trắng đặc 100%) */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3 sm:px-6 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span>HUFLIT GPA Strategist</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-700 font-semibold">K29 IT</span>
          </span>
          <DialogClose
            render={
              <button className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-xs cursor-pointer active:scale-95">
                Đóng
              </button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});

ChangelogDialog.displayName = "ChangelogDialog";
