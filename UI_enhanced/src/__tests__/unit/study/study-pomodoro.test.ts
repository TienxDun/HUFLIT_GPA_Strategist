import { describe, it, expect } from "vitest";

describe("Study Pomodoro & Stopwatch Formatter Logic", () => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatStopwatch = (ms: number, showMs: boolean = true) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");
    const cs = centiseconds.toString().padStart(2, "0");

    if (hours > 0) {
      return showMs ? `${hours}:${m}:${s}.${cs}` : `${hours}:${m}:${s}`;
    }
    return showMs ? `${m}:${s}.${cs}` : `${m}:${s}`;
  };

  it("should correctly format Pomodoro countdown times", () => {
    expect(formatTime(25 * 60)).toBe("25:00");
    expect(formatTime(5 * 60)).toBe("05:00");
    expect(formatTime(15 * 60)).toBe("15:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(0)).toBe("00:00");
  });

  it("should calculate circular progress offset accurately", () => {
    const calculateOffset = (totalSec: number, leftSec: number) => {
      const percent = totalSec > 0 ? ((totalSec - leftSec) / totalSec) * 100 : 0;
      return 440 - (440 * percent) / 100;
    };

    expect(calculateOffset(1500, 1500)).toBe(440); // 0% done -> offset 440
    expect(calculateOffset(1500, 750)).toBe(220); // 50% done -> offset 220
    expect(calculateOffset(1500, 0)).toBe(0); // 100% done -> offset 0
  });

  it("should correctly format stopwatch times without hours", () => {
    expect(formatStopwatch(0)).toBe("00:00.00");
    expect(formatStopwatch(0, false)).toBe("00:00");
    expect(formatStopwatch(1540)).toBe("00:01.54");
    expect(formatStopwatch(1540, false)).toBe("00:01");
    expect(formatStopwatch(65230)).toBe("01:05.23");
    expect(formatStopwatch(65230, false)).toBe("01:05");
  });

  it("should correctly format stopwatch times with hours", () => {
    const oneHourThirtyMins = 1 * 3600000 + 30 * 60000 + 15 * 1000 + 500;
    expect(formatStopwatch(oneHourThirtyMins)).toBe("1:30:15.50");
    expect(formatStopwatch(oneHourThirtyMins, false)).toBe("1:30:15");
  });

  it("should suggest long break every 4 completed sessions", () => {
    const getNextBreakType = (completedCount: number) => {
      return completedCount % 4 === 0 ? "long_break" : "short_break";
    };

    expect(getNextBreakType(1)).toBe("short_break");
    expect(getNextBreakType(2)).toBe("short_break");
    expect(getNextBreakType(3)).toBe("short_break");
    expect(getNextBreakType(4)).toBe("long_break");
    expect(getNextBreakType(8)).toBe("long_break");
  });

  it("should have all registered Pomodoro sound options configured with classic_clock as default on top", async () => {
    const { POMODORO_SOUND_OPTIONS, playPomodoroSound } = await import("../../../components/study/study-sound");
    expect(POMODORO_SOUND_OPTIONS.length).toBe(4);
    expect(POMODORO_SOUND_OPTIONS[0].id).toBe("classic_clock");

    const soundIds = POMODORO_SOUND_OPTIONS.map((s) => s.id);
    expect(soundIds).not.toContain("melodic");
    expect(soundIds).toContain("classic_clock");
    expect(soundIds).toContain("zen_bell");
    expect(soundIds).toContain("birds");
    expect(soundIds).toContain("digital");

    POMODORO_SOUND_OPTIONS.forEach((s) => {
      expect(s.name.length).toBeGreaterThan(0);
    });

    // Should run safely without crashing when AudioContext is missing in Node environment
    expect(() => playPomodoroSound("classic_clock", true)).not.toThrow();
    expect(() => playPomodoroSound("zen_bell", true)).not.toThrow();
    expect(() => playPomodoroSound("birds", true)).not.toThrow();
    expect(() => playPomodoroSound("digital", true)).not.toThrow();
    expect(() => playPomodoroSound("classic_clock", false)).not.toThrow();
  });
});
