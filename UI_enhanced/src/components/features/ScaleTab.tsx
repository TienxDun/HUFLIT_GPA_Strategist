import React, { memo } from "react";
import { motion } from "framer-motion";
import { GradeScaleTable } from "./scale/GradeScaleTable";
import { RankTable } from "./scale/RankTable";
import { ScheduleTable } from "./scale/ScheduleTable";

export const ScaleTab = memo(() => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pb-4 min-w-full">
      
      {/* Cột trái: Thang điểm & Xếp loại */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-4 static lg:sticky lg:top-20 space-y-2 h-fit z-20 self-start w-full"
      >
        {/* Card 1: Thang điểm học tập */}
        <GradeScaleTable />

        {/* Card 2: Xếp loại học lực */}
        <RankTable 
          title="Xếp loại Học lực"
          data={[
            { rank: "Xuất sắc", range: "3.6 - 4.0", color: "bg-emerald-100 text-emerald-700" },
            { rank: "Giỏi", range: "3.2 - 3.59", color: "bg-blue-100 text-blue-700" },
            { rank: "Khá", range: "2.5 - 3.19", color: "bg-cyan-100 text-cyan-700" },
            { rank: "Trung bình", range: "2.0 - 2.49", color: "bg-amber-100 text-amber-700" },
            { rank: "Yếu", range: "1.0 - 1.99", color: "bg-orange-100 text-orange-700" },
            { rank: "Kém", range: "0.0 - 0.99", color: "bg-red-100 text-red-700" },
          ]}
        />

        {/* Card 3: Điểm rèn luyện */}
        <RankTable 
          title="Điểm rèn luyện"
          labelColumnName="Xếp loại"
          valueColumnName="Khoảng điểm"
          data={[
            { rank: "Xuất sắc", range: "90 - 100", color: "bg-emerald-100 text-emerald-700" },
            { rank: "Tốt", range: "80 - 89", color: "bg-blue-100 text-blue-700" },
            { rank: "Khá", range: "65 - 79", color: "bg-cyan-100 text-cyan-700" },
            { rank: "Trung bình", range: "50 - 64", color: "bg-amber-100 text-amber-700" },
            { rank: "Yếu", range: "35 - 49", color: "bg-orange-100 text-orange-700" },
            { rank: "Kém", range: "0 - 34", color: "bg-red-100 text-red-700" },
          ]}
        />
      </motion.div>

      {/* Cột phải: Thời gian biểu */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-8 space-y-2"
      >
        <ScheduleTable />
      </motion.div>

    </div>
  );
});

ScaleTab.displayName = "ScaleTab";
