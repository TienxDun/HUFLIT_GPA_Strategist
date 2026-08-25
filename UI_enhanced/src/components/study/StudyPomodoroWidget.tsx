"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Flame, 
  Coffee, 
  Sparkles,
  Flag,
  X,
  Eye,
  EyeOff,
  Clock,
  Trash2,
  Calendar,
  SunMedium
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PomodoroSoundType, playPomodoroSound } from "./study-sound";

export type TimerTab = "clock" | "pomodoro" | "stopwatch";
export type PomodoroMode = "focus" | "short_break" | "long_break";

const CLOCK_SECONDS_KEY = "study_clock_show_seconds";
const CLOCK_12HOUR_KEY = "study_clock_12hour";
const STOPWATCH_MS_KEY = "study_stopwatch_show_ms";
const POMO_DURATIONS_KEY = "study_pomodoro_durations";
const SOUND_KEY = "study_sound_enabled";

interface StudyPomodoroWidgetProps {
  isVisible: boolean;
  activeTab?: TimerTab;
  onTabChange?: (tab: TimerTab) => void;
  onToggleVisibility?: () => void;
  onSessionComplete?: (mode: PomodoroMode) => void;
  // External Settings
  showClockSeconds?: boolean;
  isClock12Hour?: boolean;
  durations?: { focus: number; short_break: number; long_break: number };
  soundEnabled?: boolean;
  soundType?: PomodoroSoundType;
  showStopwatchMilliseconds?: boolean;
}

