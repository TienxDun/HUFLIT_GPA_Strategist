import { fetchFeedbacks, submitFeedback } from "./feedback";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  facebookUrl: string;
  thumbnailUrl: string;
  category: "announcement" | "scholarship" | "activity" | "other";
  date: string;
}

export interface FanpageItem {
  id: string;
  name: string;
  url: string;
  category: "school" | "union" | "faculty" | "club" | "other";
  description: string;
}

export const DEFAULT_NEWS: NewsItem[] = [];

// Helper to parse dynamic actions & list items for News
// NOTE: row.type === "news" is used for ALL submissions (both actual news and fanpages)
// Fanpages are differentiated by details.contentType === "fanpage" inside the JSON content
export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const data = await fetchFeedbacks();
    const newsMap = new Map<string, NewsItem>();

    // Process from oldest to newest (the order Google Sheets returns)
    for (const row of data) {
      // Only process rows submitted as "news" type
      if (row.type !== "news") continue;

      try {
        const details = JSON.parse(row.content);

        // Skip fanpage records stored inside the news bucket
        if (details.contentType === "fanpage") continue;
        
        // Handle Delete Action
        if (details.action === "delete") {
          if (details.targetId) newsMap.delete(details.targetId);
          continue;
        }

        // Handle Update Action
        if (details.action === "update") {
          const originalId = details.originalId;
          if (originalId && newsMap.has(originalId)) {
            newsMap.set(originalId, {
              id: originalId,
              title: row.name,
              description: details.description || "",
              facebookUrl: details.facebookUrl || "",
              thumbnailUrl: details.thumbnailUrl || "",
              category: details.category || "announcement",
              date: row.timestamp || new Date().toLocaleDateString("vi-VN"),
            });
          }
          continue;
        }

        // Normal Create Record (prefer details.id, fallback to row.timestamp)
        const recordId = details.id || row.timestamp || String(Math.random());
        newsMap.set(recordId, {
          id: recordId,
          title: row.name,
          description: details.description || "",
          facebookUrl: details.facebookUrl || "",
          thumbnailUrl: details.thumbnailUrl || "",
          category: details.category || "announcement",
          date: row.timestamp || new Date().toLocaleDateString("vi-VN"),
        });

      } catch {
        // Fallback for old/raw format data (non-JSON content)
        const recordId = row.timestamp || String(Math.random());
        newsMap.set(recordId, {
          id: recordId,
          title: row.name || "Bản tin Facebook",
          description: "Nhấp để xem chi tiết thông báo trên Facebook.",
          facebookUrl: row.content,
          thumbnailUrl: "",
          category: "announcement",
          date: row.timestamp || new Date().toLocaleDateString("vi-VN"),
        });
      }
    }

    // Newest news at the top
    return Array.from(newsMap.values()).reverse();
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function addNews(news: Omit<NewsItem, "id" | "date">): Promise<boolean> {
  try {
    const uniqueId = "news_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
    const contentData = {
      id: uniqueId,
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

export async function updateNews(id: string, news: Omit<NewsItem, "id" | "date">): Promise<boolean> {
  try {
    const contentData = {
      action: "update",
      originalId: id,
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
    console.error("Error updating news:", error);
    return false;
  }
}

export async function deleteNews(id: string): Promise<boolean> {
  try {
    const contentData = {
      action: "delete",
      targetId: id,
    };

    return await submitFeedback({
      name: "Delete News",
      type: "news",
      content: JSON.stringify(contentData),
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    return false;
  }
}

// Helper to parse dynamic actions & list items for Fanpages
// NOTE: Fanpages are stored with type: "news" in Google Sheets (to bypass Apps Script whitelist),
// and differentiated by details.contentType === "fanpage" inside the JSON content
export async function fetchFanpages(): Promise<FanpageItem[]> {
  try {
    const data = await fetchFeedbacks();
    const fanpageMap = new Map<string, FanpageItem>();

    // Process from oldest to newest
    for (const row of data) {
      // Fanpages are submitted under "news" type with contentType:"fanpage" flag
      if (row.type !== "news") continue;

      try {
        const details = JSON.parse(row.content);

        // Only process fanpage-flagged records OR delete/update actions targeting fanpage IDs
        const isFanpageRecord = details.contentType === "fanpage";
        const isFanpageAction =
          (details.action === "delete" || details.action === "update") &&
          details.targetContentType === "fanpage";

        if (!isFanpageRecord && !isFanpageAction) continue;

        // Handle Delete Action
        if (details.action === "delete") {
          if (details.targetId) fanpageMap.delete(details.targetId);
          continue;
        }

        // Handle Update Action
        if (details.action === "update") {
          const originalId = details.originalId;
          if (originalId && fanpageMap.has(originalId)) {
            fanpageMap.set(originalId, {
              id: originalId,
              name: row.name,
              url: details.url || "",
              category: details.category || "other",
              description: details.description || "",
            });
          }
          continue;
        }

        // Normal Create Record
        const recordId = details.id || row.timestamp || String(Math.random());
        fanpageMap.set(recordId, {
          id: recordId,
          name: row.name,
          url: details.url || "",
          category: details.category || "other",
          description: details.description || "",
        });

      } catch {
        // Cannot parse as JSON — skip (not a fanpage row)
        continue;
      }
    }

    return Array.from(fanpageMap.values()).reverse();
  } catch (error) {
    console.error("Error fetching fanpages:", error);
    return [];
  }
}

export async function addFanpage(fanpage: Omit<FanpageItem, "id">): Promise<boolean> {
  try {
    const uniqueId = "page_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
    const contentData = {
      contentType: "fanpage",   // Flag to distinguish from actual news
      id: uniqueId,
      url: fanpage.url,
      category: fanpage.category,
      description: fanpage.description,
    };

    // Submit as type "news" so Google Apps Script does not filter it out
    return await submitFeedback({
      name: fanpage.name,
      type: "news",
      content: JSON.stringify(contentData),
    });
  } catch (error) {
    console.error("Error adding fanpage:", error);
    return false;
  }
}

export async function updateFanpage(id: string, fanpage: Omit<FanpageItem, "id">): Promise<boolean> {
  try {
    const contentData = {
      action: "update",
      targetContentType: "fanpage",  // Flag so fetchFanpages can identify this action
      originalId: id,
      url: fanpage.url,
      category: fanpage.category,
      description: fanpage.description,
    };

    // Submit as type "news" so Google Apps Script does not filter it out
    return await submitFeedback({
      name: fanpage.name,
      type: "news",
      content: JSON.stringify(contentData),
    });
  } catch (error) {
    console.error("Error updating fanpage:", error);
    return false;
  }
}

export async function deleteFanpage(id: string): Promise<boolean> {
  try {
    const contentData = {
      action: "delete",
      targetContentType: "fanpage",  // Flag so fetchFanpages can identify this action
      targetId: id,
    };

    // Submit as type "news" so Google Apps Script does not filter it out
    return await submitFeedback({
      name: "Delete Fanpage",
      type: "news",
      content: JSON.stringify(contentData),
    });
  } catch (error) {
    console.error("Error deleting fanpage:", error);
    return false;
  }
}


