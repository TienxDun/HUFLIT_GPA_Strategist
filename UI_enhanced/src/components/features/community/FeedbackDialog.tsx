"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { MessageSquare, X } from "lucide-react";
import { memo } from "react";
import { FeedbackForm } from "./FeedbackForm";
import { FeedbackList } from "./FeedbackList";
import { useFeedback } from "@/hooks/useFeedback";

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
        className="flex h-[min(92dvh,760px)] w-[95vw] max-w-[960px] flex-col gap-0 overflow-hidden rounded-[28px] border border-slate-200/50 bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
      >
        <div className="relative shrink-0 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <DialogClose 
            render={
              <button 
                className="absolute right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-100 active:scale-90"
              />
            }
          >
            <X className="h-4 w-4" />
          </DialogClose>
          
          <div className="relative z-10 flex items-center gap-3 pr-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-500/10">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black leading-tight tracking-tight text-slate-800">
                Góp ý & Cộng đồng
              </DialogTitle>
              <div className="mt-0.5 flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  HUFLIT GPA Strategist
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-4 sm:px-6 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1 lg:overflow-hidden">
          <section className="shrink-0 space-y-3 lg:min-h-0">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-blue-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Gửi góp ý mới
              </h3>
            </div>
            <FeedbackForm onSend={sendFeedback} isSubmitting={isSubmitting} />
          </section>

          <section className="relative min-h-0 lg:overflow-hidden">
            <FeedbackList 
              feedbacks={feedbacks} 
              isLoading={isLoading} 
              onRefresh={refreshFeedbacks}
            />
          </section>
        </div>

        <div className="flex shrink-0 items-center justify-center border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 sm:px-6">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Phát triển bởi <span className="text-slate-400">Tiến Dũng (TienxDun)</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
});



FeedbackDialog.displayName = "FeedbackDialog";
