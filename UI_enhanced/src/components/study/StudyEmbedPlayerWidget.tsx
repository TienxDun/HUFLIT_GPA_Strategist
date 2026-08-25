"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Play,
  ExternalLink,
  Bookmark,
  Maximize2,
  Search,
  Headphones,
  Trash2,
  Tv,
  Music2,
  LayoutGrid,
  ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StudyEmbedItem,
  CURATED_EMBED_PRESETS,
  parseEmbedUrl
} from "./study-types";
import { toast } from "sonner";

interface StudyEmbedPlayerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onStreamActiveChange?: (isActive: boolean) => void;
  isZenMode?: boolean;
}

const STORAGE_CUSTOM_EMBEDS_KEY = "huflit_study_custom_embeds";
const STORAGE_ACTIVE_EMBED_KEY = "huflit_study_active_embed";
const STORAGE_VIEW_MODE_KEY = "huflit_study_embed_view_mode";

export const StudyEmbedPlayerWidget = ({
  isOpen,
  onClose,
  onOpen,
  onStreamActiveChange,
  isZenMode = false,
}: StudyEmbedPlayerWidgetProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<StudyEmbedItem | null>(null);
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  // Search or Quick URL Input
  const [searchOrUrl, setSearchOrUrl] = useState("");
  const [savedEmbeds, setSavedEmbeds] = useState<StudyEmbedItem[]>([]);

  // Automatically exit mini mode whenever parent opens widget
  useEffect(() => {
    if (isOpen) {
      setIsMiniMode(false);
    }
  }, [isOpen]);

  // Restore saved state from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CUSTOM_EMBEDS_KEY);
      if (stored) {
        setSavedEmbeds(JSON.parse(stored));
      }
      const lastActive = localStorage.getItem(STORAGE_ACTIVE_EMBED_KEY);
      if (lastActive) {
        const parsed = JSON.parse(lastActive);
        const matchedPreset = CURATED_EMBED_PRESETS.find((p) => p.id === parsed.id);
        setActiveItem(matchedPreset || parsed);
      }
      const savedView = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      if (savedView === "grid" || savedView === "list") {
        setViewMode(savedView);
      }
    } catch {}
  }, []);

  // Real-time URL parse detection
  const detectedEmbed = useMemo(() => {
    if (!searchOrUrl.trim()) return null;
    return parseEmbedUrl(searchOrUrl);
  }, [searchOrUrl]);

  // Sync active item state to parent (auto-pause internal music)
  useEffect(() => {
    if (onStreamActiveChange) {
      onStreamActiveChange(activeItem !== null);
    }
    try {
      if (activeItem) {
        localStorage.setItem(STORAGE_ACTIVE_EMBED_KEY, JSON.stringify(activeItem));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_EMBED_KEY);
      }
    } catch {}
  }, [activeItem, onStreamActiveChange]);

  const handlePlayItem = (item: StudyEmbedItem) => {
    setIsIframeLoading(true);
    setActiveItem(item);
    setIsMiniMode(false);
    if (onOpen) onOpen();
    toast.success(item.title, {
      description:
        item.platform === "spotify"
          ? "Nhấn nút ▶ trên khung Spotify để bắt đầu phát"
          : "Đang phát luồng âm thanh trực tiếp"
    });
  };

  const handleStopStream = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveItem(null);
    if (onStreamActiveChange) {
      onStreamActiveChange(false);
    }
    toast.info("Đã dừng phát luồng ngoài");
  };

  const handleExpand = () => {
    setIsMiniMode(false);
    if (onOpen) {
      onOpen();
    }
  };

  const handleMinimize = () => {
    setIsMiniMode(true);
    onClose();
  };

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_MODE_KEY, mode);
    } catch {}
  };

  const handlePlayFromInput = (save: boolean) => {
    if (!detectedEmbed) return;
    const title = detectedEmbed.title || (detectedEmbed.platform === "spotify" ? "Spotify Stream" : "YouTube Stream");
    
    const newItem: StudyEmbedItem = {
      id: "custom-" + Date.now(),
      title,
      url: searchOrUrl.trim(),
      embedUrl: detectedEmbed.embedUrl,
      platform: detectedEmbed.platform,
      category: "Tùy chỉnh",
      thumbnail: detectedEmbed.thumbnail,
      addedAt: Date.now()
    };

    if (save) {
      const updated = [newItem, ...savedEmbeds.filter((s) => s.url !== newItem.url)];
      setSavedEmbeds(updated);
      try {
        localStorage.setItem(STORAGE_CUSTOM_EMBEDS_KEY, JSON.stringify(updated));
      } catch {}
      toast.success("Đã lưu vào danh sách!");
    }

    handlePlayItem(newItem);
    setSearchOrUrl("");
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedEmbeds.filter((item) => item.id !== id);
    setSavedEmbeds(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_EMBEDS_KEY, JSON.stringify(updated));
    } catch {}
    toast.success("Đã xóa khỏi danh sách đã lưu");
  };

  // Modern Filter Categories with Accent Highlights
  const categories = [
    { key: "all", label: "Tất cả", accent: "text-white" },
    { key: "youtube", label: "YouTube", accent: "text-red-400" },
    { key: "spotify", label: "Spotify", accent: "text-emerald-400" },
    { key: "saved", label: `Đã lưu (${savedEmbeds.length})`, accent: "text-purple-400" }
  ];

  // Filtered List
  const displayedItems = useMemo(() => {
    const isUrlInput = detectedEmbed !== null;
    const query = isUrlInput ? "" : searchOrUrl.toLowerCase().trim();

    if (activeCategory === "saved") {
      return savedEmbeds.filter((item) =>
        query ? item.title.toLowerCase().includes(query) || item.url.toLowerCase().includes(query) : true
      );
    }

    const sourceList = [...CURATED_EMBED_PRESETS, ...savedEmbeds];
    return sourceList.filter((item) => {
      const matchesSearch = query
        ? item.title.toLowerCase().includes(query) || (item.category && item.category.toLowerCase().includes(query))
        : true;
      if (!matchesSearch) return false;
      if (activeCategory === "all") return true;
      if (activeCategory === "youtube") return item.platform === "youtube";
      if (activeCategory === "spotify") return item.platform === "spotify";
      return item.category === activeCategory;
    });
  }, [activeCategory, searchOrUrl, detectedEmbed, savedEmbeds]);

  // Is modal open and not in mini floating mode
  const isModalVisible = isOpen && !isMiniMode;

  // Don't render anything if completely closed and no active stream
  if (!isOpen && !activeItem) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (activeItem) {
        handleMinimize();
      } else {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Floating Mini Pill (Visible when stream is active but modal is closed or minimized, and NOT in Zen mode) */}
      <AnimatePresence>
        {activeItem && !isModalVisible && !isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleExpand}
            className={`fixed bottom-24 right-6 z-50 flex items-center gap-3 p-2 pl-2.5 pr-3 rounded-full backdrop-blur-3xl transition-all duration-300 group cursor-pointer ${
              activeItem.platform === "spotify"
                ? "bg-gradient-to-b from-[#14261e] to-[#0a130f] border border-emerald-500/40 shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:border-emerald-400/60"
                : "bg-gradient-to-b from-[#271416] to-[#120809] border border-red-500/40 shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:border-red-400/60"
            }`}
          >
            {/* Design Cue 1: Spotify Square Vinyl Cover vs YouTube 16:9 Cinema Thumbnail */}
            {activeItem.platform === "spotify" ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-950/80 border border-emerald-500/30 shrink-0 shadow-md">
                {activeItem.thumbnail && (
                  <img
                    src={activeItem.thumbnail}
                    alt={activeItem.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                )}
              </div>
            ) : (
              <div className="relative w-13 h-9 rounded-lg overflow-hidden bg-red-950/80 border border-red-500/30 shrink-0 shadow-md">
                {activeItem.thumbnail && (
                  <img
                    src={activeItem.thumbnail}
                    alt={activeItem.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                )}
                {/* Cinema Timeline Scrubber Line */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
              </div>
            )}

            {/* Track Title & Clean Status Indicator */}
            <div className="min-w-0 pr-1 flex flex-col justify-center">
              <p className={`text-xs font-semibold truncate max-w-[130px] sm:max-w-[160px] transition-colors ${
                activeItem.platform === "spotify" ? "text-slate-100 group-hover:text-emerald-300" : "text-slate-100 group-hover:text-red-300"
              }`}>
                {activeItem.title}
              </p>
              
              <div className="flex items-center gap-1.5 mt-0.5">
                {activeItem.platform === "spotify" ? (
                  /* Spotify: Clean Equalizer Waves */
                  <div className="flex items-end gap-0.5 h-2.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse" />
                    <span className="w-0.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: "120ms" }} />
                    <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" style={{ animationDelay: "240ms" }} />
                    <span className="w-0.5 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: "360ms" }} />
                  </div>
                ) : (
                  /* YouTube: Clean LIVE Badge */
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                    <span className="text-[9px] font-bold text-red-300 tracking-wider">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Styled Titanium Controls */}
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpand();
                }}
                className="w-7 h-7 rounded-full border border-slate-600/50 bg-slate-800/60 hover:bg-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Mở rộng (E)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStopStream}
                className="w-7 h-7 rounded-full border border-slate-700/50 bg-slate-800/40 hover:bg-red-500/30 hover:border-red-500/40 flex items-center justify-center text-slate-400 hover:text-red-200 transition-all cursor-pointer shadow-sm"
                title="Dừng phát"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stream Hub Modal Dialog */}
      <div
        onClick={handleBackdropClick}
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-all duration-300 ${
          isModalVisible
            ? "opacity-100 pointer-events-auto scale-100"
            : "opacity-0 pointer-events-none scale-95"
        }`}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1F2532] via-[#151922] to-[#0D1017] border border-slate-600/50 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-slate-100 overflow-hidden transform-gpu will-change-transform"
        >
          {/* Top Edge Brushed Metallic Reflection */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/40 to-transparent pointer-events-none z-10" />

          {/* 1. Header */}
          <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-800/40 via-slate-800/20 to-slate-800/40 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Đài Phát & Âm Nhạc Trực Tuyến
              </h2>
            </div>

            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Active Player Frame (Seamless Spotify & YouTube Video) */}
          {activeItem && (
            <div className={`relative z-10 border-b p-4 space-y-2.5 transition-colors ${
              activeItem.platform === "spotify"
                ? "bg-gradient-to-b from-[#10221A] to-[#0B1510] border-emerald-500/30"
                : "bg-gradient-to-b from-[#251214] to-[#140A0B] border-red-500/30"
            }`}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {/* Clean Visual Status (Green Equalizer vs Red LIVE Beacon) */}
                  {activeItem.platform === "spotify" ? (
                    <div className="flex items-end gap-0.5 h-3.5 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                      <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: "120ms" }} />
                      <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" style={{ animationDelay: "240ms" }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="text-[10px] font-bold text-red-300 tracking-wider">LIVE</span>
                    </div>
                  )}

                  <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-sm">
                    {activeItem.title}
                  </span>
                  {activeItem.platform === "spotify" && (
                    <span className="text-[11px] text-emerald-400/90 font-medium hidden sm:inline">
                      • Bấm ▶ để phát
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeItem.platform === "youtube" && (
                    <button
                      onClick={() => setIsAudioOnly(!isAudioOnly)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isAudioOnly
                          ? "bg-purple-600/30 text-purple-200 border-purple-400/40 shadow-sm"
                          : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700/80 hover:text-white"
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isAudioOnly ? "Chỉ nghe âm thanh" : "Xem video"}</span>
                    </button>
                  )}

                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                    title="Mở tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={handleStopStream}
                    className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors cursor-pointer border border-red-500/30"
                  >
                    Dừng phát
                  </button>
                </div>
              </div>

              {/* Embedded Frame */}
              <div
                className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 border border-slate-700/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] ${
                  activeItem.platform === "spotify"
                    ? "h-[152px] bg-transparent border-0 shadow-none"
                    : isAudioOnly
                    ? "h-[80px] bg-black"
                    : "h-[280px] sm:h-[350px] bg-black"
                }`}
              >
                {/* Sleek Titanium Shimmer Skeleton Loader */}
                <AnimatePresence>
                  {isIframeLoading && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#1C2230] to-[#121620] gap-3 pointer-events-none"
                    >
                      {/* Equalizer Wave Pulse */}
                      <div className="flex items-end gap-1 h-6">
                        <span className="w-1 h-3 bg-slate-400/60 rounded-full animate-pulse" style={{ animationDuration: "0.8s" }} />
                        <span className="w-1 h-5 bg-slate-300 rounded-full animate-pulse" style={{ animationDuration: "0.6s", animationDelay: "0.15s" }} />
                        <span className="w-1 h-6 bg-purple-400 rounded-full animate-pulse" style={{ animationDuration: "0.7s", animationDelay: "0.3s" }} />
                        <span className="w-1 h-4 bg-slate-300 rounded-full animate-pulse" style={{ animationDuration: "0.5s", animationDelay: "0.45s" }} />
                        <span className="w-1 h-2 bg-slate-400/60 rounded-full animate-pulse" style={{ animationDuration: "0.9s", animationDelay: "0.6s" }} />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                        <span>Đang kết nối luồng phát...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <iframe
                  key={activeItem.id}
                  src={activeItem.embedUrl}
                  title={activeItem.title}
                  className="w-full h-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  onLoad={() => setIsIframeLoading(false)}
                />
              </div>
            </div>
          )}

          {/* 3. Search Bar & Advanced Category Segmented Controls */}
          <div className="relative z-10 p-4 sm:p-5 border-b border-slate-700/50 bg-slate-900/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchOrUrl}
                  onChange={(e) => setSearchOrUrl(e.target.value)}
                  placeholder="Dán link YouTube / Spotify hoặc tìm kiếm theo thể loại..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121620] border border-slate-700/70 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Quick Action when URL is detected */}
              {detectedEmbed ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePlayFromInput(false)}
                    className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Phát Ngay</span>
                  </button>
                  <button
                    onClick={() => handlePlayFromInput(true)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-all border border-slate-600 cursor-pointer"
                    title="Lưu & Phát"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* View Mode Switcher (Grid vs Compact List) */
                <div className="flex items-center p-1 rounded-xl bg-[#121620] border border-slate-700/70 shrink-0">
                  <button
                    onClick={() => toggleViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                    title="Chế độ Lưới Album"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "list" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                    title="Chế độ Danh sách"
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Aesthetic Segmented Mood Filter Bar */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121620] border border-slate-700/70 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-700/90 text-white font-semibold shadow-sm border border-slate-500/50"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <span className={isActive ? cat.accent : ""}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Breakthrough Visual Stream Grid & List */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 custom-study-scroll">
            {displayedItems.length === 0 ? (
              <div className="text-center py-14 text-slate-400 text-xs">
                Không tìm thấy kênh hoặc đài phát phù hợp.
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW: Gorgeous Visual Album Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedItems.map((item) => {
                  const isCurrent = activeItem?.id === item.id || activeItem?.embedUrl === item.embedUrl;
                  const isSaved = savedEmbeds.some((s) => s.id === item.id);
                  const hasImageError = failedImages[item.id];
                  const isImageLoaded = loadedImages[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePlayItem(item)}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-b from-[#2A2342] to-[#1A152E] border-purple-400/60 ring-1 ring-purple-400/40 shadow-xl shadow-purple-950/50"
                          : "bg-gradient-to-b from-[#1C2230] to-[#131722] hover:from-[#242C3E] hover:to-[#171D2B] border-slate-700/60 hover:border-slate-500/60 shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Image / Artwork Frame with 16:9 Aspect Ratio */}
                      <div className="relative w-full h-32 bg-slate-900 overflow-hidden">
                        {/* Shimmer Placeholder */}
                        {!isImageLoaded && !hasImageError && (
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
                        )}

                        {item.thumbnail && !hasImageError ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-500 ease-out ${
                              isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                            onLoad={() => setLoadedImages((prev) => ({ ...prev, [item.id]: true }))}
                            onError={() => {
                              setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.platform === "spotify" ? (
                              <Music2 className="w-8 h-8 text-emerald-400/80" />
                            ) : (
                              <Tv className="w-8 h-8 text-red-400/80" />
                            )}
                          </div>
                        )}

                        {/* Top Gradient & Glass Badges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                        {/* Top Platform Brand Badge (Clean LIVE or Equalizer Tag) */}
                        <div className="absolute top-2.5 right-2.5">
                          {item.platform === "spotify" ? (
                            <div className="flex items-end gap-0.5 h-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 shadow-lg">
                              <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full" />
                              <span className="w-0.5 h-2.5 bg-emerald-300 rounded-full" />
                              <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 shadow-lg">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              <span className="text-[9px] font-bold text-red-300 tracking-wider">LIVE</span>
                            </div>
                          )}
                        </div>

                        {/* Center Hover Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 ${
                            isCurrent
                              ? "bg-purple-500 text-white scale-100 ring-2 ring-white/40"
                              : "bg-white/90 text-slate-950 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                          }`}>
                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                          </div>
                        </div>

                        {/* Equalizer Wave Indicator if Playing */}
                        {isCurrent && (
                          <div className="absolute bottom-2.5 right-2.5 flex items-end gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                            <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                            <span className="w-1 h-4 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-semibold truncate ${
                            isCurrent ? "text-purple-200" : "text-white group-hover:text-purple-300 transition-colors"
                          }`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                            <span className={item.platform === "spotify" ? "text-emerald-400/90 font-medium" : "text-red-400/90 font-medium"}>
                              {item.category || "Study Focus"}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] text-purple-300">
                                • <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Đang phát
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button if saved */}
                        {isSaved && (
                          <button
                            onClick={(e) => handleDeleteSaved(item.id, e)}
                            title="Xóa khỏi đã lưu"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW: Compact Sleek Rows */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayedItems.map((item) => {
                  const isCurrent = activeItem?.id === item.id || activeItem?.embedUrl === item.embedUrl;
                  const isSaved = savedEmbeds.some((s) => s.id === item.id);
                  const hasImageError = failedImages[item.id];
                  const isImageLoaded = loadedImages[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePlayItem(item)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-gradient-to-b from-[#2A2342] to-[#1A152E] border-purple-400/60 shadow-sm"
                          : "bg-gradient-to-b from-[#1C2230] to-[#131722] hover:from-[#242C3E] hover:to-[#171D2B] border-slate-700/60 hover:border-slate-500/60 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 shrink-0 overflow-hidden relative border border-slate-700/60 flex items-center justify-center">
                          {!isImageLoaded && !hasImageError && (
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
                          )}
                          {item.thumbnail && !hasImageError ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                                isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                              }`}
                              onLoad={() => setLoadedImages((prev) => ({ ...prev, [item.id]: true }))}
                              onError={() => {
                                setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-purple-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                            <Play className={`w-3.5 h-3.5 ml-0.5 fill-current ${
                              isCurrent ? "text-purple-400 opacity-100" : "text-white opacity-0 group-hover:opacity-100"
                            } transition-opacity`} />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4 className={`text-xs font-semibold truncate ${
                            isCurrent ? "text-purple-300" : "text-white group-hover:text-purple-200"
                          }`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                            <span className={item.platform === "spotify" ? "text-emerald-400/90 font-medium" : "text-red-400/90 font-medium"}>
                              {item.category || "Study Focus"}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] text-purple-300">
                                • <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Đang phát
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSaved && (
                        <button
                          onClick={(e) => handleDeleteSaved(item.id, e)}
                          title="Xóa khỏi đã lưu"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
