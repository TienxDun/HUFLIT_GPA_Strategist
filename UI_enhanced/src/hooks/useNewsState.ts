"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchNews, addNews, type NewsItem } from "@/lib/api/news";
import { toast } from "sonner";

export function useNewsState() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    loadNews();
  }, [loadNews]);

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
        await loadNews(); // reload to get new list
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

  return {
    newsItems,
    isLoading,
    isSubmitting,
    isAdmin,
    checkPassword,
    logoutAdmin,
    publishNews,
    refreshNews: loadNews,
  };
}
