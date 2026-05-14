"use client";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Lightbulb,
  MessageCircle,
  Check
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { memo, useState } from "react";
import { FeedbackDialog } from "../features/community/FeedbackDialog";
import { VisitorCount } from "./VisitorCount";

export const AuthorInfoDialog = memo(({ children }: { children: React.ReactElement }) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const avatarSrc = `${basePath}/ava.jpg`;
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <Dialog>
        <DialogTrigger render={children} />
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none bg-white rounded-[32px] shadow-2xl">
          {/* Header Background */}
          <div className="relative h-32 bg-gradient-to-b from-blue-100 to-white flex items-start justify-between p-4">
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-8 text-center -mt-16">
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

            <div className="mb-6">
              <VisitorCount />
            </div>

            <p className="text-slate-500 text-[13px] leading-relaxed mb-8 px-4 font-medium">
              "Mình hy vọng công cụ này sẽ giúp ích được cho mọi người trong hành trình chinh phục tấm bằng đại học tại HUFLIT."
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full h-12 rounded-full border-blue-500/30 text-blue-600 font-bold text-sm hover:bg-blue-50 hover:border-blue-500 transition-all gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Xem hướng dẫn sử dụng
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full h-12 rounded-full border-emerald-500/30 text-emerald-600 font-bold text-sm hover:bg-emerald-50 hover:border-emerald-500 transition-all gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Góp ý tính năng
              </Button>

              <Button
                nativeButton={false}
                render={
                  <a href="https://www.facebook.com/tienxdun/" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 fill-white/20" />
                    Nhắn tin qua Facebook
                  </a>
                }
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-200 transition-all gap-2"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
});


AuthorInfoDialog.displayName = "AuthorInfoDialog";
