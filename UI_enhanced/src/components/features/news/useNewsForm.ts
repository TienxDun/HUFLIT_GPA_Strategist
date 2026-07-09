"use client";

import { useState } from "react";

import { type FanpageItem, type NewsItem } from "@/lib/api/news";

import { PRESET_THUMBNAILS } from "./news-constants";
import { type FanpageCategory, type FormType, type NewsCategory } from "./news-types";

export function useNewsForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FormType>("news");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState<NewsCategory>("announcement");
  const [thumbnailType, setThumbnailType] = useState<string>("announcement");
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
  const [fanpageName, setFanpageName] = useState("");
  const [fanpageUrl, setFanpageUrl] = useState("");
  const [fanpageCategory, setFanpageCategory] = useState<FanpageCategory[]>(["school"]);
  const [fanpageDescription, setFanpageDescription] = useState("");

  const close = () => {
    setIsOpen(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setSourceUrl("");
    setCategory("announcement");
    setThumbnailType("announcement");
    setCustomThumbnailUrl("");
    setFanpageName("");
    setFanpageUrl("");
    setFanpageCategory(["school"]);
    setFanpageDescription("");
  };

  const openCreate = (formType: FormType) => {
    setType(formType);
    setIsOpen(true);
  };

  const openNewsEdit = (item: NewsItem) => {
    const matchedThumbnail = PRESET_THUMBNAILS.find((thumbnail) => thumbnail.url === item.thumbnailUrl);

    setType("news");
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setSourceUrl(item.facebookUrl);
    setCategory(item.category);
    setThumbnailType(matchedThumbnail?.id || "custom");
    setCustomThumbnailUrl(matchedThumbnail ? "" : item.thumbnailUrl);
    setIsOpen(true);
  };

  const openFanpageEdit = (page: FanpageItem) => {
    setType("fanpage");
    setEditingId(page.id);
    setFanpageName(page.name);
    setFanpageUrl(page.url);
    setFanpageCategory(page.category);
    setFanpageDescription(page.description);
    setIsOpen(true);
  };

  return {
    isOpen,
    type,
    setType,
    editingId,
    news: {
      title,
      setTitle,
      description,
      setDescription,
      sourceUrl,
      setSourceUrl,
      category,
      setCategory,
      thumbnailType,
      setThumbnailType,
      customThumbnailUrl,
      setCustomThumbnailUrl,
    },
    fanpage: {
      name: fanpageName,
      setName: setFanpageName,
      url: fanpageUrl,
      setUrl: setFanpageUrl,
      category: fanpageCategory,
      setCategory: setFanpageCategory,
      description: fanpageDescription,
      setDescription: setFanpageDescription,
    },
    close,
    openCreate,
    openNewsEdit,
    openFanpageEdit,
  };
}

export type NewsFormState = ReturnType<typeof useNewsForm>;
