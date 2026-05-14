"use client";

import { useState, useEffect, useCallback } from "react";
import { Feedback, fetchFeedbacks, submitFeedback } from "@/lib/api/feedback";
import { toast } from "sonner";

export function useFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to load feedbacks", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const sendFeedback = async (data: Omit<Feedback, "timestamp">) => {
    if (!data.content || data.content.length < 10) {
      toast.error("Nội dung góp ý phải có ít nhất 10 ký tự");
      return false;
    }

    setIsSubmitting(true);
    try {
      const success = await submitFeedback(data);
      if (success) {
        toast.success("Cảm ơn bạn đã đóng góp ý kiến!");
        setTimeout(loadFeedbacks, 1000);
        return true;
      } else {
        toast.error("Có lỗi xảy ra khi gửi góp ý. Vui lòng thử lại sau.");
        return false;
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    feedbacks,
    isLoading,
    isSubmitting,
    sendFeedback,
    refreshFeedbacks: loadFeedbacks,
  };
}
