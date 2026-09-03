"use client";

import { memo, useState, useEffect } from "react";
import { ExternalLink, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SPOTIFY_REF_URL =
  "https://open.spotify.com/referral/003988232388e17beae7cb91ba4be3516763f2aa4f6059ab4ec377?si=a3AsoSejSfiF-375sZ4s9A&utm_source=native-share-menu&locale=vi&rv=2";

const STORAGE_KEY = "huflit_spotify_promo_dismissed";

export const SpotifyPromoBanner = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu người dùng chưa đóng banner trong phiên
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="relative z-40 w-full overflow-hidden bg-gradient-to-r from-emerald-950 via-[#0a1f13] to-slate-950 border-b border-[#1DB954]/25 shadow-[0_4px_20px_rgba(0,0,0,0.25)] text-white"
          aria-label="Thông báo ưu đãi Spotify Premium cho sinh viên"
        >
          {/* Subtle Spotify Glow Effect */}
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-[#1DB954]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-10 w-40 h-20 bg-[#1DB954]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-[1074px] mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2.5 sm:gap-4 relative">
            
            {/* Left Content: Spotify Icon + Badge + Message */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Spotify Icon */}
              <div 
                className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 shadow-sm shadow-[#1DB954]/40"
                aria-hidden="true"
              >
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.307c-.218.358-.68.473-1.038.255-2.846-1.738-6.428-2.13-10.648-1.168-.41.094-.817-.162-.911-.572-.094-.41.162-.817.572-.911 4.628-1.057 8.583-.61 11.77 1.358.358.218.473.68.255 1.038zm1.468-3.266c-.274.444-.858.586-1.302.312-3.257-2.002-8.223-2.583-12.074-1.413-.497.151-1.026-.135-1.177-.632-.151-.497.135-1.026.632-1.177 4.407-1.338 9.889-.691 13.609 1.598.444.274.586.858.312 1.312zm.126-3.41c-3.905-2.319-10.347-2.533-14.077-1.401-.599.182-1.233-.163-1.415-.762-.182-.599.163-1.233.762-1.415 4.29-1.303 11.393-1.054 15.867 1.603.539.32 1.218.15 1.538-.389.32-.539.15-1.218-.389-1.538z" />
                </svg>
              </div>

              {/* Text Message */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0 text-xs sm:text-[13px] leading-tight">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Đặc quyền sinh viên
                </span>
                
                <p className="truncate text-slate-200">
                  <span className="font-semibold text-white">Spotify Premium 3 tháng</span> chỉ{" "}
                  <span className="text-[#1DB954] font-black underline decoration-emerald-500/50 underline-offset-2">
                    33.000 ₫
                  </span>
                  <span className="hidden md:inline text-slate-300"> — Học tập không lo quảng cáo!</span>
                </p>
              </div>
            </div>

            {/* Right Content: CTA Button + Dismiss Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <a
                href={SPOTIFY_REF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-[11px] sm:text-xs px-3 sm:px-3.5 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shadow-[#1DB954]/30 whitespace-nowrap"
              >
                <span>Xem ngay</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-400"
                aria-label="Đóng thông báo ưu đãi"
                title="Đóng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

SpotifyPromoBanner.displayName = "SpotifyPromoBanner";
