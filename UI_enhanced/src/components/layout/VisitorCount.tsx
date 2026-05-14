"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function VisitorCount() {
  const [count, setCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        // Silent catch to avoid console noise when blocked by AdBlockers
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[11px] font-bold">
        <Eye className="h-3 w-3" />
        <span>...</span>
      </div>
    );
  }

  const displayCount = count || "---";

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold shadow-sm border border-blue-100 animate-in fade-in slide-in-from-bottom-1 duration-500">
      <Eye className="h-3 w-3" />
      <span>{displayCount}</span>
    </div>
  );
}
