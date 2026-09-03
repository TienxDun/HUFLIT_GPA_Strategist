"use client";

import { useMemo, useState } from "react";
import { 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Search, 
  X, 
  Plus, 
  Globe, 
  Compass,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type FanpageItem } from "@/lib/api/news";

import { MetaBadge } from "./CardMeta";
import { FANPAGE_CATEGORIES } from "./news-constants";
import { type FanpageCategory } from "./news-types";

function formatDisplayUrl(rawUrl: string): string {
  try {
    const urlObj = new URL(rawUrl);
    const domainAndPath = urlObj.hostname.replace(/^www\./, "") + urlObj.pathname.replace(/\/$/, "");
    return domainAndPath.length > 32 ? domainAndPath.slice(0, 30) + "..." : domainAndPath;
  } catch {
    const clean = rawUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    return clean.length > 32 ? clean.slice(0, 30) + "..." : clean;
  }
}

function handleValidateAction(
  itemId: string,
  itemTitle: string,
  actionName: "sửa" | "xóa",
  callback: () => void
) {
  const hasPin = itemId.includes("_pin_");
  const promptMessage = hasPin
    ? `Nhập mã PIN chỉnh sửa (hoặc mật khẩu admin) để xác nhận ${actionName} liên kết "${itemTitle}":`
    : `Liên kết này không có mã PIN riêng. Nhập mật khẩu admin để xác nhận ${actionName} liên kết "${itemTitle}":`;

  const password = prompt(promptMessage);
  if (password === null) return; // Người dùng nhấn hủy

  if (hasPin) {
    const match = itemId.match(/_pin_([A-Za-z0-9+/=]+)$/);
    let decoded = "";
    if (match) {
      try {
        let padded = match[1];
        while (padded.length % 4 !== 0) {
          padded += "=";
        }
        decoded = atob(padded);
      } catch {
        decoded = match[1];
      }
    }
    if (password !== "adminne" && password !== decoded) {
      toast.error("Mật mã chỉnh sửa hoặc mật khẩu admin không chính xác!", {
        description: "Vui lòng kiểm tra lại mã PIN của bạn.",
      });
      return;
    }
  } else {
    if (password !== "adminne") {
      toast.error("Mật khẩu admin không chính xác!", {
        description: "Bạn cần có quyền quản trị để thao tác liên kết này.",
      });
      return;
    }
  }

  callback();
}

interface ManageFanpagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  fanpages: FanpageItem[];
  onEdit: (page: FanpageItem) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
  isSubmitting: boolean;
}

