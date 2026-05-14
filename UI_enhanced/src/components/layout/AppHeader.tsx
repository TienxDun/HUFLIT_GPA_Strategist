"use client";

import { GraduationCap, Calculator, Target, BookOpen, Newspaper, BarChart3 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo } from "react";
import { AuthorInfoDialog } from "./AuthorInfoDialog";
import Image from "next/image";
import { motion } from "framer-motion";

interface AppHeaderProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const AppHeader = memo(({ activeTab, onTabChange }: AppHeaderProps) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const avatarSrc = `${basePath}/ava.jpg`;

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:px-6 mb-4">
      <div className="max-w-[1074px] mx-auto h-13 flex items-center justify-between px-3 bg-white/90 backdrop-blur-2xl border border-slate-200/60 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.05)] rounded-full transition-all duration-500 ring-1 ring-white/50">
        
        {/* Logo Section */}
        <div 
          onClick={() => onTabChange?.("manual")}
          className="flex items-center gap-2.5 pl-1 group cursor-pointer shrink-0 active:scale-95 transition-transform min-w-[44px] min-h-[44px] justify-center sm:justify-start"
          role="button"
          aria-label="Về trang chủ Nhập điểm"
        >
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-1.5 rounded-full shadow-[0_2px_10px_rgba(37,99,235,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-black text-[14px] tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent hidden md:block">HUFLIT</span>
        </div>

        {/* Nav Menu (Floating Pill Tabs) — Hidden on mobile, Bottom Nav handles it */}
        <div className="hidden sm:flex flex-1 items-center justify-center h-full px-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="flex items-center h-9 gap-1 sm:gap-1.5 border-none p-1 bg-transparent rounded-full relative">
            {[
              { value: "manual", icon: Calculator, label: "Nhập điểm" },
              { value: "roadmap", icon: Target, label: "Lộ trình" },
              { value: "subject", icon: BookOpen, label: "Môn lẻ" },
              { value: "scale", icon: BarChart3, label: "Thang điểm" },
              { value: "news", icon: Newspaper, label: "Tin tức" },
            ].map((tab) => {
              const isActive = activeTab === tab.value;
              
              return (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  aria-label={`Chuyển sang tab ${tab.label}`}
                  className="h-7 sm:h-8 relative rounded-full border-0 px-4 sm:px-6 py-0 text-[10px] sm:text-[11px] font-bold text-slate-500 transition-colors focus-visible:ring-0 flex items-center justify-center group shadow-none 
                    hover:text-blue-600/80 data-active:text-blue-700 tracking-tight z-10 bg-transparent"
                >
                  {/* Hover effect for inactive tabs */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-slate-100/0 group-hover:bg-slate-100/50 rounded-full transition-colors -z-10" />
                  )}

                  {/* Active Background (Magic Pill) */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-blue-50 border-0 rounded-full -z-10 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <span className="whitespace-nowrap relative z-20 transition-transform group-active:scale-95 tracking-tight">
                    {tab.label}
                  </span>
                  
                  {/* Active Underline Indicator (Animated) */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-underline"
                      className="absolute inset-x-0 bottom-[4px] flex justify-center z-20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    >
                      <div className="w-6 h-[2px] bg-blue-600 rounded-full opacity-80" />
                    </motion.div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Mobile Brand Centerpiece */}
        <div className="flex sm:hidden flex-1 flex-col items-center justify-center leading-none select-none pointer-events-none">
          <span className="font-black text-[12px] tracking-[0.4em] text-blue-600 translate-x-[0.2em] drop-shadow-sm">HUFLIT</span>
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5 translate-x-[0.1em]">Strategist</span>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-1.5 pr-0.5 shrink-0">

          <AuthorInfoDialog>
            <button 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-sm active:scale-90 transition-transform cursor-pointer overflow-hidden border-none outline-none"
              aria-label="Thông tin tác giả"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                <Image 
                  src={avatarSrc}
                  alt="TienxDun" 
                  fill 
                  className="object-cover"
                />
              </div>
            </button>
          </AuthorInfoDialog>
        </div>

      </div>
    </header>
  );
});

AppHeader.displayName = "AppHeader";
