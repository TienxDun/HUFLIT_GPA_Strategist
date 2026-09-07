"use client";

import React, { memo, useState } from "react";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { VisitorCount } from "./VisitorCount";
import { ChangelogDialog } from "./ChangelogDialog";
import { getLatestVersion } from "@/constants/changelog";

export const AppFooter = memo(() => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const latest = getLatestVersion();
  const regulationUrl =
    "https://portal.huflit.edu.vn/News/Detail/3208/Quy-che-dao-tao";

  return (
    <>
      <footer className="w-full mt-6 border-t border-slate-200/60 py-3 text-center px-4">
        <div className="max-w-[1074px] mx-auto flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-3 text-[11px] text-slate-500 font-medium leading-relaxed">
          {/* Vế trái: Thông tin quy chế */}
          <p className="text-slate-600 font-medium text-center md:text-left flex items-center justify-center md:justify-start gap-1 flex-wrap">
            <BookOpen className="inline-block h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Nguồn: Quy chế đào tạo HUFLIT (QĐ 476)</span>
            <span className="text-slate-300">•</span>
            <a
              href={regulationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors font-semibold underline decoration-dotted"
            >
              Xem quy chế gốc
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>

          {/* Vế phải: Phiên bản & Lượt truy cập (Đồng bộ phong cách typography & dấu phân cách) */}
          <div className="text-slate-500 shrink-0 flex items-center justify-center md:justify-end gap-1.5 flex-wrap">
            <button
              onClick={() => setIsChangelogOpen(true)}
              title="Nhấn để xem nhật ký cập nhật phiên bản"
              className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <span>Phiên bản</span>
              <span className="font-mono font-bold text-slate-700 group-hover:text-blue-600">
                {latest.version}
              </span>
              <span className="text-slate-400 group-hover:text-blue-500 font-mono text-[10.5px]">
                ({latest.date})
              </span>
            </button>

            <span className="text-slate-300">•</span>

            <VisitorCount />
          </div>
        </div>
      </footer>

      <ChangelogDialog
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </>
  );
});

AppFooter.displayName = "AppFooter";

