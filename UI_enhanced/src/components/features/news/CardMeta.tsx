"use client";

import { Calendar, Edit2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatDisplayDate } from "./news-utils";

export function MetaBadge({ className, label }: { className: string; label: string }) {
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase", className)}>
      {label}
    </span>
  );
}

export function DateLine({
  value,
  compact,
  hideIconWhenEmpty,
}: {
  value?: string;
  compact?: boolean;
  hideIconWhenEmpty?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-5 shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400",
        compact ? "mt-1.5" : "mt-2"
      )}
    >
      <Calendar className={cn("h-3.5 w-3.5 text-slate-400", hideIconWhenEmpty && !value && "invisible")} />
      <span className="truncate">{formatDisplayDate(value) || "\u00a0"}</span>
    </div>
  );
}

export function EditButton({ className, label, onClick }: { className?: string; label: string; onClick: () => void }) {
  return (
    <div className={cn("absolute z-10 flex gap-1.5", className)} onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
