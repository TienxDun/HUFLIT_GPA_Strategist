"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export function VisitorCount() {
  const [count, setCount] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(
          "https://tienxdun.goatcounter.com/counter/TOTAL.json?rnd=" + Math.random(),
          {
            mode: "cors",
            credentials: "omit",
          }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.count) {
          setCount(data.count.toLocaleString());
        }
      } catch {
        // Silent catch to avoid console noise when blocked by AdBlockers
      } finally {
        setLoaded(true);
      }
    };

    fetchCount();
  }, []);

  if (!loaded) {
    return (
      <span className="text-slate-400 flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-slate-300 animate-pulse" />
        <span>Hoạt động từ 08/12/2025</span>
      </span>
    );
  }

  const displayCount = count || "---";

  return (
    <a
      href="https://tienxdun.goatcounter.com/?hl-period=year&group=hour&period-start=2025-07-16&period-end=2026-07-16&filter=&group=hour"
      target="_blank"
      rel="noopener noreferrer"
      className="animate-in fade-in duration-700 text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer group"
      title="Xem thống kê chi tiết lượt truy cập"
    >
      <Activity className="h-3.5 w-3.5 text-blue-500/80 group-hover:text-blue-600 transition-colors" />
      <span className="group-hover:underline decoration-dotted">
        <strong className="text-blue-600 font-bold">{displayCount}</strong> lượt truy cập từ 08/12/2025
      </span>
    </a>
  );
}
