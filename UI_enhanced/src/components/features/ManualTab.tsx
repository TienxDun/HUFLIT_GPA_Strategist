"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useManualGPA } from "@/hooks/useManualGPA";
import { type InitialRoadmapData } from "@/hooks/useRoadmapState";

import InitialStatsCard from "./manual/InitialStatsCard";
import PortalImportDialog from "./manual/PortalImportDialog";
import ManualStats from "./manual/ManualStats";
import dynamic from "next/dynamic";
const ManualChart = dynamic(() => import("./manual/ManualChart"), {
  ssr: false,
  loading: () => <div className="h-[145px] w-full animate-pulse bg-slate-50 rounded-2xl border border-slate-200" />
});

import SemesterCard from "./manual/SemesterCard";
import YearSummaryCard from "./manual/YearSummaryCard";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

interface ManualTabProps {
  onSwitchToRoadmap?: (data: InitialRoadmapData) => void;
}

const ManualTab = memo(({ onSwitchToRoadmap }: ManualTabProps) => {
  const {
    isLoaded,
    initialGPA,
    initialCredits,
    semesters,
    result,
    yearlyStats,
    getYear,
    updateInitialGPA,
    updateInitialCredits,
    updateSemesterName,
    addSemester,
    removeSemester,
    addCourse,
    updateCourse,
    removeCourse,
    resetData,
    importFromPortal
  } = useManualGPA();

  if (!isLoaded) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start pb-10">
      {/* SIDEBAR */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-4 static lg:sticky lg:top-20 space-y-2 order-first h-fit z-20 self-start"
      >
        <InitialStatsCard
          initialGPA={initialGPA}
          initialCredits={initialCredits}
          onUpdateGPA={updateInitialGPA}
          onUpdateCredits={updateInitialCredits}
          onReset={resetData}
        >
          <PortalImportDialog onImport={importFromPortal} />
        </InitialStatsCard>

        <ManualStats 
          result={result} 
          semesters={semesters} 
          onSwitchToRoadmap={onSwitchToRoadmap} 
        />

        <ManualChart semesterStats={result.semesterStats} />
      </motion.div>

      {/* MAIN CONTENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-8 space-y-6"
      >
        <div className="flex items-center justify-between px-2 mb-2 gap-2">
          <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>
            Chi tiết các học kỳ
          </h2>
          <Button
            onClick={addSemester}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs gap-1.5 h-8 px-3 rounded-lg shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> 
            <span className="hidden sm:inline">Thêm học kỳ mới</span>
            <span className="sm:hidden">Thêm HK</span>
          </Button>
        </div>

        {semesters.map((sem, sIdx) => {
          const currentYearLabel = getYear(sem.name) || `Năm ${Math.floor(sIdx / 3) + 1}`;
          const nextYearLabel = sIdx < semesters.length - 1 
            ? (getYear(semesters[sIdx + 1].name) || `Năm ${Math.floor((sIdx + 1) / 3) + 1}`)
            : null;

          const showSummary = currentYearLabel !== nextYearLabel || sIdx === semesters.length - 1;

          return (
            <div key={sIdx} className="space-y-6">
              <SemesterCard
                sem={sem}
                sIdx={sIdx}
                onUpdateName={updateSemesterName}
                onRemoveSemester={removeSemester}
                onAddCourse={addCourse}
                onUpdateCourse={updateCourse}
                onRemoveCourse={removeCourse}
                isOnlySemester={semesters.length === 1}
                semStats={result.semesterStats[sIdx]}
              />
              
              {showSummary && yearlyStats[currentYearLabel] && (
                <YearSummaryCard 
                  year={currentYearLabel} 
                  data={yearlyStats[currentYearLabel]} 
                />
              )}
            </div>
          );
        })}

        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={addSemester}
            className="group border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold py-8 px-12 rounded-3xl transition-all w-full flex flex-col gap-2 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <span>Thêm học kỳ mới</span>
          </Button>
        </div>
      </motion.div>
      <ScrollToTop />
    </div>
  );
});

ManualTab.displayName = "ManualTab";

export { ManualTab };
