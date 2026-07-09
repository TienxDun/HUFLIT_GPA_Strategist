"use client";

import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SectionTitle({
  id,
  title,
  description,
  actionLabel,
  onAdd,
  onEditAll,
  editAllLabel,
}: {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  onAdd: () => void;
  onEditAll?: () => void;
  editAllLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100/80 pb-2">
      <div className="min-w-0 flex-1">
        <h3 id={id} className="text-sm font-bold text-slate-800 truncate">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 pt-0.5 ml-3">
        {onEditAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditAll}
            aria-label={editAllLabel}
            className="h-8 w-8 rounded-lg border-slate-200/80 p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-blue-600" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          aria-label={actionLabel}
          className="h-8 gap-1.5 rounded-lg border-slate-200/80 px-2 sm:px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </Button>
      </div>
    </div>
  );
}

