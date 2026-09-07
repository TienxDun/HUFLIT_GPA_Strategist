"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  History,
  Lightbulb,
  MessageCircle,
  Check,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";
import { FeedbackDialog } from "../features/community/FeedbackDialog";
import { ChangelogDialog } from "./ChangelogDialog";
import { getLatestVersion } from "@/constants/changelog";

export const AuthorInfoDialog = memo(({ children }: { children: React.ReactElement }) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const avatarSrc = `${basePath}/ava.jpg`;
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const latest = getLatestVersion();

  return (
    <>
      <Dialog>
        <DialogTrigger render={children} />
        <DialogContent className="w-[92vw] sm:w-[95vw] max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl">
          {/* Header Background */}
          <div className="relative h-32 bg-gradient-to-b from-blue-100 to-white flex items-start justify-between p-4">
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-7 text-center -mt-16">
            {/* Avatar Container */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="absolute inset-0 rounded-full bg-white p-1.5 shadow-xl transition-transform group-hover:scale-105 duration-500">
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white ring-2 ring-blue-50/50">
                  <Image
                    src={avatarSrc}
                    alt="Tiến Dũng"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              {/* Badge */}
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500 delay-300">
                <Check className="h-4 w-4 text-white stroke-[3]" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Tiến Dũng</h3>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-bold tracking-wider mb-2">
              K29 IT - HUFLIT
            </div>

            <p className="text-slate-500 text-[13px] leading-relaxed mb-6 px-3 font-medium">
              &ldquo;Mình hy vọng công cụ này sẽ giúp ích được cho mọi người trong hành trình chinh phục tấm bằng đại học tại HUFLIT.&rdquo;
            </p>

            {/* Inset Grouped List (iOS / Apple Style) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 shadow-xs divide-y divide-slate-100">
              {/* Item 1: Nhật ký cập nhật (Ưu tiên số 1) */}
              <button
                type="button"
                onClick={() => setIsChangelogOpen(true)}
                className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white active:bg-slate-100/70 cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/70 transition-transform group-hover:scale-105">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-1 items-center justify-between gap-2 min-w-0 pr-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Nhật ký cập nhật
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200/60 shrink-0">
                    {latest.version}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Item 2: Góp ý tính năng */}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white active:bg-slate-100/70 cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/70 transition-transform group-hover:scale-105">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    Góp ý tính năng
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Item 3: Mở trang tính điểm GPA cũ (Công cụ cũ) */}
              <a
                href={`${basePath}/legacy/index.html`}
                className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white active:bg-slate-100/70 cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/70 transition-transform group-hover:scale-105">
                  <History className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    Mở trang tính điểm GPA cũ
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </a>
            </div>

            {/* Primary CTA: Nhắn tin qua Facebook (Nổi bật độc lập) */}
            <a
              href="https://www.facebook.com/tienxdun/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex h-11 sm:h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="h-4 w-4 fill-white/20" />
              <span>Nhắn tin qua Facebook</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <ChangelogDialog
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </>
  );
});


AuthorInfoDialog.displayName = "AuthorInfoDialog";
