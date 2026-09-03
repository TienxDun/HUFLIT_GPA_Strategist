"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoItem {
  id: "google-ai" | "spotify";
  badgeText: string;
  title: string;
  highlightText: string;
  desktopDescription: string;
  mobileTitle: string;
  mobileHighlight: string;
  ctaTextDesktop: string;
  ctaTextMobile: string;
  url: string;
  theme: {
    bgGradient: string;
    borderBottom: string;
    glowLeft: string;
    glowRight: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    ctaBg: string;
    ctaHover: string;
    ctaText: string;
    ctaShadow: string;
    highlightClass: string;
    progressBar: string;
    focusRing: string;
  };
  renderIcon: () => React.ReactNode;
}

const GOOGLE_AI_URL = "https://goo.gle/ai-student-university-vn";
const SPOTIFY_REF_URL =
  "https://open.spotify.com/referral/003988232388e17beae7cb91ba4be3516763f2aa4f6059ab4ec377?si=a3AsoSejSfiF-375sZ4s9A&utm_source=native-share-menu&locale=vi&rv=2";

const PROMO_ITEMS: PromoItem[] = [
  {
    id: "google-ai",
    badgeText: "Google AI x Sinh viên VN",
    title: "Google AI Plus (Gemini)",
    highlightText: "Miễn phí 1 năm",
    desktopDescription: "— Trợ lý AI học tập & đồ án cho sinh viên!",
    mobileTitle: "Google AI Plus",
    mobileHighlight: "Free 1 năm",
    ctaTextDesktop: "Nhận ưu đãi",
    ctaTextMobile: "Nhận",
    url: GOOGLE_AI_URL,
    theme: {
      bgGradient: "bg-gradient-to-r from-[#0a1326] via-[#0e1730] to-[#1a122e]",
      borderBottom: "border-b border-sky-400/20",
      glowLeft: "bg-sky-500/15",
      glowRight: "bg-indigo-500/15",
      badgeBg: "bg-sky-500/15",
      badgeText: "text-sky-300",
      badgeBorder: "border-sky-400/25",
      ctaBg: "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500",
      ctaHover: "hover:from-sky-300 hover:via-blue-400 hover:to-indigo-400",
      ctaText: "text-white",
      ctaShadow: "shadow-sky-500/25",
      highlightClass: "text-amber-300 font-extrabold underline decoration-amber-400/50 underline-offset-2",
      progressBar: "bg-gradient-to-r from-sky-400 to-indigo-400",
      focusRing: "focus:ring-sky-400",
    },
    renderIcon: () => (
      <div
        className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/40 p-1"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
        </svg>
      </div>
    ),
  },
  {
    id: "spotify",
    badgeText: "Đặc quyền sinh viên",
    title: "Spotify Premium 3 tháng",
    highlightText: "Chỉ 33.000 ₫",
    desktopDescription: "— Nghe nhạc không quảng cáo khi học tập!",
    mobileTitle: "Spotify Premium",
    mobileHighlight: "3 tháng 33k",
    ctaTextDesktop: "Xem ngay",
    ctaTextMobile: "Xem",
    url: SPOTIFY_REF_URL,
    theme: {
      bgGradient: "bg-gradient-to-r from-[#06180d] via-[#091f12] to-[#0f172a]",
      borderBottom: "border-b border-[#1DB954]/20",
      glowLeft: "bg-[#1DB954]/15",
      glowRight: "bg-[#1DB954]/10",
      badgeBg: "bg-[#1DB954]/15",
      badgeText: "text-[#1DB954]",
      badgeBorder: "border-[#1DB954]/25",
      ctaBg: "bg-[#1DB954]",
      ctaHover: "hover:bg-[#1ed760]",
      ctaText: "text-black",
      ctaShadow: "shadow-[#1DB954]/30",
      highlightClass: "text-[#1DB954] font-extrabold underline decoration-emerald-500/50 underline-offset-2",
      progressBar: "bg-[#1DB954]",
      focusRing: "focus:ring-emerald-400",
    },
    renderIcon: () => (
      <div
        className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 shadow-sm shadow-[#1DB954]/40"
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.307c-.218.358-.68.473-1.038.255-2.846-1.738-6.428-2.13-10.648-1.168-.41.094-.817-.162-.911-.572-.094-.41.162-.817.572-.911 4.628-1.057 8.583-.61 11.77 1.358.358.218.473.68.255 1.038zm1.468-3.266c-.274.444-.858.586-1.302.312-3.257-2.002-8.223-2.583-12.074-1.413-.497.151-1.026-.135-1.177-.632-.151-.497.135-1.026.632-1.177 4.407-1.338 9.889-.691 13.609 1.598.444.274.586.858.312 1.312zm.126-3.41c-3.905-2.319-10.347-2.533-14.077-1.401-.599.182-1.233-.163-1.415-.762-.182-.599.163-1.233.762-1.415 4.29-1.303 11.393-1.054 15.867 1.603.539.32 1.218.15 1.538-.389.32-.539.15-1.218-.389-1.538z" />
        </svg>
      </div>
    ),
  },
];

const STORAGE_KEY = "huflit_student_promo_dismissed";
const AUTO_PLAY_INTERVAL = 7500; // 7.5 giây mỗi ưu đãi

export const StudentPromoBanner = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Touch gesture tracking for mobile horizontal swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  useEffect(() => {
    // Kiểm tra nếu người dùng chưa đóng banner trong phiên
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % PROMO_ITEMS.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + PROMO_ITEMS.length) % PROMO_ITEMS.length);
    setProgressKey((prev) => prev + 1);
  }, []);

  // Tự động chuyển ưu đãi khi không hover/touch
  useEffect(() => {
    if (!isOpen || isPaused || PROMO_ITEMS.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, handleNext]);

  // Mobile horizontal swipe detection
  const minSwipeDistance = 35; // px

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current ?? 0) - (touchEndY.current ?? 0);

    // Chuyển banner khi vuốt ngang rõ rệt hơn vuốt dọc
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        handleNext(); // Vuốt sang trái -> xem tiếp theo
      } else {
        handlePrev(); // Vuốt sang phải -> xem trước đó
      }
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  const currentItem = PROMO_ITEMS[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`relative z-40 w-full overflow-hidden ${currentItem.theme.bgGradient} ${currentItem.theme.borderBottom} shadow-[0_2px_12px_rgba(0,0,0,0.18)] text-white transition-colors duration-500 select-none touch-pan-y group`}
          aria-label="Thông báo ưu đãi đặc quyền cho sinh viên"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Ambient Glows */}
          <div
            className={`absolute -left-10 -top-10 w-32 h-32 ${currentItem.theme.glowLeft} rounded-full blur-2xl pointer-events-none transition-colors duration-500`}
          />
          <div
            className={`absolute right-1/3 -bottom-8 w-40 h-20 ${currentItem.theme.glowRight} rounded-full blur-2xl pointer-events-none transition-colors duration-500`}
          />

          <div className="max-w-[1074px] mx-auto px-2.5 sm:px-5 py-1.5 sm:py-2 flex items-center justify-between gap-2 relative">
            
            {/* Left Content Area */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, x: direction * 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 16 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1"
                >
                  {/* Brand Icon */}
                  {currentItem.renderIcon()}

                  {/* Desktop & Tablet View (>= sm) */}
                  <div className="hidden sm:flex items-center gap-2 min-w-0 text-xs sm:text-[13px] leading-tight">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${currentItem.theme.badgeBg} ${currentItem.theme.badgeText} border ${currentItem.theme.badgeBorder} shrink-0`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {currentItem.badgeText}
                    </span>

                    <p className="text-slate-200 truncate">
                      <span className="font-semibold text-white">{currentItem.title}</span>{" "}
                      <span className={currentItem.theme.highlightClass}>
                        {currentItem.highlightText}
                      </span>
                      <span className="text-slate-300/90 ml-1">
                        {currentItem.desktopDescription}
                      </span>
                    </p>
                  </div>

                  {/* Mobile Compact View (< sm) */}
                  <div className="flex sm:hidden items-center gap-1.5 min-w-0 text-[11px] leading-tight">
                    <span className="font-semibold text-white truncate max-w-[115px]">
                      {currentItem.mobileTitle}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className={`shrink-0 ${currentItem.theme.highlightClass}`}>
                      {currentItem.mobileHighlight}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Controls Area: Desktop Chevrons + CTA + Dismiss Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mini Chevron Nav (Desktop Only, subtle & pops on hover) */}
              {PROMO_ITEMS.length > 1 && (
                <div className="hidden sm:flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity mr-0.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                    aria-label="Ưu đãi trước"
                    title="Ưu đãi trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                    aria-label="Ưu đãi tiếp theo"
                    title="Ưu đãi tiếp theo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Call-To-Action Button */}
              <a
                href={currentItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 sm:gap-1.5 ${currentItem.theme.ctaBg} ${currentItem.theme.ctaHover} ${currentItem.theme.ctaText} font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${currentItem.theme.ctaShadow} whitespace-nowrap`}
              >
                <span className="sm:inline hidden">{currentItem.ctaTextDesktop}</span>
                <span className="sm:hidden inline">{currentItem.ctaTextMobile}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className={`p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer focus:outline-none focus:ring-1 ${currentItem.theme.focusRing}`}
                aria-label="Đóng thông báo ưu đãi"
                title="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Micro Progress Bar at the bottom (indicates auto-rotation) */}
          {PROMO_ITEMS.length > 1 && !isPaused && (
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/5 overflow-hidden">
              <motion.div
                key={progressKey}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: AUTO_PLAY_INTERVAL / 1000, ease: "linear" }}
                className={`h-full ${currentItem.theme.progressBar} opacity-75`}
              />
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

StudentPromoBanner.displayName = "StudentPromoBanner";
