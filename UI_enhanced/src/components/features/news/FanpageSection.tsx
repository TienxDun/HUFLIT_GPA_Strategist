"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { type FanpageItem } from "@/lib/api/news";

import { FANPAGE_CATEGORIES } from "./news-constants";
import { CategoryFilters } from "./CategoryFilters";
import { EmptyState } from "./EmptyState";
import { FanpageCard } from "./FanpageCard";
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

export function FanpageSection({
  activeCategory,
  counts,
  filteredFanpages,
  isLoading,
  items,
  search,
  onAdd,
  onCategoryChange,
  onEdit,
  onRefresh,
  onSearchChange,
}: {
  activeCategory: string;
  counts: Record<string, number>;
  filteredFanpages: FanpageItem[];
  isLoading: boolean;
  items: FanpageItem[];
  search: string;
  onAdd: () => void;
  onCategoryChange: (category: string) => void;
  onEdit: (page: FanpageItem) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
}) {
  const [direction, setDirection] = useState(0);
  const categories = ["all", ...Object.keys(FANPAGE_CATEGORIES)];
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
    <section
      className="space-y-3 lg:sticky lg:top-24 lg:border-l lg:border-slate-200/80 lg:pl-5"
      aria-labelledby="fanpage-section-title"
    >
      <SectionTitle
        id="fanpage-section-title"
        title="Kênh thông tin HUFLIT"
        description="Danh sách các Fanpage hữu ích cho sinh viên"
        actionLabel="Thêm kênh thông tin"
        onAdd={onAdd}
      />
      <SearchField
        label="Tìm kiếm kênh thông tin"
        placeholder="Tìm kiếm kênh thông tin..."
        value={search}
        onChange={onSearchChange}
      />
      <CategoryFilters
        active={activeCategory}
        categories={FANPAGE_CATEGORIES}
        counts={counts}
        onChange={handleCategoryChange}
      />
      {isLoading && items.length === 0 ? (
        <SectionLoadingSkeleton compact />
      ) : filteredFanpages.length === 0 ? (
        <EmptyState
          compact
          title="Không tìm thấy kênh nào"
          description="Hãy thử tìm kiếm với từ khóa khác hoặc đổi danh mục."
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
              className="max-h-[560px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {filteredFanpages.map((page) => (
                <FanpageCard key={page.id} page={page} onEdit={onEdit} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

