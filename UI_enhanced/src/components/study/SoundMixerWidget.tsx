"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Headphones, 
  Coffee, 
  Moon, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Sliders,
  CloudRain,
  Trees,
  Flame,
  Waves,
  Wind,
  Keyboard,
  Fan,
  TrainTrack,
  Plane,
  Car,
  Droplets,
  Bird,
  Zap,
  Orbit,
  Music2,
  Sparkles
} from "lucide-react";
import { 
  MoodType, 
  Track, 
  AmbientSound, 
  STUDY_TRACKS_BY_MOOD, 
  AMBIENT_SOUNDS 
} from "./study-types";
import { motion, AnimatePresence } from "framer-motion";

interface SoundMixerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSelectTrack: (track: Track) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  isGlobalMuted: boolean;
}

// Icon helper for ambient sounds
const renderSoundIcon = (iconName: string, active: boolean) => {
  const props = { className: `w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400"}` };
  switch (iconName) {
    case "CloudRain": return <CloudRain {...props} />;
    case "Zap": return <Zap {...props} />;
    case "Trees": return <Trees {...props} />;
    case "Bird": return <Bird {...props} />;
    case "Flame": return <Flame {...props} />;
    case "Waves": return <Waves {...props} />;
    case "Wind": return <Wind {...props} />;
    case "Keyboard": return <Keyboard {...props} />;
    case "Coffee": return <Coffee {...props} />;
    case "Fan": return <Fan {...props} />;
    case "TrainTrack": return <TrainTrack {...props} />;
    case "Plane": return <Plane {...props} />;
    case "Car": return <Car {...props} />;
    case "Droplets": return <Droplets {...props} />;
    case "Orbit": return <Orbit {...props} />;
    default: return <Volume2 {...props} />;
  }
};

