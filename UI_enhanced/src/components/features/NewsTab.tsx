"use client";

import React, { memo, useMemo, useState } from "react";

import { useNewsState } from "@/hooks/useNewsState";

import { CommunityBanner } from "./news/CommunityBanner";
import { FanpageSection } from "./news/FanpageSection";
import { NewsFormModal } from "./news/NewsFormModal";
import { ManageFanpagesModal } from "./news/ManageFanpagesModal";
import { ManageNewsModal } from "./news/ManageNewsModal";
import { NewsSection } from "./news/NewsSection";
import { countByCategory, getThumbnailUrl } from "./news/news-utils";
import { useNewsForm } from "./news/useNewsForm";

export const NewsTab = memo(() => {
  const [isManageFanpagesOpen, setIsManageFanpagesOpen] = useState(false);
  const [isManageNewsOpen, setIsManageNewsOpen] = useState(false);
  const {
    newsItems,
    fanpageItems,
    isLoading,
    isLoadingFanpages,
    isSubmitting,
    publishNews,
    editNewsItem,
    removeNewsItem,
    publishFanpage,
    editFanpageItem,
    removeFanpageItem,
    refreshNews,
  } = useNewsState();

  const form = useNewsForm();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFanpageCategory, setActiveFanpageCategory] = useState<string>("all");
  const [newsSearch, setNewsSearch] = useState("");
  const [fanpageSearch, setFanpageSearch] = useState("");

  const filteredNews = useMemo(() => {
    const query = newsSearch.trim().toLowerCase();

    return newsItems.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, newsItems, newsSearch]);

  const filteredFanpages = useMemo(() => {
    const query = fanpageSearch.trim().toLowerCase();

    return fanpageItems.filter((page) => {
      const matchesCategory =
        activeFanpageCategory === "all" ||
        page.category.includes(activeFanpageCategory as any);
      const matchesSearch =
        !query ||
        page.name.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeFanpageCategory, fanpageItems, fanpageSearch]);

  const newsCategoryCounts = useMemo(() => countByCategory(newsItems), [newsItems]);
  const fanpageCategoryCounts = useMemo(() => countByCategory(fanpageItems), [fanpageItems]);

  const handleSubmitNews = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      title: form.news.title,
      description: form.news.description,
      facebookUrl: form.news.sourceUrl,
      category: form.news.category,
      thumbnailUrl: getThumbnailUrl(form.news.thumbnailType, form.news.customThumbnailUrl),
    };
    const success = form.editingId
      ? await editNewsItem(form.editingId, payload)
      : await publishNews(payload, form.pin);

    if (success) form.close();
  };

  const handleSubmitFanpage = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      name: form.fanpage.name,
      url: form.fanpage.url,
      category: form.fanpage.category,
      description: form.fanpage.description,
    };
    const success = form.editingId
      ? await editFanpageItem(form.editingId, payload)
      : await publishFanpage(payload, form.pin);

    if (success) form.close();
  };

  return (
    <div className="min-w-full space-y-4 pb-8">
      <CommunityBanner onAddClick={() => form.openCreate("news")} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <NewsSection
          activeCategory={activeCategory}
          counts={newsCategoryCounts}
          filteredNews={filteredNews}
          isLoading={isLoading}
          items={newsItems}
          search={newsSearch}
          onAdd={() => form.openCreate("news")}
          onCategoryChange={setActiveCategory}
          onManage={() => setIsManageNewsOpen(true)}
          onRefresh={refreshNews}
          onSearchChange={setNewsSearch}
        />
        <FanpageSection
          activeCategory={activeFanpageCategory}
          counts={fanpageCategoryCounts}
          filteredFanpages={filteredFanpages}
          isLoading={isLoadingFanpages}
          items={fanpageItems}
          search={fanpageSearch}
          onAdd={() => form.openCreate("fanpage")}
          onCategoryChange={setActiveFanpageCategory}
          onManage={() => setIsManageFanpagesOpen(true)}
          onRefresh={refreshNews}
          onSearchChange={setFanpageSearch}
        />
      </div>

      <NewsFormModal
        form={form}
        isSubmitting={isSubmitting}
        onSubmitFanpage={handleSubmitFanpage}
        onSubmitNews={handleSubmitNews}
      />

      <ManageFanpagesModal
        isOpen={isManageFanpagesOpen}
        onClose={() => setIsManageFanpagesOpen(false)}
        fanpages={fanpageItems}
        onEdit={form.openFanpageEdit}
        onDelete={removeFanpageItem}
        isSubmitting={isSubmitting}
      />

      <ManageNewsModal
        isOpen={isManageNewsOpen}
        onClose={() => setIsManageNewsOpen(false)}
        news={newsItems}
        onEdit={form.openNewsEdit}
        onDelete={removeNewsItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
});

NewsTab.displayName = "NewsTab";
