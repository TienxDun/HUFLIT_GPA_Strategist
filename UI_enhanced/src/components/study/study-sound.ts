// Web Audio API Synthesizer for Pomodoro Chimes & Notifications (No external audio files needed)

export type PomodoroSoundType = "classic_clock" | "zen_bell" | "birds" | "digital";

export interface PomodoroSoundOption {
  id: PomodoroSoundType;
  name: string;
  iconName: string;
}

export const POMODORO_SOUND_OPTIONS: PomodoroSoundOption[] = [
  {
    id: "classic_clock",
    name: "Chuông đồng hồ cổ điển",
    iconName: "Clock",
  },
  {
    id: "zen_bell",
    name: "Chuông chùa / Zen Bowl",
    iconName: "Flame",
  },
  {
    id: "birds",
    name: "Tiếng chim hót nhẹ",
    iconName: "SunMedium",
  },
  {
    id: "digital",
    name: "Chuông điện tử hiện đại",
    iconName: "Volume2",
  },
];

export const playPomodoroSound = (soundType: PomodoroSoundType = "classic_clock", enabled: boolean = true) => {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    switch (soundType) {
      case "zen_bell": {
        // Zen Singing Bowl: Deep warm tone (~280Hz) + rich harmonics (560Hz, 840Hz) + slow lingering decay
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc3.type = "sine";

        osc1.frequency.setValueAtTime(277.18, now); // C#4
        osc2.frequency.setValueAtTime(554.37, now); // C#5
        osc3.frequency.setValueAtTime(830.61, now); // G#5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.2);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 3.2);
        osc2.stop(now + 3.2);
        osc3.stop(now + 3.2);
        break;
      }

      case "birds": {
        // Gentle bird chirps: 3 rhythmic sweet chirps with frequency modulation
        const chirps = [
          { start: 0, dur: 0.15, f1: 2400, f2: 3800, f3: 2800 },
          { start: 0.22, dur: 0.18, f1: 2600, f2: 4200, f3: 3100 },
          { start: 0.46, dur: 0.22, f1: 2900, f2: 4600, f3: 3400 },
        ];

        chirps.forEach(({ start, dur, f1, f2, f3 }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + start;

          osc.type = "sine";
          osc.frequency.setValueAtTime(f1, t);
          osc.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.4);
          osc.frequency.exponentialRampToValueAtTime(f3, t + dur);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.2, t + dur * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + dur);
        });
        break;
      }

      case "digital": {
        // Modern crisp double-beep
        [0, 0.18].forEach((time, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + time;
          const freq = idx === 0 ? 880 : 1174.66; // A5 -> D6

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.14);
        });
        break;
      }

      case "classic_clock":
      default: {
        // Westminster 4-note chime: E4 -> C4 -> D4 -> G3
        const notes = [
          { freq: 329.63, time: 0 },    // E4
          { freq: 261.63, time: 0.35 }, // C4
          { freq: 293.66, time: 0.7 },  // D4
          { freq: 196.00, time: 1.05 }, // G3
        ];

        notes.forEach(({ freq, time }) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + time;

          osc1.type = "sine";
          osc2.type = "triangle";

          osc1.frequency.setValueAtTime(freq, t);
          osc2.frequency.setValueAtTime(freq * 2, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.55);
          osc2.stop(t + 0.55);
        });
        break;
      }
    }
  } catch {
    // Audio Context fail-safe
  }
};
