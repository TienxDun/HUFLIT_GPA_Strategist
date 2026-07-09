import React from "react";

import { PRESET_THUMBNAILS, URL_PREVIEW_STYLES } from "./news-constants";

export function getUrlPreview(url: string) {
  const fallback = {
    host: "liên kết nguồn",
    label: "Website",
    tone: "bg-slate-50 text-slate-600 border-slate-200",
    accent: "from-slate-700/80 to-slate-500/65",
  };

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const style = URL_PREVIEW_STYLES.find((item) =>
      item.match.some((domain) => host.includes(domain))
    );

    return {
      host,
      label: style?.label || fallback.label,
      tone: style?.tone || fallback.tone,
      accent: style?.accent || fallback.accent,
    };
  } catch {
    return fallback;
  }
}

export function getEmbeddedImageUrl(url: string, fallbackUrl: string = PRESET_THUMBNAILS[3].url) {
  try {
    const parsed = new URL(url);

    if (/\.(avif|gif|jpe?g|png|webp)$/i.test(parsed.pathname)) {
      return url;
    }

    const youtubeId = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.split("/").filter(Boolean)[0]
      : parsed.searchParams.get("v");

    return youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
      : `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=900`;
  } catch {
    return fallbackUrl;
  }
}

export function getThumbnailUrl(type: string, customUrl: string) {
  if (type === "custom") {
    return customUrl.trim() || PRESET_THUMBNAILS[0].url;
  }

  return PRESET_THUMBNAILS.find((thumbnail) => thumbnail.id === type)?.url || PRESET_THUMBNAILS[0].url;
}

export function formatDisplayDate(value?: string) {
  if (!value) return "";

  const parsed = parseVietnameseDate(value);
  if (!parsed) return value;

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs >= 0) {
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Vừa cập nhật";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

export function countByCategory<T extends { category: string | string[] }>(items: T[]) {
  const counts: Record<string, number> = { all: items.length };
  for (const item of items) {
    const cats = Array.isArray(item.category) ? item.category : [item.category];
    for (const cat of cats) {
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
  }
  return counts;
}

export function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openOnKeyboard(event: React.KeyboardEvent, url: string) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  openExternalUrl(url);
}

function parseVietnameseDate(value: string) {
  const match = value
    .trim()
    .match(/^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s+)?(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    const parsed = new Date(value.trim());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [, hour = "0", minute = "0", second = "0", day, month, year] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
}
