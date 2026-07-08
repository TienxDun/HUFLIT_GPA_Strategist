"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchNews,
  addNews,
  updateNews,
  deleteNews,
  fetchFanpages,
  addFanpage,
  updateFanpage,
  deleteFanpage,
  type NewsItem,
  type FanpageItem,
} from "@/lib/api/news";
import { toast } from "sonner";

const SYNC_AFTER_CREATE_MS = 1500;

function syncWithOptimisticItems<T extends { id: string }>(
  freshItems: T[],
  optimisticItems: T[]
) {
  const freshIds = new Set(freshItems.map((item) => item.id));
  const pendingItems = optimisticItems.filter((item) => !freshIds.has(item.id));

  return {
    items: [...pendingItems, ...freshItems],
    pendingItems,
  };
}

export function useNewsState() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [fanpageItems, setFanpageItems] = useState<FanpageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFanpages, setIsLoadingFanpages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const optimisticNewsItems = useRef<NewsItem[]>([]);
  const optimisticFanpageItems = useRef<FanpageItem[]>([]);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNews();
      const synced = syncWithOptimisticItems(data, optimisticNewsItems.current);
      optimisticNewsItems.current = synced.pendingItems;
      setNewsItems(synced.items);
    } catch {
      toast.error("Không thể tải bản tin từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFanpages = useCallback(async () => {
    setIsLoadingFanpages(true);
    try {
      const data = await fetchFanpages();
      const synced = syncWithOptimisticItems(data, optimisticFanpageItems.current);
      optimisticFanpageItems.current = synced.pendingItems;
      setFanpageItems(synced.items);
    } catch {
      toast.error("Không thể tải danh sách Fanpage từ hệ thống.");
    } finally {
      setIsLoadingFanpages(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    loadFanpages();
  }, [loadNews, loadFanpages]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const checkPassword = useCallback((password: string) => {
    if (password === "adminne") {
      setIsAdmin(true);
      toast.success("Xác thực quản trị viên thành công!");
      return true;
    }
    toast.error("Mật khẩu không chính xác!");
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    toast.info("Đã đăng xuất tài khoản quản trị.");
  }, []);

  // ── News actions ──────────────────────────────────────────────────────────

  const publishNews = async (news: Omit<NewsItem, "id" | "date">) => {
    if (!news.title || news.title.trim().length < 5) {
      toast.error("Tiêu đề bản tin phải có ít nhất 5 ký tự");
      return false;
    }
    if (!news.facebookUrl?.trim().startsWith("http")) {
      toast.error("Vui lòng nhập đường dẫn nguồn hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const createdNews = await addNews(news);
      if (!createdNews) throw new Error("Failed to create news");

      optimisticNewsItems.current = [
        createdNews,
        ...optimisticNewsItems.current.filter((item) => item.id !== createdNews.id),
      ];
      setNewsItems((prev) => [
        createdNews,
        ...prev.filter((item) => item.id !== createdNews.id),
      ]);
      toast.success("Đã đăng bản tin thành công!");
      setTimeout(loadNews, SYNC_AFTER_CREATE_MS);
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi đăng bản tin. Vui lòng thử lại sau.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const editNewsItem = async (id: string, news: Omit<NewsItem, "id" | "date">) => {
    if (!news.title || news.title.trim().length < 5) {
      toast.error("Tiêu đề bản tin phải có ít nhất 5 ký tự");
      return false;
    }
    if (!news.facebookUrl?.trim().startsWith("http")) {
      toast.error("Vui lòng nhập đường dẫn nguồn hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      await updateNews(id, news);
      toast.success("Cập nhật bản tin thành công!");
      optimisticNewsItems.current = optimisticNewsItems.current.map((item) =>
        item.id === id
          ? {
              ...item,
              title: news.title,
              description: news.description,
              facebookUrl: news.facebookUrl,
              thumbnailUrl: news.thumbnailUrl,
              category: news.category,
            }
          : item
      );
      setNewsItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                title: news.title,
                description: news.description,
                facebookUrl: news.facebookUrl,
                thumbnailUrl: news.thumbnailUrl,
                category: news.category,
              }
            : item
        )
      );
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật bản tin.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeNewsItem = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteNews(id);
      toast.success("Đã xóa bản tin thành công!");
      optimisticNewsItems.current = optimisticNewsItems.current.filter(
        (item) => item.id !== id
      );
      setNewsItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi xóa bản tin.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Fanpage actions ───────────────────────────────────────────────────────

  const publishFanpage = async (fanpage: Omit<FanpageItem, "id" | "date">) => {
    if (!fanpage.name || fanpage.name.trim().length < 5) {
      toast.error("Tên fanpage phải có ít nhất 5 ký tự");
      return false;
    }
    if (!fanpage.url?.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Fanpage hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const createdFanpage = await addFanpage(fanpage);
      if (!createdFanpage) throw new Error("Failed to create fanpage");

      optimisticFanpageItems.current = [
        createdFanpage,
        ...optimisticFanpageItems.current.filter(
          (item) => item.id !== createdFanpage.id
        ),
      ];
      setFanpageItems((prev) => [
        createdFanpage,
        ...prev.filter((item) => item.id !== createdFanpage.id),
      ]);
      toast.success("Đã thêm Fanpage thành công!");
      setTimeout(loadFanpages, SYNC_AFTER_CREATE_MS);
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi thêm Fanpage. Vui lòng thử lại sau.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFanpageItem = async (id: string, fanpage: Omit<FanpageItem, "id" | "date">) => {
    if (!fanpage.name || fanpage.name.trim().length < 5) {
      toast.error("Tên fanpage phải có ít nhất 5 ký tự");
      return false;
    }
    if (!fanpage.url?.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Fanpage hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      await updateFanpage(id, fanpage);
      toast.success("Cập nhật Fanpage thành công!");
      optimisticFanpageItems.current = optimisticFanpageItems.current.map((page) =>
        page.id === id
          ? {
              ...page,
              name: fanpage.name,
              url: fanpage.url,
              category: fanpage.category,
              description: fanpage.description,
            }
          : page
      );
      setFanpageItems((prev) =>
        prev.map((page) =>
          page.id === id
            ? {
                ...page,
                name: fanpage.name,
                url: fanpage.url,
                category: fanpage.category,
                description: fanpage.description,
              }
            : page
        )
      );
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật Fanpage.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFanpageItem = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteFanpage(id);
      toast.success("Đã xóa Fanpage thành công!");
      optimisticFanpageItems.current = optimisticFanpageItems.current.filter(
        (page) => page.id !== id
      );
      setFanpageItems((prev) => prev.filter((page) => page.id !== id));
      return true;
    } catch {
      toast.error("Có lỗi xảy ra khi xóa Fanpage.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Refresh all ───────────────────────────────────────────────────────────

  const refreshAll = useCallback(async () => {
    await Promise.all([loadNews(), loadFanpages()]);
  }, [loadNews, loadFanpages]);

  return {
    newsItems,
    fanpageItems,
    isLoading: isLoading || isLoadingFanpages,
    isLoadingNews: isLoading,
    isLoadingFanpages,
    isSubmitting,
    isAdmin,
    checkPassword,
    logoutAdmin,
    publishNews,
    editNewsItem,
    removeNewsItem,
    publishFanpage,
    editFanpageItem,
    removeFanpageItem,
    refreshNews: refreshAll,
    refreshFanpages: loadFanpages,
  };
}