export const SoundMixerWidget = ({
  isOpen,
  onClose,
  currentMood,
  onSelectMood,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isShuffle,
  onToggleShuffle,
  isLooping,
  onToggleLoop,
  isGlobalMuted,
}: SoundMixerWidgetProps) => {
  const [activeTab, setActiveTab] = useState<"music" | "ambience">("music");
  
  // Ambient Sound volumes state: { soundId: volumeNumber (0 = off, >0 = on) }
  const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({});
  const soundAudiosRef = useRef<Record<string, HTMLAudioElement>>({});

  // Phục hồi cài đặt phối âm môi trường từ LocalStorage
  useEffect(() => {
    try {
      const savedVolsStr = localStorage.getItem("huflit_study_ambient_vols");
      if (savedVolsStr) {
        const parsed = JSON.parse(savedVolsStr);
        if (parsed && typeof parsed === "object") {
          setAmbientVolumes(parsed);
        }
      }
    } catch {}
  }, []);

  const updateAmbientVolumes = (updater: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    setAmbientVolumes((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem("huflit_study_ambient_vols", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Setup ambient sound audio objects
  useEffect(() => {
    AMBIENT_SOUNDS.forEach((sound) => {
      if (!soundAudiosRef.current[sound.id]) {
        const audio = new Audio(sound.src);
        audio.loop = true;
        audio.preload = "none";
        soundAudiosRef.current[sound.id] = audio;
      }
    });

    return () => {
      // Cleanup on unmount
      Object.values(soundAudiosRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      soundAudiosRef.current = {};
    };
  }, []);

  // Update volume and play/pause for each ambient track
  useEffect(() => {
    AMBIENT_SOUNDS.forEach((sound) => {
      const audio = soundAudiosRef.current[sound.id];
      if (audio) {
        const soundVol = ambientVolumes[sound.id] || 0;
        const effectiveVol = isGlobalMuted ? 0 : soundVol;
        audio.volume = effectiveVol;

        if (effectiveVol > 0 && audio.paused) {
          audio.play().catch(() => {});
        } else if (effectiveVol === 0 && !audio.paused) {
          audio.pause();
        }
      }
    });
  }, [ambientVolumes, isGlobalMuted]);

  const toggleSound = (soundId: string) => {
    updateAmbientVolumes((prev) => {
      const current = prev[soundId] || 0;
      return {
        ...prev,
        [soundId]: current > 0 ? 0 : 0.6,
      };
    });
  };

  const handleSoundVolume = (soundId: string, val: number) => {
    updateAmbientVolumes((prev) => ({
      ...prev,
      [soundId]: val,
    }));
  };

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || isNaN(sec) || sec <= 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const popupRef = useRef<HTMLDivElement | null>(null);

  // Tự động đóng popup Sound Mixer khi bấm vào bất kỳ vị trí nào bên ngoài popup
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Lắng nghe sau 50ms để không bị kích hoạt bởi chính sự kiện click mở popup
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  const currentMoodTracks = STUDY_TRACKS_BY_MOOD[currentMood] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="sound-mixer-fragment">
          {/* Fullscreen transparent backdrop capturing clicks anywhere outside the mixer */}
          <motion.div
            key="sound-mixer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10 cursor-default"
            onClick={onClose}
          />

          <motion.div
            key="sound-mixer-panel"
            ref={popupRef}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-16 bottom-3 sm:bottom-4 right-4 sm:right-6 z-50 w-[390px] sm:w-[420px] max-w-[calc(100vw-24px)] flex flex-col rounded-3xl bg-[#0b0f17]/95 backdrop-blur-3xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-white overflow-hidden"
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold tracking-tight">Sound Mixer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs: Nhạc nền (Music) vs Âm thanh môi trường (Ambience) */}
        <div className="flex items-center gap-1.5 p-1 mx-4 mt-3 bg-black/40 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("music")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "music"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            Nhạc Chill ({currentMoodTracks.length})
          </button>
          <button
            onClick={() => setActiveTab("ambience")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "ambience"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            Âm thanh nền ({AMBIENT_SOUNDS.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-study-scroll">
          {activeTab === "music" ? (
            <>
              {/* MOODS SECTION */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Moods
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "lofi", label: "Lo-fi", icon: Headphones, color: "text-indigo-400" },
                    { key: "jazz", label: "Jazz", icon: Coffee, color: "text-emerald-400" },
                    { key: "relax", label: "Relax", icon: Moon, color: "text-amber-400" },
                  ].map((mood, idx) => {
                    const isSelected = currentMood === mood.key;
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.key || `mood-${idx}`}
                        onClick={() => onSelectMood(mood.key as MoodType)}
                        className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600/90 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 font-bold"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 font-medium"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-white" : mood.color}`} />
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CURRENT PLAYING CARD (Modern Premium Glassmorphism) */}
              <div className="relative p-4 rounded-3xl bg-gradient-to-b from-slate-800/70 via-slate-900/85 to-[#0b0f19]/95 border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden">
                {/* Ambient dynamic glow blobs */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Track Header & Artwork */}
                <div className="relative z-10 flex items-center gap-3.5 mb-3.5">
                  {/* Artwork with glow ring & active wave animation */}
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl shrink-0 bg-slate-800 border border-white/20 group">
                    <img
                      src={currentTrack.cover}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isPlaying ? "scale-105" : "scale-100"
                      }`}
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1">
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                        <span className="w-1 h-6 bg-emerald-300 rounded-full animate-[bounce_1s_infinite_300ms]" />
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                      </div>
                    )}
                  </div>

                  {/* Title, Artist, & Mood Badge */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white tracking-tight truncate leading-snug">
                        {currentTrack.title}
                      </h4>
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30 shadow-sm leading-none">
                        <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        <span className="translate-y-[0.5px]">{currentTrack.genre}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate font-medium">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>

                {/* Modern Progress Bar with Time Display */}
                <div className="relative z-10 space-y-1.5 my-3">
                  <div className="relative group flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration > 0 ? duration : 100}
                      value={currentTime}
                      onChange={(e) => onSeek(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/15 hover:bg-white/25 rounded-full appearance-none cursor-pointer accent-emerald-400 transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono font-medium text-slate-400 px-0.5">
                    <span className="text-emerald-400 font-semibold">{formatTime(currentTime)}</span>
                    <span>{duration > 0 ? formatTime(duration) : "0:00"}</span>
                  </div>
                </div>

                {/* Primary Modern Controls */}
                <div className="relative z-10 flex items-center justify-between pt-1">
                  {/* Shuffle Button */}
                  <button
                    onClick={onToggleShuffle}
                    className={`p-2 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
                      isShuffle
                        ? "text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Xáo trộn bài hát"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  {/* Prev Button */}
                  <button
                    onClick={onPrevTrack}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 active:scale-90 transition-all shadow-sm cursor-pointer"
                    title="Bài trước"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  {/* Glowing Play/Pause Center Button */}
                  <button
                    onClick={onTogglePlay}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-200 text-slate-950 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_24px_rgba(52,211,153,0.45)] hover:shadow-[0_0_32px_rgba(52,211,153,0.7)] flex items-center justify-center group cursor-pointer"
                    title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-slate-950" />
                    ) : (
                      <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={onNextTrack}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 active:scale-90 transition-all shadow-sm cursor-pointer"
                    title="Bài tiếp theo"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>

                  {/* Loop Button */}
                  <button
                    onClick={onToggleLoop}
                    className={`p-2 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
                      isLooping
                        ? "text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Lặp lại bài hát"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* UP NEXT PLAYLIST (Fills full height) */}
              <div className="space-y-2 pb-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Up Next ({currentMoodTracks.length} bài)
                </h4>
                <div className="space-y-1.5">
                  {currentMoodTracks.map((t, idx) => {
                    const isSelected = t.id === currentTrack.id;
                    return (
                      <button
                        key={t.id || `track-${idx}`}
                        onClick={() => onSelectTrack(t)}
                        className={`flex items-center gap-3 p-2 rounded-2xl w-full text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600/20 border border-emerald-400/40 text-emerald-300"
                            : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                          <img src={t.cover} alt={t.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate leading-tight">{t.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{t.artist}</p>
                        </div>
                        {isSelected && isPlaying && (
                          <div className="flex items-center gap-0.5 pr-1">
                            <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                            <span className="w-1 h-4 bg-emerald-400 animate-pulse delay-75 rounded-full" />
                            <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150 rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* AMBIENT SOUNDS 20-TRACK MIXER (Fills full height) */
            <div className="space-y-4 pb-2">
              {/* Header Info & Active Count & Reset */}
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Âm thanh thiên nhiên</span>
                  {Object.values(ambientVolumes).filter((v) => v > 0).length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 animate-pulse">
                      Đang bật {Object.values(ambientVolumes).filter((v) => v > 0).length}
                    </span>
                  )}
                </div>
                {Object.values(ambientVolumes).some((v) => v > 0) && (
                  <button
                    onClick={() => updateAmbientVolumes({})}
                    className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <VolumeX className="w-3 h-3" />
                    Tắt tất cả
                  </button>
                )}
              </div>

              {/* Quick Presets (4 Columns x 2 Rows Grid - 100% Visible at a glance) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gợi ý phối âm nhanh
                  </span>
                  <span className="text-[10px] text-slate-500">Chạm để Bật / Tắt</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    {
                      label: "Quán Cafe",
                      icon: Coffee,
                      color: "text-amber-400",
                      recipe: { "Window Rain": 0.5, "People Talking": 0.35, "Keyboard": 0.25 } as Record<string, number>
                    },
                    {
                      label: "Lửa trại",
                      icon: Flame,
                      color: "text-orange-400",
                      recipe: { "Campfire": 0.6, "Forest": 0.4, "Wind": 0.25 } as Record<string, number>
                    },
                    {
                      label: "Mưa bão",
                      icon: CloudRain,
                      color: "text-sky-400",
                      recipe: { "Summer Storm": 0.6, "Thunders": 0.35, "City Rain": 0.3 } as Record<string, number>
                    },
                    {
                      label: "Sóng biển",
                      icon: Waves,
                      color: "text-teal-400",
                      recipe: { "Waves": 0.6, "Wind": 0.25, "Bird Chirping": 0.3 } as Record<string, number>
                    },
                    {
                      label: "Vũ trụ",
                      icon: Sparkles,
                      color: "text-purple-400",
                      recipe: { "Deep Space": 0.6, "Underwater": 0.35, "Fan": 0.2 } as Record<string, number>
                    },
                    {
                      label: "Rừng cây",
                      icon: Trees,
                      color: "text-emerald-400",
                      recipe: { "Forest": 0.55, "River": 0.4, "Bird Chirping": 0.35 } as Record<string, number>
                    },
                    {
                      label: "Tàu đêm",
                      icon: TrainTrack,
                      color: "text-indigo-400",
                      recipe: { "Train": 0.55, "City Rain": 0.35, "Wind": 0.2 } as Record<string, number>
                    },
                    {
                      label: "Lò sưởi",
                      icon: Flame,
                      color: "text-rose-400",
                      recipe: { "Fireplace": 0.6, "Window Rain": 0.4, "Keyboard": 0.25 } as Record<string, number>
                    }
                  ].map((preset, idx) => {
                    const Icon = preset.icon;
                    const matchingSounds = AMBIENT_SOUNDS.filter((s) =>
                      Object.keys(preset.recipe).some((k) => s.name.toLowerCase().includes(k.toLowerCase()))
                    );
                    const isPresetActive =
                      matchingSounds.length > 0 &&
                      matchingSounds.every((s) => (ambientVolumes[s.id] || 0) > 0);

                    return (
                      <button
                        key={preset.label || `preset-${idx}`}
                        onClick={() => {
                          if (isPresetActive) {
                            const newVols = { ...ambientVolumes };
                            matchingSounds.forEach((s) => {
                              delete newVols[s.id];
                            });
                            updateAmbientVolumes(newVols);
                          } else {
                            const newVols: Record<string, number> = {};
                            matchingSounds.forEach((s) => {
                              const matchKey = Object.keys(preset.recipe).find((k) =>
                                s.name.toLowerCase().includes(k.toLowerCase())
                              );
                              if (matchKey && preset.recipe[matchKey] !== undefined) {
                                newVols[s.id] = preset.recipe[matchKey];
                              }
                            });
                            updateAmbientVolumes(newVols);
                          }
                        }}
                        className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl border transition-all text-center group active:scale-95 shadow-sm cursor-pointer ${
                          isPresetActive
                            ? "bg-emerald-500/25 border-emerald-400/60 text-emerald-300 ring-1 ring-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)] font-bold"
                            : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium"
                        }`}
                        title={isPresetActive ? "Bấm để tắt" : "Bấm để bật"}
                      >
                        <Icon className={`w-4 h-4 ${isPresetActive ? "text-emerald-400" : preset.color} transition-transform group-hover:scale-110`} />
                        <span className="text-[11px] leading-tight truncate w-full">{preset.label}</span>
                        {isPresetActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse absolute top-1.5 right-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Header for 20 Soundboard Tiles */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Bộ phối âm chi tiết (20 âm)
                </span>
                {Object.values(ambientVolumes).filter((v) => v > 0).length > 0 && (
                  <span className="text-[10px] text-slate-400">
                    Đang kích hoạt <b className="text-emerald-400">{Object.values(ambientVolumes).filter((v) => v > 0).length}</b> âm thanh
                  </span>
                )}
              </div>

              {/* 20 Ambient Sounds Studio Soundboard (Fills entire modal height) */}
              <div className="grid grid-cols-2 gap-2.5">
                {AMBIENT_SOUNDS.map((sound, idx) => {
                  const vol = ambientVolumes[sound.id] || 0;
                  const isActive = vol > 0;

                  const isFire = sound.name.toLowerCase().includes("fire") || sound.name.toLowerCase().includes("camp");
                  const isWater = ["rain", "ocean", "river", "drops"].some((k) => sound.id.includes(k));
                  const isNature = ["birds", "forest", "wind", "night"].some((k) => sound.id.includes(k));

                  const activeBg = isFire
                    ? "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-black/60 border-amber-400/40 shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
                    : isWater
                    ? "bg-sky-500/15 border-sky-500/40 shadow-lg shadow-sky-500/10"
                    : isNature
                    ? "bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                    : "bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10";

                  const activeIconBg = isFire
                    ? "bg-amber-500/30 text-amber-300 border-amber-400/40"
                    : isWater
                    ? "bg-sky-500/25 border-sky-400/50 text-sky-300"
                    : isNature
                    ? "bg-emerald-500/25 border-emerald-400/50 text-emerald-300"
                    : "bg-purple-500/25 border-purple-400/50 text-purple-300";

                  const accentColor = isFire
                    ? "accent-amber-400"
                    : isWater
                    ? "accent-sky-400"
                    : isNature
                    ? "accent-emerald-400"
                    : "accent-purple-400";

                  return (
                    <div
                      key={sound.id || `ambient-${idx}`}
                      className={`flex flex-col justify-between p-2.5 rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? `${activeBg}`
                          : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/8"
                      }`}
                    >
                      {/* Top row: Icon button + Sound Name + Equalizer */}
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleSound(sound.id)}
                          className={`p-2 rounded-xl transition-all border shrink-0 cursor-pointer ${
                            isActive
                              ? `${activeIconBg} scale-105 shadow-md`
                              : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:text-white"
                          }`}
                          title={isActive ? "Tắt âm thanh này" : "Bật âm thanh này (60%)"}
                        >
                          {renderSoundIcon(sound.icon, isActive)}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate leading-tight ${isActive ? "text-white" : "text-slate-300"}`}>
                            {sound.name}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isActive ? (
                              <div className="flex items-center gap-0.5 text-emerald-400">
                                <span className="w-0.5 h-2.5 bg-current rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                                <span className="w-0.5 h-3.5 bg-current rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                                <span className="w-0.5 h-2 bg-current rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                                <span className="text-[10px] font-semibold ml-1 text-emerald-300">Phát</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500">Tắt</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: Mini Slider & Volume Percent */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={vol}
                          onChange={(e) => handleSoundVolume(sound.id, parseFloat(e.target.value))}
                          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all ${
                            isActive ? `bg-white/20 hover:bg-white/30 ${accentColor}` : "bg-white/10 hover:bg-white/20 accent-slate-500 opacity-50"
                          }`}
                        />
                        <span className={`text-[10px] font-mono font-semibold w-7 text-right ${isActive ? "text-white" : "text-slate-500"}`}>
                          {Math.round(vol * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
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
