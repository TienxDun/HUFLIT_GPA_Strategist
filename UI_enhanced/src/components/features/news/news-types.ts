import { type FanpageItem, type NewsItem } from "@/lib/api/news";

export type NewsCategory = NewsItem["category"];
export type FanpageCategory = FanpageItem["category"];
export type FormType = "news" | "fanpage";
export type CategoryMap<T extends string> = Record<T, { label: string; color: string }>;
