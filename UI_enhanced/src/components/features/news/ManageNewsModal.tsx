"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type NewsItem } from "@/lib/api/news";

import { MetaBadge } from "./CardMeta";
import { NEWS_CATEGORIES } from "./news-constants";
import { formatDisplayDate } from "./news-utils";

export function ManageNewsModal({
  isOpen,
  onClose,
  news,
  onEdit,
  onDelete,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem[];
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
  isSubmitting: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border-slate-100 bg-white p-4 sm:max-h-[calc(100dvh-2rem)] sm:max-w-xl sm:p-5 flex flex-col">
        <DialogHeader className="pb-2.5 border-b border-slate-100/80">
          <DialogTitle className="text-base font-bold text-slate-800 sm:text-lg">
            Quản lý Bản tin & Thông báo
          </DialogTitle>
          <p className="text-[11px] font-medium leading-relaxed text-slate-400 sm:text-xs">
            Danh sách tất cả các bản tin học vụ và sự kiện. Bạn có thể nhanh chóng Chỉnh sửa hoặc Xóa các bản tin này.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3.5 space-y-2.5 max-h-[50vh] pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {news.length === 0 ? (
            <div className="text-center py-10 text-xs font-semibold text-slate-400">
              Không có bản tin nào để quản lý.
            </div>
          ) : (
            news.map((item) => {
              const category = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.other;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="truncate text-xs font-extrabold text-slate-800 sm:text-sm">
                      {item.title}
                    </h5>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <MetaBadge className={category.color} label={category.label} />
                      {item.date && (
                        <span className="text-[10px] font-medium text-slate-400">
                          {formatDisplayDate(item.date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onEdit(item);
                      }}
                      className="h-7 w-7 rounded-lg border-slate-200/80 p-0 text-blue-600 hover:bg-slate-100"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (confirm(`Bạn có chắc chắn muốn xóa bản tin "${item.title}" không?`)) {
                          onDelete(item.id);
                        }
                      }}
                      className="h-7 w-7 rounded-lg border-slate-200/80 p-0 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
