"use client";

import { Edit2, Plus } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { FanpageForm, NewsForm } from "./NewsForms";
import { type FormType } from "./news-types";
import { type NewsFormState } from "./useNewsForm";

export function NewsFormModal({
  form,
  isSubmitting,
  onSubmitFanpage,
  onSubmitNews,
}: {
  form: NewsFormState;
  isSubmitting: boolean;
  onSubmitFanpage: (event: React.FormEvent) => void;
  onSubmitNews: (event: React.FormEvent) => void;
}) {
  const isNews = form.type === "news";
  const isEditing = Boolean(form.editingId);

  return (
    <Dialog open={form.isOpen} onOpenChange={(open) => !open && form.close()}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border-slate-100 bg-white p-4 sm:max-h-[calc(100dvh-2rem)] sm:max-w-2xl sm:p-5 lg:max-w-3xl">
        <DialogHeader className="gap-1 pb-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-800 sm:text-lg">
            {isEditing ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
            {getFormTitle(form.type, isEditing)}
          </DialogTitle>
          <p className="text-[11px] font-medium leading-snug text-slate-400 sm:text-xs">
            {getFormDescription(form.type, isEditing)}
          </p>
        </DialogHeader>

        {!isEditing && <FormTypeTabs active={form.type} onChange={form.setType} />}

        {isNews ? (
          <NewsForm
            form={form.news}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitNews}
            pin={form.pin}
            setPin={form.setPin}
          />
        ) : (
          <FanpageForm
            form={form.fanpage}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitFanpage}
            pin={form.pin}
            setPin={form.setPin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function getFormTitle(type: FormType, isEditing: boolean) {
  if (isEditing) {
    return type === "news" ? "Chỉnh sửa bản tin" : "Chỉnh sửa kênh thông tin";
  }

  return type === "news" ? "Đăng bản tin mới" : "Thêm Fanpage hữu ích mới";
}

function getFormDescription(type: FormType, isEditing: boolean) {
  if (isEditing) {
    return "Cập nhật lại các thông tin của bản tin hoặc liên kết để hiển thị chính xác nhất";
  }

  return type === "news"
    ? "Điền thông tin và nhúng link Facebook để đăng tin tức hiển thị trực tuyến"
    : "Thêm fanpage, liên kết hữu ích để sinh viên mới dễ dàng theo dõi";
}

function FormTypeTabs({ active, onChange }: { active: FormType; onChange: (type: FormType) => void }) {
  return (
    <div className="mb-3 flex gap-3 border-b border-slate-100 pb-2">
      <FormTypeTab active={active === "news"} label="Đăng Bản tin" onClick={() => onChange("news")} />
      <FormTypeTab active={active === "fanpage"} label="Thêm Fanpage hữu ích" onClick={() => onChange("fanpage")} />
    </div>
  );
}

function FormTypeTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 cursor-pointer border-b-2 pb-1.5 text-center text-[11px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:text-xs",
        active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
      )}
    >
      {label}
    </button>
  );
}
