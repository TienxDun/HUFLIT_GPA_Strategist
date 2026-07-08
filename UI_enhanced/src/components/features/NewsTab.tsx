"use client";

import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  Lock, 
  Plus, 
  LogOut, 
  ExternalLink, 
  Info, 
  Calendar, 
  Tag, 
  Loader2, 
  RefreshCw 
} from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { useNewsState } from "@/hooks/useNewsState";
import { type NewsItem } from "@/lib/api/news";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

// Preset Unsplash images for thumbnails to make the UI look stunning
const PRESET_THUMBNAILS = [
  {
    id: "announcement",
    label: "Thông báo học vụ",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "activity",
    label: "Hoạt động & Sự kiện",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "scholarship",
    label: "Học bổng & Khen thưởng",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "general",
    label: "Tin tức chung",
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop",
  },
];

const CATEGORY_MAP = {
  announcement: { label: "Thông báo", color: "bg-red-50 text-red-600 border-red-200/60" },
  scholarship: { label: "Học bổng", color: "bg-amber-50 text-amber-600 border-amber-200/60" },
  activity: { label: "Hoạt động", color: "bg-sky-50 text-sky-600 border-sky-200/60" },
  other: { label: "Tin tức khác", color: "bg-slate-50 text-slate-600 border-slate-200/60" },
};

