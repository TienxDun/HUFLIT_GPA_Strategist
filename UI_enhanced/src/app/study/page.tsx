"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  CheckSquare, 
  FileText, 
  Image as ImageIcon,
  Headphones,
  Eye,
  EyeOff,
  Timer,
  Keyboard,
  X,
  Music2,
  Sliders,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Scene, STUDY_SCENES, StudyEmbedItem } from "@/components/study/study-types";
import { PomodoroSoundType } from "@/components/study/study-sound";
import { StudyMusicPlayer } from "@/components/study/StudyMusicPlayer";
import { StudyPomodoroWidget, TimerTab } from "@/components/study/StudyPomodoroWidget";
import { StudySettingsModal } from "@/components/study/StudySettingsModal";

// Lazy Load heavy widgets with code-splitting to optimize First Contentful Paint & bundle size
const StudyTasksWidget = dynamic(
  () => import("@/components/study/StudyTasksWidget").then((mod) => mod.StudyTasksWidget),
  { ssr: false }
);

const StudyNotesWidget = dynamic(
  () => import("@/components/study/StudyNotesWidget").then((mod) => mod.StudyNotesWidget),
  { ssr: false }
);

const SceneSelectorWidget = dynamic(
  () => import("@/components/study/SceneSelectorWidget").then((mod) => mod.SceneSelectorWidget),
  { ssr: false }
);

const StudyEmbedPlayerWidget = dynamic(
  () => import("@/components/study/StudyEmbedPlayerWidget").then((mod) => mod.StudyEmbedPlayerWidget),
  { ssr: false }
);

