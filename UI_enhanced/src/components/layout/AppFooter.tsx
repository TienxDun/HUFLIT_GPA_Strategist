import React, { memo } from "react";
import { BookOpen, ExternalLink } from "lucide-react";

export const AppFooter = memo(() => {
  const regulationUrl =
    "https://hufliteduvn-my.sharepoint.com/personal/dt_huflit_edu_vn/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fdt%5Fhuflit%5Fedu%5Fvn%2FDocuments%2FPORTAL%20UPLOAD%2FQUY%20DINH%20%2D%20QUY%20CHE%2FQuy%20ch%E1%BA%BF%20%C4%91%C3%A0o%20t%E1%BA%A1o%2DQD476%2Dngay%2D30122021%2Epdf&parent=%2Fpersonal%2Fdt%5Fhuflit%5Fedu%5Fvn%2FDocuments%2FPORTAL%20UPLOAD%2FQUY%20DINH%20%2D%20QUY%20CHE&ga=1";

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
        <p className="text-slate-400 shrink-0">
          Hoạt động từ 08/12/2025
        </p>
      </div>
    </footer>
  );
});

AppFooter.displayName = "AppFooter";
