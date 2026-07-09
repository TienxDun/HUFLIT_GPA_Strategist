import { type NewsItem } from "@/lib/api/news";

export type NewsCategory = NewsItem["category"];
export type FanpageCategory = "school" | "union" | "faculty" | "club" | "other";
export type FormType = "news" | "fanpage";
export type CategoryMap<T extends string> = Record<T, { label: string; color: string }>;
