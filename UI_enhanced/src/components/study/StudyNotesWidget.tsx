"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  FileText, 
  X, 
  Copy, 
  Trash2, 
  Check, 
  Sparkles, 
  Plus, 
  Search, 
  Download, 
  Edit3, 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered,
  CheckSquare, 
  Code, 
  Quote,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  RemoveFormatting,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: number;
}

interface StudyNotesWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_MULTI_KEY = "huflit_study_multi_notes";
const STORAGE_OLD_KEY = "huflit_study_notes";

const NOTE_CATEGORIES = ["Tất cả", "Học tập", "Dự án", "Công thức", "Cá nhân"];

// Helper to convert legacy markdown text into clean rich HTML for Word-like rendering
function markdownToHtml(md: string): string {
  if (!md) return "<p><br></p>";
  // If it already looks like HTML, return as is
  if (/<[a-z][\s\S]*>/i.test(md)) return md;

  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(255,255,255,0.06);padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);font-family:monospace;margin:8px 0;"><code>$1</code></pre>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:16px;font-weight:bold;margin:10px 0 4px;color:#f1f5f9;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:18px;font-weight:bold;margin:12px 0 6px;color:#f8fafc;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:22px;font-weight:800;margin:14px 0 8px;color:#ffffff;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote style="border-left:4px solid #10b981;background:rgba(16,185,129,0.08);padding:6px 12px;margin:8px 0;border-radius:0 8px 8px 0;color:#cbd5e1;font-style:italic;">$1</blockquote>');

  // Checklists
  html = html.replace(/^- \[x\] (.*$)/gim, '<div class="todo-item" style="display:flex;align-items:center;gap:8px;margin:4px 0;"><input type="checkbox" checked style="cursor:pointer;width:15px;height:15px;accent-color:#10b981;" /><span style="text-decoration:line-through;opacity:0.7;">$1</span></div>');
  html = html.replace(/^- \[ \] (.*$)/gim, '<div class="todo-item" style="display:flex;align-items:center;gap:8px;margin:4px 0;"><input type="checkbox" style="cursor:pointer;width:15px;height:15px;accent-color:#10b981;" /><span>$1</span></div>');

  // Bold, Italic, Inline Code
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:6px;color:#6ee7b7;font-family:monospace;font-size:12px;">$1</code>');

  // Bullet items
  html = html.replace(/^- (.*$)/gim, '<li style="margin-left:18px;list-style-type:disc;">$1</li>');

  // Line breaks to paragraphs / br
  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<pre") || trimmed.startsWith("<div") || trimmed.startsWith("<li")) {
        return trimmed;
      }
      return `<p style="margin:6px 0;line-height:1.6;">${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

const DEFAULT_NOTES: StudyNote[] = [
  {
    id: "note-1",
    title: "📝 Kế hoạch & Công thức học tập",
    category: "Học tập",
    content: markdownToHtml(`# Kế hoạch học tập tuần này 🚀\n\n## 🎯 Mục tiêu quan trọng\n- [x] Hoàn thành bài tập lớn môn Lập trình Web\n- [ ] Ôn tập 50 từ vựng Tiếng Anh chuyên ngành\n- [ ] Đọc trước chương 4 môn Cơ sở dữ liệu\n\n## 💡 Công thức cần ghi nhớ\n> **GPA = Tổng (Điểm môn x Số tín chỉ) / Tổng số tín chỉ**\n\n\`\`\`javascript\n// Lưu ý cú pháp xử lý mảng\nconst highGrades = subjects.filter(s => s.grade >= 8.5);\n\`\`\`\n\nChúc bạn có một buổi học thật năng suất! ✨`),
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "note-2",
    title: "📚 Từ vựng Tiếng Anh chuyên ngành",
    category: "Học tập",
    content: markdownToHtml(`### Từ vựng hữu ích ngành CNTT:\n- **Scalability**: Khả năng mở rộng hệ thống\n- **Concurrency**: Tính đồng thời\n- **Latency**: Độ trễ mạng\n- **Throughput**: Băng thông xử lý`),
    updatedAt: Date.now() - 7200000,
  }
];