export const NewsTab = memo(() => {
  const {
    newsItems,
    isLoading,
    isSubmitting,
    isAdmin,
    checkPassword,
    logoutAdmin,
    publishNews,
    refreshNews,
  } = useNewsState();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Dialog controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [category, setCategory] = useState<"announcement" | "scholarship" | "activity" | "other">("announcement");
  const [thumbType, setThumbType] = useState<string>("announcement");
  const [customThumbUrl, setCustomThumbUrl] = useState("");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = checkPassword(passwordInput);
    if (success) {
      setPasswordInput("");
      setIsAuthOpen(false);
      setIsFormOpen(true);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose thumbnail URL based on selection
    let thumbnailUrl = "";
    if (thumbType === "custom") {
      thumbnailUrl = customThumbUrl.trim() || PRESET_THUMBNAILS[0].url;
    } else {
      const selectedPreset = PRESET_THUMBNAILS.find(p => p.id === thumbType);
      thumbnailUrl = selectedPreset ? selectedPreset.url : PRESET_THUMBNAILS[0].url;
    }

    const success = await publishNews({
      title,
      description,
      facebookUrl: fbUrl,
      category,
      thumbnailUrl,
    });

    if (success) {
      // Clear inputs
      setTitle("");
      setDescription("");
      setFbUrl("");
      setCustomThumbUrl("");
      setIsFormOpen(false);
    }
  };

  // Helper to format Facebook embed URL safely
  const getEmbedUrl = (url: string) => {
    let cleanUrl = url.trim();
    // Support mobile URLs
    cleanUrl = cleanUrl.replace("m.facebook.com", "www.facebook.com");
    cleanUrl = cleanUrl.replace("mobile.facebook.com", "www.facebook.com");
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(cleanUrl)}&show_text=true&width=500`;
  };

  // Filter items
  const filteredNews = newsItems.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="space-y-6 pb-8 min-w-full">
      {/* Header section with Filter Controls and Admin button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bản tin Sinh viên</h2>
            <p className="text-xs text-slate-500 font-medium">Cập nhật thông báo và các hoạt động của trường</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNews}
            disabled={isLoading}
            className="rounded-2xl border-slate-200/80 hover:bg-slate-50 font-semibold text-slate-600 ml-auto md:ml-0 gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Tải lại
          </Button>

          {isAdmin ? (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsFormOpen(true)}
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-1 sm:flex-none gap-1.5 shadow-sm shadow-blue-100"
              >
                <Plus className="h-4 w-4" />
                Đăng tin mới
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logoutAdmin}
                className="rounded-2xl hover:bg-red-50 text-red-500 font-semibold gap-1.5 px-3"
                title="Đăng xuất quản trị viên"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Thoát Admin</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuthOpen(true)}
              className="rounded-2xl border-slate-200/80 hover:bg-slate-50 text-slate-600 font-semibold gap-1.5 w-full sm:w-auto"
            >
              <Lock className="h-4 w-4 text-slate-400" />
              Quản trị Bản tin
            </Button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 py-1 -mx-2 px-2 scrollbar-none">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          size="sm"
          className="rounded-full font-semibold px-4 shrink-0 transition-all duration-300"
        >
          Tất cả
        </Button>
        {Object.entries(CATEGORY_MAP).map(([key, config]) => (
          <Button
            key={key}
            variant={activeCategory === key ? "default" : "outline"}
            onClick={() => setActiveCategory(key)}
            size="sm"
            className="rounded-full font-semibold px-4 shrink-0 transition-all duration-300"
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* News Grid */}
      {isLoading && newsItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4 opacity-80" />
          <p className="font-semibold text-slate-600">Đang tải danh sách bản tin...</p>
          <p className="text-xs mt-1 text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100">
          <Newspaper className="h-12 w-12 text-slate-300 mb-4 opacity-50" />
          <h3 className="font-semibold text-slate-700 text-lg">Không tìm thấy bản tin nào</h3>
          <p className="text-sm mt-1 text-slate-400 max-w-sm text-center">
            Hiện chưa có bản tin nào thuộc danh mục này, hoặc kết nối dữ liệu bị gián đoạn.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, index) => {
              const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.other;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                  className="flex flex-col bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedNews(item)}
                >
                  {/* Thumbnail Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.thumbnailUrl || PRESET_THUMBNAILS[3].url} 
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge variant="outline" className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-sm ${catConfig.color} bg-white/95 backdrop-blur-xs`}>
                        {catConfig.label}
                      </Badge>
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 flex flex-col p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors text-[15px]">
                      {item.title}
                    </h3>
                    
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed flex-1">
                      {item.description}
                    </p>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-blue-600 text-xs font-bold mt-auto">
                      <span className="group-hover:underline">Xem thông báo chi tiết</span>
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FB Embed Modal Viewer */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-slate-950/40 border-none backdrop-blur-lg rounded-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]">
          {selectedNews && (
            <>
              <DialogHeader className="p-4 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0 mt-0.5">
                    <FacebookIcon className="h-5 w-5 fill-current" />
                  </div>
                  <div className="pr-6">
                    <DialogTitle className="text-slate-800 font-bold text-sm line-clamp-1">
                      {selectedNews.title}
                    </DialogTitle>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedNews.date}</span>
                      <span>&bull;</span>
                      <span className="text-blue-500 font-bold">Facebook Embed</span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Webview Area */}
              <div className="flex-1 overflow-y-auto bg-slate-100 flex items-center justify-center p-3 sm:p-6 min-h-[400px]">
                {selectedNews.facebookUrl.includes("facebook.com") ? (
                  <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/60 shadow-md overflow-hidden flex flex-col items-center">
                    <iframe
                      src={getEmbedUrl(selectedNews.facebookUrl)}
                      width="100%"
                      height="500"
                      style={{ border: "none", overflow: "hidden" }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      className="mx-auto"
                    />
                    <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 w-full flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Bài viết nhúng từ Fanpage HUFLIT</span>
                      <a
                        href={selectedNews.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Mở Facebook
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  // Fallback for normal links (e.g. portal)
                  <div className="max-w-md w-full bg-white rounded-3xl p-6 text-center shadow-lg border border-slate-100">
                    <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-800 mb-2">Liên kết cổng thông tin</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      Liên kết này dẫn tới Cổng thông tin chính thức Portal HUFLIT. Bạn có thể mở liên kết để xem bài viết gốc.
                    </p>
                    <a
                      href={selectedNews.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-sm"
                    >
                      Truy cập trang nguồn
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Auth Modal */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-slate-100 p-5 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-slate-400" />
              Xác thực Quản trị viên
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Vui lòng nhập mật khẩu quản trị để thực hiện chỉnh sửa bản tin
            </p>
          </DialogHeader>

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs font-bold text-slate-600">Mật khẩu</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="Nhập pass admin..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500"
                autoFocus
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold rounded-xl py-2.5"
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* News Creation Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg rounded-3xl border-slate-100 p-6 bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Đăng bản tin mới
            </DialogTitle>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Điền thông tin và nhúng link Facebook để đăng tin tức hiển thị trực tuyến
            </p>
          </DialogHeader>

          <form onSubmit={handlePublish} className="space-y-4 pt-3">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="news-title" className="text-xs font-bold text-slate-600">Tiêu đề bản tin *</Label>
              <Input
                id="news-title"
                type="text"
                required
                placeholder="Nhập tiêu đề tin tức..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="news-desc" className="text-xs font-bold text-slate-600">Mô tả ngắn *</Label>
              <textarea
                id="news-desc"
                required
                rows={3}
                placeholder="Nhập tóm tắt nội dung tin tức..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-xl border border-slate-200/80 bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Facebook URL */}
            <div className="space-y-1.5">
              <Label htmlFor="news-fb" className="text-xs font-bold text-slate-600">Link bài viết Facebook *</Label>
              <Input
                id="news-fb"
                type="url"
                required
                placeholder="Dán link bài viết hoặc ảnh của Facebook tại đây..."
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
              />
              <p className="text-[10px] text-slate-400 font-semibold">
                Hỗ trợ các link dạng: https://www.facebook.com/photo/?fbid=... hoặc link bài viết công khai.
              </p>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Danh mục bản tin</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(CATEGORY_MAP).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key as any)}
                    className={`px-3 py-2 border rounded-xl font-semibold text-xs text-center transition-all ${
                      category === key
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnail Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Hình ảnh đại diện</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_THUMBNAILS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setThumbType(p.id)}
                    className={`relative h-16 rounded-xl border overflow-hidden transition-all text-left ${
                      thumbType === p.id 
                        ? "ring-2 ring-blue-600 border-blue-600" 
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.label} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-slate-950/40 p-1.5 flex items-end">
                      <span className="text-[9px] font-bold text-white leading-none line-clamp-1">{p.label}</span>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setThumbType("custom")}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center transition-all font-bold text-xs ${
                    thumbType === "custom"
                      ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Tag className="h-4 w-4 mb-1" />
                  <span>Link ảnh tự do</span>
                </button>
              </div>
            </div>

            {/* Custom Thumbnail URL Input */}
            {thumbType === "custom" && (
              <div className="space-y-1.5">
                <Label htmlFor="custom-thumb" className="text-xs font-bold text-slate-600">Link hình ảnh đại diện</Label>
                <Input
                  id="custom-thumb"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={customThumbUrl}
                  onChange={(e) => setCustomThumbUrl(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus-visible:ring-blue-500 text-xs"
                />
              </div>
            )}

            <DialogFooter className="pt-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 shadow-sm shadow-blue-100 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng tin tức...
                  </>
                ) : (
                  <>
                    Đăng bản tin
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

NewsTab.displayName = "NewsTab";
