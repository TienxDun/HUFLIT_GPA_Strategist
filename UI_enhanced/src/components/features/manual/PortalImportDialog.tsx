"use client";

import { useState } from "react";
import { CloudUpload, ExternalLink, Copy, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface PortalImportDialogProps {
  onImport: (text: string) => void;
}

const PortalImportDialog = ({ onImport }: PortalImportDialogProps) => {
  const [importText, setImportText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleImport = () => {
    if (!importText.trim()) return;
    onImport(importText);
    setImportText("");
    setIsOpen(false);
  };

  return (
    <div className="pt-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger render={
          <Button variant="outline" className="w-full bg-white border-blue-200 text-blue-700 font-bold shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all rounded-xl h-10 text-xs gap-2" />
        }>
          <CloudUpload className="h-4 w-4" /> Nhập dữ liệu từ Portal
        </DialogTrigger>
        <DialogContent className="max-w-3xl bg-white border-slate-200 shadow-2xl p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 pb-2 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/15">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">Nhập dữ liệu Portal</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm">
                  Tự động hóa việc nhập điểm chỉ với vài giây.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5">
            {/* Step-by-Step Instructions */}
            {/* Unified Step-by-Step Flow */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {[
                  { step: 1, text: "Truy cập Portal", subText: "Mở trang điểm ở đây nè! ", icon: ExternalLink, url: "https://portal.huflit.edu.vn/Home/Marks" },
                  { step: 2, text: "Sao chép tất cả", subText: "Ctrl+A & Ctrl+C", icon: Copy },
                  { step: 3, text: "Dán vào ô dưới", subText: "Ctrl+V để nhập", icon: ClipboardCheck }
                ].map((s) => {
                  const isLink = !!s.url;
                  const Component = isLink ? 'a' : 'div' as any;
                  
                  return (
                    <Component 
                      key={s.step} 
                      href={s.url}
                      target={isLink ? "_blank" : undefined}
                      rel={isLink ? "noopener noreferrer" : undefined}
                      className={`flex items-center gap-3 p-3.5 transition-all group ${isLink ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                        <s.icon className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">BƯỚC 0{s.step}</span>
                          {isLink && <ExternalLink className="w-2.5 h-2.5 text-blue-400/50 group-hover:text-blue-500 transition-colors" />}
                        </div>
                        <span className={`text-[11px] font-bold text-slate-800 leading-none truncate ${isLink ? 'group-hover:underline group-hover:text-blue-700' : ''}`}>
                          {s.text}
                        </span>
                        <span className={`text-[10px] mt-1 leading-none ${isLink ? 'text-blue-600 font-bold underline underline-offset-2 decoration-blue-300' : 'text-slate-500 font-medium'}`}>
                          {s.subText}
                        </span>
                      </div>
                    </Component>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Textarea Area */}
            <div className="relative">
              <textarea
                className="w-full h-[200px] p-4 font-mono text-[11px] bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400"
                placeholder="Nhấp vào đây và nhấn Ctrl + V để dán bảng điểm..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur border border-slate-200 rounded-lg shadow-sm">
                <div className={`h-2 w-2 rounded-full ${importText.length > 50 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {importText.length > 0 ? "Sẵn sàng" : "Chờ dữ liệu"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="m-0 p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-3xl">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="h-10 px-6 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importText.trim()}
              className={`
                h-10 px-8 rounded-xl
                font-bold text-sm tracking-tight
                transition-all duration-200
                ${!importText.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                }
              `}
            >
              Bắt đầu phân tích
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortalImportDialog;
