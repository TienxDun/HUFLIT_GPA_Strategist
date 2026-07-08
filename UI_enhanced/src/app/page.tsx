"use client";

import { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { PWAInstallGuide } from "@/components/layout/PWAInstallGuide";
import { AppFooter } from "@/components/layout/AppFooter";
import { TabSkeleton } from "@/components/features/TabSkeleton";
import { decodeRoadmapState } from "@/lib/share-utils";
import { toast } from "sonner";
import { type InitialRoadmapData } from "@/hooks/useRoadmapState";

const VALID_TABS = ["manual", "roadmap", "subject", "scale", "news"] as const;
type TabValue = (typeof VALID_TABS)[number];

const DEFAULT_TAB: TabValue = "manual";

const isValidTab = (tab: string | null): tab is TabValue =>
  Boolean(tab && VALID_TABS.includes(tab as TabValue));

const getTabFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return isValidTab(tab) ? tab : DEFAULT_TAB;
};

const getTabUrl = (tab: TabValue) => {
  const url = new URL(window.location.href);
  url.searchParams.delete("s");
  url.searchParams.set("tab", tab);
  return `${url.pathname}${url.search}${url.hash}`;
};

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

const NewsTab = dynamic(() => import("@/components/features/NewsTab").then(mod => mod.NewsTab), {
  loading: () => <TabSkeleton />,
  ssr: false
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabValue>(DEFAULT_TAB);
  const [roadmapInitialData, setRoadmapInitialData] = useState<InitialRoadmapData | null>(null);

  const handleTabChange = useCallback((tab: string) => {
    if (!isValidTab(tab)) return;

    setActiveTab(tab);
    
    const nextUrl = getTabUrl(tab);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.pushState({ tab }, "", nextUrl);
    }

    // Smooth scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Preload dynamic components and check for shared data
  useEffect(() => {
    // 1. Xử lý dữ liệu chia sẻ từ URL
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("s");
    let loadedSharedRoadmap = false;
    
    if (sharedData) {
      const decoded = decodeRoadmapState(sharedData);
      if (decoded) {
        loadedSharedRoadmap = true;
        setRoadmapInitialData({
          gpa: decoded.currentGPA,
          credits: decoded.currentCredits,
          targetGPA: decoded.targetGPA,
          remainingCredits: decoded.remainingCredits,
          pendingRetakes: decoded.retakes
        });
        setActiveTab("roadmap");
        
        // Dọn dẹp URL để trông chuyên nghiệp hơn
        window.history.replaceState({ tab: "roadmap" }, "", getTabUrl("roadmap"));
        
        // Thông báo cho người dùng
        setTimeout(() => {
          toast.success("Lộ trình đã được nạp thành công", {
            description: "Dữ liệu từ liên kết chia sẻ đã sẵn sàng.",
            duration: 4000,
          });
        }, 800);
      }
    }

    if (!loadedSharedRoadmap) {
      const initialTab = getTabFromUrl();
      setActiveTab(initialTab);
      window.history.replaceState({ tab: initialTab }, "", getTabUrl(initialTab));
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

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSwitchToRoadmap = (data: InitialRoadmapData) => {
    setRoadmapInitialData(data);
    handleTabChange("roadmap");
  };

  return (
    <main className="relative min-h-dvh bg-slate-50/50 text-slate-900 pt-safe flex flex-col">
      {/* SEO H1 - Visually Hidden */}
      <h1 className="sr-only">HUFLIT GPA Strategist - Công cụ tính điểm GPA và lập lộ trình học tập thông minh cho sinh viên HUFLIT</h1>
      
      {/* Background Blobs for Glassmorphism - Wrapped to contain overflow without breaking sticky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-cyan-100/40 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-sky-100/30 blur-[80px]"></div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full relative z-10 flex-1 flex flex-col">
        
        {/* Header - Refactored to separate component */}
        <AppHeader activeTab={activeTab} onTabChange={handleTabChange} />
        <PWAInstallGuide />

        {/* Main Content Area */}
        <div className="max-w-[1074px] mx-auto px-3 sm:px-6 mt-4 w-full mobile-content-safe flex-1 flex flex-col">
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
            <NewsTab />
          </TabsContent>

          {/* Footer chân trang */}
          <AppFooter />
        </div>
      </Tabs>

      {/* Bottom Navigation — Mobile only */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
