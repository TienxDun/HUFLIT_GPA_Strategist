"use client";

import { useEffect, useRef } from "react";

interface SuccessCelebrationProps {
  active: boolean;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_QUERY = "(max-width: 640px), (pointer: coarse)";

function matchesMedia(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

function isLowPowerDevice() {
  if (typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & { deviceMemory?: number };
  return typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
}

export function SuccessCelebration({ active }: SuccessCelebrationProps) {
  const lastActive = useRef(false);

  useEffect(() => {
    const shouldCelebrate = active && !lastActive.current;
    lastActive.current = active;

    if (!shouldCelebrate || matchesMedia(REDUCED_MOTION_QUERY)) {
      return;
    }

    let cancelled = false;

    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;

      const shouldUseLightMode = matchesMedia(MOBILE_QUERY) || isLowPowerDevice();
      const defaults = {
        disableForReducedMotion: true,
        origin: { y: 0.72 },
        scalar: shouldUseLightMode ? 0.72 : 0.9,
        startVelocity: shouldUseLightMode ? 20 : 26,
        ticks: shouldUseLightMode ? 42 : 56,
        zIndex: 100,
      };

      confetti({
        ...defaults,
        particleCount: shouldUseLightMode ? 24 : 48,
        spread: shouldUseLightMode ? 52 : 68,
      });

      if (!shouldUseLightMode) {
        window.setTimeout(() => {
          if (cancelled) return;

          confetti({
            ...defaults,
            particleCount: 28,
            spread: 84,
            origin: { y: 0.68 },
          });
        }, 160);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active]);

  return null; // Không render UI card, chỉ chạy animation
}
