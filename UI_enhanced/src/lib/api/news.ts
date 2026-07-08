// News & Fanpages API layer — v2
// Schema: 2 dedicated Google Sheets (News, Fanpages) with fixed columns.
// Real UPDATE/DELETE by ID via Apps Script. No JSON blobs, no action-replay.

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyFR94GwrdhHVLXwue8sRI9JgfslRzfdVtoTK6jVzS1Rw3CKz9ICirH1-mtRRUCvzgV/exec";
// ── Public types ──────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  facebookUrl: string;
  thumbnailUrl: string;
  category: "announcement" | "scholarship" | "activity" | "other";
  date: string; // display-ready created_at string
}

export interface FanpageItem {
  id: string;
  name: string;
  url: string;
  category: "school" | "union" | "faculty" | "club" | "other";
  description: string;
  date: string; // display-ready created_at string
}

// ── Internal raw shapes (mirror Google Sheet column order) ────────────────────

interface RawNewsRow {
  id: string;
  title: string;
  description: string;
  facebook_url: string;
  thumbnail_url: string;
  category: string;
  created_at: string;
}

interface RawFanpageRow {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  created_at?: string;
}

// ── Transport helpers ─────────────────────────────────────────────────────────

async function apiFetch<T>(sheet: string): Promise<T[]> {
  const url = `${GOOGLE_SCRIPT_URL}?sheet=${sheet}&t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for sheet: ${sheet}`);
  return res.json();
}

async function apiPost(body: Record<string, unknown>): Promise<boolean> {
  // mode:'no-cors' — response is opaque; treat every call as success
  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  return true;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

function getCreatedAt(rawDate: string | undefined, id: string): string {
  if (rawDate) return rawDate;

  const timestamp = id.match(/^[a-z]+_(\d+)_/)?.[1];
  if (!timestamp) return "";

  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", { hour12: false });
}

// ── News CRUD ─────────────────────────────────────────────────────────────────

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const rows = await apiFetch<RawNewsRow>("news");
    return rows
      .filter((r) => r.id && r.title) // guard: skip invalid/old-format rows
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description || "",
        facebookUrl: r.facebook_url || "",
        thumbnailUrl: r.thumbnail_url || "",
        category: (r.category as NewsItem["category"]) || "other",
        date: getCreatedAt(r.created_at, r.id),
      }))
      .reverse();
  } catch (error) {
    console.error("fetchNews error:", error);
    return [];
  }
}

export async function addNews(
  item: Omit<NewsItem, "id" | "date">
): Promise<boolean> {
  try {
    return apiPost({
      sheet: "news",
      action: "create",
      id: generateId("news"),
      title: item.title,
      description: item.description,
      facebook_url: item.facebookUrl,
      thumbnail_url: item.thumbnailUrl,
      category: item.category,
      created_at: new Date().toLocaleString("vi-VN"),
    });
  } catch (error) {
    console.error("addNews error:", error);
    return false;
  }
}

export async function updateNews(
  id: string,
  item: Omit<NewsItem, "id" | "date">
): Promise<boolean> {
  try {
    return apiPost({
      sheet: "news",
      action: "update",
      id,
      title: item.title,
      description: item.description,
      facebook_url: item.facebookUrl,
      thumbnail_url: item.thumbnailUrl,
      category: item.category,
    });
  } catch (error) {
    console.error("updateNews error:", error);
    return false;
  }
}

export async function deleteNews(id: string): Promise<boolean> {
  try {
    return apiPost({ sheet: "news", action: "delete", id });
  } catch (error) {
    console.error("deleteNews error:", error);
    return false;
  }
}

// ── Fanpages CRUD ─────────────────────────────────────────────────────────────

export async function fetchFanpages(): Promise<FanpageItem[]> {
  try {
    const rows = await apiFetch<RawFanpageRow>("fanpages");
    return rows
      .filter((r) => r.id && r.name) // guard: skip invalid/old-format rows
      .map((r) => ({
        id: r.id,
        name: r.name,
        url: r.url || "",
        category: (r.category as FanpageItem["category"]) || "other",
        description: r.description || "",
        date: getCreatedAt(r.created_at, r.id),
      }))
      .reverse();
  } catch (error) {
    console.error("fetchFanpages error:", error);
    return [];
  }
}


export async function addFanpage(
  item: Omit<FanpageItem, "id" | "date">
): Promise<boolean> {
  try {
    return apiPost({
      sheet: "fanpages",
      action: "create",
      id: generateId("page"),
      name: item.name,
      url: item.url,
      category: item.category,
      description: item.description,
      created_at: new Date().toLocaleString("vi-VN"),
    });
  } catch (error) {
    console.error("addFanpage error:", error);
    return false;
  }
}

export async function updateFanpage(
  id: string,
  item: Omit<FanpageItem, "id" | "date">
): Promise<boolean> {
  try {
    return apiPost({
      sheet: "fanpages",
      action: "update",
      id,
      name: item.name,
      url: item.url,
      category: item.category,
      description: item.description,
    });
  } catch (error) {
    console.error("updateFanpage error:", error);
    return false;
  }
}

export async function deleteFanpage(id: string): Promise<boolean> {
  try {
    return apiPost({ sheet: "fanpages", action: "delete", id });
  } catch (error) {
    console.error("deleteFanpage error:", error);
    return false;
  }
}