export const StudyPomodoroWidget = ({
  isVisible,
  activeTab: externalTab,
  onTabChange,
  onToggleVisibility,
  onSessionComplete,
  showClockSeconds: externalShowSeconds,
  isClock12Hour: external12Hour,
  durations: externalDurations,
  soundEnabled: externalSound,
  soundType: externalSoundType,
  showStopwatchMilliseconds: externalShowMs,
}: StudyPomodoroWidgetProps) => {
  const [internalTab, setInternalTab] = useState<TimerTab>("clock");
  const currentTab = externalTab !== undefined ? externalTab : internalTab;
  const switchTab = (tab: TimerTab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const [pomoMode, setPomoMode] = useState<PomodoroMode>("focus");

  // Real-time Clock State for "clock" tab
  const [clockDigits, setClockDigits] = useState("");
  const [clockPeriod, setClockPeriod] = useState("");
  const [clockFullDate, setClockFullDate] = useState("");
  const [internalShowClockSeconds, setInternalShowClockSeconds] = useState(false);
  const [internalIsClock12Hour, setInternalIsClock12Hour] = useState(false);

  const showClockSeconds = externalShowSeconds !== undefined ? externalShowSeconds : internalShowClockSeconds;
  const isClock12Hour = external12Hour !== undefined ? external12Hour : internalIsClock12Hour;

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0); // in milliseconds
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [internalShowStopwatchMilliseconds, setInternalShowStopwatchMilliseconds] = useState(false);
  const showStopwatchMilliseconds = externalShowMs !== undefined ? externalShowMs : internalShowStopwatchMilliseconds;
  const [laps, setLaps] = useState<number[]>([]);
  const [isLapsOpen, setIsLapsOpen] = useState(false);

  // Custom durations in minutes
  const [internalDurations, setInternalDurations] = useState({
    focus: 25,
    short_break: 5,
    long_break: 15,
  });
  const durations = externalDurations !== undefined ? externalDurations : internalDurations;

  // Pomodoro countdown timer state (in seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [internalSoundEnabled, setInternalSoundEnabled] = useState(true);
  const soundEnabled = externalSound !== undefined ? externalSound : internalSoundEnabled;

  // Load saved preferences on mount if not provided externally
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem("huflit_study_pomo_count");
      if (savedCount) setCompletedSessions(parseInt(savedCount, 10) || 0);

      const savedDurations = localStorage.getItem(POMO_DURATIONS_KEY);
      if (savedDurations) setInternalDurations(JSON.parse(savedDurations));

      const savedSound = localStorage.getItem(SOUND_KEY);
      if (savedSound !== null) setInternalSoundEnabled(savedSound === "true");

      const savedSec = localStorage.getItem(CLOCK_SECONDS_KEY);
      if (savedSec !== null) setInternalShowClockSeconds(savedSec === "true");

      const saved12h = localStorage.getItem(CLOCK_12HOUR_KEY);
      if (saved12h !== null) setInternalIsClock12Hour(saved12h === "true");

      const savedMs = localStorage.getItem(STOPWATCH_MS_KEY);
      if (savedMs !== null) setInternalShowStopwatchMilliseconds(savedMs === "true");
    } catch {}
  }, []);

  // Update timeLeft when durations prop changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(durations[pomoMode] * 60);
    }
  }, [durations, pomoMode, isRunning]);

  useEffect(() => {
    const updateRealtime = () => {
      const now = new Date();
      const hours24 = now.getHours();
      let hours = hours24;
      let period = "";

      if (isClock12Hour) {
        period = hours24 >= 12 ? "PM" : "AM";
        hours = hours24 % 12;
        if (hours === 0) hours = 12;
      }

      const hStr = String(hours).padStart(2, "0");
      const mStr = String(now.getMinutes()).padStart(2, "0");
      const sStr = String(now.getSeconds()).padStart(2, "0");

      setClockDigits(showClockSeconds ? `${hStr} : ${mStr} : ${sStr}` : `${hStr} : ${mStr}`);
      setClockPeriod(period);
      
      const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const dayName = weekdays[now.getDay()];
      const dateNum = String(now.getDate()).padStart(2, "0");
      const monthNum = String(now.getMonth() + 1).padStart(2, "0");
      const yearNum = now.getFullYear();
      setClockFullDate(`${dayName}, ${dateNum} tháng ${monthNum}, ${yearNum}`);
    };

    updateRealtime();
    const interval = setInterval(updateRealtime, showClockSeconds ? 1000 : 10000);
    return () => clearInterval(interval);
  }, [showClockSeconds, isClock12Hour]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "🌅 Chúc bạn một buổi sáng học tập tràn đầy năng lượng";
    if (hour >= 12 && hour < 18) return "☀️ Giữ vững tập trung để hoàn thành tốt mục tiêu";
    if (hour >= 18 && hour < 22) return "🌆 Buổi tối yên tĩnh, tập trung học tập hiệu quả";
    return "🌙 Không gian đêm thanh tịnh, hãy giữ gìn sức khỏe bạn nhé";
  };

  const soundType = externalSoundType || "classic_clock";

  // Sound chime synthesizer using Web Audio API
  const playChime = useCallback(() => {
    playPomodoroSound(soundType, soundEnabled);
  }, [soundType, soundEnabled]);

  // Switch Pomodoro Mode
  const switchPomoMode = (mode: PomodoroMode) => {
    setPomoMode(mode);
    setTimeLeft(durations[mode] * 60);
    setIsRunning(false);
  };

  // Handle Pomodoro session completion / skip
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    playChime();

    if (pomoMode === "focus") {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      try {
        localStorage.setItem("huflit_study_pomo_count", String(nextCount));
      } catch {}
      if (onSessionComplete) onSessionComplete("focus");

      if (nextCount % 4 === 0) {
        switchPomoMode("long_break");
      } else {
        switchPomoMode("short_break");
      }
    } else {
      if (onSessionComplete) onSessionComplete(pomoMode);
      switchPomoMode("focus");
    }
  }, [pomoMode, completedSessions, onSessionComplete, playChime]);

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleComplete]);

  // Stopwatch tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      interval = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 30); // ~33fps for smooth centiseconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStopwatchRunning]);

  const resetPomodoro = () => {
    setIsRunning(false);
    setTimeLeft(durations[pomoMode] * 60);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const addLap = () => {
    if (isStopwatchRunning) {
      setLaps((prev) => [stopwatchTime, ...prev]);
      setIsLapsOpen(true);
    }
  };

  // Format mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")} : ${secs.toString().padStart(2, "0")}`;
  };

  // Format Stopwatch mm:ss.ms or hh:mm:ss
  const formatStopwatch = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");
    const cs = centiseconds.toString().padStart(2, "0");

    if (hours > 0) {
      return showStopwatchMilliseconds ? `${hours}:${m}:${s}.${cs}` : `${hours}:${m}:${s}`;
    }
    return showStopwatchMilliseconds ? `${m} : ${s}.${cs}` : `${m} : ${s}`;
  };

  if (!isVisible) return null;

  return (
    <div className="group relative flex flex-col items-center justify-start text-white select-none pointer-events-auto w-full max-w-xl h-[300px] sm:h-[320px]">
      {/* 1. Sleek Floating Mode Pill Bar (Tự động ẩn khi không hover, hiện mượt khi hover) */}
      <div 
        className="flex items-center gap-2.5 mb-2 z-20 transition-all duration-300 opacity-0 -translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto"
      >
        <div className="flex items-center p-1 rounded-full bg-black/80 backdrop-blur-2xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {/* Clock Tab */}
          <button
            onClick={() => switchTab("clock")}
            className={`w-24 sm:w-28 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
              currentTab === "clock"
                ? "bg-white text-black shadow-md font-extrabold"
                : "text-white/70 hover:text-white font-bold"
            }`}
          >
            Đồng hồ
          </button>

          {/* Pomodoro Tab */}
          <button
            onClick={() => switchTab("pomodoro")}
            className={`w-24 sm:w-28 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
              currentTab === "pomodoro"
                ? "bg-white text-black shadow-md font-extrabold"
                : "text-white/70 hover:text-white font-bold"
            }`}
          >
            Pomodoro
          </button>

          {/* Stopwatch Tab */}
          <button
            onClick={() => switchTab("stopwatch")}
            className={`w-24 sm:w-28 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
              currentTab === "stopwatch"
                ? "bg-white text-black shadow-md font-extrabold"
                : "text-white/70 hover:text-white font-bold"
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* 3. Giant Clean Digits (Chữ số 4K khổng lồ, cố định chiều cao h-32 để không giật nhảy layout) */}
      <div className="h-28 sm:h-32 md:h-36 flex items-center justify-center my-1">
        {currentTab === "clock" ? (
          <motion.div
            key={`${clockDigits}-${clockPeriod}`}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            className="flex items-baseline justify-center whitespace-nowrap text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.85)] select-none tabular-nums text-center leading-none"
          >
            <span>{clockDigits || "00 : 00"}</span>
            {clockPeriod ? (
              <span className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-white/60 ml-2.5 sm:ml-3.5 self-center sm:self-end pb-1 sm:pb-2">
                {clockPeriod}
              </span>
            ) : null}
          </motion.div>
        ) : currentTab === "pomodoro" ? (
          <motion.div
            key={timeLeft}
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 1 }}
            className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.85)] select-none tabular-nums text-center leading-none"
          >
            {formatTime(timeLeft)}
          </motion.div>
        ) : (
          <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_15px_40px_rgba(0,0,0,0.85)] select-none tabular-nums text-center leading-none">
            {formatStopwatch(stopwatchTime)}
          </div>
        )}
      </div>

      {/* 4. Subtitle Area: Submodes / Date (Cố định chiều cao h-8 để khoảng cách luôn hoàn hảo) */}
      <div className="h-8 flex items-center justify-center mb-2">
        {currentTab === "pomodoro" ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/90 drop-shadow-md">
            <button
              onClick={() => switchPomoMode("focus")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                pomoMode === "focus"
                  ? "bg-white text-black font-extrabold shadow-sm scale-100"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Tập trung
            </button>
            <button
              onClick={() => switchPomoMode("short_break")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                pomoMode === "short_break"
                  ? "bg-white text-black font-extrabold shadow-sm scale-100"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Nghỉ ngắn
            </button>
            <button
              onClick={() => switchPomoMode("long_break")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                pomoMode === "long_break"
                  ? "bg-white text-black font-extrabold shadow-sm scale-100"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Nghỉ dài
            </button>
          </div>
        ) : currentTab === "clock" ? (
          <div className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {clockFullDate}
          </div>
        ) : laps.length > 0 ? (
          <button
            onClick={() => setIsLapsOpen(!isLapsOpen)}
            className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isLapsOpen ? "bg-white text-black font-extrabold shadow-sm" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {laps.length} vòng đã ghi
          </button>
        ) : null}
      </div>

      {/* 5. Minimalist Floating Controls (Chỉ hiển thị nút ở chế độ có điều khiển) */}
      {currentTab !== "clock" && (
        <div className="h-16 flex items-center justify-center gap-4 sm:gap-5 mt-2">
          {currentTab === "pomodoro" ? (
            <>
              {/* Reset Circular Button */}
              <button
                onClick={resetPomodoro}
                className="w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-2xl border border-white/15 flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer"
                title="Đặt lại từ đầu"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Big White Circular Play / Pause Button */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_12px_35px_rgba(0,0,0,0.6)] cursor-pointer"
                title={isRunning ? "Tạm dừng" : "Bắt đầu tập trung"}
              >
                {isRunning ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Skip Circular Button */}
              <button
                onClick={handleComplete}
                className="w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-2xl border border-white/15 flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer"
                title="Bỏ qua / Hoàn thành phiên"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </>
          ) : currentTab === "stopwatch" ? (
            <>
              {/* Reset Stopwatch */}
              <button
                onClick={resetStopwatch}
                className="w-12 h-12 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white backdrop-blur-2xl border border-white/15 flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer"
                title="Đặt lại từ đầu"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Big White Play / Pause Stopwatch */}
              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className="w-16 h-16 rounded-full bg-white text-black hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_12px_35px_rgba(0,0,0,0.6)] cursor-pointer"
                title={isStopwatchRunning ? "Tạm dừng" : "Bắt đầu bấm giờ"}
              >
                {isStopwatchRunning ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Flag / Lap Button */}
              <button
                onClick={addLap}
                disabled={!isStopwatchRunning}
                className={`w-12 h-12 rounded-full backdrop-blur-2xl border flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer ${
                  isStopwatchRunning
                    ? "bg-black/80 hover:bg-black border-white/15 text-white"
                    : "bg-black/40 border-white/5 text-white/30 cursor-not-allowed"
                }`}
                title="Ghi vòng (Lap)"
              >
                <Flag className="w-5 h-5" />
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* 6. Minimalist Pagination Dots (Chỉ hiển thị cho 4 hiệp của Pomodoro) */}
      {currentTab === "pomodoro" && (
        <div className="h-6 flex items-center justify-center gap-1.5 mt-3 opacity-60">
          {[0, 1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`rounded-full transition-all duration-300 ${
                dot === (completedSessions % 4)
                  ? "bg-white w-3.5 h-1.5 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  : "bg-white/40 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* 7. Modern Glassmorphic Lap Times Drawer for Stopwatch (Nổi tuyệt đối, không chiếm height trong DOM flow) */}
      <AnimatePresence>
        {currentTab === "stopwatch" && laps.length > 0 && isLapsOpen && (
          <React.Fragment key="stopwatch-laps-drawer-fragment">
            {/* Backdrop to close Laps Drawer when clicking outside */}
            <div
              key="stopwatch-laps-backdrop"
              className="fixed inset-0 z-30 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsLapsOpen(false);
              }}
            />
            <motion.div
              key="stopwatch-laps-panel"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-80 sm:w-88 rounded-3xl bg-slate-900/90 hover:bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-3.5 z-40 space-y-2.5"
            >
            {/* Header */}
            <div className="flex items-center justify-between px-1 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <Flag className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 leading-none">Vòng bấm giờ</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{laps.length} mốc thời gian</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLaps([])}
                  className="px-2 py-1 rounded-xl text-[10px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Xoá tất cả vòng"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
                <button
                  onClick={() => setIsLapsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Thu gọn"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Laps List with modern custom sleek scrollbar */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1.5 custom-study-scroll">
              {laps.map((lap, idx) => {
                const lapNumber = laps.length - idx;
                const isLatest = idx === 0;
                return (
                  <div
                    key={`lap-${lapNumber}-${idx}`}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-2xl transition-all ${
                      isLatest
                        ? "bg-sky-500/20 border border-sky-400/30 text-white shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-lg ${
                        isLatest ? "bg-sky-400/30 text-sky-200" : "bg-white/10 text-slate-400"
                      }`}>
                        #{lapNumber}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] text-sky-300 font-semibold">Gần nhất</span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold tracking-wider text-sky-200">
                      {formatStopwatch(lap)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
    </div>
  );
};
