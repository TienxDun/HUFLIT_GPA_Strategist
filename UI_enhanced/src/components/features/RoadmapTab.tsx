"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoadmapState, type InitialRoadmapData } from "@/hooks/useRoadmapState";
import { GoalSetupCard } from "./roadmap/GoalSetupCard";
import { ResultHeroCard } from "./roadmap/ResultHeroCard";
import { AlgorithmDialog } from "./roadmap/AlgorithmDialog";
import { ScenarioCard } from "./roadmap/ScenarioCard";
import { SuccessCelebration } from "./roadmap/SuccessCelebration";
import { encodeRoadmapState } from "@/lib/share-utils";
import { toast } from "sonner";


interface RoadmapTabProps {
  initialData?: InitialRoadmapData | null;
  onSwitchTab?: (tab: string) => void;
}

export function RoadmapTab({ initialData, onSwitchTab }: RoadmapTabProps) {
  const { state, actions, computed } = useRoadmapState(initialData);
  const { result, status, maxPossibleGPA, combinations, scenarioText, retakeSuggestions } = computed;

  // Quản lý trạng thái đóng mở của các bước trong GoalSetupCard
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false
  });

  const toggleStep = useCallback((step: number) => {
    setExpandedSteps(prev => {
      const isOpening = !prev[step];
      const newState = { ...prev, [step]: isOpening };
      
      // Nếu mở thẻ số 4 thì tự động đóng thẻ 2 và 3 để tiết kiệm không gian
      if (step === 4 && isOpening) {
        newState[2] = false;
        newState[3] = false;
      }
      
      return newState;
    });
  }, []);

  const isAnyExpanded = Object.values(expandedSteps).some(Boolean);

  const toggleAllSteps = useCallback(() => {
    if (isAnyExpanded) {
      setExpandedSteps({
        1: false,
        2: false,
        3: false,
        4: false
      });
    } else {
      setExpandedSteps({
        1: true,
        2: true,
        3: true,
        4: true
      });
    }
  }, [isAnyExpanded]);

  const handleAddRetakeSuggestion = useCallback((suggestion: any) => {
    actions.addRetakesFromSuggestion(suggestion);
    // Tự động mở thẻ 4 và đóng thẻ 2, 3 khi bấm Áp dụng
    setExpandedSteps(prev => ({
      ...prev,
      4: true,
      2: false,
      3: false
    }));
  }, [actions]);
  
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Đã sao chép liên kết!", {
        description: "Bạn có thể gửi liên kết này cho bạn bè.",
        duration: 3000,
      });
    });
  }, []);

  const handleShare = useCallback(() => {
    try {
      const shareData = encodeRoadmapState(state);
      const url = new URL(window.location.href);
      url.searchParams.set('s', shareData);
      const shareUrl = url.toString();

      if (navigator.share) {
        navigator.share({
          title: 'Lộ trình GPA - HUFLIT GPA Strategist',
          text: 'Xem lộ trình mục tiêu GPA của mình nè!',
          url: shareUrl,
        }).catch(() => copyToClipboard(shareUrl));
      } else {
        copyToClipboard(shareUrl);
      }
    } catch (err) {
      toast.error("Không thể tạo liên kết chia sẻ");
    }
  }, [state, copyToClipboard]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
      <SuccessCelebration active={status === "achieved"} />
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-4 static lg:sticky lg:top-20 space-y-6 h-fit z-20 self-start"
      >
        <GoalSetupCard 
          state={state} 
          actions={actions} 
          computed={computed} 
          expandedSteps={expandedSteps}
          onToggleStep={toggleStep}
          onToggleAll={toggleAllSteps}
          onShare={handleShare}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-8 space-y-3"
      >
        <ResultHeroCard
          result={result}
          status={status}
          maxPossibleGPA={maxPossibleGPA}
          targetGPA={state.targetGPA}
          currentCredits={state.currentCredits}
          onShare={handleShare}
        />
        <AlgorithmDialog
          currentGPA={state.currentGPA}
          currentCredits={state.currentCredits}
          targetGPA={state.targetGPA}
          remainingCredits={state.remainingCredits}
          retakes={state.retakes}
          result={result}
        />
        <AnimatePresence mode="wait">
          {status !== "achieved" && (
            <motion.div
              key="scenario-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScenarioCard
                scenarioText={scenarioText}
                combinations={combinations}
                result={result}
                retakeSuggestions={retakeSuggestions}
                hasManualData={computed.hasManualData}
                missingScenarios={computed.missingScenarios}
                targetGPA={state.targetGPA}
                totalPointsGap={computed.totalPointsGap}
                onAddRetakeSuggestion={handleAddRetakeSuggestion}
                onSwitchTab={onSwitchTab}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

