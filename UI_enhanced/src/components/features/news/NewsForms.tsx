"use client";

import { AlignLeft, FileText, Link2, Type } from "lucide-react";

import { FANPAGE_CATEGORIES, NEWS_CATEGORIES } from "./news-constants";
import { ChoiceGrid, SubmitButton, TextareaField, TextInputField } from "./FormFields";
import { type FanpageCategory, type NewsCategory } from "./news-types";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { type NewsFormState } from "./useNewsForm";

export function NewsForm({
  form,
  isEditing,
  isSubmitting,
  onSubmit,
}: {
  form: NewsFormState["news"];
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <TextInputField
        id="news-title"
        label="Tiêu đề bản tin *"
        icon={<Type className="h-4 w-4" />}
        required
        placeholder="Nhập tiêu đề tin tức..."
        value={form.title}
        onChange={form.setTitle}
      />
      <TextareaField
        className="md:row-span-2"
        id="news-desc"
        label="Mô tả ngắn *"
        icon={<AlignLeft className="h-4 w-4" />}
        required
        rows={2}
        placeholder="Nhập tóm tắt nội dung tin tức..."
        value={form.description}
        onChange={form.setDescription}
      />
      <TextInputField
        id="news-fb"
        label="Đường dẫn nguồn bản tin *"
        icon={<Link2 className="h-4 w-4" />}
        type="url"
        required
        placeholder="https://huflit.edu.vn/... hoặc https://www.facebook.com/..."
        value={form.sourceUrl}
        onChange={form.setSourceUrl}
        helpText="Hỗ trợ URL đa dạng: website HUFLIT, Portal, Facebook, Google Form/Drive, YouTube hoặc trang thông báo khác."
      />
      <ChoiceGrid
        className="md:col-span-2"
        label="Danh mục bản tin"
        columnsClassName="grid-cols-2 sm:grid-cols-4"
        items={NEWS_CATEGORIES}
        selected={form.category}
        onSelect={(category) => form.setCategory(category as NewsCategory)}
      />
      <ThumbnailPicker
        className="md:col-span-2"
        selected={form.thumbnailType}
        onSelect={form.setThumbnailType}
      />
      {form.thumbnailType === "custom" && (
        <TextInputField
          className="md:col-span-2"
          id="custom-thumb"
          label="Link hình ảnh đại diện"
          icon={<Link2 className="h-4 w-4" />}
          type="url"
          placeholder="https://example.com/image.jpg"
          value={form.customThumbnailUrl}
          onChange={form.setCustomThumbnailUrl}
        />
      )}
      <SubmitButton
        className="md:col-span-2"
        isSubmitting={isSubmitting}
        loadingText={isEditing ? "Đang cập nhật..." : "Đang đăng bản tin..."}
        text={isEditing ? "Cập nhật bản tin" : "Đăng bản tin"}
      />
    </form>
  );
}

export function FanpageForm({
  form,
  isEditing,
  isSubmitting,
  onSubmit,
}: {
  form: NewsFormState["fanpage"];
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
      <TextInputField
        id="page-name"
        label="Tên Fanpage / Liên kết *"
        icon={<FileText className="h-4 w-4" />}
        required
        placeholder="Ví dụ: Đoàn - Hội Khoa Công nghệ thông tin..."
        value={form.name}
        onChange={form.setName}
      />
      <TextInputField
        id="page-url"
        label="Đường dẫn liên kết (Facebook URL) *"
        icon={<Link2 className="h-4 w-4" />}
        type="url"
        required
        placeholder="https://www.facebook.com/..."
        value={form.url}
        onChange={form.setUrl}
      />
      <ChoiceGrid
        className="md:col-span-2"
        label="Phân loại liên kết"
        columnsClassName="grid-cols-2 sm:grid-cols-5"
        itemClassName="px-2 text-xs font-bold"
        items={FANPAGE_CATEGORIES}
        selected={form.category}
        onSelect={(category) => form.setCategory(category as FanpageCategory)}
      />
      <TextareaField
        className="md:col-span-2"
        id="page-desc"
        label="Mô tả ngắn"
        icon={<AlignLeft className="h-4 w-4" />}
        rows={2}
        placeholder="Nhập mô tả ngắn về kênh thông tin này..."
        value={form.description}
        onChange={form.setDescription}
      />
      <SubmitButton
        className="md:col-span-2"
        isSubmitting={isSubmitting}
        loadingText={isEditing ? "Đang cập nhật..." : "Đang lưu liên kết..."}
        text={isEditing ? "Cập nhật liên kết" : "Lưu liên kết"}
      />
    </form>
  );
}
