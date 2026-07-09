import React, { memo } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { VisitorCount } from "./VisitorCount";

export const AppFooter = memo(() => {
  const regulationUrl =
    "https://portal.huflit.edu.vn/News/Detail/3208/Quy-che-dao-tao";

  return (
    <footer className="w-full mt-6 border-t border-slate-200/60 py-2.5 text-center px-4">
      <div className="max-w-[1074px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-medium leading-relaxed">
        <p className="text-slate-600 font-semibold text-center md:text-left">
          <BookOpen className="inline-block h-3.5 w-3.5 mr-1 text-slate-400 align-text-bottom" />
          Nguồn: Quy chế đào tạo HUFLIT (QĐ 476) &bull;{" "}
          <a
            href={regulationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors font-bold underline decoration-dotted"
          >
            Xem quy chế gốc
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </p>
        <p className="text-slate-400 shrink-0 inline-flex items-center gap-1 flex-wrap justify-center md:justify-end">
          <VisitorCount />
        </p>
      </div>
    </footer>
  );
});

AppFooter.displayName = "AppFooter";
