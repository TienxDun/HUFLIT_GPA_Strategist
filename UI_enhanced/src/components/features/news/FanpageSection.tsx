"use client";

import { type FanpageItem } from "@/lib/api/news";

import { FANPAGE_CATEGORIES } from "./news-constants";
import { CategoryFilters } from "./CategoryFilters";
import { EmptyState } from "./EmptyState";
import { FanpageCard } from "./FanpageCard";
import { SearchField } from "./SearchField";
import { SectionLoadingSkeleton } from "./SectionLoadingSkeleton";
import { SectionTitle } from "./SectionTitle";

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
        onChange={onCategoryChange}
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
        <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredFanpages.map((page) => (
            <FanpageCard key={page.id} page={page} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}
