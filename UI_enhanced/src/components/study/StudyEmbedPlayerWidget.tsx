"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Play,
  ExternalLink,
  Bookmark,
  Maximize2,
  Search,
  Trash2,
  Tv,
  Music2,
  LayoutGrid,
  ListFilter,
  PictureInPicture2,
  GripHorizontal
} from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
  activeItem?: StudyEmbedItem | null;
  onStreamActiveChange?: (isActive: boolean) => void;
  onActiveItemChange?: (item: StudyEmbedItem | null) => void;
  isZenMode?: boolean;
}

const STORAGE_CUSTOM_EMBEDS_KEY = "huflit_study_custom_embeds";
const STORAGE_ACTIVE_EMBED_KEY = "huflit_study_active_embed";
const STORAGE_VIEW_MODE_KEY = "huflit_study_embed_view_mode";

export const StudyEmbedPlayerWidget = ({
  isOpen,
  onClose,
  onOpen,
  activeItem = null,
  onStreamActiveChange,
  onActiveItemChange,
  isZenMode = false,
}: StudyEmbedPlayerWidgetProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const changeActiveItem = React.useCallback((item: StudyEmbedItem | null) => {
    if (onActiveItemChange) {
      onActiveItemChange(item);
    }
    if (onStreamActiveChange) {
      onStreamActiveChange(item !== null);
    }
    try {
      if (item) {
        localStorage.setItem(STORAGE_ACTIVE_EMBED_KEY, JSON.stringify(item));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_EMBED_KEY);
      }
    } catch {}
  }, [onActiveItemChange, onStreamActiveChange]);

  const [isCinemaFocus, setIsCinemaFocus] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const pipDragControls = useDragControls();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  // Search or Quick URL Input
  const [searchOrUrl, setSearchOrUrl] = useState("");
  const [savedEmbeds, setSavedEmbeds] = useState<StudyEmbedItem[]>([]);

  // Automatically exit PiP mode whenever parent opens widget
  useEffect(() => {
    if (isOpen) {
      setIsPipMode(false);
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
        const target = matchedPreset || parsed;
        changeActiveItem(target);
      }
      const savedView = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      if (savedView === "grid" || savedView === "list") {
        setViewMode(savedView);
      }
    } catch {}
  }, [changeActiveItem]);

  // Real-time URL parse detection
  const detectedEmbed = useMemo(() => {
    if (!searchOrUrl.trim()) return null;
    return parseEmbedUrl(searchOrUrl);
  }, [searchOrUrl]);

  // Asynchronously resolve real video/playlist title from oEmbed API
  const [fetchedMetadata, setFetchedMetadata] = useState<{ title?: string; author?: string; thumbnail?: string } | null>(null);

  useEffect(() => {
    if (!detectedEmbed || !searchOrUrl.trim()) {
      setFetchedMetadata(null);
      return;
    }

    let isMounted = true;
    const url = searchOrUrl.trim();

    const fetchRealOembed = async () => {
      try {
        if (detectedEmbed.platform === "youtube") {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title && isMounted) {
              setFetchedMetadata({
                title: data.title,
                author: data.author_name,
                thumbnail: data.thumbnail_url || detectedEmbed.thumbnail
              });
              return;
            }
          }
        } else if (detectedEmbed.platform === "spotify") {
          const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title && isMounted) {
              setFetchedMetadata({
                title: data.title,
                thumbnail: data.thumbnail_url || detectedEmbed.thumbnail
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn("[StudyEmbed] Failed to fetch oEmbed:", err);
      }
    };

    fetchRealOembed();

    return () => {
      isMounted = false;
    };
  }, [detectedEmbed, searchOrUrl]);

  // Background resolver: enhance active item's title if it's currently a placeholder
  useEffect(() => {
    if (!activeItem || !activeItem.url) return;
    const genericTitles = ["YouTube Video", "YouTube Live Stream", "YouTube Playlist", "Custom Stream", "Spotify Playlist", "Spotify Track", "Spotify Album"];
    if (!genericTitles.includes(activeItem.title)) return;

    let isMounted = true;
    const resolveTitle = async () => {
      try {
        if (activeItem.platform === "youtube") {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(activeItem.url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title && isMounted) {
              changeActiveItem({
                ...activeItem,
                title: data.title,
                category: data.author_name || activeItem.category || "YouTube",
                thumbnail: data.thumbnail_url || activeItem.thumbnail
              });
            }
          }
        } else if (activeItem.platform === "spotify") {
          const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(activeItem.url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title && isMounted) {
              changeActiveItem({
                ...activeItem,
                title: data.title,
                thumbnail: data.thumbnail_url || activeItem.thumbnail
              });
            }
          }
        }
      } catch {}
    };

    resolveTitle();
    return () => { isMounted = false; };
  }, [activeItem, changeActiveItem]);

  const handlePlayItem = (item: StudyEmbedItem) => {
    setIsIframeLoading(true);
    changeActiveItem(item);
    setIsPipMode(false);
    if (onOpen) onOpen();
    toast.success(item.title, {
      description:
        item.platform === "spotify"
          ? "Nhấn nút ▶ trên khung Spotify để bắt đầu phát"
          : "Đang phát luồng âm thanh"
    });
  };

  const handleStopStream = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    changeActiveItem(null);
    setIsPipMode(false);
    toast.info("Đã dừng phát luồng ngoài");
  };

  const handleExpand = () => {
    setIsPipMode(false);
    if (onOpen) {
      onOpen();
    }
  };

  const handleMinimize = () => {
    onClose();
  };

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem(STORAGE_VIEW_MODE_KEY, mode);
    } catch {}
  };

  const handlePlayFromInput = async (save: boolean) => {
    if (!detectedEmbed) return;
    
    // Check if we already have fetched real title or fallback
    let resolvedTitle = fetchedMetadata?.title;
    let resolvedAuthor = fetchedMetadata?.author;
    let resolvedThumb = fetchedMetadata?.thumbnail || detectedEmbed.thumbnail;

    // If not fetched yet, try a quick 1-second fetch before mounting
    if (!resolvedTitle) {
      try {
        if (detectedEmbed.platform === "youtube") {
          const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(searchOrUrl.trim())}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.title) {
              resolvedTitle = data.title;
              resolvedAuthor = data.author_name;
              resolvedThumb = data.thumbnail_url || resolvedThumb;
            }
          }
        }
      } catch {}
    }

    const title = resolvedTitle || detectedEmbed.title || (detectedEmbed.platform === "spotify" ? "Spotify Stream" : "YouTube Video");
    
    const newItem: StudyEmbedItem = {
      id: "custom-" + Date.now(),
      title,
      url: searchOrUrl.trim(),
      embedUrl: detectedEmbed.embedUrl,
      platform: detectedEmbed.platform,
      category: resolvedAuthor || "Tùy chỉnh",
      thumbnail: resolvedThumb,
      isLive: detectedEmbed.isLive || false,
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

  // Is modal backdrop visible
  const isBackdropOpen = isOpen && !isPipMode;

  // Don't render anything if completely closed and no active stream
  if (!isOpen && !activeItem && !isPipMode) return null;

  return (
    <>
      {/* Dimmed Modal Backdrop (Only shown when full modal is open and not in PiP) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isBackdropOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Single Persistent Morphing Player & Modal Shell */}
      <div
        className={
          isPipMode
            ? "fixed inset-0 z-50 pointer-events-none"
            : isBackdropOpen
            ? "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none"
            : "fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
        }
      >
        <motion.div
          drag={isPipMode}
          dragControls={pipDragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.08}
          className={
            isPipMode
              ? "pointer-events-auto fixed bottom-24 right-6 w-[340px] sm:w-[420px] rounded-2xl bg-[#0D1017]/95 backdrop-blur-2xl border border-slate-700/70 shadow-[0_25px_65px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)_inset] overflow-hidden group/pip touch-none select-none"
              : isCinemaFocus && activeItem
              ? "pointer-events-auto relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1F2532] via-[#151922] to-[#0D1017] border border-slate-600/50 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-slate-100 overflow-hidden transform-gpu"
              : "pointer-events-auto relative w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#1F2532] via-[#151922] to-[#0D1017] border border-slate-600/50 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-slate-100 overflow-hidden transform-gpu"
          }
        >
          {/* Top Edge Brushed Metallic Reflection (Modal Mode only) */}
          {!isPipMode && (
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/40 to-transparent pointer-events-none z-10" />
          )}

          {/* 1. Header Logic */}
          {isPipMode ? (
            /* PiP Draggable Header Bar */
            <div
              onPointerDown={(e) => pipDragControls.start(e)}
              className="flex items-center justify-between px-3.5 py-2 bg-slate-900/95 hover:bg-slate-900 border-b border-slate-800/80 text-white cursor-grab active:cursor-grabbing transition-colors"
              title="Nhấn giữ & kéo thả để di chuyển vị trí khắp màn hình"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2 pointer-events-none">
                <GripHorizontal className="w-4 h-4 text-slate-500 group-hover/pip:text-slate-300 transition-colors shrink-0" />
                {activeItem?.isLive ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[9px] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold text-[9px] shrink-0">
                    PiP
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {activeItem?.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setIsPipMode(false);
                    if (onOpen) onOpen();
                  }}
                  className="p-1 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Mở rộng ra Modal đầy đủ"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setIsPipMode(false)}
                  className="p-1 rounded-md hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Đóng cửa sổ nổi (Thu về thanh đáy)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Full Modal Header (Hidden in Cinema Focus Mode) */
            !isCinemaFocus && (
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
            )
          )}

          {/* 2. Active Player Toolbar (Modal Mode only) */}
          {!isPipMode && activeItem && (
            <div className={`relative z-10 border-b p-3.5 sm:p-4 space-y-2.5 transition-colors ${
              activeItem.platform === "spotify"
                ? "bg-gradient-to-b from-[#10221A] to-[#0B1510] border-emerald-500/30"
                : "bg-gradient-to-b from-[#251214] to-[#140A0B] border-red-500/30"
            }`}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {activeItem.platform === "spotify" ? (
                    <div className="flex items-end gap-0.5 h-3.5 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                      <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: "120ms" }} />
                      <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-pulse" style={{ animationDelay: "240ms" }} />
                    </div>
                  ) : activeItem.isLive ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      <span className="text-[10px] font-bold text-red-300 tracking-wider">LIVE</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold tracking-wider">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>VIDEO</span>
                    </div>
                  )}

                  <span className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {activeItem.title}
                  </span>
                  {activeItem.platform === "spotify" && (
                    <span className="text-[11px] text-emerald-400/90 font-medium hidden sm:inline">
                      • Bấm ▶ để phát
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Cinema Focus Toggle */}
                  {activeItem.platform === "youtube" && (
                    <button
                      onClick={() => setIsCinemaFocus(!isCinemaFocus)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isCinemaFocus
                          ? "bg-purple-600/30 text-purple-200 border-purple-400/40 shadow-sm"
                          : "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700/80 hover:text-white"
                      }`}
                      title={isCinemaFocus ? "Mở lại danh sách bài hát" : "Chỉ tập trung xem video (Ẩn danh sách)"}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>{isCinemaFocus ? "Hiện danh sách" : "Chỉ xem video"}</span>
                    </button>
                  )}

                  {/* Picture-in-Picture Popout Button */}
                  {activeItem.platform === "youtube" && (
                    <button
                      onClick={() => {
                        setIsPipMode(true);
                        toast.info("Đã chuyển sang Cửa sổ Video Nổi (PiP)");
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-slate-700/60 flex items-center gap-1.5"
                      title="Tách thành Cửa sổ Video nổi ở góc màn hình"
                    >
                      <PictureInPicture2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cửa sổ nổi</span>
                    </button>
                  )}

                  {!isCinemaFocus ? (
                    <>
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
                    </>
                  ) : (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
                      title="Đóng (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. The Continuous Persistent Video Frame (Never unmounts or restarts playback) */}
          {activeItem && (
            <div
              className={`relative w-full overflow-hidden transition-all duration-300 ${
                isPipMode
                  ? "h-[190px] sm:h-[236px] bg-black"
                  : activeItem.platform === "spotify"
                  ? "h-[152px] bg-transparent"
                  : isCinemaFocus
                  ? "h-[360px] sm:h-[480px] bg-black p-0"
                  : "h-[280px] sm:h-[350px] bg-black p-0"
              }`}
            >
              {/* Shimmer Skeleton during initial connect */}
              <AnimatePresence>
                {isIframeLoading && !isPipMode && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-[#1C2230] to-[#121620] gap-3 pointer-events-none"
                  >
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
          )}

          {/* 4. Search Bar & Presets Drawer (Only shown in Full Modal Mode) */}
          {!isPipMode && !isCinemaFocus && (
            <>
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
                    <div className="flex items-center p-1 rounded-xl bg-[#121620] border border-slate-700/70 shrink-0">
                      <button
                        onClick={() => toggleViewMode("grid")}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewMode === "grid" ? "bg-slate-700/80 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Dạng lưới"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleViewMode("list")}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          viewMode === "list" ? "bg-slate-700/80 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Dạng danh sách"
                      >
                        <ListFilter className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer border ${
                          isActive
                            ? "bg-slate-700/80 text-white border-slate-500 shadow-sm"
                            : "bg-[#121620]/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/40"
                        }`}
                      >
                        <span className={cat.accent}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets Grid/List */}
              <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 custom-study-scroll">
                {displayedItems.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 text-xs">
                    Không tìm thấy kênh hoặc đài phát phù hợp.
                  </div>
                ) : viewMode === "grid" ? (
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
                          <div className="relative w-full h-32 bg-slate-900 overflow-hidden">
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
                                onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
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
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute top-2.5 right-2.5">
                              {item.platform === "spotify" ? (
                                <div className="flex items-end gap-0.5 h-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 shadow-lg">
                                  <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full" />
                                  <span className="w-0.5 h-2.5 bg-emerald-300 rounded-full" />
                                  <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full" />
                                </div>
                              ) : item.isLive ? (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 shadow-lg">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                  <span className="text-[9px] font-bold text-red-300 tracking-wider">LIVE</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/30 shadow-lg">
                                  <Play className="w-2.5 h-2.5 text-red-400 fill-current" />
                                  <span className="text-[9px] font-bold text-red-300 tracking-wider">VIDEO</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 ${
                                isCurrent
                                  ? "bg-purple-500 text-white scale-100 ring-2 ring-white/40"
                                  : "bg-white/90 text-slate-950 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                              }`}>
                                <Play className="w-4 h-4 ml-0.5 fill-current" />
                              </div>
                            </div>
                            {isCurrent && (
                              <div className="absolute bottom-2.5 right-2.5 flex items-end gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                                <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                                <span className="w-1 h-4 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                                <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                              </div>
                            )}
                          </div>
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
                                  onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
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
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};
