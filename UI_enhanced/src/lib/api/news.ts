import { fetchFeedbacks, submitFeedback, type Feedback } from "./feedback";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  facebookUrl: string;
  thumbnailUrl: string;
  category: "announcement" | "scholarship" | "activity" | "other";
  date: string;
}

export const DEFAULT_NEWS: NewsItem[] = [];

function parseNewsItem(row: Feedback): NewsItem | null {
  if (row.type !== "news") return null;

  try {
    const details = JSON.parse(row.content);
    return {
      id: row.timestamp || String(Math.random()),
      title: row.name,
      description: details.description || "",
      facebookUrl: details.facebookUrl || "",
      thumbnailUrl: details.thumbnailUrl || "",
      category: details.category || "announcement",
      date: row.timestamp || new Date().toLocaleDateString("vi-VN"),
    };
  } catch {
    // Fallback if the content is just a raw URL string
    return {
      id: row.timestamp || String(Math.random()),
      title: row.name || "Bản tin Facebook",
      description: "Nhấp để xem chi tiết thông báo trên Facebook.",
      facebookUrl: row.content,
      thumbnailUrl: "",
      category: "announcement",
      date: row.timestamp || new Date().toLocaleDateString("vi-VN"),
    };
  }
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const data = await fetchFeedbacks();
    const onlineNews = data
      .map(parseNewsItem)
      .filter((item): item is NewsItem => item !== null);

    // Sort: Online news usually shows up in order, but we can reverse onlineNews so newest is at the top.
    const sortedOnline = [...onlineNews].reverse();
    return sortedOnline;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function addNews(news: Omit<NewsItem, "id" | "date">): Promise<boolean> {
  try {
    const contentData = {
      description: news.description,
      facebookUrl: news.facebookUrl,
      thumbnailUrl: news.thumbnailUrl,
      category: news.category,
    };

    return await submitFeedback({
      name: news.title,
      type: "news",
      content: JSON.stringify(contentData),
    });
  } catch (error) {
    console.error("Error adding news:", error);
    return false;
  }
}