export default function StudySpacePage() {
  const [currentScene, setCurrentScene] = useState<Scene>(STUDY_SCENES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isZenMode, setIsZenMode] = useState(false);

  // Widget States
  const [isPomodoroVisible, setIsPomodoroVisible] = useState(true);
  const [centerTab, setCenterTab] = useState<TimerTab>("pomodoro");
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isScenesOpen, setIsScenesOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isEmbedPlayerOpen, setIsEmbedPlayerOpen] = useState(false);
  const [isExternalStreamActive, setIsExternalStreamActive] = useState(false);
  const [externalActiveItem, setExternalActiveItem] = useState<StudyEmbedItem | null>(null);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Unified Settings Modal State (Default: Tắt giây đồng hồ, Tắt .00 stopwatch, Bật chuông Pomodoro 25-5-15)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedTabBeforeSettings, setSavedTabBeforeSettings] = useState<TimerTab | null>(null);
  const [showClockSeconds, setShowClockSeconds] = useState(false);
  const [isClock12Hour, setIsClock12Hour] = useState(false);
  const [showStopwatchMilliseconds, setShowStopwatchMilliseconds] = useState(false);
  const [pomodoroDurations, setPomodoroDurations] = useState({
    focus: 25,
    short_break: 5,
    long_break: 15,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<PomodoroSoundType>("classic_clock");

  // Phục hồi Background Scene & Cài đặt cá nhân từ LocalStorage khi vào lại trang
  useEffect(() => {
    try {
      const savedSceneId = localStorage.getItem("huflit_study_scene_id");
      if (savedSceneId) {
        const found = STUDY_SCENES.find((s) => s.id === savedSceneId);
        if (found) setCurrentScene(found);
      }
      const savedMute = localStorage.getItem("huflit_study_global_mute");
      if (savedMute !== null) {
        setIsGlobalMuted(savedMute === "true");
      }
      const savedPomoVis = localStorage.getItem("huflit_study_pomo_visible");
      if (savedPomoVis !== null) {
        setIsPomodoroVisible(savedPomoVis === "true");
      }

      // Restore Study Settings
      const savedSec = localStorage.getItem("study_clock_show_seconds");
      if (savedSec !== null) setShowClockSeconds(savedSec === "true");

      const saved12h = localStorage.getItem("study_clock_12hour");
      if (saved12h !== null) setIsClock12Hour(saved12h === "true");

      const savedMs = localStorage.getItem("study_stopwatch_show_ms");
      if (savedMs !== null) setShowStopwatchMilliseconds(savedMs === "true");

      const savedDurations = localStorage.getItem("study_pomodoro_durations");
      if (savedDurations) setPomodoroDurations(JSON.parse(savedDurations));

      const savedSound = localStorage.getItem("study_sound_enabled");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedSoundType = localStorage.getItem("study_pomodoro_sound_type") as PomodoroSoundType;
      const validSounds: PomodoroSoundType[] = ["classic_clock", "zen_bell", "birds", "digital"];
      if (savedSoundType && validSounds.includes(savedSoundType)) {
        setSoundType(savedSoundType);
      } else {
        setSoundType("classic_clock");
      }
    } catch {}
  }, []);

  const handleOpenSettings = () => {
    setSavedTabBeforeSettings(centerTab);
    setIsSettingsOpen(true);
    setIsMixerOpen(false);
    setIsTasksOpen(false);
    setIsNotesOpen(false);
    setIsScenesOpen(false);
    setIsEmbedPlayerOpen(false);
    setIsShortcutsHelpOpen(false);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    if (savedTabBeforeSettings) {
      setCenterTab(savedTabBeforeSettings);
      setSavedTabBeforeSettings(null);
    }
  };

  const handleActiveSectionChange = (section: TimerTab) => {
    setIsPomodoroVisible(true);
    setCenterTab(section);
  };

  const handleToggleClockSeconds = () => {
    setShowClockSeconds((prev) => {
      const next = !prev;
      try { localStorage.setItem("study_clock_show_seconds", String(next)); } catch {}
      return next;
    });
  };

  const handleToggleClock12Hour = () => {
    setIsClock12Hour((prev) => {
      const next = !prev;
      try { localStorage.setItem("study_clock_12hour", String(next)); } catch {}
      return next;
    });
  };

  const handleToggleStopwatchMilliseconds = () => {
    setShowStopwatchMilliseconds((prev) => {
      const next = !prev;
      try { localStorage.setItem("study_stopwatch_show_ms", String(next)); } catch {}
      return next;
    });
  };

  const handleSavePomodoroDurations = (d: typeof pomodoroDurations) => {
    setPomodoroDurations(d);
    try { localStorage.setItem("study_pomodoro_durations", JSON.stringify(d)); } catch {}
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem("study_sound_enabled", String(next)); } catch {}
      return next;
    });
  };

  const handleSelectSoundType = (type: PomodoroSoundType) => {
    setSoundType(type);
    try { localStorage.setItem("study_pomodoro_sound_type", type); } catch {}
  };

  const handleSelectScene = (scene: Scene) => {
    setCurrentScene(scene);
    try {
      localStorage.setItem("huflit_study_scene_id", scene.id);
    } catch {}
  };

  const toggleGlobalMute = () => {
    setIsGlobalMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("huflit_study_global_mute", String(next));
      } catch {}
      return next;
    });
  };

  // Digital clock & date update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      setCurrentDate(`${day}/${month}/${year}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Global Keyboard Shortcuts for UI and Tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi người dùng đang nhập văn bản
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement).isContentEditable
      );

      if (e.key === "Escape") {
        handleCloseSettings();
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
        setIsEmbedPlayerOpen(false);
        setIsShortcutsHelpOpen(false);
        setIsZenMode(false);
        return;
      }

      if (isInput) return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        setIsZenMode((prev) => {
          const next = !prev;
          if (next) {
            setIsTasksOpen(false);
            setIsNotesOpen(false);
            setIsScenesOpen(false);
            setIsMixerOpen(false);
            setIsEmbedPlayerOpen(false);
            handleCloseSettings();
          }
          return next;
        });
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setIsPomodoroVisible((prev) => {
          const next = !prev;
          try {
            localStorage.setItem("huflit_study_pomo_visible", String(next));
          } catch {}
          return next;
        });
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setIsTasksOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsNotesOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
        setIsEmbedPlayerOpen(false);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setIsNotesOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsTasksOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
        setIsEmbedPlayerOpen(false);
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsScenesOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsMixerOpen(false);
        setIsEmbedPlayerOpen(false);
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setIsEmbedPlayerOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setIsMixerOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsScenesOpen(false);
        setIsEmbedPlayerOpen(false);
      } else if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => {
          const next = !prev;
          if (next) handleCloseSettings();
          return next;
        });
        setIsMixerOpen(false);
        setIsEmbedPlayerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    setHasVideoError(false);
  }, [currentScene.id]);

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-slate-950 text-white select-none font-sans">
      {/* Dynamic Immersive Background Scene (Seamless Cinematic Crossfade for Video & Image) */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden pointer-events-none">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {currentScene.type === "VIDEO" && !hasVideoError ? (
              <video
                src={currentScene.bgUrl}
                poster={currentScene.thumbnailUrl}
                autoPlay
                loop
                muted
                playsInline
                onError={() => {
                  console.warn(`[StudySpace] Lỗi nạp video bối cảnh "${currentScene.name}", tự động chuyển sang ảnh thumbnail an toàn.`);
                  setHasVideoError(true);
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${hasVideoError ? currentScene.thumbnailUrl : currentScene.bgUrl}')`,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Navigation Bar */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.header
            key="study-top-nav-bar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none"
          >
            {/* Back Button */}
            <div className="pointer-events-auto">
              <Link
                href="/"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 text-slate-200 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 group cursor-pointer text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-white" />
                <span className="tracking-tight">GPA Calculator</span>
              </Link>
            </div>

            {/* Brand Status Capsule (Bấm vào để bật/tắt Đồng hồ & Ngày tháng) */}
            <button
              onClick={() => {
                if (isPomodoroVisible && centerTab === "clock") {
                  setIsPomodoroVisible(false);
                } else {
                  setIsPomodoroVisible(true);
                  setCenterTab("clock");
                }
              }}
              className={`hidden sm:inline-flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-3 px-4 py-1.5 rounded-full backdrop-blur-2xl border pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 group select-none cursor-pointer active:scale-95 ${
                isPomodoroVisible && centerTab === "clock"
                  ? "bg-slate-900/95 border-white/30 ring-1 ring-white/20 text-white"
                  : "bg-slate-950/70 hover:bg-slate-900/90 border-white/10 hover:border-white/20"
              }`}
              title={isPomodoroVisible && centerTab === "clock" ? "Bấm để ẩn Đồng hồ" : "Bấm để hiển thị Đồng hồ"}
            >
              {/* Clean Brand Typography */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold tracking-wide text-white group-hover:text-white transition-colors">
                  HUFLIT
                </span>
                <span className="font-normal text-slate-300 group-hover:text-slate-100 transition-colors">
                  StudySpace
                </span>
              </div>

              {/* Elegant Hairline Divider */}
              <span className="h-3 w-px bg-white/15" />

              {/* Live Clock */}
              <span className="font-mono text-xs text-slate-300 font-medium tracking-wider tabular-nums group-hover:text-white transition-colors">
                {currentTime || "00:00:00"}
              </span>
            </button>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Keyboard Shortcuts Cheat Sheet Button */}
              <button
                onClick={() => {
                  setIsShortcutsHelpOpen((prev) => {
                    const next = !prev;
                    if (next) handleCloseSettings();
                    return next;
                  });
                  setIsMixerOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 text-slate-200 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 text-xs font-medium cursor-pointer"
                title="Bảng tra cứu phím tắt (?)"
              >
                <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-bold text-slate-300">?</span>
                <span className="hidden md:inline">Phím tắt</span>
              </button>

              {/* Zen Mode Toggle */}
              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 text-slate-200 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 text-xs font-medium cursor-pointer"
                title="Ẩn thanh công cụ để tập trung (Zen Mode: Z)"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Ẩn UI</span>
              </button>

              {/* Global Mute Toggle */}
              <button
                onClick={toggleGlobalMute}
                className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 text-slate-200 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all active:scale-95 cursor-pointer"
                title={isGlobalMuted ? "Bật âm thanh (M)" : "Tắt toàn bộ âm (M)"}
              >
                {isGlobalMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Settings Toggle (Cài đặt không gian học tập) */}
              <button
                onClick={() => {
                  if (isSettingsOpen) {
                    handleCloseSettings();
                  } else {
                    handleOpenSettings();
                  }
                }}
                className={`p-2 rounded-full backdrop-blur-xl border transition-all active:scale-95 cursor-pointer ${
                  isSettingsOpen
                    ? "bg-white text-black font-bold shadow-lg border-white"
                    : "bg-slate-900/70 hover:bg-slate-900/95 border-white/15 text-white/80 hover:text-white"
                }`}
                title="Cài đặt không gian học tập"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
                title={isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Floating Zen Mode Restore Button */}
      {isZenMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsZenMode(false)}
          className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 backdrop-blur-2xl border border-white/20 text-white/90 text-xs font-semibold shadow-2xl transition-all active:scale-95 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hiện lại giao diện</span>
        </motion.button>
      )}

      {/* Floating Left Dock Control Bar (Tasks, Notes, Scenes) */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.div 
            key="study-left-dock-bar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5 p-2 rounded-3xl bg-slate-900/75 backdrop-blur-2xl border border-white/15 shadow-2xl"
          >
            {/* Pomodoro Focus Timer Toggle */}
            <button
              onClick={() => {
                setIsPomodoroVisible((prev) => {
                  const next = !prev;
                  try {
                    localStorage.setItem("huflit_study_pomo_visible", String(next));
                  } catch {}
                  return next;
                });
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isPomodoroVisible ? "bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Đồng hồ Pomodoro (T)"
            >
              <Timer className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Pomodoro (T)
              </span>
            </button>

            {/* Tasks Widget Trigger */}
            <button
              onClick={() => {
                setIsTasksOpen(!isTasksOpen);
                if (!isTasksOpen) handleCloseSettings();
                setIsNotesOpen(false);
                setIsScenesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isTasksOpen ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Kế hoạch học tập (K)"
            >
              <CheckSquare className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Nhiệm vụ (K)
              </span>
            </button>

            {/* Quick Notes Widget Trigger */}
            <button
              onClick={() => {
                setIsNotesOpen(!isNotesOpen);
                if (!isNotesOpen) handleCloseSettings();
                setIsTasksOpen(false);
                setIsScenesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isNotesOpen ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Ghi chép nhanh (N)"
            >
              <FileText className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Ghi chú (N)
              </span>
            </button>

            {/* Scenes Selector Widget Trigger */}
            <button
              onClick={() => {
                setIsScenesOpen(!isScenesOpen);
                if (!isScenesOpen) handleCloseSettings();
                setIsTasksOpen(false);
                setIsNotesOpen(false);
                setIsMixerOpen(false);
                setIsEmbedPlayerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isScenesOpen ? "bg-sky-500/20 text-sky-300 border border-sky-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Thay đổi hình nền & không gian (B)"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Không gian (B)
              </span>
            </button>

            {/* External Stream / Embed Player Trigger */}
            <button
              onClick={() => {
                setIsEmbedPlayerOpen(!isEmbedPlayerOpen);
                if (!isEmbedPlayerOpen) handleCloseSettings();
                setIsTasksOpen(false);
                setIsNotesOpen(false);
                setIsScenesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isEmbedPlayerOpen || isExternalStreamActive
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Đài phát ngoài (YouTube & Spotify) (E)"
            >
              <Radio className="w-5 h-5 text-purple-300" />
              {isExternalStreamActive && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Đài phát (E)
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popout Widgets */}
      <StudyTasksWidget isOpen={isTasksOpen} onClose={() => setIsTasksOpen(false)} />
      <StudyNotesWidget isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
      <SceneSelectorWidget 
        isOpen={isScenesOpen} 
        onClose={() => setIsScenesOpen(false)} 
        currentScene={currentScene}
        onSelectScene={handleSelectScene}
      />
      <StudyEmbedPlayerWidget 
        isOpen={isEmbedPlayerOpen} 
        onClose={() => setIsEmbedPlayerOpen(false)}
        onOpen={() => {
          handleCloseSettings();
          setIsTasksOpen(false);
          setIsNotesOpen(false);
          setIsScenesOpen(false);
          setIsMixerOpen(false);
          setIsEmbedPlayerOpen(true);
        }}
        onStreamActiveChange={setIsExternalStreamActive}
        onActiveItemChange={setExternalActiveItem}
        isZenMode={isZenMode}
      />

      {/* Unified Study Settings Modal */}
      <StudySettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onActiveSectionChange={handleActiveSectionChange}
        showClockSeconds={showClockSeconds}
        onToggleClockSeconds={handleToggleClockSeconds}
        isClock12Hour={isClock12Hour}
        onToggleClock12Hour={handleToggleClock12Hour}
        durations={pomodoroDurations}
        onSaveDurations={handleSavePomodoroDurations}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        soundType={soundType}
        onSelectSoundType={handleSelectSoundType}
        showStopwatchMilliseconds={showStopwatchMilliseconds}
        onToggleStopwatchMilliseconds={handleToggleStopwatchMilliseconds}
      />

      {/* Main Center Area: Ambient Centerpiece Pomodoro & Stopwatch hòa vào background */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none px-4 pb-14">
        <StudyPomodoroWidget 
          isVisible={isPomodoroVisible}
          activeTab={centerTab}
          onTabChange={setCenterTab}
          onToggleVisibility={() => setIsPomodoroVisible(!isPomodoroVisible)}
          showClockSeconds={showClockSeconds}
          isClock12Hour={isClock12Hour}
          showStopwatchMilliseconds={showStopwatchMilliseconds}
          durations={pomodoroDurations}
          soundEnabled={soundEnabled}
          soundType={soundType}
        />
      </main>

      {/* Bottom Floating Music Player (Giữ luôn mounted để nhạc không bao giờ bị dừng khi Ẩn UI) */}
      <motion.div 
        animate={{ 
          opacity: isZenMode ? 0 : 1, 
          y: isZenMode ? 40 : 0,
          pointerEvents: isZenMode ? "none" : "auto" 
        }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-4 left-4 right-4 z-40 flex justify-center"
      >
        <div className="w-full flex justify-center">
          <StudyMusicPlayer 
            isGlobalMuted={isGlobalMuted} 
            isMixerOpen={isMixerOpen}
            isExternalStreamActive={isExternalStreamActive}
            externalStreamItem={externalActiveItem}
            onExpandExternalStream={() => {
              handleCloseSettings();
              setIsTasksOpen(false);
              setIsNotesOpen(false);
              setIsScenesOpen(false);
              setIsMixerOpen(false);
              setIsEmbedPlayerOpen(true);
            }}
            onStopExternalStream={() => {
              setIsExternalStreamActive(false);
              setExternalActiveItem(null);
            }}
            onToggleMixer={() => {
              setIsMixerOpen((prev) => {
                const next = !prev;
                if (next) {
                  handleCloseSettings();
                  setIsTasksOpen(false);
                  setIsNotesOpen(false);
                  setIsScenesOpen(false);
                  setIsEmbedPlayerOpen(false);
                  setIsShortcutsHelpOpen(false);
                }
                return next;
              });
            }}
            onCloseMixer={() => setIsMixerOpen(false)}
          />
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <AnimatePresence>
        {isShortcutsHelpOpen && (
          <motion.div
            key="study-shortcuts-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsShortcutsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 space-y-5 text-white"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Phím Tắt Không Gian Học Tập</h3>
                    <p className="text-xs text-slate-400">Điều khiển toàn bộ âm nhạc và công cụ nhanh chóng bằng bàn phím</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShortcutsHelpOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcuts Groups Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Music Group */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Music2 className="w-3.5 h-3.5" />
                    <span>Điều Khiển Âm Nhạc</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Phát / Tạm dừng</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">Space</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bài tiếp theo</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">→</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bài trước đó</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">←</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Tăng / Giảm âm lượng</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">↑</kbd>
                        <kbd className="px-1.5 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">↓</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bật / Tắt tiếng (Mute)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">M</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Xáo trộn (Shuffle)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">S</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Lặp lại (Loop)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">L</kbd>
                    </div>
                  </div>
                </div>

                {/* Workspace & Tools Group */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <h4 className="font-bold text-sky-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Công Cụ & Không Gian</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bật/Tắt Toàn màn hình</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">F</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Chế độ Zen (Ẩn/Hiện UI)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">Z</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Đồng hồ Pomodoro</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">T</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Kế hoạch học tập</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">K</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Ghi chép nhanh (Notes)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">N</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Đổi không gian hình nền</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">B</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Đài phát (YouTube/Spotify)</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">E</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bảng phím tắt này</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">?</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Đóng mọi cửa sổ</span>
                      <kbd className="px-2 py-1 rounded-lg bg-black/50 border border-white/20 font-mono text-[11px] font-bold text-slate-200">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tip footer */}
              <div className="text-[11px] text-slate-400 text-center pt-1 border-t border-white/10">
                💡 <span className="text-slate-300">Mẹo:</span> Phím tắt sẽ tự động tạm ngưng khi bạn đang nhập nội dung vào ô ghi chú hoặc tạo thẻ.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
