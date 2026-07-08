"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SectionTitle({
  id,
  title,
  description,
  actionLabel,
  onAdd,
}: {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
      <div>
        <h3 id={id} className="text-sm font-bold text-slate-800">
          {title}
        </h3>
        <p className="text-[10px] font-medium text-slate-400">{description}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        aria-label={actionLabel}
        className="h-7 w-7 rounded-lg border-slate-200/80 p-0 text-blue-600 hover:bg-slate-50"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
