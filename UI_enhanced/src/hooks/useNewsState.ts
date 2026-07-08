"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  fetchNews, 
  addNews, 
  updateNews,
  deleteNews,
  type NewsItem, 
  fetchFanpages, 
  addFanpage, 
  updateFanpage,
  deleteFanpage,
  type FanpageItem 
} from "@/lib/api/news";
import { toast } from "sonner";

export function useNewsState() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [fanpageItems, setFanpageItems] = useState<FanpageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFanpages, setIsLoadingFanpages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load news list
  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNews();
      setNewsItems(data);
    } catch (error) {
      console.error("Failed to load news items:", error);
      toast.error("Không thể tải bản tin từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load fanpage list
  const loadFanpages = useCallback(async () => {
    setIsLoadingFanpages(true);
    try {
      const data = await fetchFanpages();
      setFanpageItems(data);
    } catch (error) {
      console.error("Failed to load fanpage items:", error);
      toast.error("Không thể tải danh sách Fanpage từ hệ thống.");
    } finally {
      setIsLoadingFanpages(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    loadFanpages();
  }, [loadNews, loadFanpages]);

  // Auth password check
  const checkPassword = useCallback((password: string) => {
    if (password === "adminne") {
      setIsAdmin(true);
      toast.success("Xác thực quản trị viên thành công!");
      return true;
    } else {
      toast.error("Mật khẩu không chính xác!");
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    toast.info("Đã đăng xuất tài khoản quản trị.");
  }, []);

  // Post news
  const publishNews = async (news: Omit<NewsItem, "id" | "date">) => {
    if (!news.title || news.title.trim().length < 5) {
      toast.error("Tiêu đề bản tin phải có ít nhất 5 ký tự");
      return false;
    }
    if (!news.facebookUrl || !news.facebookUrl.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Facebook hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await addNews(news);
      if (success) {
        toast.success("Đã đăng bản tin thành công!");
        loadNews(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi đăng bản tin. Vui lòng thử lại sau.");
        return false;
      }
    } catch (error) {
      console.error("Error publishing news:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit news
  const editNewsItem = async (id: string, news: Omit<NewsItem, "id" | "date">) => {
    if (!news.title || news.title.trim().length < 5) {
      toast.error("Tiêu đề bản tin phải có ít nhất 5 ký tự");
      return false;
    }
    if (!news.facebookUrl || !news.facebookUrl.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Facebook hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await updateNews(id, news);
      if (success) {
        toast.success("Cập nhật bản tin thành công!");
        loadNews(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật bản tin. Vui lòng thử lại sau.");
        return false;
      }
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete news
  const removeNewsItem = async (id: string) => {
    setIsSubmitting(true);
    try {
      const success = await deleteNews(id);
      if (success) {
        toast.success("Đã xóa bản tin thành công!");
        loadNews(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi xóa bản tin.");
        return false;
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Post fanpage
  const publishFanpage = async (fanpage: Omit<FanpageItem, "id">) => {
    if (!fanpage.name || fanpage.name.trim().length < 5) {
      toast.error("Tên fanpage phải có ít nhất 5 ký tự");
      return false;
    }
    if (!fanpage.url || !fanpage.url.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Fanpage hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await addFanpage(fanpage);
      if (success) {
        toast.success("Đã thêm Fanpage thành công!");
        loadFanpages(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi thêm Fanpage. Vui lòng thử lại sau.");
        return false;
      }
    } catch (error) {
      console.error("Error publishing fanpage:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit fanpage
  const editFanpageItem = async (id: string, fanpage: Omit<FanpageItem, "id">) => {
    if (!fanpage.name || fanpage.name.trim().length < 5) {
      toast.error("Tên fanpage phải có ít nhất 5 ký tự");
      return false;
    }
    if (!fanpage.url || !fanpage.url.trim().startsWith("http")) {
      toast.error("Vui lòng nhập link Fanpage hợp lệ (bắt đầu bằng http)");
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await updateFanpage(id, fanpage);
      if (success) {
        toast.success("Cập nhật Fanpage thành công!");
        loadFanpages(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật Fanpage.");
        return false;
      }
    } catch (error) {
      console.error("Error updating fanpage:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete fanpage
  const removeFanpageItem = async (id: string) => {
    setIsSubmitting(true);
    try {
      const success = await deleteFanpage(id);
      if (success) {
        toast.success("Đã xóa Fanpage thành công!");
        loadFanpages(); // run in background, do not block UI
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi xóa Fanpage.");
        return false;
      }
    } catch (error) {
      console.error("Error deleting fanpage:", error);
      toast.error("Lỗi kết nối máy chủ");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setIsLoadingFanpages(true);
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


