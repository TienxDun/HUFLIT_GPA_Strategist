"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  Lock, 
  Plus, 
  LogOut, 
  ExternalLink, 
  Info, 
  Calendar, 
  Tag, 
  Loader2, 
  RefreshCw,
  Edit2,
  Trash2
} from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { useNewsState } from "@/hooks/useNewsState";
import { type NewsItem, type FanpageItem } from "@/lib/api/news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const FANPAGE_CATEGORY_MAP = {
  school: { label: "Trường", color: "bg-blue-50/90 text-blue-600 border-blue-200/80 hover:bg-blue-100/90" },
  union: { label: "Đoàn - Hội", color: "bg-purple-50/90 text-purple-600 border-purple-200/80 hover:bg-purple-100/90" },
  faculty: { label: "Khoa", color: "bg-emerald-50/90 text-emerald-600 border-emerald-200/80 hover:bg-emerald-100/90" },
  club: { label: "CLB", color: "bg-pink-50/90 text-pink-600 border-pink-200/80 hover:bg-pink-100/90" },
  other: { label: "Khác", color: "bg-slate-50/90 text-slate-600 border-slate-200/80 hover:bg-slate-100/90" },
};

export const NewsTab = memo(() => {
  const {
    newsItems,
    fanpageItems,
    isLoading,
    isLoadingFanpages,
    isSubmitting,
    isAdmin,
    checkPassword,
    logoutAdmin,
    publishNews,
    editNewsItem,
    removeNewsItem,
    publishFanpage,
    editFanpageItem,
    removeFanpageItem,
    refreshNews,
  } = useNewsState();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showNewsEmbed, setShowNewsEmbed] = useState(false);
  const [selectedFanpage, setSelectedFanpage] = useState<FanpageItem | null>(null);
  
  // Dialog controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = checkPassword(passwordInput);
    if (success) {
      setPasswordInput("");
      setIsAuthOpen(false);
      setIsFormOpen(true);
    }
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

  const handleDeleteNewsClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bản tin này không?")) {
      await removeNewsItem(id);
    }
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

  const handleDeleteFanpageClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa kênh thông tin này không?")) {
      await removeFanpageItem(id);
    }
  };

  // Facebook post embed URL
  const getEmbedUrl = (url: string) => {
    let cleanUrl = url.trim();
    cleanUrl = cleanUrl.replace("m.facebook.com", "www.facebook.com");
    cleanUrl = cleanUrl.replace("mobile.facebook.com", "www.facebook.com");
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(cleanUrl)}&show_text=true&width=500`;
  };

  // Facebook page plugin embed URL
  const getFanpageEmbedUrl = (url: string) => {
    let cleanUrl = url.trim();
    cleanUrl = cleanUrl.replace("m.facebook.com", "www.facebook.com");
    cleanUrl = cleanUrl.replace("mobile.facebook.com", "www.facebook.com");
    return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(cleanUrl)}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;
  };

  // Filter news
  const filteredNews = newsItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(newsSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter fanpages
  const filteredFanpages = fanpageItems.filter((page) => {
    const matchesCategory = activeFanpageCategory === "all" || page.category === activeFanpageCategory;
    const matchesSearch = page.name.toLowerCase().includes(fanpageSearch.toLowerCase()) ||
      (page.description && page.description.toLowerCase().includes(fanpageSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-8 min-w-full">
      {/* Header section with Filter Controls and Admin button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bản tin Sinh viên</h2>
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
            className="rounded-2xl border-slate-200/80 hover:bg-slate-50 font-semibold text-slate-600 gap-1.5 justify-center py-2.5 h-9 flex-1 md:flex-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>

          {isAdmin ? (
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setFormType("news");
                  setIsFormOpen(true);
                }}
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-sm shadow-blue-100 justify-center py-2.5 h-9 flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4" />
                Đăng tin / Kênh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logoutAdmin}
                className="rounded-2xl hover:bg-red-50 text-red-500 font-semibold gap-1.5 px-3 py-2.5 h-9 justify-center shrink-0"
                title="Đăng xuất quản trị viên"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Thoát</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuthOpen(true)}
              className="rounded-2xl border-slate-200/80 hover:bg-slate-50 text-slate-600 font-semibold gap-1.5 justify-center py-2.5 h-9 flex-1 md:flex-none"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Quản trị Bản tin
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout for News and Fanpage Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: News (50% width on desktop) */}
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-[28px] p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100/80">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Bản tin & Thông báo</h3>
              <p className="text-[10px] text-slate-400 font-medium">Cập nhật tin tức học vụ và hoạt động mới nhất</p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormType("news");
                  setIsFormOpen(true);
                }}
                className="h-7 w-7 rounded-lg p-0 border-slate-200/80 text-blue-600 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Quick Search for News */}
          <Input
            type="text"
            placeholder="Tìm kiếm bản tin..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 h-8.5 text-xs py-1.5 px-3"
          />

          {/* Category filters */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1.5 -mx-1 px-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(CATEGORY_MAP).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${
                  activeCategory === key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* News List */}
          {isLoading && newsItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4 opacity-80" />
              <p className="font-semibold text-slate-600">Đang tải danh sách bản tin...</p>
              <p className="text-xs mt-1 text-slate-400">Vui lòng chờ trong giây lát</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100">
              <Newspaper className="h-12 w-12 text-slate-300 mb-4 opacity-50" />
              <h3 className="font-semibold text-slate-700 text-lg">Không tìm thấy bản tin nào</h3>
              <p className="text-sm mt-1 text-slate-400 max-w-sm text-center">
                Hiện chưa có bản tin nào thuộc danh mục này, hoặc kết nối dữ liệu bị gián đoạn.
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredNews.map((item, index) => {
                  const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                      className="flex flex-col bg-white border border-slate-100/85 hover:border-blue-500/20 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden group cursor-pointer"
                      onClick={() => setSelectedNews(item)}
                    >
                      {/* Thumbnail Image */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.thumbnailUrl || PRESET_THUMBNAILS[3].url} 
                          alt={item.title}
                          className="object-cover w-full h-full group-hover:scale-106 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <Badge variant="outline" className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-sm ${catConfig.color} bg-white/95 backdrop-blur-xs`}>
                            {catConfig.label}
                          </Badge>
                        </div>
                        {isAdmin && (
                          <div className="absolute top-3 right-3 flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleEditNewsClick(item, e)}
                              className="p-1.5 bg-white/90 backdrop-blur-xs border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Chỉnh sửa bản tin"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNewsClick(item.id, e)}
                              className="p-1.5 bg-white/90 backdrop-blur-xs border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="Xóa bản tin"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Card Info */}
                      <div className="flex-1 flex flex-col p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                          <span>{item.date}</span>
                        </div>

                        <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-300 text-[14px] tracking-tight">
                          {item.title}
                        </h3>
                        
                        <p className="text-slate-500 text-[12px] line-clamp-3 leading-relaxed flex-1">
                          {item.description}
                        </p>

                        <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-blue-600 text-[12px] font-bold mt-auto">
                          <span className="group-hover:text-blue-700 transition-colors duration-300">Xem thông báo chi tiết</span>
                          <div className="p-1 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right Column: Fanpage List (50% width on desktop) */}
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-[28px] p-5 space-y-4 shadow-sm sticky top-24">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100/80">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Kênh thông tin HUFLIT</h3>
              <p className="text-[10px] text-slate-400 font-medium">Danh sách các Fanpage hữu ích cho sinh viên</p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormType("fanpage");
                  setIsFormOpen(true);
                }}
                className="h-7 w-7 rounded-lg p-0 border-slate-200/80 text-blue-600 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Quick Search */}
          <Input
            type="text"
            placeholder="Tìm kiếm kênh thông tin..."
            value={fanpageSearch}
            onChange={(e) => setFanpageSearch(e.target.value)}
            className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 h-8.5 text-xs py-1.5 px-3"
          />

          {/* Category Quick Badges */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1.5 -mx-1 px-1 scrollbar-none">
            <button
              onClick={() => setActiveFanpageCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${
                activeFanpageCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(FANPAGE_CATEGORY_MAP).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveFanpageCategory(key as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 whitespace-nowrap ${
                  activeFanpageCategory === key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100/50"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Fanpage List Items */}
          {isLoadingFanpages && fanpageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2 opacity-80" />
              <p className="text-[10px] font-semibold text-slate-500">Đang tải danh sách kênh...</p>
            </div>
          ) : filteredFanpages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center">
              <p className="text-xs font-semibold text-slate-500">Không tìm thấy kênh nào</p>
              <p className="text-[10px] mt-0.5 max-w-[200px]">Hãy thử tìm kiếm với từ khóa khác hoặc danh mục khác</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {filteredFanpages.map((page) => {
                const catConfig = FANPAGE_CATEGORY_MAP[page.category] || FANPAGE_CATEGORY_MAP.other;
                const isFacebookUrl = page.url?.includes("facebook.com");
                return (
                  <div
                    key={page.id}
                    onClick={() => setSelectedFanpage(page)}
                    className="flex flex-col bg-white border border-slate-100/85 hover:border-blue-500/20 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group/item cursor-pointer relative"
                  >
                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleEditFanpageClick(page, e)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Chỉnh sửa kênh thông tin"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFanpageClick(page.id, e)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Xóa kênh thông tin"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className={`flex items-center gap-2 flex-wrap ${isAdmin ? "pr-16" : ""}`}>
                        <span className="font-bold text-slate-800 text-[14px] leading-tight break-words group-hover/item:text-blue-600 transition-colors duration-200">
                          {page.name}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-md uppercase tracking-wider ${catConfig.color} bg-white/95 shrink-0`}>
                          {catConfig.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                        {page.description || "Kênh thông tin chính thức của HUFLIT."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between mt-2">
                      <span className="text-blue-600 text-[12px] font-bold group-hover/item:text-blue-700 transition-colors duration-200">
                        {isFacebookUrl ? "Xem trước trang Facebook" : "Xem liên kết"}
                      </span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Direct open button */}
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                          title="Mở Facebook trực tiếp"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fanpage Preview Modal */}
      <Dialog open={!!selectedFanpage} onOpenChange={(open) => !open && setSelectedFanpage(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-slate-950/40 border-none backdrop-blur-lg rounded-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
          {selectedFanpage && (
            <>
              <DialogHeader className="p-4 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0 mt-0.5">
                    <FacebookIcon className="h-5 w-5 fill-current" />
                  </div>
                  <div className="pr-6 min-w-0">
                    <DialogTitle className="text-slate-800 font-bold text-sm line-clamp-1">
                      {selectedFanpage.name}
                    </DialogTitle>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="text-blue-500 font-bold">Facebook Page</span>
                      <span>&bull;</span>
                      <span className="truncate">{selectedFanpage.url}</span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto bg-slate-100 flex items-start justify-center p-3 sm:p-4 min-h-[400px]">
                {selectedFanpage.url?.includes("facebook.com") ? (
                  <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden flex flex-col items-center">
                    <iframe
                      src={getFanpageEmbedUrl(selectedFanpage.url)}
                      width="500"
                      height="500"
                      style={{ border: "none", overflow: "hidden" }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      className="w-full"
                    />
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 w-full flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Nhúng từ Facebook Page Plugin</span>
                      <a
                        href={selectedFanpage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Mở Facebook
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md w-full bg-white rounded-3xl p-6 text-center shadow-lg border border-slate-100">
                    <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-800 mb-2">{selectedFanpage.name}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      {selectedFanpage.description || "Nhấn bên dưới để mở liên kết này."}
                    </p>
                    <a
                      href={selectedFanpage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-sm"
                    >
                      Truy cập trang nguồn
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* News Article Modal */}
      <Dialog
        open={!!selectedNews}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNews(null);
            setShowNewsEmbed(false);
          }
        }}
      >
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-slate-950/40 border-none backdrop-blur-lg rounded-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
          {selectedNews && (
            <>
              {/* Header */}
              <DialogHeader className="p-4 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0 mt-0.5">
                    <FacebookIcon className="h-5 w-5 fill-current" />
                  </div>
                  <div className="pr-6 min-w-0">
                    <DialogTitle className="text-slate-800 font-bold text-sm line-clamp-2 leading-snug">
                      {selectedNews.title}
                    </DialogTitle>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedNews.date}</span>
                      <span>&bull;</span>
                      <span className={`font-bold ${
                        ({
                          announcement: "text-rose-500",
                          scholarship: "text-amber-500",
                          activity: "text-sky-500",
                          other: "text-slate-400",
                        } as Record<string, string>)[selectedNews.category] || "text-slate-400"
                      }`}>
                        {CATEGORY_MAP[selectedNews.category]?.label || "Tin tức"}
                      </span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {/* Thumbnail */}
                {selectedNews.thumbnailUrl && (
                  <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedNews.thumbnailUrl}
                      alt={selectedNews.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>
                )}

                {/* Description card */}
                <div className="p-5 space-y-4">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {selectedNews.description || "Nhấn nút bên dưới để xem bài viết gốc trên Facebook."}
                  </p>

                  {/* Primary CTA */}
                  <a
                    href={selectedNews.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-sm shadow-blue-100 text-sm"
                  >
                    <FacebookIcon className="h-4 w-4 fill-current" />
                    Xem bài viết trên Facebook
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Optional: embed toggle — only for FB posts */}
                  {selectedNews.facebookUrl?.includes("facebook.com") && (
                    <div className="pt-1">
                      {!showNewsEmbed ? (
                        <button
                          type="button"
                          onClick={() => setShowNewsEmbed(true)}
                          className="w-full py-2.5 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                        >
                          <Info className="h-3.5 w-3.5" />
                          Nhúng bài viết Facebook (tuỳ chọn)
                        </button>
                      ) : (
                        <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm">
                          <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-1.5">
                            <Info className="h-3 w-3 text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-semibold">
                              Nếu hiện lỗi &ldquo;post no longer available&rdquo;, bài viết đã bị xóa hoặc đổi quyền riêng tư trên Facebook.
                            </p>
                          </div>
                          <iframe
                            src={getEmbedUrl(selectedNews.facebookUrl)}
                            width="100%"
                            height="480"
                            style={{ border: "none", overflow: "hidden" }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Auth Modal */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-slate-100 p-5 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              Xác thực Quản trị viên
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Vui lòng nhập mật khẩu quản trị để thực hiện chỉnh sửa bản tin
            </p>
          </DialogHeader>

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs font-bold text-slate-600">Mật khẩu</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="Nhập pass admin..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500"
                autoFocus
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl py-2.5"
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

              {/* Facebook URL */}
              <div className="space-y-1.5">
                <Label htmlFor="news-fb" className="text-xs font-bold text-slate-600">Link bài viết Facebook *</Label>
                <Input
                  id="news-fb"
                  type="url"
                  required
                  placeholder="Dán link bài viết hoặc ảnh của Facebook tại đây..."
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
                <p className="text-[10px] text-slate-400 font-semibold">
                  Hỗ trợ các link dạng: https://www.facebook.com/photo/?fbid=... hoặc link bài viết công khai.
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
