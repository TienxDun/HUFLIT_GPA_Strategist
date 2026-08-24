"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Clock, 
  Timer, 
  Flame, 
  Volume2, 
  VolumeX, 
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StudySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  // Live preview mode switcher
  onActiveSectionChange?: (section: "clock" | "pomodoro" | "stopwatch") => void;
  // Clock settings
  showClockSeconds: boolean;
  onToggleClockSeconds: () => void;
  isClock12Hour: boolean;
  onToggleClock12Hour: () => void;
  // Pomodoro settings
  durations: { focus: number; short_break: number; long_break: number };
  onSaveDurations: (durations: { focus: number; short_break: number; long_break: number }) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  // Stopwatch settings
  showStopwatchMilliseconds: boolean;
  onToggleStopwatchMilliseconds: () => void;
}

// Reusable Modern Animated iOS-Style Toggle Switch
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  activeColor?: string;
}

const ToggleSwitch = ({ checked, onChange, activeColor = "bg-emerald-500" }: ToggleSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-250 ease-in-out focus:outline-none active:scale-95 ${
        checked ? `${activeColor} shadow-[0_0_12px_rgba(255,255,255,0.25)]` : "bg-white/10 hover:bg-white/15 border border-white/10"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export const StudySettingsModal = ({
  isOpen,
  onClose,
  onActiveSectionChange,
  showClockSeconds,
  onToggleClockSeconds,
  isClock12Hour,
  onToggleClock12Hour,
  durations,
  onSaveDurations,
  soundEnabled,
  onToggleSound,
  showStopwatchMilliseconds,
  onToggleStopwatchMilliseconds,
}: StudySettingsProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "clock" | "pomodoro" | "stopwatch">("all");

  // Global keydown listener for Escape key to close settings instantly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectTab = (tab: "all" | "clock" | "pomodoro" | "stopwatch") => {
    setActiveTab(tab);
    if (tab !== "all" && onActiveSectionChange) {
      onActiveSectionChange(tab);
    }
  };

  const handleClockSecondsToggle = () => {
    if (onActiveSectionChange) onActiveSectionChange("clock");
    onToggleClockSeconds();
  };

  const handleClock12HourToggle = () => {
    if (onActiveSectionChange) onActiveSectionChange("clock");
    onToggleClock12Hour();
  };

  const handlePomodoroDurationsChange = (d: typeof durations) => {
    if (onActiveSectionChange) onActiveSectionChange("pomodoro");
    onSaveDurations(d);
  };

  const handleSoundToggle = () => {
    if (onActiveSectionChange) onActiveSectionChange("pomodoro");
    onToggleSound();
  };

  const handleStopwatchMillisecondsToggle = () => {
    if (onActiveSectionChange) onActiveSectionChange("stopwatch");
    onToggleStopwatchMilliseconds();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="settings-modal-fragment">
          {/* Transparent Backdrop (Không làm mờ nền để người dùng thấy rõ 100% thay đổi trực quan trên màn hình) */}
          <div
            key="settings-backdrop"
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={onClose}
          />

          {/* Settings Floating Panel (Neo từ góc trên bên phải) */}
          <motion.div
            key="settings-panel"
            initial={{ opacity: 0, scale: 0.94, y: -10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10, x: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 right-4 sm:right-6 z-50 w-full max-w-[340px] sm:max-w-[380px] rounded-3xl bg-[#14161b]/98 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] p-5 space-y-4 text-white select-none max-h-[calc(100vh-80px)] overflow-y-auto custom-study-scroll"
          >
            {/* Header (Đã xóa icon thừa, tinh gọn & thanh lịch) */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide">Cài đặt không gian</h3>
                <p className="text-[10px] text-slate-400 font-medium">Tùy biến hiển thị & thời lượng</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleSelectTab("all")}
                className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === "all" ? "bg-white text-black shadow font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("clock")}
                className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === "clock" ? "bg-white text-black shadow font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Đồng hồ
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("pomodoro")}
                className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === "pomodoro" ? "bg-white text-black shadow font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Pomodoro
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab("stopwatch")}
                className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                  activeTab === "stopwatch" ? "bg-white text-black shadow font-extrabold" : "text-slate-400 hover:text-white"
                }`}
              >
                Bấm giờ
              </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4">
              {/* SECTION 1: ĐỒNG HỒ */}
              {(activeTab === "all" || activeTab === "clock") && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đồng hồ</span>
                  </div>

                  {/* Hiển thị giây */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 text-xs">Hiển thị giây (:ss)</div>
                      <div className="text-[10px] text-slate-400 font-mono">23:52:48 ⟷ 23:52</div>
                    </div>
                    <ToggleSwitch
                      checked={showClockSeconds}
                      onChange={handleClockSecondsToggle}
                      activeColor="bg-emerald-500"
                    />
                  </div>

                  {/* Định dạng 12h/24h */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 text-xs">Định dạng thời gian</div>
                      <div className="text-[10px] text-slate-400">24 Giờ hoặc 12 Giờ (AM/PM)</div>
                    </div>
                    <div className="flex items-center p-0.5 rounded-xl bg-white/10 border border-white/10">
                      <button
                        type="button"
                        onClick={() => isClock12Hour && handleClock12HourToggle()}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !isClock12Hour ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        24h
                      </button>
                      <button
                        type="button"
                        onClick={() => !isClock12Hour && handleClock12HourToggle()}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isClock12Hour ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        12h
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: POMODORO */}
              {(activeTab === "all" || activeTab === "pomodoro") && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pomodoro</span>
                  </div>

                  {/* Thời lượng */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Tập trung</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={durations.focus}
                        onChange={(e) =>
                          handlePomodoroDurationsChange({
                            ...durations,
                            focus: Math.max(1, parseInt(e.target.value, 10) || 25),
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-center font-bold font-mono focus:border-emerald-400 focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nghỉ ngắn</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={durations.short_break}
                        onChange={(e) =>
                          handlePomodoroDurationsChange({
                            ...durations,
                            short_break: Math.max(1, parseInt(e.target.value, 10) || 5),
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-center font-bold font-mono focus:border-emerald-400 focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nghỉ dài</label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={durations.long_break}
                        onChange={(e) =>
                          handlePomodoroDurationsChange({
                            ...durations,
                            long_break: Math.max(1, parseInt(e.target.value, 10) || 15),
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-center font-bold font-mono focus:border-emerald-400 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Âm thanh chuông */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mt-2">
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">Chuông báo kết thúc</span>
                    </div>
                    <ToggleSwitch
                      checked={soundEnabled}
                      onChange={handleSoundToggle}
                      activeColor="bg-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: STOPWATCH */}
              {(activeTab === "all" || activeTab === "stopwatch") && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bấm giờ (Stopwatch)</span>
                  </div>

                  {/* Hiển thị tích tắc .00 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200 text-xs">Phần trăm giây (.00)</div>
                      <div className="text-[10px] text-slate-400 font-mono">00:00.00 ⟷ 00:00</div>
                    </div>
                    <ToggleSwitch
                      checked={showStopwatchMilliseconds}
                      onChange={handleStopwatchMillisecondsToggle}
                      activeColor="bg-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
