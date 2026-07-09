"use client";

import React, { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    hasMoved.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 3) {
      hasMoved.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleClick = (key: string) => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    onChange(key);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1.5 scrollbar-none cursor-grab select-none"
    >
      <CategoryFilterButton
        label="Tất cả"
        count={counts.all}
        isActive={active === "all"}
        onClick={() => handleClick("all")}
      />
      {Object.entries(categories).map(([key, config]) => (
        <CategoryFilterButton
          key={key}
          label={(config as { label: string }).label}
          count={counts[key] || 0}
          isActive={active === key}
          onClick={() => handleClick(key)}
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isActive && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [isActive]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className={cn(FILTER_BUTTON_BASE, isActive ? FILTER_BUTTON_ACTIVE : FILTER_BUTTON_IDLE)}
    >
      {label} <span className="ml-1 font-semibold opacity-75">{count}</span>
    </button>
  );
}

