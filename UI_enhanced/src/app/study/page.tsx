"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Scene, STUDY_SCENES } from "@/components/study/study-types";
import { StudyMusicPlayer } from "@/components/study/StudyMusicPlayer";
import { StudyTasksWidget } from "@/components/study/StudyTasksWidget";
import { StudyNotesWidget } from "@/components/study/StudyNotesWidget";
import { SceneSelectorWidget } from "@/components/study/SceneSelectorWidget";
import { StudyPomodoroWidget, TimerTab } from "@/components/study/StudyPomodoroWidget";
import { StudySettingsModal } from "@/components/study/StudySettingsModal";

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
    } catch {}
  }, []);

  const handleOpenSettings = () => {
    setSavedTabBeforeSettings(centerTab);
    setIsSettingsOpen(true);
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
        setIsZenMode((prev) => !prev);
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
        setIsTasksOpen((prev) => !prev);
        setIsNotesOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setIsNotesOpen((prev) => !prev);
        setIsTasksOpen(false);
        setIsScenesOpen(false);
        setIsMixerOpen(false);
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsScenesOpen((prev) => !prev);
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsMixerOpen(false);
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setIsMixerOpen((prev) => !prev);
        setIsTasksOpen(false);
        setIsNotesOpen(false);
        setIsScenesOpen(false);
      } else if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
        setIsMixerOpen(false);
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
      {/* Dynamic Immersive Background Scene (Hỗ trợ cả Video 4K và Image sắc nét, có Fallback an toàn) */}
      {currentScene.type === "VIDEO" && !hasVideoError ? (
        <video
          key={currentScene.id}
          src={currentScene.bgUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => {
            console.warn(`[StudySpace] Lỗi nạp video bối cảnh "${currentScene.name}", tự động chuyển sang ảnh thumbnail an toàn.`);
            setHasVideoError(true);
          }}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        />
      ) : (
        <motion.div 
          key={currentScene.id}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url('${hasVideoError ? currentScene.thumbnailUrl : currentScene.bgUrl}')`,
          }}
        />
      )}

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
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white/90 hover:text-white shadow-xl transition-all active:scale-95 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-blue-400" />
                <span className="text-xs font-semibold tracking-tight">GPA Calculator</span>
              </Link>
            </div>

            {/* Brand Status Dynamic Island Capsule (Bấm vào để kích hoạt Đồng hồ & Ngày tháng ở giữa màn hình) */}
            <button
              onClick={() => {
                setIsPomodoroVisible(true);
                setCenterTab("clock");
              }}
              className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 pointer-events-auto shadow-lg hover:shadow-xl transition-all group select-none cursor-pointer active:scale-95"
              title="Bấm để hiển thị Đồng hồ & Ngày tháng ở giữa màn hình"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                  HUFLIT
                </span>
                <span className="text-xs font-medium text-sky-400">
                  StudySpace
                </span>
              </div>

              <span className="text-xs text-white/20 font-bold">•</span>

              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider group-hover:text-emerald-300 transition-colors">
                {currentTime || "00:00:00"}
              </span>
            </button>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Keyboard Shortcuts Cheat Sheet Button */}
              <button
                onClick={() => setIsShortcutsHelpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 text-xs font-medium cursor-pointer"
                title="Bảng tra cứu phím tắt (?)"
              >
                <span className="font-mono text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-bold">?</span>
                <span className="hidden md:inline">Phím tắt</span>
              </button>

              {/* Zen Mode Toggle */}
              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 text-xs font-medium cursor-pointer"
                title="Ẩn thanh công cụ để tập trung (Zen Mode: Z)"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Ẩn UI</span>
              </button>

              {/* Global Mute Toggle */}
              <button
                onClick={toggleGlobalMute}
                className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl border border-white/15 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
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
              title={isPomodoroVisible ? "Ẩn đồng hồ Pomodoro" : "Hiện đồng hồ Pomodoro"}
            >
              <Timer className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                {isPomodoroVisible ? "Ẩn Pomodoro" : "Hiện Pomodoro"}
              </span>
            </button>

            {/* Tasks Widget Trigger */}
            <button
              onClick={() => {
                setIsTasksOpen(!isTasksOpen);
                setIsNotesOpen(false);
                setIsScenesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isTasksOpen ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Kế hoạch học tập (To-do List)"
            >
              <CheckSquare className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Nhiệm vụ
              </span>
            </button>

            {/* Quick Notes Widget Trigger */}
            <button
              onClick={() => {
                setIsNotesOpen(!isNotesOpen);
                setIsTasksOpen(false);
                setIsScenesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isNotesOpen ? "bg-amber-500/20 text-amber-300 border border-amber-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Ghi chép nhanh (Scratchpad)"
            >
              <FileText className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Ghi chú
              </span>
            </button>

            {/* Scenes Selector Widget Trigger */}
            <button
              onClick={() => {
                setIsScenesOpen(!isScenesOpen);
                setIsTasksOpen(false);
                setIsNotesOpen(false);
                setIsMixerOpen(false);
              }}
              className={`p-2.5 rounded-2xl transition-all group relative cursor-pointer ${
                isScenesOpen ? "bg-sky-500/20 text-sky-300 border border-sky-400/40" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Thay đổi hình nền & không gian"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-slate-900/90 text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                Không gian
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
            onToggleMixer={() => setIsMixerOpen(!isMixerOpen)}
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
