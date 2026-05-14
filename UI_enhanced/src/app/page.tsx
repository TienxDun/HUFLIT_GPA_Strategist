"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { TabSkeleton } from "@/components/features/TabSkeleton";
import { Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeRoadmapState } from "@/lib/share-utils";
import { toast } from "sonner";
import { type InitialRoadmapData } from "@/hooks/useRoadmapState";


// Dynamic Imports for performance optimization
const ScaleTab = dynamic(() => import("@/components/features/ScaleTab").then(mod => mod.ScaleTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const SubjectTab = dynamic(() => import("@/components/features/SubjectTab").then(mod => mod.SubjectTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const ManualTab = dynamic(() => import("@/components/features/ManualTab").then(mod => mod.ManualTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

const RoadmapTab = dynamic(() => import("@/components/features/RoadmapTab").then(mod => mod.RoadmapTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("manual");
  const [roadmapInitialData, setRoadmapInitialData] = useState<InitialRoadmapData | null>(null);

  // Preload dynamic components and check for shared data
  useEffect(() => {
    // 1. Xử lý dữ liệu chia sẻ từ URL
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("s");
    
    if (sharedData) {
      const decoded = decodeRoadmapState(sharedData);
      if (decoded) {
        setRoadmapInitialData({
          gpa: decoded.currentGPA,
          credits: decoded.currentCredits,
          targetGPA: decoded.targetGPA,
          remainingCredits: decoded.remainingCredits,
          pendingRetakes: decoded.retakes
        });
        setActiveTab("roadmap");
        
        // Dọn dẹp URL để trông chuyên nghiệp hơn
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
        
        // Thông báo cho người dùng
        setTimeout(() => {
          toast.success("Lộ trình đã được nạp thành công", {
            description: "Dữ liệu từ liên kết chia sẻ đã sẵn sàng.",
            duration: 4000,
          });
        }, 800);
      }
    }

    // 2. Preload heavy components after initial render to make tab switching instant
    const preload = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Promise.all([
        import("@/components/features/ScaleTab"),
        import("@/components/features/SubjectTab"),
        import("@/components/features/ManualTab"),
        import("@/components/features/RoadmapTab")
      ]).catch(err => console.error("Preload failed", err));
    };
    
    preload();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Smooth scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchToRoadmap = (data: InitialRoadmapData) => {
    setRoadmapInitialData(data);
    setActiveTab("roadmap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen bg-slate-50/50 text-slate-900 pb-4">
      {/* SEO H1 - Visually Hidden */}
      <h1 className="sr-only">HUFLIT GPA Strategist - Công cụ tính điểm GPA và lập lộ trình học tập thông minh cho sinh viên HUFLIT</h1>
      
      {/* Background Blobs for Glassmorphism - Wrapped to contain overflow without breaking sticky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-cyan-100/40 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-sky-100/30 blur-[80px]"></div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full relative z-10">
        
        {/* Header - Refactored to separate component */}
        <AppHeader activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content Area */}
        <div className="max-w-[1074px] mx-auto px-3 sm:px-6 mt-4 w-full pb-24 sm:pb-6">
          <TabsContent value="roadmap" className="focus-visible:outline-none focus-visible:ring-0 m-0 w-full">
            <RoadmapTab initialData={roadmapInitialData} onSwitchTab={handleTabChange} />
          </TabsContent>

          <TabsContent value="manual" className="focus-visible:outline-none focus-visible:ring-0 m-0 w-full">
            <ManualTab onSwitchToRoadmap={handleSwitchToRoadmap} />
          </TabsContent>

          <TabsContent value="subject" className="focus-visible:outline-none focus-visible:ring-0 m-0 w-full">
            <SubjectTab />
          </TabsContent>

          <TabsContent value="scale" className="focus-visible:outline-none focus-visible:ring-0 m-0 w-full">
            <ScaleTab />
          </TabsContent>

          <TabsContent value="news" className="focus-visible:outline-none focus-visible:ring-0 m-0 w-full">
            <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="font-medium text-lg">Bản tin Sinh viên</h3>
              <p className="text-sm mt-1 italic opacity-60">Tính năng đang được cập nhật dữ liệu...</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Bottom Navigation — Mobile only */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
