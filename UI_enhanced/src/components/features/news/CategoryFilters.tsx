"use client";

import { cn } from "@/lib/utils";

import { type CategoryMap } from "./news-types";

const FILTER_BUTTON_BASE =
  "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const FILTER_BUTTON_ACTIVE = "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-100/50";
const FILTER_BUTTON_IDLE =
  "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700";

export function CategoryFilters<T extends string>({
  active,
  categories,
  counts,
  onChange,
}: {
  active: string;
  categories: CategoryMap<T>;
  counts: Record<string, number>;
  onChange: (category: string) => void;
}) {
  return (
    <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1.5 scrollbar-none">
      <CategoryFilterButton
        label="Tất cả"
        count={counts.all}
        isActive={active === "all"}
        onClick={() => onChange("all")}
      />
      {Object.entries(categories).map(([key, config]) => (
        <CategoryFilterButton
          key={key}
          label={(config as { label: string }).label}
          count={counts[key] || 0}
          isActive={active === key}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  );
}

function CategoryFilterButton({
  count,
  isActive,
  label,
  onClick,
}: {
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(FILTER_BUTTON_BASE, isActive ? FILTER_BUTTON_ACTIVE : FILTER_BUTTON_IDLE)}
    >
      {label} <span className="ml-1 font-semibold opacity-75">{count}</span>
    </button>
  );
}
