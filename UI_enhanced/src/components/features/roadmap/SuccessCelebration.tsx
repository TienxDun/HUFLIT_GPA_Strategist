"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface SuccessCelebrationProps {
  active: boolean;
}

export function SuccessCelebration({ active }: SuccessCelebrationProps) {
  const lastActive = useRef(false);

  useEffect(() => {
    // Chỉ kích hoạt khi chuyển từ không active sang active
    if (active && !lastActive.current) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Bắn pháo hoa từ hai bên trái và phải
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
    
    lastActive.current = active;
  }, [active]);

  return null; // Không render UI card, chỉ chạy animation
}
