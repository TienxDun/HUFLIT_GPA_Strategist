"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { LineChart as ChartIcon } from "lucide-react";
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
    cumulativeGPA: number;
  }[];
}

const ManualChart = memo(({ semesterStats }: ManualChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    return semesterStats.map(s => ({
      name: s.name,
      gpa: s.cumulativeGPA
    }));
  }, [semesterStats]);

  if (chartData.length <= 1) return null;

  return (
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 overflow-hidden">
      <CardHeader className="py-2.5 px-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Biến động GPA</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-[145px] pt-3 pb-4 px-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120} aspect={2.5}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                hide
              />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                fontSize={10}
                fontWeight="bold"
                stroke="#94a3b8"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : "0.00", "GPA"]}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGpa)"
                animationDuration={1500}
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
