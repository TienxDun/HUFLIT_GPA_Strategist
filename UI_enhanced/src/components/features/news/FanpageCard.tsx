"use client";

import { type FanpageItem } from "@/lib/api/news";

import { FANPAGE_CATEGORIES } from "./news-constants";
import { DateLine, EditButton, MetaBadge } from "./CardMeta";
import { getEmbeddedImageUrl, getUrlPreview, openExternalUrl, openOnKeyboard } from "./news-utils";

export function FanpageCard({
  page,
  onEdit,
}: {
  page: FanpageItem;
  onEdit: (page: FanpageItem) => void;
}) {
  const source = getUrlPreview(page.url);
  const categories = page.category;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => openExternalUrl(page.url)}
      onKeyDown={(event) => openOnKeyboard(event, page.url)}
      className="group/item relative grid h-[142px] cursor-pointer grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200/75 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-[0_18px_40px_-28px_rgba(37,99,235,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:grid-cols-[128px_minmax(0,1fr)]"
    >
      <div className="relative h-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getEmbeddedImageUrl(page.url)}
          alt={page.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
      </div>

      <EditButton label="Chỉnh sửa kênh thông tin" onClick={() => onEdit(page)} className="right-3 top-3" />

      <div className="flex min-w-0 flex-col overflow-hidden p-3.5">
        <div className="mb-2 flex min-w-0 flex-wrap items-center gap-1.5 pr-16">
          {categories.map((catKey) => {
            const config = FANPAGE_CATEGORIES[catKey] || FANPAGE_CATEGORIES.other;
            return <MetaBadge key={catKey} className={config.color} label={config.label} />;
          })}
          <MetaBadge className={source.tone} label={source.label} />
        </div>
        <h4 className="line-clamp-2 min-h-[38px] text-[14px] font-extrabold leading-snug text-slate-900 transition-colors duration-200 group-hover/item:text-blue-700">
          {page.name}
        </h4>
        <DateLine value={page.date} hideIconWhenEmpty compact />
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-slate-600">
          {page.description || "Kênh thông tin chính thức của HUFLIT."}
        </p>
      </div>
    </div>
  );
}