export const StudyNotesWidget = ({ isOpen, onClose }: StudyNotesWidgetProps) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Vừa xong");
  const [noteToDelete, setNoteToDelete] = useState<StudyNote | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);

  // Formatting active states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes on mount
  useEffect(() => {
    try {
      const savedMulti = localStorage.getItem(STORAGE_MULTI_KEY);
      if (savedMulti) {
        const parsed: StudyNote[] = JSON.parse(savedMulti);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map(n => ({
            ...n,
            content: markdownToHtml(n.content)
          }));
          setNotes(formatted);
          setActiveNoteId(formatted[0].id);
          return;
        }
      }

      // Check migration from old single note
      const oldNote = localStorage.getItem(STORAGE_OLD_KEY);
      if (oldNote) {
        const migratedNote: StudyNote = {
          id: `note-${Date.now()}`,
          title: "Ghi chú nhanh",
          category: "Học tập",
          content: markdownToHtml(oldNote),
          updatedAt: Date.now(),
        };
        const initial = [migratedNote, ...DEFAULT_NOTES];
        setNotes(initial);
        setActiveNoteId(migratedNote.id);
        localStorage.setItem(STORAGE_MULTI_KEY, JSON.stringify(initial));
        return;
      }

      // Default fallback
      setNotes(DEFAULT_NOTES);
      setActiveNoteId(DEFAULT_NOTES[0].id);
      localStorage.setItem(STORAGE_MULTI_KEY, JSON.stringify(DEFAULT_NOTES));
    } catch {
      setNotes(DEFAULT_NOTES);
      setActiveNoteId(DEFAULT_NOTES[0].id);
    }
  }, []);

  // Update editor innerHTML when activeNoteId changes or modal opens
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0];
  }, [notes, activeNoteId]);

  const updateCountsFromDom = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const cleanText = text.trim();
    setWordCount(cleanText ? cleanText.split(/\s+/).length : 0);
    setCharCount(cleanText.length);
  }, []);

  useEffect(() => {
    if (editorRef.current && activeNote) {
      // Only overwrite if the content actually changed from another note
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || "<p><br></p>";
      }
      updateCountsFromDom();
    }
  }, [activeNoteId, isOpen, activeNote, updateCountsFromDom]);

  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Save notes to localStorage helper
  const saveNotesToStorage = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem(STORAGE_MULTI_KEY, JSON.stringify(updatedNotes));
      const now = new Date();
      setLastSavedTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      );
    } catch {}
  };

  // Filtered notes by search query and category
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchCat = selectedCategory === "Tất cả" || n.category === selectedCategory;
      const strippedContent = n.content.replace(/<[^>]*>/g, "").toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strippedContent.includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [notes, selectedCategory, searchQuery]);

  // Actions
  const handleCreateNote = () => {
    const newNote: StudyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: "Ghi chú mới",
      category: selectedCategory === "Tất cả" ? "Học tập" : selectedCategory,
      content: "<p>Bắt đầu ghi chép nội dung tại đây...</p>",
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    setActiveNoteId(newNote.id);
    toast.success("Đã tạo ghi chú mới");
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id ? { ...n, title: newTitle, updatedAt: Date.now() } : n
    );
    saveNotesToStorage(updated);
  };

  const handleEditorInput = () => {
    if (!editorRef.current || !activeNote) return;
    const newHtml = editorRef.current.innerHTML;
    updateCountsFromDom();

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const updated = notes.map((n) =>
        n.id === activeNote.id ? { ...n, content: newHtml, updatedAt: Date.now() } : n
      );
      saveNotesToStorage(updated);
    }, 400);
  };

  const handleUpdateCategory = (newCat: string) => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id ? { ...n, category: newCat, updatedAt: Date.now() } : n
    );
    saveNotesToStorage(updated);
    toast.success(`Đã chuyển sang danh mục: ${newCat}`);
  };

  const promptDeleteNote = (note: StudyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      toast.error("Phải giữ lại ít nhất một bản ghi chú");
      return;
    }
    setNoteToDelete(note);
  };

  const handleConfirmDeleteNote = () => {
    if (!noteToDelete) return;
    const idToDelete = noteToDelete.id;
    const updated = notes.filter((n) => n.id !== idToDelete);
    saveNotesToStorage(updated);
    if (activeNoteId === idToDelete) {
      setActiveNoteId(updated[0].id);
    }
    toast.success(`Đã xoá ghi chú "${noteToDelete.title}"`);
    setNoteToDelete(null);
  };

  // Check and update active formatting state for toolbar buttons
  const checkActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {}
  }, []);

  // WYSIWYG Command Execution Helper (Word Style)
  const execFormat = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    checkActiveFormats();
    handleEditorInput();
  };

  // Custom Todo Checkbox Insert
  const insertChecklist = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const todoHtml = '<div class="todo-item" style="display:flex;align-items:center;gap:8px;margin:4px 0;"><input type="checkbox" style="cursor:pointer;width:16px;height:16px;accent-color:#10b981;" /><span>Việc cần làm...</span></div>';
    document.execCommand("insertHTML", false, todoHtml);
    handleEditorInput();
  };

  // Custom Code Snippet Insert
  const insertCodeSnippet = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const codeHtml = '<pre style="background:rgba(255,255,255,0.06);padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);font-family:monospace;margin:8px 0;color:#6ee7b7;"><code>// Nhập mã nguồn tại đây...</code></pre><p><br></p>';
    document.execCommand("insertHTML", false, codeHtml);
    handleEditorInput();
  };

  // Text Highlight (Dạ quang vàng neon)
  const toggleHighlight = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("hiliteColor", false, "#fef08a");
    handleEditorInput();
  };

  // Blockquote
  const toggleQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("formatBlock", false, "<blockquote>");
    handleEditorInput();
  };

  const handleCopy = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Đã sao chép nội dung văn bản");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote || !editorRef.current) return;
    const element = document.createElement("a");
    const rawText = editorRef.current.innerText || "";
    const file = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    const safeTitle = activeNote.title.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, "_");
    element.download = `${safeTitle || "ghi_chu"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Đã tải xuống ${element.download}`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <React.Fragment key="notes-widget-fragment">
            {/* Transparent Click-Outside Backdrop */}
            <div
              key="notes-backdrop"
              className="fixed inset-0 z-40 cursor-pointer"
              onClick={onClose}
            />

            {/* Main Notes Modal Window */}
            <motion.div
              key="notes-modal-panel"
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[88vw] max-w-5xl h-[650px] max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-[#12141a]/98 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] text-white overflow-hidden select-none"
            >
              {/* LEFT SIDEBAR: NOTE LIST & SEARCH */}
              <div className="w-full md:w-72 lg:w-80 flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] shrink-0 h-[220px] md:h-full">
                {/* Header Sidebar */}
                <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm tracking-wide text-white">Ghi chú ({notes.length})</span>
                  </div>

                  <button
                    onClick={handleCreateNote}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo mới</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="p-2.5 border-b border-white/10">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm ghi chú..."
                      className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    {Boolean(searchQuery) && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto custom-study-scroll pt-2 pb-0.5">
                    {NOTE_CATEGORIES.map((cat, idx) => (
                      <button
                        key={cat || `note-cat-${idx}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-white text-slate-950 shadow-sm"
                            : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note Item List */}
                <div className="flex-1 overflow-y-auto custom-study-scroll p-2 space-y-1.5">
                  {filteredNotes.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 text-xs italic">
                      Không tìm thấy ghi chú nào
                    </div>
                  ) : (
                    filteredNotes.map((note, noteIdx) => {
                      const isActive = note.id === activeNoteId;
                      const plainPreview = note.content.replace(/<[^>]*>/g, "").trim() || "Chưa có nội dung...";
                      const preview = plainPreview.length > 50 ? plainPreview.substring(0, 50) + "..." : plainPreview;
                      const dateStr = new Date(note.updatedAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "numeric",
                      });

                      return (
                        <div
                          key={note.id || `note-card-${noteIdx}`}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`group relative p-2.5 rounded-2xl transition-all cursor-pointer border ${
                            isActive
                              ? "bg-emerald-500/15 border-emerald-500/40 shadow-sm"
                              : "bg-white/[0.02] hover:bg-white/[0.06] border-white/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <h4
                              className={`text-xs font-bold truncate flex-1 ${
                                isActive ? "text-emerald-300" : "text-white"
                              }`}
                            >
                              {note.title || "Ghi chú không tên"}
                            </h4>

                            <button
                              onClick={(e) => promptDeleteNote(note, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all"
                              title="Xóa ghi chú"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal leading-relaxed">
                            {preview}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-slate-500">
                            <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-semibold">
                              {note.category}
                            </span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT MAIN: WYSIWYG WORD-LIKE RICH TEXT EDITOR */}
              {activeNote ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                  {/* Top Toolbar */}
                  <div className="p-3 border-b border-white/10 flex flex-col gap-2 shrink-0 bg-white/[0.01]">
                    {/* Note Title Input & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <input
                          type="text"
                          value={activeNote.title}
                          onChange={(e) => handleUpdateTitle(e.target.value)}
                          placeholder="Tiêu đề ghi chú..."
                          className="w-full bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b focus:border-emerald-400 pb-0.5 transition-colors"
                        />
                      </div>

                      {/* Header Quick Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleCopy}
                          className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Sao chép toàn bộ văn bản"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={handleDownload}
                          className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Tải xuống file .txt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={onClose}
                          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                          title="Đóng (Esc)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Word-Style Rich Text Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-white/5 text-xs">
                      {/* Undo / Redo */}
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => execFormat("undo")}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Hoàn tác (Ctrl+Z)"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("redo")}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Làm lại (Ctrl+Y)"
                        >
                          <Redo2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Headings / Block format */}
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => execFormat("formatBlock", "<h1>")}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Tiêu đề lớn (H1)"
                        >
                          <Heading1 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("formatBlock", "<h2>")}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Tiêu đề vừa (H2)"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("formatBlock", "<h3>")}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Tiêu đề nhỏ (H3)"
                        >
                          <Heading3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bold, Italic, Underline, Strikethrough */}
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => execFormat("bold")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.bold ? "bg-emerald-500 text-slate-950 font-black shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="In đậm (Ctrl+B)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("italic")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.italic ? "bg-emerald-500 text-slate-950 font-black shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="In nghiêng (Ctrl+I)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("underline")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.underline ? "bg-emerald-500 text-slate-950 font-black shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Gạch chân (Ctrl+U)"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("strikeThrough")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.strikethrough ? "bg-emerald-500 text-slate-950 font-black shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Gạch ngang chữ"
                        >
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={toggleHighlight}
                          className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 cursor-pointer"
                          title="Bút dạ quang (Highlight)"
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lists & Tasks */}
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => execFormat("insertUnorderedList")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.unorderedList ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Danh sách gạch đầu dòng (Bullets)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("insertOrderedList")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.orderedList ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Danh sách đánh số (1, 2, 3...)"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={insertChecklist}
                          className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                          title="Việc cần làm (Checklist)"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quotes & Code */}
                      <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={toggleQuote}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Khối trích dẫn (Quote)"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={insertCodeSnippet}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Khối mã code"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Alignment */}
                      <div className="hidden lg:flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => execFormat("justifyLeft")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyLeft ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn trái"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("justifyCenter")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyCenter ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn giữa"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormat("justifyRight")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyRight ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn phải"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Clear Formatting */}
                      <button
                        type="button"
                        onClick={() => execFormat("removeFormat")}
                        className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Xóa định dạng"
                      >
                        <RemoveFormatting className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* WYSIWYG ContentEditable Document Body */}
                  <div className="flex-1 flex overflow-hidden p-4">
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onKeyUp={checkActiveFormats}
                      onMouseUp={checkActiveFormats}
                      onSelect={checkActiveFormats}
                      className="w-full h-full overflow-y-auto custom-study-scroll p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-sm text-slate-100 leading-relaxed outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 selection:bg-emerald-500/30 font-sans space-y-2 cursor-text"
                      style={{
                        minHeight: "100%",
                      }}
                    />
                  </div>

                  {/* Footer Info Bar */}
                  <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      {/* Category Dropdown */}
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        <select
                          value={activeNote.category}
                          onChange={(e) => handleUpdateCategory(e.target.value)}
                          className="bg-transparent text-slate-300 text-[10px] font-bold focus:outline-none cursor-pointer"
                        >
                          {NOTE_CATEGORIES.filter(c => c !== "Tất cả").map((cat, cIdx) => (
                            <option key={cat || `cat-opt-${cIdx}`} value={cat} className="bg-slate-900 text-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Tự động lưu ({lastSavedTime})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{wordCount} từ</span>
                      <span>•</span>
                      <span>{charCount} ký tự</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                  Chọn hoặc tạo một ghi chú để bắt đầu
                </div>
              )}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Modern Custom Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDeleteNote}
        title="Xác nhận xóa ghi chú"
        description="Bạn có chắc chắn muốn xóa bản ghi chú này không? Thao tác này không thể hoàn tác."
        itemName={noteToDelete?.title}
        confirmText="Xóa ghi chú"
        cancelText="Hủy bỏ"
      />
    </>
  );
};
