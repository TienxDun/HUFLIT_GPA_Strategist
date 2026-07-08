"use client";

import { Tag } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { PRESET_THUMBNAILS } from "./news-constants";

export function ThumbnailPicker({
  className,
  selected,
  onSelect,
}: {
  className?: string;
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-bold text-slate-700">Hình ảnh đại diện</Label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {PRESET_THUMBNAILS.map((thumbnail) => (
          <button
            key={thumbnail.id}
            type="button"
            onClick={() => onSelect(thumbnail.id)}
            className={cn(
              "relative h-14 cursor-pointer overflow-hidden rounded-xl border text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:h-16",
              selected === thumbnail.id
                ? "border-blue-600 ring-2 ring-blue-600/80"
                : "border-slate-200 opacity-75 hover:border-blue-200 hover:opacity-100"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail.url} alt={thumbnail.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end bg-slate-950/40 p-1.5">
              <span className="line-clamp-1 text-[9px] font-bold leading-none text-white">{thumbnail.label}</span>
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelect("custom")}
          className={cn(
            "flex h-14 cursor-pointer flex-col items-center justify-center rounded-xl border text-[10px] font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:h-16",
            selected === "custom"
              ? "border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-600"
              : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700"
          )}
        >
          <Tag className="mb-1 h-4 w-4" />
          <span>Link ảnh tự do</span>
        </button>
      </div>
    </div>
  );
}
