"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  Plus, 
  Calendar, 
  Tag, 
  Loader2, 
  RefreshCw,
  Edit2,
  Search,
  X
} from "lucide-react";

import { useNewsState } from "@/hooks/useNewsState";
import { type NewsItem, type FanpageItem } from "@/lib/api/news";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

// Preset Unsplash images for thumbnails to make the UI look stunning
const PRESET_THUMBNAILS = [
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
];

const CATEGORY_MAP = {
  announcement: { label: "Thông báo", color: "bg-rose-50/90 text-rose-600 border-rose-200/80 hover:bg-rose-100/90" },
  scholarship: { label: "Học bổng", color: "bg-amber-50/90 text-amber-600 border-amber-200/80 hover:bg-amber-100/90" },
  activity: { label: "Hoạt động", color: "bg-sky-50/90 text-sky-600 border-sky-200/80 hover:bg-sky-100/90" },
  other: { label: "Tin tức khác", color: "bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100/90" },
};

const URL_PREVIEW_STYLES = [
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
];

function getUrlPreview(url: string) {
  const fallback = {
    host: "liên kết nguồn",
    label: "Website",
    tone: "bg-slate-50 text-slate-600 border-slate-200",
    accent: "from-slate-700/80 to-slate-500/65",
  };

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const style = URL_PREVIEW_STYLES.find((item) =>
      item.match.some((domain) => host.includes(domain))
    );

    return {
      host,
      label: style?.label || "Website",
      tone: style?.tone || fallback.tone,
      accent: style?.accent || fallback.accent,
    };
  } catch {
    return fallback;
  }
}

