"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music2, 
  Repeat, 
  Shuffle, 
  SlidersHorizontal 
} from "lucide-react";
import { Track, MoodType, STUDY_TRACKS_BY_MOOD } from "./study-types";
import { SoundMixerWidget } from "./SoundMixerWidget";

interface StudyMusicPlayerProps {
  isGlobalMuted?: boolean;
  isMixerOpen?: boolean;
  onToggleMixer?: () => void;
  onCloseMixer?: () => void;
}

export const StudyMusicPlayer = ({ 
  isGlobalMuted = false,
  isMixerOpen: externalIsMixerOpen,
  onToggleMixer,
  onCloseMixer
}: StudyMusicPlayerProps) => {
  const [currentMood, setCurrentMood] = useState<MoodType>("lofi");
  const [tracks, setTracks] = useState<Track[]>(STUDY_TRACKS_BY_MOOD.lofi);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [internalIsMixerOpen, setInternalIsMixerOpen] = useState(false);

  const isMixerOpen = externalIsMixerOpen !== undefined ? externalIsMixerOpen : internalIsMixerOpen;
  const toggleMixer = onToggleMixer || (() => setInternalIsMixerOpen(!internalIsMixerOpen));
  const closeMixer = onCloseMixer || (() => setInternalIsMixerOpen(false));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [frequencyData, setFrequencyData] = useState<number[]>(() => new Array(28).fill(20));

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const effectiveVolume = (isGlobalMuted || isLocalMuted) ? 0 : volume;

  // Real-time animation loop for sound wave frequencies (Multi-harmonic Beat Synthesizer)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setFrequencyData(new Array(28).fill(20));
      return;
    }

    const renderWave = () => {
      const t = audioRef.current?.currentTime || 0;
      // Multi-layer harmonic frequency simulation based on exact playback time & volume
      const bars = Array.from({ length: 28 }, (_, i) => {
        // Bass region (low index), Mid (middle), Treble (high index)
        const bassFactor = Math.sin(t * 5.2) * Math.cos(i * 0.3) * 35;
        const midFactor = Math.sin(i * 0.8 + t * 6.8) * 30;
        const trebleFactor = Math.sin(i * 1.5 + t * 9.4) * 15;
        const noise = Math.sin(t * 15 + i * 4) * 8;

        const combined = 40 + bassFactor + midFactor + trebleFactor + noise;
        const scaled = combined * (0.6 + effectiveVolume * 0.4);
        return Math.max(16, Math.min(96, Math.round(scaled)));
      });

      setFrequencyData(bars);
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, effectiveVolume]);

  // Phục hồi cài đặt Nhạc từ LocalStorage khi vào lại trang
  useEffect(() => {
    try {
      const savedMood = localStorage.getItem("huflit_study_mood") as MoodType;
      const validMoods: MoodType[] = ["lofi", "jazz", "relax"];
      const moodToUse = validMoods.includes(savedMood) ? savedMood : "lofi";
      
      const moodTracks = STUDY_TRACKS_BY_MOOD[moodToUse] || [];
      if (savedMood && validMoods.includes(savedMood)) {
        setCurrentMood(moodToUse);
        setTracks(moodTracks);
      }

      const savedTrackId = localStorage.getItem("huflit_study_track_id");
      if (savedTrackId) {
        const trackIdx = moodTracks.findIndex((t) => t.id === savedTrackId);
        if (trackIdx !== -1) {
          setCurrentTrackIndex(trackIdx);
        }
      }

      const savedVol = localStorage.getItem("huflit_study_volume");
      if (savedVol !== null && !isNaN(parseFloat(savedVol))) {
        setVolume(parseFloat(savedVol));
      }

      const savedShuffle = localStorage.getItem("huflit_study_shuffle");
      if (savedShuffle !== null) {
        setIsShuffle(savedShuffle === "true");
      }

      const savedLoop = localStorage.getItem("huflit_study_loop");
      if (savedLoop !== null) {
        setIsLooping(savedLoop === "true");
      }
    } catch {}
  }, []);

  // Sync tracks when mood changes & lưu LocalStorage
  const handleSelectMood = (mood: MoodType) => {
    setCurrentMood(mood);
    const newTracks = STUDY_TRACKS_BY_MOOD[mood] || [];
    setTracks(newTracks);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
    try {
      localStorage.setItem("huflit_study_mood", mood);
      if (newTracks[0]) {
        localStorage.setItem("huflit_study_track_id", newTracks[0].id);
      }
    } catch {}
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsLocalMuted(false);
    try {
      localStorage.setItem("huflit_study_volume", String(newVol));
    } catch {}
  };

  const handleToggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("huflit_study_shuffle", String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleLoop = () => {
    setIsLooping((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("huflit_study_loop", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Tự động phát nhạc ngay khi vào trang StudySpace
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptAutoplay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Nếu chính sách trình duyệt yêu cầu cử chỉ người dùng trước (như mở link mới trực tiếp)
          const onFirstInteraction = () => {
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          };
          window.addEventListener("click", onFirstInteraction, { once: true });
          window.addEventListener("touchstart", onFirstInteraction, { once: true });
          window.addEventListener("keydown", onFirstInteraction, { once: true });
        });
    };

    attemptAutoplay();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleNextTrack = useCallback(() => {
    let nextIdx = 0;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else {
      nextIdx = (currentTrackIndex + 1) % tracks.length;
    }
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
    try {
      if (tracks[nextIdx]) {
        localStorage.setItem("huflit_study_track_id", tracks[nextIdx].id);
      }
    } catch {}
  }, [currentTrackIndex, isShuffle, tracks]);

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
    try {
      if (tracks[prevIdx]) {
        localStorage.setItem("huflit_study_track_id", tracks[prevIdx].id);
      }
    } catch {}
  };

  // Global Keyboard Shortcuts for Music Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi người dùng đang nhập văn bản vào input / textarea / contentEditable
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleNextTrack();
      } else if (e.key === "ArrowLeft" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlePrevTrack();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleVolumeChange(Math.min(1, Math.round((volume + 0.05) * 100) / 100));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleVolumeChange(Math.max(0, Math.round((volume - 0.05) * 100) / 100));
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsLocalMuted((prev) => !prev);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleToggleShuffle();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleToggleLoop();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, handleNextTrack, volume]);

  const handleSelectTrack = (track: Track) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    } else {
      // Switch mood if track belongs to another mood
      const foundMood = (["lofi", "jazz", "relax"] as MoodType[]).find((m) =>
        STUDY_TRACKS_BY_MOOD[m].some((t) => t.id === track.id)
      );
      if (foundMood) {
        setCurrentMood(foundMood);
        const newTracks = STUDY_TRACKS_BY_MOOD[foundMood];
        setTracks(newTracks);
        const newIdx = newTracks.findIndex((t) => t.id === track.id);
        setCurrentTrackIndex(newIdx !== -1 ? newIdx : 0);
        try {
          localStorage.setItem("huflit_study_mood", foundMood);
        } catch {}
      }
    }
    setIsPlaying(true);
    try {
      localStorage.setItem("huflit_study_track_id", track.id);
    } catch {}
  };

  const syncDuration = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    syncDuration();
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAudioError = () => {
    console.warn(`[StudyMusicPlayer] Tín hiệu mạng hoặc CDN bị gián đoạn cho bài "${currentTrack?.title}". Tự động chuyển sang bài tiếp theo...`);
    // Tự động nhảy mượt sang bài tiếp theo nếu CDN server bên thứ ba bị ngắt stream HTTP/2
    setTimeout(() => {
      handleNextTrack();
    }, 1000);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (!isFinite(timeInSeconds) || isNaN(timeInSeconds) || timeInSeconds <= 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={syncDuration}
        onCanPlay={syncDuration}
        onLoadedData={syncDuration}
        onError={handleAudioError}
        onEnded={handleNextTrack}
        loop={isLooping}
        preload="metadata"
      />

      {/* Sound Mixer Modal Drawer */}
      <SoundMixerWidget
        isOpen={isMixerOpen}
        onClose={closeMixer}
        currentMood={currentMood}
        onSelectMood={handleSelectMood}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onSelectTrack={(track) => {
          const idx = tracks.findIndex((t) => t.id === track.id);
          if (idx !== -1) {
            setCurrentTrackIndex(idx);
          }
          setIsPlaying(true);
          try {
            localStorage.setItem("huflit_study_track_id", track.id);
          } catch {}
        }}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isShuffle={isShuffle}
        onToggleShuffle={handleToggleShuffle}
        isLooping={isLooping}
        onToggleLoop={handleToggleLoop}
        isGlobalMuted={isGlobalMuted}
      />

      {/* Main Glassmorphic Bottom Bar Player */}
      <div className="relative w-full max-w-4xl px-2 sm:px-4 group">
        {/* Dynamic Aura Ambient Glow */}
        <div 
          className={`absolute -inset-1 rounded-full blur-xl pointer-events-none transition-all duration-700 ${
            isPlaying 
              ? "bg-gradient-to-r from-emerald-500/25 via-sky-500/25 to-indigo-500/25 opacity-90 animate-pulse" 
              : "bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-30"
          }`} 
        />

        <div className="relative flex items-center justify-between gap-2.5 sm:gap-4 pl-3 pr-3 sm:pl-3.5 sm:pr-3.5 py-2 rounded-full bg-slate-950/85 hover:bg-slate-950/90 backdrop-blur-2xl border border-white/20 shadow-[0_15px_45px_rgba(0,0,0,0.6)] transition-all duration-300 text-white w-full">
          {/* Track Vinyl Artwork & Info (Left) */}
          <div 
            onClick={toggleMixer}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-[160px] sm:max-w-[220px] md:max-w-[260px] shrink-0 cursor-pointer group/art"
            title="Mở Sound Mixer & Danh sách nhạc"
          >
            {/* Spinning Vinyl Record Disk */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-white/30 via-slate-700 to-white/20 shadow-lg shadow-black/60 shrink-0 group-hover/art:scale-105 transition-transform duration-300">
              <div 
                className={`w-full h-full rounded-full overflow-hidden relative shadow-inner ${
                  isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
                }`}
              >
                <img
                  src={currentTrack?.cover || "https://assets.beeziee.com/thumbnails/coffee-shop.PNG"}
                  alt={currentTrack?.title}
                  className="w-full h-full object-cover"
                />
                {/* Vinyl Grooves & Center Spindle Ring */}
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-slate-950 border border-white/50 shadow-sm z-10 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>

            {/* Title, Artist */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 truncate leading-tight group-hover/art:text-emerald-300 transition-colors">
                {currentTrack?.title}
              </h4>

              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 truncate">
                <span className="truncate">{currentTrack?.artist}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-white/10 text-emerald-300 font-bold border border-white/10 text-[10px]">
                  {currentTrack?.genre}
                </span>
              </div>
            </div>
          </div>

          {/* Center Interactive Audio Waveform Progress Bar (Phản ứng theo tần số nhạc thực tế) */}
          <div className="hidden md:flex items-center gap-2.5 flex-1 min-w-[160px] px-2">
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right shrink-0">
              {formatTime(currentTime)}
            </span>

            {/* Waveform Visualization Container */}
            <div className="relative w-full h-8 flex items-center justify-between gap-[2px] px-1 group/waveform cursor-pointer">
              {frequencyData.map((heightPercent, idx) => {
                const progressRatio = duration > 0 ? currentTime / duration : 0;
                const barRatio = idx / (frequencyData.length - 1);
                const isPlayed = barRatio <= progressRatio;

                return (
                  <div
                    key={`freq-${idx}`}
                    className="flex-1 flex items-center justify-center h-full"
                  >
                    <span
                      style={{
                        height: isPlaying ? `${heightPercent}%` : "20%"
                      }}
                      className={`w-full max-w-[3.5px] rounded-full transition-all duration-75 ${
                        isPlayed
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                          : "bg-white/20 group-hover/waveform:bg-white/35"
                      }`}
                    />
                  </div>
                );
              })}

              {/* Invisible native range input for smooth seeking */}
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 100}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Kéo hoặc bấm để tua bài hát"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-400 w-8 shrink-0">
              {duration > 0 ? formatTime(duration) : "0:00"}
            </span>
          </div>

          {/* Controls (Right) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Shuffle */}
            <button
              onClick={handleToggleShuffle}
              className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                isShuffle 
                  ? "text-emerald-400 bg-emerald-500/20 shadow-sm border border-emerald-400/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Xáo trộn bài hát"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Previous */}
            <button
              onClick={handlePrevTrack}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
              title="Bài trước đó"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause Main Glowing Pearl Button */}
            <button
              onClick={togglePlay}
              className="relative p-2.5 sm:p-3 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 hover:from-emerald-400 hover:to-emerald-200 text-slate-950 font-black shadow-[0_0_20px_rgba(52,211,153,0.7)] hover:shadow-[0_0_28px_rgba(52,211,153,0.9)] transition-all active:scale-90 cursor-pointer shrink-0"
              title={isPlaying ? "Tạm dừng (Space)" : "Phát nhạc (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 translate-x-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNextTrack}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Loop */}
            <button
              onClick={handleToggleLoop}
              className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                isLooping 
                  ? "text-emerald-400 bg-emerald-500/20 shadow-sm border border-emerald-400/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Lặp lại danh sách"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Volume Control */}
            <div className="hidden lg:flex items-center gap-1.5 pl-1.5 pr-1 border-l border-white/15">
              <button
                onClick={() => setIsLocalMuted(!isLocalMuted)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                {effectiveVolume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={effectiveVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Sound Mixer Open Button (Nằm gọn gàng hoàn hảo bên trong viền cong) */}
            <button
              onClick={toggleMixer}
              className={`p-2 rounded-full transition-all active:scale-95 cursor-pointer border shrink-0 ${
                isMixerOpen 
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.6)]" 
                  : "bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 border-white/15 shadow-sm"
              }`}
              title="Mở Sound Mixer (Lo-fi / Jazz / Relax & Âm thanh nền)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
