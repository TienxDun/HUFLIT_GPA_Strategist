"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  MonitorSmartphone,
  Share,
  Smartphone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "ios" | "desktop" | "unknown";

function isMobileInstallPlatform(platform: Platform) {
  return platform === "android" || platform === "ios";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getPlatform(): Platform {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIPadOS =
    /macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1;
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || isIPadOS;
  const isAndroid = /android/.test(userAgent);

  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (/macintosh|windows|linux/.test(userAgent)) return "desktop";
  return "unknown";
}

export function PWAInstallGuide() {
  const [platform] = useState<Platform>(() =>
    typeof window === "undefined" ? "unknown" : getPlatform()
  );
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const fullscreenQuery = window.matchMedia("(display-mode: fullscreen)");

    const hideInstallGuide = () => {
      setVisible(false);
      setGuideOpen(false);
      setInstallPrompt(null);
    };

    if (!isMobileInstallPlatform(platform) || isStandalone()) {
      hideInstallGuide();
      return;
    }

    const openGuideTimer = window.setTimeout(() => {
      setVisible(true);
      setGuideOpen(true);
    }, 700);

    const handleBeforeInstallPrompt = (event: Event) => {
      if (!isMobileInstallPlatform(platform) || isStandalone()) {
        hideInstallGuide();
        return;
      }

      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleDisplayModeChange = () => {
      if (isStandalone()) {
        hideInstallGuide();
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", hideInstallGuide);
    standaloneQuery.addEventListener("change", handleDisplayModeChange);
    fullscreenQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.clearTimeout(openGuideTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", hideInstallGuide);
      standaloneQuery.removeEventListener("change", handleDisplayModeChange);
      fullscreenQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, [platform]);

  const content = useMemo(() => {
    if (platform === "ios") {
      return {
        title: "Cài app vào màn hình chính",
        description: "Mở nhanh như app, dùng ổn hơn khi cần xem lại GPA.",
        action: "Thêm app",
      };
    }

    if (platform === "android") {
      return {
        title: "Cài GPA Strategist",
        description: installPrompt
          ? "Thêm vào màn hình chính để mở nhanh và dùng như app."
          : "Bấm cài đặt để thêm web app vào màn hình chính.",
        action: "Cài đặt",
      };
    }

    return {
      title: "Dùng GPA Strategist như app",
      description: "Cài vào thiết bị để truy cập nhanh hơn từ màn hình chính.",
      action: "Hướng dẫn",
    };
  }, [installPrompt, platform]);

  const installGuide = useMemo(() => {
    if (platform === "ios") {
      return {
        badge: "iOS",
        icon: <Share className="size-4" />,
        title: "iPhone / iPad Safari",
        steps: [
          "Mở GPA Strategist bằng Safari.",
          "Chạm nút Chia sẻ ở thanh công cụ.",
          "Chọn Thêm vào Màn hình chính, rồi bấm Thêm.",
        ],
        note: "Chrome trên iOS không hiện đầy đủ tùy chọn này, nên Safari là cách ổn định nhất.",
      };
    }

    if (platform === "android") {
      return {
        badge: "Android",
        icon: <Smartphone className="size-4" />,
        title: "Android / Chrome",
        steps: installPrompt
          ? [
              "Chạm nút Cài đặt ngay trong thông báo này.",
              "Xác nhận cài đặt khi Chrome hỏi.",
              "Mở GPA Strategist từ màn hình chính.",
            ]
          : [
              "Mở GPA Strategist bằng Chrome.",
              "Chạm menu ba chấm ở góc trình duyệt.",
              "Chọn Cài đặt ứng dụng hoặc Thêm vào màn hình chính.",
            ],
        note: installPrompt
          ? "Thiết bị này hỗ trợ cài đặt trực tiếp từ trình duyệt."
          : "Một số trình duyệt Android chỉ hiện nút cài đặt trong menu.",
      };
    }

    return {
      badge: "Web",
      icon: <MonitorSmartphone className="size-4" />,
      title: "Thiết bị hiện tại",
      steps: [
        "Mở menu của trình duyệt.",
        "Tìm Cài đặt ứng dụng, Install app hoặc Add to Home Screen.",
        "Xác nhận để thêm GPA Strategist vào màn hình chính.",
      ],
      note: "Nếu không thấy tùy chọn cài đặt, hãy thử Chrome, Edge hoặc Safari trên thiết bị di động.",
    };
  }, [installPrompt, platform]);

  const handleInstall = async () => {
    if (!installPrompt) {
      setGuideOpen(true);
      if (platform === "android") {
        toast.info("Chrome chưa sẵn sàng cài trực tiếp", {
          description: "Bạn có thể mở menu ba chấm rồi chọn Cài đặt ứng dụng.",
          duration: 5000,
        });
      }
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setVisible(false);
      setGuideOpen(false);
      toast.success("Đã thêm GPA Strategist vào thiết bị");
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setGuideOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.section
            key="pwa-install-banner"
            className="mx-auto mb-4 mt-1 w-full max-w-[1074px] px-3 sm:px-6"
            aria-label="Hướng dẫn cài đặt ứng dụng"
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
          >
            <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white py-3 pl-5 pr-2.5 shadow-[0_12px_32px_-4px_rgba(59,130,246,0.08),0_4px_12px_-2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_16px_36px_-4px_rgba(59,130,246,0.12)] sm:py-3.5 sm:pl-6 sm:pr-3">
              
              {/* Title & Description */}
              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight leading-snug">{content.title}</h2>
                <p className="mt-0.5 text-[10px] sm:text-xs font-semibold leading-relaxed text-slate-500">
                  {content.description}
                </p>
              </div>

              {/* Right Action buttons */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  className="relative overflow-hidden h-8 sm:h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 shadow-[0_4px_10px_rgba(37,99,235,0.15)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] flex items-center gap-1 border-none shrink-0"
                  onClick={platform === "android" ? handleInstall : () => setGuideOpen(true)}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut"
                    }}
                  />
                  {platform === "ios" ? <Share className="relative z-10 size-3.5" /> : <Download className="relative z-10 size-3.5" />}
                  <span className="relative z-10 inline-block">{content.action}</span>
                </Button>
                
                {/* Close button - always in the flex flow, vertically centered */}
                <button
                  type="button"
                  className="flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors active:scale-90"
                  onClick={handleDismiss}
                  aria-label="Ẩn hướng dẫn cài đặt"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-lg font-black text-slate-900">
              Cài GPA Strategist trên thiết bị
            </DialogTitle>
            <DialogDescription className="leading-6">
              Làm theo đúng trình duyệt bạn đang dùng để thêm web app vào màn hình chính.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <InstallSteps
              badge={installGuide.badge}
              icon={installGuide.icon}
              title={installGuide.title}
              steps={installGuide.steps}
              note={installGuide.note}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => setGuideOpen(false)}
            >
              Để sau
            </Button>
            {platform === "android" && (
              <Button
                type="button"
                className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleInstall}
              >
                <Download className="size-4" />
                Cài đặt ngay
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InstallSteps({
  badge,
  icon,
  title,
  steps,
  note,
}: {
  badge: string;
  icon: ReactNode;
  title: string;
  steps: string[];
  note: string;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <span
          className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white"
          aria-hidden="true"
        >
          {icon}
        </span>
        {title}
        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700">
          {badge}
        </span>
      </div>

      <ol className="mt-3 space-y-2 text-sm font-medium leading-5 text-slate-600">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-slate-500 ring-1 ring-slate-200">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
        {note}
      </p>
    </div>
  );
}
