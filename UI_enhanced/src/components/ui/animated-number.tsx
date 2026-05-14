"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({
  value,
  precision = 0,
  className,
  suffix = "",
  prefix = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(precision)}${suffix}`;
      }
    });
  }, [springValue, precision, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(precision)}
      {suffix}
    </span>
  );
}
