"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { MessageSquare, X, RefreshCw } from "lucide-react";
import { memo } from "react";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackList } from "./FeedbackList";
import { useFeedback } from "@/hooks/useFeedback";
import { Button } from "@/components/ui/button";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackDialog = memo(({ isOpen, onClose }: FeedbackDialogProps) => {
  const { feedbacks, isLoading, isSubmitting, sendFeedback, refreshFeedbacks } = useFeedback();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false} 
        className="max-w-[550px] w-[95vw] p-0 overflow-hidden border border-slate-200/50 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] gap-0"
      >
        {/* Header - Compact & Light */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 relative">
          <DialogClose 
            render={
              <button 
                className="absolute top-1/2 -translate-y-1/2 right-4 w-9 h-9 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all border border-slate-200 cursor-pointer active:scale-90 z-20"
              />
            }
          >
            <X className="h-4 w-4" />
          </DialogClose>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                Góp ý & Cộng đồng
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  HUFLIT GPA Strategist
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh] space-y-8 scrollbar-hide">
          {/* Form Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-blue-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Gửi góp ý mới
              </h3>
            </div>
            <FeedbackForm onSend={sendFeedback} isSubmitting={isSubmitting} />
          </section>

          {/* List Section */}
          <section className="relative">
            <FeedbackList 
              feedbacks={feedbacks} 
              isLoading={isLoading} 
              onRefresh={refreshFeedbacks}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Phát triển bởi <span className="text-slate-400">Tiến Dũng (TienxDun)</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
});



FeedbackDialog.displayName = "FeedbackDialog";
