"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface ManualChartProps {
  semesterStats: {
    name: string;
    gpa?: number;
    cumulativeGPA: number;
  }[];
}

const formatShortName = (name: string, index: number) => {
  return `HK${index + 1}`;
};

const ManualChart = memo(({ semesterStats }: ManualChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    return semesterStats.map((s, idx) => ({
      fullName: s.name || `Học kỳ ${idx + 1}`,
      name: formatShortName(s.name, idx),
      gpa: s.cumulativeGPA,
      semGpa: s.gpa || 0
    }));
  }, [semesterStats]);

  const summary = useMemo(() => {
    if (chartData.length === 0) return null;
    const semGpas = chartData.map(d => d.semGpa).filter(g => g > 0);
    const maxSemGPA = semGpas.length > 0 ? Math.max(...semGpas) : Math.max(...chartData.map(d => d.gpa));
    const gpas = chartData.map(d => d.gpa);
    const latest = gpas[gpas.length - 1];
    const prev = gpas.length >= 2 ? gpas[gpas.length - 2] : latest;
    const diff = latest - prev;
    const trend = diff > 0.01 ? "up" : diff < -0.01 ? "down" : "flat";

    return { maxSemGPA, latest, trend, diff };
  }, [chartData]);

  if (chartData.length <= 1) return null;

  return (
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 overflow-hidden gap-0 py-0">
      <CardHeader className="py-2.5 !pb-2.5 px-4 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm text-blue-600 shrink-0">
            {summary?.trend === "up" ? (
              <TrendingUp className="h-4 w-4" />
            ) : summary?.trend === "down" ? (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">
            Biến động GPA
          </CardTitle>
        </div>

        {summary && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="text-slate-400">GPA HK cao nhất:</span>
            <span className="text-blue-600 font-black px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100/60 shadow-2xs">
              {summary.maxSemGPA.toFixed(2)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="h-[155px] pt-3 pb-2 px-1">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontWeight: 700, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                dy={4}
              />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
                  fontSize: "11px",
                  fontWeight: "bold",
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "#334155", fontWeight: 800, marginBottom: "2px" }}
                formatter={(value: any) => [
                  <span key="val" className="text-blue-600 font-black">
                    {typeof value === "number" ? value.toFixed(2) : "0.00"}
                  </span>,
                  "GPA Tích lũy"
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return payload[0].payload.fullName;
                  }
                  return label;
                }}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gpaGradient)"
                dot={{
                  r: 3.5,
                  stroke: "#2563eb",
                  strokeWidth: 2,
                  fill: "#ffffff"
                }}
                activeDot={{
                  r: 5.5,
                  stroke: "#1d4ed8",
                  strokeWidth: 2,
                  fill: "#ffffff"
                }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50/50 animate-pulse rounded-xl" />
        )}
      </CardContent>
    </Card>
  );
});

ManualChart.displayName = "ManualChart";

export default ManualChart;
