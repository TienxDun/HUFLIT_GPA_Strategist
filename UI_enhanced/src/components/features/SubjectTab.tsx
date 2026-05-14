"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, HelpCircle } from "lucide-react";
import { useSubjectCalculator } from "@/hooks/useSubjectCalculator";
import { SubjectConfigCard } from "./subject/SubjectConfigCard";
import { GradeRequirementCard } from "./subject/GradeRequirementCard";

/**
 * SubjectTab Component
 * 
 * Manages the "Tính môn lẻ" (Individual Subject Calculation) view.
 * Uses useSubjectCalculator for business logic and focused sub-components for UI.
 */
export function SubjectTab() {
  const {
    ratio,
    setRatio,
    processScore,
    handleScoreChange,
    accumulatedScore,
    minFinalToPass,
    calculateRequiredFinal,
    validScales
  } = useSubjectCalculator();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
      {/* Left Column: Configuration and General Info */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-4 static lg:sticky lg:top-20 h-fit self-start z-20 space-y-4 w-full flex flex-col"
      >
        <SubjectConfigCard
          ratio={ratio}
          setRatio={setRatio}
          processScore={processScore}
          handleScoreChange={handleScoreChange}
          accumulatedScore={accumulatedScore}
          minFinalToPass={minFinalToPass}
        />

        {/* Hướng dẫn sử dụng Tab */}
        <Card className="hidden lg:flex flex-col flex-1 border-white/20 bg-white/40 backdrop-blur-xl shadow-lg shadow-blue-500/5 rounded-3xl overflow-hidden mt-2 py-0 gap-0">
          <CardContent className="p-3.5 space-y-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center justify-start gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <HelpCircle className="w-4 h-4" />
              </span>
              Mẹo sử dụng
            </h3>
            <ul className="text-[12px] text-slate-600 space-y-1.5 list-none p-0 m-0">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Chọn tỷ lệ phần trăm tương ứng với môn học.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Nhập điểm quá trình để xem số điểm cần qua môn tối thiểu.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Bảng mục tiêu giúp bạn biết điểm cuối kỳ cần thi để đạt được GPA mong muốn.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Right Column: Target grades calculation results */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-8 space-y-4 w-full"
      >
        <Card className="w-full border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-blue-500/5 transition-all duration-300 hover:shadow-blue-500/10 rounded-3xl overflow-hidden gap-0 py-0">
          <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm">
                <Trophy className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">
                  Mục tiêu Điểm thi
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 font-medium">
                  Điểm thi cần đạt để đạt từng mức GPA mục tiêu.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 gap-2">
              {validScales.map((scale) => (
                <GradeRequirementCard
                  key={scale.grade}
                  grade={scale.grade}
                  gpa={scale.gpa}
                  requiredFinal={calculateRequiredFinal(scale.min)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
