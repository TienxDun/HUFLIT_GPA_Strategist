"use client";

import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { type CategoryMap } from "./news-types";

const FIELD_SHELL_CLASS = "space-y-1.5";
const FIELD_LABEL_CLASS = "text-xs font-bold text-slate-700";
const FIELD_CONTROL_CLASS =
  "min-h-10 rounded-xl border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm shadow-slate-100/70 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0";

export function TextInputField({
  className,
  icon,
  helpText,
  id,
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  className?: string;
  icon?: ReactNode;
  helpText?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <div className={cn(FIELD_SHELL_CLASS, className)}>
      <Label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-slate-400">
            {icon}
          </span>
        )}
        <Input
          id={id}
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(FIELD_CONTROL_CLASS, icon && "pl-10")}
        />
      </div>
      {helpText && <p className="text-[10px] font-medium leading-snug text-slate-500">{helpText}</p>}
    </div>
  );
}

export function TextareaField({
  className,
  icon,
  id,
  label,
  onChange,
  placeholder,
  required,
  rows,
  value,
}: {
  className?: string;
  icon?: ReactNode;
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  rows: number;
  value: string;
}) {
  const hasHeight = className?.includes("h-");

  return (
    <div className={cn(FIELD_SHELL_CLASS, className, hasHeight && "flex flex-col")}>
      <Label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </Label>
      <div className={cn("relative", hasHeight && "flex-1")}>
        {icon && (
          <span className="pointer-events-none absolute left-3 top-3 flex h-4 w-4 items-center justify-center text-slate-400">
            {icon}
          </span>
        )}
        <textarea
          id={id}
          required={required}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "flex w-full resize-none border py-3 leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50",
            FIELD_CONTROL_CLASS,
            icon && "pl-10",
            hasHeight && "h-full"
          )}
        />
      </div>
    </div>
  );
}

export function ChoiceGrid<T extends string>({
  className,
  columnsClassName,
  itemClassName,
  items,
  label,
  onSelect,
  selected,
}: {
  className?: string;
  columnsClassName: string;
  itemClassName?: string;
  items: CategoryMap<T>;
  label: string;
  onSelect: (key: T) => void;
  selected: T;
}) {
  return (
    <div className={cn(FIELD_SHELL_CLASS, className)}>
      <Label className={FIELD_LABEL_CLASS}>{label}</Label>
      <div className={cn("grid gap-2", columnsClassName)}>
        {Object.entries(items).map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key as T)}
            className={cn(
              "min-h-9 cursor-pointer rounded-xl border px-3 py-1.5 text-center text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
              selected === key
                ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-200"
                : "border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-100/70 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700",
              itemClassName
            )}
          >
            {(config as { label: string }).label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MultiChoiceGrid<T extends string>({
  className,
  columnsClassName,
  itemClassName,
  items,
  label,
  onSelect,
  selected,
}: {
  className?: string;
  columnsClassName: string;
  itemClassName?: string;
  items: CategoryMap<T>;
  label: string;
  onSelect: (keys: T[]) => void;
  selected: T[];
}) {
  const handleToggle = (key: T) => {
    if (selected.includes(key)) {
      if (selected.length > 1) {
        onSelect(selected.filter((k) => k !== key));
      }
    } else {
      onSelect([...selected, key]);
    }
  };

  return (
    <div className={cn(FIELD_SHELL_CLASS, className)}>
      <Label className={FIELD_LABEL_CLASS}>{label}</Label>
      <div className={cn("grid gap-2", columnsClassName)}>
        {Object.entries(items).map(([key, config]) => {
          const isSelected = selected.includes(key as T);
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleToggle(key as T)}
              className={cn(
                "min-h-9 cursor-pointer rounded-xl border px-3 py-1.5 text-center text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm shadow-slate-200"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm shadow-slate-100/70 hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-700",
                itemClassName
              )}
            >
              {(config as { label: string }).label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SubmitButton({
  className,
  isSubmitting,
  loadingText,
  text,
}: {
  className?: string;
  isSubmitting: boolean;
  loadingText: string;
  text: string;
}) {
  return (
    <div className={cn("pt-1", className)}>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-100 hover:bg-blue-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          text
        )}
      </Button>
    </div>
  );
}
