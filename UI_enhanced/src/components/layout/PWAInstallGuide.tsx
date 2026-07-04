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

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "android" | "ios" | "desktop" | "unknown";
const CTA_DISMISSED_UNTIL_KEY = "huflit-pwa-cta-dismissed-until";
const CTA_DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

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

function isDismissedWithinCooldown() {
  const dismissedUntil = Number(localStorage.getItem(CTA_DISMISSED_UNTIL_KEY));
  return Number.isFinite(dismissedUntil) && Date.now() < dismissedUntil;
}

function dismissForThreeDays() {
  localStorage.setItem(
    CTA_DISMISSED_UNTIL_KEY,
    String(Date.now() + CTA_DISMISS_DURATION_MS)
  );
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

    if (isStandalone() || isDismissedWithinCooldown()) {
      hideInstallGuide();
      return;
    }

    const openGuideTimer = window.setTimeout(() => {
      setVisible(true);
      setGuideOpen(true);
    }, 700);

    const handleBeforeInstallPrompt = (event: Event) => {
      if (isStandalone() || isDismissedWithinCooldown()) {
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
        action: "Xem cách cài",
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

  const handleUnderstand = () => {
    dismissForThreeDays();
    setVisible(false);
    setGuideOpen(false);
  };

  if (!visible) return null;

  return (
    <>
      <section
        className="mx-auto mb-4 mt-1 w-full max-w-[1074px] px-3 sm:px-6"
        aria-label="Hướng dẫn cài đặt ứng dụng"
      >
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:items-center sm:p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <MonitorSmartphone className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black leading-tight text-slate-900">{content.title}</h2>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
              {content.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-xl bg-blue-600 px-3 text-white hover:bg-blue-700"
              onClick={platform === "android" ? handleInstall : () => setGuideOpen(true)}
            >
              {platform === "ios" ? <Share className="size-4" /> : <Download className="size-4" />}
              <span className="hidden sm:inline">{content.action}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-xl text-slate-500"
              onClick={handleDismiss}
              aria-label="Ẩn hướng dẫn cài đặt"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </section>

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
            <Button
              type="button"
              className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={platform === "android" ? handleInstall : handleUnderstand}
            >
              {platform === "android" ? (
                <Download className="size-4" />
              ) : (
                <Share className="size-4" />
              )}
              {platform === "android" ? "Cài đặt ngay" : "Đã hiểu"}
            </Button>
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
