import { type CategoryMap, type FanpageCategory, type NewsCategory } from "./news-types";

export const PRESET_THUMBNAILS = [
  {
    id: "announcement",
    label: "Thông báo học vụ",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "activity",
    label: "Hoạt động & Sự kiện",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "scholarship",
    label: "Học bổng & Khen thưởng",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "general",
    label: "Tin tức chung",
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop",
  },
] as const;

export const NEWS_CATEGORIES: CategoryMap<NewsCategory> = {
  announcement: {
    label: "Thông báo",
    color: "bg-rose-50/90 text-rose-600 border-rose-200/80 hover:bg-rose-100/90",
  },
  scholarship: {
    label: "Học bổng",
    color: "bg-amber-50/90 text-amber-600 border-amber-200/80 hover:bg-amber-100/90",
  },
  activity: {
    label: "Hoạt động",
    color: "bg-sky-50/90 text-sky-600 border-sky-200/80 hover:bg-sky-100/90",
  },
  other: {
    label: "Tin tức khác",
    color: "bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100/90",
  },
};

export const FANPAGE_CATEGORIES: CategoryMap<FanpageCategory> = {
  school: {
    label: "Trường",
    color: "bg-blue-50/90 text-blue-600 border-blue-200/80 hover:bg-blue-100/90",
  },
  union: {
    label: "Đoàn - Hội",
    color: "bg-purple-50/90 text-purple-600 border-purple-200/80 hover:bg-purple-100/90",
  },
  faculty: {
    label: "Khoa",
    color: "bg-emerald-50/90 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100/90",
  },
  club: {
    label: "CLB",
    color: "bg-pink-50/90 text-pink-600 border-pink-200/80 hover:bg-pink-100/90",
  },
  other: {
    label: "Khác",
    color: "bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100/90",
  },
};

export const URL_PREVIEW_STYLES = [
  {
    match: ["facebook.com", "fb.watch"],
    label: "Facebook",
    tone: "bg-blue-50 text-blue-700 border-blue-100",
    accent: "from-blue-600/85 to-sky-500/70",
  },
  {
    match: ["portal.huflit.edu.vn"],
    label: "Portal",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "from-emerald-600/85 to-teal-500/70",
  },
  {
    match: ["huflit.edu.vn"],
    label: "HUFLIT",
    tone: "bg-red-50 text-red-700 border-red-100",
    accent: "from-red-600/85 to-rose-500/70",
  },
  {
    match: ["docs.google.com", "drive.google.com", "forms.gle"],
    label: "Google",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "from-amber-500/85 to-yellow-500/70",
  },
  {
    match: ["youtube.com", "youtu.be"],
    label: "Video",
    tone: "bg-rose-50 text-rose-700 border-rose-100",
    accent: "from-rose-600/85 to-orange-500/70",
  },
] as const;
