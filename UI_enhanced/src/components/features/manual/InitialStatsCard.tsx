"use client";

import { memo } from "react";
import { LayoutDashboard, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InitialStatsCardProps {
  initialGPA: number;
  initialCredits: number;
  onUpdateGPA: (val: number) => void;
  onUpdateCredits: (val: number) => void;
  onReset: () => void;
  children?: React.ReactNode;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

const InitialStatsCard = memo(({
  initialGPA,
  initialCredits,
  onUpdateGPA,
  onUpdateCredits,
  onReset,
  children
}: InitialStatsCardProps) => {
  const [isResetOpen, setIsResetOpen] = useState(false);

  return (
    <Card className="ring-0 border border-slate-300 bg-white shadow-xl shadow-blue-500/5 py-0">
      <CardHeader className="py-2.5 px-4 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-50/50 backdrop-blur-sm p-1.5 rounded-lg border border-blue-100/50 shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-blue-600" />
          </div>
          <CardTitle className="text-sm text-slate-800 font-bold tracking-tight">Tổng kết</CardTitle>
        </div>
        
        <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
          <DialogTrigger render={
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          } />
          <DialogContent className="max-w-[340px] rounded-3xl p-6 border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl">
            <DialogHeader className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 mx-auto mb-2">
                <RotateCcw className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold text-slate-800">Xác nhận xóa dữ liệu?</DialogTitle>
              <DialogDescription className="text-center text-slate-500 text-sm font-medium">
                Hành động này sẽ xóa toàn bộ điểm số và cài đặt hiện tại. Bạn không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsResetOpen(false)} 
                className="flex-1 rounded-2xl border-slate-200 font-bold text-slate-600 h-11 hover:bg-slate-50 transition-all"
              >
                Hủy
              </Button>
              <Button 
                onClick={() => { onReset(); setIsResetOpen(false); }} 
                className="flex-1 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 h-11 transition-all active:scale-95"
              >
                Xóa hết
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-3 space-y-3">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="initial-gpa" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ps-1">GPA Hiện tại</Label>
              <Input
                id="initial-gpa"
                type="number"
                step="0.01"
                className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                value={initialGPA || ""}
                onChange={(e) => onUpdateGPA(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="initial-credits" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ps-1">Tích lũy</Label>
              <Input
                id="initial-credits"
                type="number"
                className="bg-white border-slate-300 rounded-xl h-9 text-center font-bold text-blue-600 placeholder:text-slate-500 shadow-sm focus:ring-1 focus:ring-blue-500 transition-all"
                value={initialCredits || ""}
                onChange={(e) => onUpdateCredits(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div className="pt-0.5">
          {children}
        </div>
      </CardContent>
    </Card>
  );
});

InitialStatsCard.displayName = "InitialStatsCard";

export default InitialStatsCard;
