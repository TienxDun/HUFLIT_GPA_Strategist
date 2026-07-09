"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Newspaper } from "lucide-react";

import { type NewsItem } from "@/lib/api/news";

import { NEWS_CATEGORIES } from "./news-constants";
import { CategoryFilters } from "./CategoryFilters";
import { EmptyState } from "./EmptyState";
import { NewsCard } from "./NewsCard";
import { SearchField } from "./SearchField";
import { SectionLoadingSkeleton } from "./SectionLoadingSkeleton";
import { SectionTitle } from "./SectionTitle";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
  }),
};

export function NewsSection({
  activeCategory,
  filteredNews,
  isLoading,
  items,
  counts,
  search,
  onAdd,
  onCategoryChange,
  onManage,
  onRefresh,
  onSearchChange,
}: {
  activeCategory: string;
  filteredNews: NewsItem[];
  isLoading: boolean;
  items: NewsItem[];
  counts: Record<string, number>;
  search: string;
  onAdd: () => void;
  onCategoryChange: (category: string) => void;
  onManage: () => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
}) {
  const [direction, setDirection] = useState(0);
  const categories = ["all", ...Object.keys(NEWS_CATEGORIES)];
  const isDragging = useRef(false);

  const handleCategoryChange = (newCategory: string) => {
    const currentIndex = categories.indexOf(activeCategory);
    const newIndex = categories.indexOf(newCategory);
    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }
    onCategoryChange(newCategory);
  };

  const handleSwipeLeft = () => {
    const currentIndex = categories.indexOf(activeCategory);
    if (currentIndex < categories.length - 1) {
      handleCategoryChange(categories[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = categories.indexOf(activeCategory);
    if (currentIndex > 0) {
      handleCategoryChange(categories[currentIndex - 1]);
    }
  };

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.stopPropagation();
      e.preventDefault();
      setTimeout(() => {
        isDragging.current = false;
      }, 50);
    }
  };

  return (
    <section className="space-y-3" aria-labelledby="news-section-title">
      <SectionTitle
        id="news-section-title"
        title="Bản tin & Thông báo"
        description="Cập nhật tin tức học vụ và hoạt động mới nhất"
        actionLabel="Đăng bản tin mới"
        onAdd={onAdd}
        onEditAll={onManage}
        editAllLabel="Quản lý bản tin"
      />
      <SearchField
        label="Tìm kiếm bản tin"
        placeholder="Tìm kiếm bản tin..."
        value={search}
        onChange={onSearchChange}
      />
      <CategoryFilters
        active={activeCategory}
        categories={NEWS_CATEGORIES}
        counts={counts}
        onChange={handleCategoryChange}
      />
      {isLoading && items.length === 0 ? (
        <SectionLoadingSkeleton />
      ) : filteredNews.length === 0 ? (
        <EmptyState
          icon={<NewsEmptyIcon />}
          title="Không tìm thấy bản tin nào"
          description="Hãy thử từ khóa khác, đổi danh mục, hoặc tải lại dữ liệu nếu danh sách chưa cập nhật."
          onRefresh={onRefresh}
        />
      ) : (
        <div className="overflow-hidden pr-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCategory}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.22 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={() => {
                isDragging.current = true;
              }}
              onDragEnd={(_event, info) => {
                const swipeThreshold = 60;
                if (info.offset.x < -swipeThreshold) {
                  handleSwipeLeft();
                } else if (info.offset.x > swipeThreshold) {
                  handleSwipeRight();
                }
                setTimeout(() => {
                  isDragging.current = false;
                }, 50);
              }}
              onClickCapture={handleCaptureClick}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {filteredNews.map((item, index) => (
                <NewsCard key={item.id} item={item} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function NewsEmptyIcon() {
  return <Newspaper className="mb-3 h-10 w-10 text-slate-300 opacity-60" />;
}
