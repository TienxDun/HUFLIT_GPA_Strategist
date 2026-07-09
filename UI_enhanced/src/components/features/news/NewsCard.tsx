"use client";

import { motion } from "framer-motion";

import { type NewsItem } from "@/lib/api/news";
import { cn } from "@/lib/utils";

import { NEWS_CATEGORIES } from "./news-constants";
import { MetaBadge } from "./CardMeta";
import { formatDisplayDate, getEmbeddedImageUrl, openExternalUrl, openOnKeyboard } from "./news-utils";

export function NewsCard({
  item,
  index,
}: {
  item: NewsItem;
  index: number;
}) {
  const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.other;
  const imageUrl = getEmbeddedImageUrl(item.facebookUrl, item.thumbnailUrl);

  return (
    <motion.div
      key={item.id}
      layout
      role="link"
      tabIndex={0}
      title={item.title}
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
          </div>
          {item.date && (
            <div className="rounded-md bg-slate-950/65 px-1.5 py-0.5 text-[8.5px] font-bold text-white backdrop-blur-[1px] shrink-0">
              {formatDisplayDate(item.date)}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <h4
          title={item.title}
          className="line-clamp-2 min-h-[40px] text-[15px] font-extrabold leading-snug text-slate-900 transition-colors duration-200 group-hover/item:text-blue-700"
        >
          {item.title}
        </h4>
        <p className="mt-2.5 line-clamp-3 flex-1 rounded-xl bg-slate-50/80 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
