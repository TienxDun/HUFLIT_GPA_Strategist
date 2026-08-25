"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Video, 
  Search, 
  Coffee, 
  Trees, 
  Building2, 
  Heart, 
  Tv, 
  ChevronLeft, 
  ChevronRight,
  Check
} from "lucide-react";
import { Scene, STUDY_SCENES } from "./study-types";
import { motion, AnimatePresence } from "framer-motion";

interface SceneSelectorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentScene: Scene;
  onSelectScene: (scene: Scene) => void;
}

const SceneThumbnail: React.FC<{ scene: Scene }> = ({ scene }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}
      <img
        src={scene.thumbnailUrl}
        alt={scene.name}
        className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

interface CategoryItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const SceneSelectorWidget = ({
  isOpen,
  onClose,
  currentScene,
  onSelectScene,
}: SceneSelectorWidgetProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalReady, setIsModalReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scenes = STUDY_SCENES;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsModalReady(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsModalReady(false);
    }
  }, [isOpen]);

  const categories: CategoryItem[] = [
    { key: "all", label: "Tất cả", icon: Sparkles, color: "text-amber-400" },
    { key: "video", label: "Video 4K", icon: Video, color: "text-rose-400" },
    { key: "chill", label: "Chill & Lofi", icon: Coffee, color: "text-amber-300" },
    { key: "anime", label: "Anime", icon: Tv, color: "text-purple-400" },
    { key: "nature", label: "Thiên nhiên", icon: Trees, color: "text-teal-400" },
    { key: "urban", label: "Đô thị & Đêm", icon: Building2, color: "text-sky-400" },
    { key: "cute", label: "Đáng yêu", icon: Heart, color: "text-pink-400" },
  ];

  const availableCategories = useMemo(() => {
    return categories.filter((cat) => {
      const count = scenes.filter((s) => {
        if (cat.key === "all") return true;
        if (cat.key === "video") return s.type === "VIDEO";
        return s.category === cat.key;
      }).length;
      return count > 0;
    });
  }, [scenes]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredScenes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scenes.filter((s) => {
      const matchCategory = 
        selectedCategory === "all" ? true :
        selectedCategory === "video" ? s.type === "VIDEO" :
        s.category === selectedCategory;

      const matchSearch = !q || 
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [scenes, selectedCategory, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="scene-selector-fragment">
          {/* Fullscreen Backdrop (Trong suốt để nhìn rõ 100% hình nền thay đổi phía sau) */}
          <motion.div
            key="scene-selector-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10 cursor-default"
            onClick={onClose}
          />

          <motion.div
            key="scene-selector-panel"
            initial={{ opacity: 0, x: -20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 bottom-20 left-20 sm:left-24 z-50 w-[420px] sm:w-[460px] max-w-[calc(100vw-96px)] flex flex-col rounded-3xl bg-[#0d121f]/94 backdrop-blur-xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.75)] text-white overflow-hidden transform-gpu will-change-transform"
          >
            {/* Header with Search */}
            <div className="p-4 pb-2.5 border-b border-white/10 shrink-0 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                      Không gian & Hình nền
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/30">
                        {scenes.length}
                      </span>
                    </h3>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Search Bar */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bối cảnh (Tokyo, Cafe, Mưa, Cat...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-sky-400/50 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
                />
                {Boolean(searchQuery) && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modern Interactive Category Carousel */}
            <div className="relative px-3 pt-2 pb-2 shrink-0 border-b border-white/5 bg-black/20">
              {/* Scroll arrow buttons */}
              <button
                onClick={() => scroll("left")}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white shadow-md active:scale-90 transition-all hidden sm:flex items-center justify-center cursor-pointer"
                title="Cuộn sang trái"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-1.5 overflow-x-auto px-2 sm:px-6 py-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {availableCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.key;
                  const count = scenes.filter((s) => {
                    if (cat.key === "all") return true;
                    if (cat.key === "video") return s.type === "VIDEO";
                    return s.category === cat.key;
                  }).length;

                  return (
                    <button
                      key={cat.key || `cat-scene-${idx}`}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`relative group flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                        isSelected
                          ? "text-white shadow-lg"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                      }`}
                    >
                      {/* Sliding Active Pill Background (Framer Motion) */}
                      {isSelected && (
                        <motion.div
                          layoutId="active-scene-cat"
                          className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl border border-sky-400/40 shadow-[0_4px_16px_rgba(2,132,199,0.4)]"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}

                      {/* Icon with Color */}
                      <Icon
                        className={`w-3.5 h-3.5 relative z-10 transition-transform group-hover:scale-110 ${
                          isSelected ? "text-white" : cat.color
                        }`}
                      />

                      {/* Label */}
                      <span className="relative z-10">{cat.label}</span>

                      {/* Count Badge */}
                      <span
                        className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scroll("right")}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white shadow-md active:scale-90 transition-all hidden sm:flex items-center justify-center cursor-pointer"
                title="Cuộn sang phải"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scene Cards Grid (2 cột thanh thoát cạnh dock, không che trung tâm) */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-3.5 grid grid-cols-2 gap-3 auto-rows-max content-start custom-study-scroll">
              {filteredScenes.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Search className="w-6 h-6 opacity-40" />
                  <span>Không tìm thấy bối cảnh nào phù hợp</span>
                </div>
              ) : (
                filteredScenes.map((scene, idx) => {
                  const isSelected = currentScene.id === scene.id;
                  const isVideo = scene.type === "VIDEO";

                  return (
                    <button
                      key={scene.id || `scene-${idx}`}
                      onClick={() => onSelectScene(scene)}
                      className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 text-left bg-slate-900/80 cursor-pointer shrink-0 shadow-md hover:shadow-xl ${
                        isSelected
                          ? "border-sky-400 ring-2 ring-sky-400/60 shadow-[0_8px_24px_rgba(2,132,199,0.4)] scale-[1.02]"
                          : "border-white/10 hover:border-white/30 hover:scale-[1.015]"
                      }`}
                    >
                      {/* Thumbnail Image */}
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-950 shrink-0">
                        <SceneThumbnail scene={scene} />

                        {/* Video 4K Badge */}
                        {isVideo && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-amber-400/30 shadow-md">
                            <Video className="w-2.5 h-2.5" /> 4K Động
                          </span>
                        )}

                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-xl animate-fade-in">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Đang dùng</span>
                          </div>
                        )}
                      </div>

                      {/* Scene Title Info */}
                      <div className="p-2.5 bg-slate-950/90 backdrop-blur-sm border-t border-white/10 shrink-0 flex flex-col justify-center">
                        <p className="text-xs font-bold text-white leading-tight truncate group-hover:text-sky-300 transition-colors">
                          {scene.name}
                        </p>
                        <span className="text-[10px] text-slate-400 capitalize mt-0.5 block truncate">
                          {scene.category}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
