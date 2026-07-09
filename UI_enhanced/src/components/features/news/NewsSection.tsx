"use client";

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
        onChange={onCategoryChange}
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
        <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

function NewsEmptyIcon() {
  return <Newspaper className="mb-3 h-10 w-10 text-slate-300 opacity-60" />;
}
