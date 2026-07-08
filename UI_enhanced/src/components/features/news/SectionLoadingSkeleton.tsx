"use client";

import { cn } from "@/lib/utils";

export function SectionLoadingSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
      {Array.from({ length: compact ? 3 : 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm",
            compact ? "h-[142px]" : "h-[260px]"
          )}
        >
          <div className={cn("animate-pulse bg-slate-100", compact ? "hidden" : "h-28")} />
          <div className="space-y-3 p-4">
            <div className="flex gap-2">
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
