"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  compact,
  icon,
  title,
  description,
  onRefresh,
}: {
  compact?: boolean;
  icon?: React.ReactNode;
  title: string;
  description: string;
  onRefresh: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-5 text-center text-slate-400",
        compact ? "py-10" : "py-14"
      )}
    >
      {icon}
      <h3 className={cn("font-semibold text-slate-700", compact ? "text-sm" : "text-base")}>{title}</h3>
      <p className={cn("mt-1", compact ? "max-w-[240px] text-xs" : "max-w-sm text-sm")}>{description}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className={cn(
          "mt-4 rounded-xl border-slate-200/80 text-slate-600 hover:bg-slate-50",
          compact ? "h-8 text-xs" : "h-9"
        )}
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        Tải lại
      </Button>
    </div>
  );
}