export function ManageFanpagesModal({
  isOpen,
  onClose,
  fanpages,
  onEdit,
  onDelete,
  onAdd,
  isSubmitting,
}: ManageFanpagesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Đếm số lượng theo từng phân loại
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: fanpages.length };
    Object.keys(FANPAGE_CATEGORIES).forEach((cat) => {
      counts[cat] = 0;
    });

    fanpages.forEach((page) => {
      page.category.forEach((cat) => {
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
    });

    return counts;
  }, [fanpages]);

  // Lọc danh sách theo từ khóa và phân loại
  const filteredFanpages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return fanpages.filter((page) => {
      const matchesCategory =
        selectedCategory === "all" ||
        page.category.includes(selectedCategory as FanpageCategory);

      const matchesSearch =
        !query ||
        page.name.toLowerCase().includes(query) ||
        (page.description && page.description.toLowerCase().includes(query)) ||
        page.url.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [fanpages, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const handleAddNew = () => {
    onClose();
    onAdd?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-3xl border-slate-100 bg-white p-4 sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl sm:p-6 flex flex-col shadow-2xl">
        
        {/* Header Section: Thoáng đãng, không bị chèn ép với nút Đóng (X) */}
        <DialogHeader className="pb-3 border-b border-slate-100 flex flex-col gap-1 pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-extrabold text-slate-900 sm:text-lg flex items-center gap-2">
              Quản lý Kênh thông tin
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {fanpages.length}
              </span>
            </DialogTitle>
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-slate-500 sm:text-xs">
            Tìm kiếm, xem trước hoặc nhanh chóng chỉnh sửa, xóa các fanpage HUFLIT hữu ích.
          </p>
        </DialogHeader>

        {/* Toolbar: Search Box + Action Button "Thêm kênh mới" + Category Filter Chips */}
        <div className="pt-3 pb-1 space-y-2.5">
          {/* Row 1: Search Input kết hợp Nút Thêm mới chuẩn Dashboard */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên kênh, liên kết hoặc mô tả..."
                className="w-full h-10 pl-9.5 pr-8 text-xs sm:text-[13px] bg-slate-50/90 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Xóa tìm kiếm"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Nút "+ Thêm kênh mới" đặt cạnh ô tìm kiếm: Rất thoáng, không bao giờ nhầm nút X */}
            {onAdd && (
              <Button
                onClick={handleAddNew}
                className="h-10 px-3.5 sm:px-4 gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-300/40 active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Tạo thêm kênh thông tin mới"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Thêm kênh mới</span>
                <span className="sm:hidden">Thêm kênh</span>
              </Button>
            )}
          </div>

          {/* Row 2: Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] shrink-0 transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Tất cả ({categoryCounts.all || 0})
            </button>

            {Object.entries(FANPAGE_CATEGORIES).map(([catKey, config]) => {
              const count = categoryCounts[catKey] || 0;
              const isActive = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : `${config.color} border-slate-200/60`
                  }`}
                >
                  <span>{config.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? "bg-white/25" : "bg-black/5"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List Content Area */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5 max-h-[50vh] pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredFanpages.length === 0 ? (
            <div className="text-center py-12 px-4 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  Không tìm thấy kênh thông tin nào
                </p>
                <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto">
                  {searchQuery || selectedCategory !== "all"
                    ? "Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc đang áp dụng."
                    : "Chưa có kênh thông tin nào trong danh sách."}
                </p>
              </div>

              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 text-xs font-semibold gap-1.5 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại bộ lọc
                </Button>
              )}
            </div>
          ) : (
            filteredFanpages.map((page) => {
              const categories = [...page.category].sort(
                (a, b) =>
                  Object.keys(FANPAGE_CATEGORIES).indexOf(a) -
                  Object.keys(FANPAGE_CATEGORIES).indexOf(b)
              );

              return (
                <div
                  key={page.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm p-3.5 transition-all duration-200"
                >
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="truncate text-xs font-extrabold text-slate-900 sm:text-sm group-hover:text-blue-600 transition-colors">
                        {page.name}
                      </h5>
                    </div>

                    {page.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug font-medium">
                        {page.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {/* Domain link */}
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-blue-600 transition-colors"
                        title={page.url}
                      >
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">
                          {formatDisplayUrl(page.url)}
                        </span>
                      </a>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1">
                        {categories.map((catKey) => {
                          const config =
                            FANPAGE_CATEGORIES[catKey] || FANPAGE_CATEGORIES.other;
                          return (
                            <MetaBadge
                              key={catKey}
                              className={config.color}
                              label={config.label}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons Group */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Xem trực tiếp liên kết */}
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 active:scale-95 transition-all shadow-2xs"
                      title="Mở liên kết fanpage ngoài trang"
                      aria-label={`Mở liên kết ${page.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    {/* Chỉnh sửa */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleValidateAction(page.id, page.name, "sửa", () => {
                          onClose();
                          onEdit(page);
                        });
                      }}
                      className="h-8.5 w-8.5 rounded-xl border-slate-200/80 bg-white p-0 text-blue-600 hover:border-blue-300 hover:bg-blue-50 active:scale-95 transition-all shadow-2xs"
                      title="Chỉnh sửa kênh này"
                      aria-label={`Chỉnh sửa ${page.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    {/* Xóa */}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => {
                        handleValidateAction(page.id, page.name, "xóa", () => {
                          onDelete(page.id);
                        });
                      }}
                      className="h-8.5 w-8.5 rounded-xl border-slate-200/80 bg-white p-0 text-rose-600 hover:border-rose-300 hover:bg-rose-50 active:scale-95 transition-all shadow-2xs"
                      title="Xóa kênh này"
                      aria-label={`Xóa ${page.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info & Close Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>
            Đang hiển thị <strong className="text-slate-800">{filteredFanpages.length}</strong> / {fanpages.length} kênh
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-3.5 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
          >
            Đóng
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
