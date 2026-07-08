"use client";

import { motion } from "framer-motion";

import { type NewsItem } from "@/lib/api/news";
import { cn } from "@/lib/utils";

import { NEWS_CATEGORIES } from "./news-constants";
import { DateLine, EditButton, MetaBadge } from "./CardMeta";
import { getEmbeddedImageUrl, getUrlPreview, openExternalUrl, openOnKeyboard } from "./news-utils";

export function NewsCard({
  item,
  index,
  onEdit,
}: {
  item: NewsItem;
  index: number;
  onEdit: (item: NewsItem) => void;
}) {
  const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.other;
  const source = getUrlPreview(item.facebookUrl);
  const imageUrl = getEmbeddedImageUrl(item.facebookUrl, item.thumbnailUrl);

  return (
    <motion.div
      key={item.id}
      layout
      role="link"
      tabIndex={0}
      onClick={() => openExternalUrl(item.facebookUrl)}
      onKeyDown={(event) => openOnKeyboard(event, item.facebookUrl)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group/item relative flex h-[260px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/75 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-[0_18px_40px_-28px_rgba(37,99,235,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative h-28 shrink-0 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <MetaBadge className={cn(category.color, "bg-white/95 backdrop-blur shadow-sm")} label={category.label} />
            <MetaBadge className={cn(source.tone, "bg-white/95 backdrop-blur shadow-sm")} label={source.label} />
          </div>
        </div>
      </div>

      <EditButton label="Chỉnh sửa bản tin" onClick={() => onEdit(item)} className="right-4 top-4" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <h4 className="line-clamp-2 min-h-[40px] text-[15px] font-extrabold leading-snug text-slate-900 transition-colors duration-200 group-hover/item:text-blue-700">
          {item.title}
        </h4>
        <DateLine value={item.date} />
        <p className="mt-3 line-clamp-2 min-h-[44px] shrink-0 rounded-xl bg-slate-50/80 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