function getEmbeddedImageUrl(url: string, fallbackUrl?: string) {
  const fallback = fallbackUrl || PRESET_THUMBNAILS[3].url;

  try {
    const parsed = new URL(url);
    const imageExtension = /\.(avif|gif|jpe?g|png|webp)$/i;

    if (imageExtension.test(parsed.pathname)) {
      return url;
    }

    const youtubeId =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v");

    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=900`;
  } catch {
    return fallback;
  }
}

const FANPAGE_CATEGORY_MAP = {
  school: { label: "Trường", color: "bg-blue-50/90 text-blue-600 border-blue-200/80 hover:bg-blue-100/90" },
  union: { label: "Đoàn - Hội", color: "bg-purple-50/90 text-purple-600 border-purple-200/80 hover:bg-purple-100/90" },
  faculty: { label: "Khoa", color: "bg-emerald-50/90 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100/90" },
  club: { label: "CLB", color: "bg-pink-50/90 text-pink-600 border-pink-200/80 hover:bg-pink-100/90" },
  other: { label: "Khác", color: "bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100/90" },
};

function parseVietnameseDate(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s+)?(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    const [, hour = "0", minute = "0", second = "0", day, month, year] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(value?: string) {
  if (!value) return "";

  const parsed = parseVietnameseDate(value);
  if (!parsed) return value;

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs >= 0) {
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Vừa cập nhật";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <Input
        type="search"
        name={label}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl border-slate-200/80 bg-white pl-9 pr-9 text-sm focus-visible:ring-blue-500"
      />
      {value && (
        <button
          type="button"
          aria-label={`Xóa ${label.toLowerCase()}`}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function SectionLoadingSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
      {Array.from({ length: compact ? 3 : 4 }).map((_, index) => (
        <div
          key={index}
          className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm ${compact ? "h-[142px]" : "h-[260px]"}`}
        >
          <div className={`animate-pulse bg-slate-100 ${compact ? "hidden" : "h-28"}`} />
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

export const NewsTab = memo(() => {
  const {
    newsItems,
    fanpageItems,
    isLoading,
    isLoadingFanpages,
    isSubmitting,
    publishNews,
    editNewsItem,
    publishFanpage,
    editFanpageItem,
    refreshNews,
  } = useNewsState();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Switch form type & Edit tracking
  const [formType, setFormType] = useState<"news" | "fanpage">("news");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form inputs for News
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [category, setCategory] = useState<"announcement" | "scholarship" | "activity" | "other">("announcement");
  const [thumbType, setThumbType] = useState<string>("announcement");
  const [customThumbUrl, setCustomThumbUrl] = useState("");

  // Form inputs for Fanpage
  const [fanpageName, setFanpageName] = useState("");
  const [fanpageUrl, setFanpageUrl] = useState("");
  const [fanpageCategory, setFanpageCategory] = useState<"school" | "union" | "faculty" | "club" | "other">("school");
  const [fanpageDescription, setFanpageDescription] = useState("");

  // Search & Filter state for Fanpage
  const [fanpageSearch, setFanpageSearch] = useState("");
  const [activeFanpageCategory, setActiveFanpageCategory] = useState<string>("all");

  // Search state for News
  const [newsSearch, setNewsSearch] = useState("");

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    // Reset News Form
    setTitle("");
    setDescription("");
    setFbUrl("");
    setCustomThumbUrl("");
    setThumbType("announcement");
    // Reset Fanpage Form
    setFanpageName("");
    setFanpageUrl("");
    setFanpageDescription("");
    setFanpageCategory("school");
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose thumbnail URL based on selection
    let thumbnailUrl = "";
    if (thumbType === "custom") {
      thumbnailUrl = customThumbUrl.trim() || PRESET_THUMBNAILS[0].url;
    } else {
      const selectedPreset = PRESET_THUMBNAILS.find(p => p.id === thumbType);
      thumbnailUrl = selectedPreset ? selectedPreset.url : PRESET_THUMBNAILS[0].url;
    }

    let success = false;
    if (editingId) {
      success = await editNewsItem(editingId, {
        title,
        description,
        facebookUrl: fbUrl,
        category,
        thumbnailUrl,
      });
    } else {
      success = await publishNews({
        title,
        description,
        facebookUrl: fbUrl,
        category,
        thumbnailUrl,
      });
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handlePublishFanpage = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;
    if (editingId) {
      success = await editFanpageItem(editingId, {
        name: fanpageName,
        url: fanpageUrl,
        category: fanpageCategory,
        description: fanpageDescription,
      });
    } else {
      success = await publishFanpage({
        name: fanpageName,
        url: fanpageUrl,
        category: fanpageCategory,
        description: fanpageDescription,
      });
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleEditNewsClick = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormType("news");
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setFbUrl(item.facebookUrl);
    setCategory(item.category);

    const matchedPreset = PRESET_THUMBNAILS.find(p => p.url === item.thumbnailUrl);
    if (matchedPreset) {
      setThumbType(matchedPreset.id);
      setCustomThumbUrl("");
    } else {
      setThumbType("custom");
      setCustomThumbUrl(item.thumbnailUrl);
    }
    setIsFormOpen(true);
  };

  const handleEditFanpageClick = (page: FanpageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormType("fanpage");
    setEditingId(page.id);
    setFanpageName(page.name);
    setFanpageUrl(page.url);
    setFanpageCategory(page.category);
    setFanpageDescription(page.description);
    setIsFormOpen(true);
  };

  // Filter news
  const filteredNews = newsItems.filter((item) => {
    const query = newsSearch.trim().toLowerCase();
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Filter fanpages
  const filteredFanpages = fanpageItems.filter((page) => {
    const query = fanpageSearch.trim().toLowerCase();
    const matchesCategory = activeFanpageCategory === "all" || page.category === activeFanpageCategory;
    const matchesSearch = !query ||
      page.name.toLowerCase().includes(query) ||
      (page.description && page.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const newsCategoryCounts = newsItems.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    { all: newsItems.length }
  );

  const fanpageCategoryCounts = fanpageItems.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    { all: fanpageItems.length }
  );

  return (
    <div className="min-w-full space-y-4 pb-8">
      {/* Header section with Filter Controls and Admin button */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur-md md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bản tin Sinh viên</h2>
            <p className="text-xs text-slate-500 font-medium">Cập nhật thông báo và các hoạt động của trường</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto mt-1 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNews}
            disabled={isLoading}
            className="h-9 flex-1 justify-center gap-1.5 rounded-xl border-slate-200/80 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 md:flex-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setFormType("news");
              setIsFormOpen(true);
            }}
            className="h-9 flex-1 justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 font-semibold text-white shadow-sm shadow-blue-100 hover:bg-blue-700 md:flex-none"
          >
            <Plus className="h-4 w-4" />
            Đóng góp tin / Kênh
          </Button>
        </div>
      </div>

      {/* Main Grid Layout for News and Fanpage Sidebar */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        
        {/* Left Column: News */}
        <section className="space-y-3" aria-labelledby="news-section-title">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
            <div>
              <h3 id="news-section-title" className="text-sm font-bold text-slate-800">Bản tin & Thông báo</h3>
              <p className="text-[10px] text-slate-400 font-medium">Cập nhật tin tức học vụ và hoạt động mới nhất</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormType("news");
                setIsFormOpen(true);
              }}
              aria-label="Đăng bản tin mới"
              className="h-7 w-7 rounded-lg p-0 border-slate-200/80 text-blue-600 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Quick Search for News */}
          <SearchField
            label="Tìm kiếm bản tin"
            placeholder="Tìm kiếm bản tin…"
            value={newsSearch}
            onChange={setNewsSearch}
          />

          {/* Category filters */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1.5 -mx-1 px-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              Tất cả <span className="ml-1 font-semibold opacity-75">{newsCategoryCounts.all}</span>
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeCategory === key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {config.label} <span className="ml-1 font-semibold opacity-75">{newsCategoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>

          {/* News List */}
          {isLoading && newsItems.length === 0 ? (
            <SectionLoadingSkeleton />
          ) : filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center text-slate-400">
              <Newspaper className="mb-3 h-10 w-10 text-slate-300 opacity-60" />
              <h3 className="text-base font-semibold text-slate-700">Không tìm thấy bản tin nào</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                Hãy thử từ khóa khác, đổi danh mục, hoặc tải lại dữ liệu nếu danh sách chưa cập nhật.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refreshNews}
                className="mt-4 h-9 rounded-xl border-slate-200/80 text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Tải lại
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredNews.map((item, index) => {
                  const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
                  const sourcePreview = getUrlPreview(item.facebookUrl);
                  const embeddedImageUrl = getEmbeddedImageUrl(item.facebookUrl, item.thumbnailUrl);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      role="link"
                      tabIndex={0}
                      onClick={() => window.open(item.facebookUrl, "_blank", "noopener,noreferrer")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          window.open(item.facebookUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                      className="group/item relative flex h-[260px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/75 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-[0_18px_40px_-28px_rgba(37,99,235,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      <div className="relative h-28 shrink-0 overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={embeddedImageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex min-w-0 items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm ${catConfig.color} bg-white/95 backdrop-blur`}>
                              {catConfig.label}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase shadow-sm ${sourcePreview.tone} bg-white/95 backdrop-blur`}>
                              {sourcePreview.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 z-10 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleEditNewsClick(item, e)}
                          aria-label="Chỉnh sửa bản tin"
                          className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          title="Chỉnh sửa bản tin"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
                        <h4 className="line-clamp-2 min-h-[40px] text-[15px] font-extrabold leading-snug text-slate-900 transition-colors duration-200 group-hover/item:text-blue-700">
                          {item.title}
                        </h4>

                        <div className="mt-2 flex h-5 shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{formatDisplayDate(item.date)}</span>
                        </div>

                        <p className="mt-3 line-clamp-2 min-h-[44px] shrink-0 rounded-xl bg-slate-50/80 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* Right Column: Fanpage List */}
        <section className="space-y-3 lg:sticky lg:top-24 lg:border-l lg:border-slate-200/80 lg:pl-5" aria-labelledby="fanpage-section-title">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
            <div>
              <h3 id="fanpage-section-title" className="text-sm font-bold text-slate-800">Kênh thông tin HUFLIT</h3>
              <p className="text-[10px] text-slate-400 font-medium">Danh sách các Fanpage hữu ích cho sinh viên</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormType("fanpage");
                setIsFormOpen(true);
              }}
              aria-label="Thêm kênh thông tin"
              className="h-7 w-7 rounded-lg p-0 border-slate-200/80 text-blue-600 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Quick Search */}
          <SearchField
            label="Tìm kiếm kênh thông tin"
            placeholder="Tìm kiếm kênh thông tin…"
            value={fanpageSearch}
            onChange={setFanpageSearch}
          />

          {/* Category Quick Badges */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1.5 -mx-1 px-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFanpageCategory("all")}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeFanpageCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              Tất cả <span className="ml-1 font-semibold opacity-75">{fanpageCategoryCounts.all}</span>
            </button>
            {Object.entries(FANPAGE_CATEGORY_MAP).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFanpageCategory(key)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeFanpageCategory === key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {config.label} <span className="ml-1 font-semibold opacity-75">{fanpageCategoryCounts[key] || 0}</span>
              </button>
            ))}
          </div>

          {/* Fanpage List Items */}
          {isLoadingFanpages && fanpageItems.length === 0 ? (
            <SectionLoadingSkeleton compact />
          ) : filteredFanpages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-5 py-10 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">Không tìm thấy kênh nào</p>
              <p className="mt-1 max-w-[240px] text-xs">Hãy thử tìm kiếm với từ khóa khác hoặc đổi danh mục.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refreshNews}
                className="mt-4 h-8 rounded-xl border-slate-200/80 text-xs text-slate-600 hover:bg-slate-50"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Tải lại
              </Button>
            </div>
          ) : (
            <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filteredFanpages.map((page) => {
                const catConfig = FANPAGE_CATEGORY_MAP[page.category] || FANPAGE_CATEGORY_MAP.other;
                const sourcePreview = getUrlPreview(page.url);
                const embeddedImageUrl = getEmbeddedImageUrl(page.url);
                return (
                  <div
                    key={page.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => window.open(page.url, "_blank", "noopener,noreferrer")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        window.open(page.url, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="group/item relative grid h-[142px] cursor-pointer grid-cols-[112px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-slate-200/75 bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-300/70 hover:shadow-[0_18px_40px_-28px_rgba(37,99,235,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:grid-cols-[128px_minmax(0,1fr)]"
                  >
                    <div className="relative h-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={embeddedImageUrl}
                        alt={page.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
                    </div>
                    <div className="absolute right-3 top-3 z-10 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleEditFanpageClick(page, e)}
                        aria-label="Chỉnh sửa kênh thông tin"
                        className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        title="Chỉnh sửa kênh thông tin"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex min-w-0 flex-col overflow-hidden p-3.5">
                      <div className="mb-2 flex min-w-0 flex-wrap items-center gap-1.5 pr-16">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${catConfig.color}`}>
                          {catConfig.label}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${sourcePreview.tone}`}>
                          {sourcePreview.label}
                        </span>
                      </div>

                      <h4 className="line-clamp-2 min-h-[38px] text-[14px] font-extrabold leading-snug text-slate-900 transition-colors duration-200 group-hover/item:text-blue-700">
                        {page.name}
                      </h4>

                      <div className="mt-1.5 flex h-5 shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <Calendar className={`h-3.5 w-3.5 text-slate-400 ${page.date ? "" : "invisible"}`} />
                        <span className="truncate">{formatDisplayDate(page.date) || "\u00a0"}</span>
                      </div>

                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-slate-600">
                        {page.description || "Kênh thông tin chính thức của HUFLIT."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Creation / Edit Form Modal (News / Fanpage) */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="max-w-lg rounded-3xl border-slate-100 p-6 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-slate-800 font-bold text-lg flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
              {editingId 
                ? (formType === "news" ? "Chỉnh sửa bản tin" : "Chỉnh sửa kênh thông tin")
                : (formType === "news" ? "Đăng bản tin mới" : "Thêm Fanpage hữu ích mới")
              }
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {editingId 
                ? "Cập nhật lại các thông tin của bản tin hoặc liên kết để hiển thị chính xác nhất"
                : (formType === "news" 
                  ? "Điền thông tin và nhúng link Facebook để đăng tin tức hiển thị trực tuyến"
                  : "Thêm fanpage, liên kết hữu ích để sinh viên mới dễ dàng theo dõi")
              }
            </p>
          </DialogHeader>

          {/* Form Type Switcher - Only show when creating, hide when editing */}
          {!editingId && (
            <div className="flex border-b border-slate-100 pb-2.5 mb-4 gap-4">
              <button
                type="button"
                onClick={() => setFormType("news")}
                className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                  formType === "news"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Đăng Bản tin
              </button>
              <button
                type="button"
                onClick={() => setFormType("fanpage")}
                className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                  formType === "fanpage"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Thêm Fanpage hữu ích
              </button>
            </div>
          )}

          {formType === "news" ? (
            /* Form News */
            <form onSubmit={handlePublish} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="news-title" className="text-xs font-bold text-slate-600">Tiêu đề bản tin *</Label>
                <Input
                  id="news-title"
                  type="text"
                  required
                  placeholder="Nhập tiêu đề tin tức..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="news-desc" className="text-xs font-bold text-slate-600">Mô tả ngắn *</Label>
                <textarea
                  id="news-desc"
                  required
                  rows={3}
                  placeholder="Nhập tóm tắt nội dung tin tức..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex w-full rounded-xl border border-slate-200/80 bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Source URL */}
              <div className="space-y-1.5">
                <Label htmlFor="news-fb" className="text-xs font-bold text-slate-600">Đường dẫn nguồn bản tin *</Label>
                <Input
                  id="news-fb"
                  type="url"
                  required
                  placeholder="https://huflit.edu.vn/... hoặc https://www.facebook.com/..."
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
                <p className="text-[10px] text-slate-400 font-semibold">
                  Hỗ trợ URL đa dạng: website HUFLIT, Portal, Facebook, Google Form/Drive, YouTube hoặc trang thông báo khác.
                </p>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Danh mục bản tin</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key as any)}
                      className={`px-3 py-2 border rounded-xl font-semibold text-xs text-center transition-all ${
                        category === key
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Hình ảnh đại diện</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_THUMBNAILS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setThumbType(p.id)}
                      className={`relative h-16 rounded-xl border overflow-hidden transition-all text-left ${
                        thumbType === p.id 
                          ? "ring-2 ring-blue-600 border-blue-600" 
                          : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.label} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-slate-950/40 p-1.5 flex items-end">
                        <span className="text-[9px] font-bold text-white leading-none line-clamp-1">{p.label}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setThumbType("custom")}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all font-bold text-xs ${
                      thumbType === "custom"
                        ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <Tag className="h-4 w-4 mb-1" />
                    <span>Link ảnh tự do</span>
                  </button>
                </div>
              </div>

              {/* Custom Thumbnail URL Input */}
              {thumbType === "custom" && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-thumb" className="text-xs font-bold text-slate-600">Link hình ảnh đại diện</Label>
                  <Input
                    id="custom-thumb"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={customThumbUrl}
                    onChange={(e) => setCustomThumbUrl(e.target.value)}
                    className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                  />
                </div>
              )}

              <DialogFooter className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-sm shadow-blue-100 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId ? "Đang cập nhật..." : "Đang đăng bản tin..."}
                    </>
                  ) : (
                    <>{editingId ? "Cập nhật bản tin" : "Đăng bản tin"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            /* Form Fanpage */
            <form onSubmit={handlePublishFanpage} className="space-y-4">
              {/* Fanpage Name */}
              <div className="space-y-1.5">
                <Label htmlFor="page-name" className="text-xs font-bold text-slate-600">Tên Fanpage / Liên kết *</Label>
                <Input
                  id="page-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Đoàn - Hội Khoa Công nghệ thông tin..."
                  value={fanpageName}
                  onChange={(e) => setFanpageName(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
              </div>

              {/* Fanpage URL */}
              <div className="space-y-1.5">
                <Label htmlFor="page-url" className="text-xs font-bold text-slate-600">Đường dẫn liên kết (Facebook URL) *</Label>
                <Input
                  id="page-url"
                  type="url"
                  required
                  placeholder="https://www.facebook.com/..."
                  value={fanpageUrl}
                  onChange={(e) => setFanpageUrl(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
              </div>

              {/* Fanpage Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Phân loại liên kết</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {Object.entries(FANPAGE_CATEGORY_MAP).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFanpageCategory(key as any)}
                      className={`px-1.5 py-2 border rounded-xl font-bold text-[10px] text-center transition-all ${
                        fanpageCategory === key
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fanpage Description */}
              <div className="space-y-1.5">
                <Label htmlFor="page-desc" className="text-xs font-bold text-slate-600">Mô tả ngắn</Label>
                <textarea
                  id="page-desc"
                  rows={2}
                  placeholder="Nhập mô tả ngắn về kênh thông tin này..."
                  value={fanpageDescription}
                  onChange={(e) => setFanpageDescription(e.target.value)}
                  className="flex w-full rounded-xl border border-slate-200/80 bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-sm shadow-blue-100 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingId ? "Đang cập nhật..." : "Đang lưu liên kết..."}
                    </>
                  ) : (
                    <>{editingId ? "Cập nhật liên kết" : "Lưu liên kết"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

NewsTab.displayName = "NewsTab";
