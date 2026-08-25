"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  FileText, 
  X, 
  Copy, 
  Trash2, 
  Check, 
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
  Tag,
  Clock,
  Sun,
  Moon
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
const STORAGE_THEME_KEY = "huflit_study_notes_theme";

const NOTE_CATEGORIES = ["Tất cả", "Học tập", "Dự án", "Công thức", "Cá nhân"];

const CATEGORY_COLORS: Record<string, { bgDark: string; textDark: string; borderDark: string; bgLight: string; textLight: string; borderLight: string }> = {
  "Học tập": { 
    bgDark: "bg-emerald-500/15", textDark: "text-emerald-300", borderDark: "border-emerald-500/30",
    bgLight: "bg-emerald-50", textLight: "text-emerald-700", borderLight: "border-emerald-300"
  },
  "Dự án": { 
    bgDark: "bg-sky-500/15", textDark: "text-sky-300", borderDark: "border-sky-500/30",
    bgLight: "bg-sky-50", textLight: "text-sky-700", borderLight: "border-sky-300"
  },
  "Công thức": { 
    bgDark: "bg-amber-500/15", textDark: "text-amber-300", borderDark: "border-amber-500/30",
    bgLight: "bg-amber-50", textLight: "text-amber-700", borderLight: "border-amber-300"
  },
  "Cá nhân": { 
    bgDark: "bg-purple-500/15", textDark: "text-purple-300", borderDark: "border-purple-500/30",
    bgLight: "bg-purple-50", textLight: "text-purple-700", borderLight: "border-purple-300"
  },
};

// Helper to convert legacy markdown text into clean rich HTML for Word-like rendering
function markdownToHtml(md: string): string {
  if (!md) return "<p><br></p>";
  
  let cleaned = md.replace(/#fef08a/g, "rgba(251, 191, 36, 0.25)").replace(/#ffff00/g, "rgba(251, 191, 36, 0.25)");

  // If it already looks like HTML, return cleaned
  if (/<[a-z][\s\S]*>/i.test(cleaned)) return cleaned;

  let html = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Checklists
  html = html.replace(/^- \[x\] (.*$)/gim, '<div class="todo-item"><input type="checkbox" checked="true" class="todo-checkbox" /><span class="todo-checked-text">$1</span></div>');
  html = html.replace(/^- \[ \] (.*$)/gim, '<div class="todo-item"><input type="checkbox" class="todo-checkbox" /><span>$1</span></div>');

  // Bold, Italic, Inline Code
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bullet items
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');

  // Line breaks to paragraphs / br
  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<pre") || trimmed.startsWith("<div") || trimmed.startsWith("<li")) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isLight = theme === "light";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_THEME_KEY, nextTheme);
    toast.success(
      nextTheme === "light"
        ? "Đã chuyển sang giao diện Sáng (Light Theme)"
        : "Đã chuyển sang giao diện Tối (Dark Theme)"
    );
  };

  // Formatting active states
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    highlight: false,
    h1: false,
    h2: false,
    h3: false,
    quote: false,
    code: false,
    todo: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notes and theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      const savedMulti = localStorage.getItem(STORAGE_MULTI_KEY);
      if (savedMulti) {
        const parsed: StudyNote[] = JSON.parse(savedMulti);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0) {
            const formatted = parsed.map((n) => ({
              ...n,
              content: markdownToHtml(n.content),
            }));
            setNotes(formatted);
            setActiveNoteId(formatted[0].id);
          } else {
            setNotes([]);
            setActiveNoteId("");
          }
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
    return notes.find((n) => n.id === activeNoteId) || null;
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
      const strippedContent = n.content.replace(/<[^>]*>/g, " ").toLowerCase();
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
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  const handleUpdateCategory = (newCat: string, targetNoteId?: string) => {
    const noteId = targetNoteId || activeNote?.id;
    if (!noteId) return;
    const updated = notes.map((n) =>
      n.id === noteId ? { ...n, category: newCat, updatedAt: Date.now() } : n
    );
    saveNotesToStorage(updated);
    toast.success(`Đã chuyển sang danh mục: ${newCat}`);
  };

  const promptDeleteNote = (note: StudyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(note);
  };

  const handleConfirmDeleteNote = () => {
    if (!noteToDelete) return;
    const idToDelete = noteToDelete.id;
    const updated = notes.filter((n) => n.id !== idToDelete);
    saveNotesToStorage(updated);
    if (activeNoteId === idToDelete) {
      setActiveNoteId(updated.length > 0 ? updated[0].id : "");
    }
    toast.success(`Đã xoá ghi chú "${noteToDelete.title}"`);
    setNoteToDelete(null);
  };

  // Helper to find closest mark or highlight element in selection
  const getHighlightElement = useCallback((selection: Selection | null): HTMLElement | null => {
    if (!selection || !editorRef.current) return null;
    let node: Node | null = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement) {
        if (node.tagName === "MARK" || node.classList.contains("study-highlight")) {
          return node;
        }
        const bg = node.style.backgroundColor;
        // Chỉ nhận diện các màu vàng / highlight thực sự, không nhận nhầm màu nền tối của editor
        if (bg && (bg.includes("250, 204, 21") || bg.includes("251, 191, 36") || bg.includes("254, 240, 138") || bg === "rgb(254, 240, 138)" || bg === "#fef08a" || bg === "yellow")) {
          return node;
        }
      }
      node = node.parentNode;
    }
    return null;
  }, []);

  // Helper check if current text selection has highlight
  const isSelectionHighlighted = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return false;
    return getHighlightElement(selection) !== null;
  }, [getHighlightElement]);

  // Check and update active formatting state for toolbar buttons
  const checkActiveFormats = useCallback(() => {
    try {
      let isInsideCode = false;
      let isInsideTodo = false;
      let block = "";
      try {
        block = (document.queryCommandValue("formatBlock") || "").toLowerCase().replace(/[<>]/g, "");
      } catch {}

      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        let curr: Node | null = selection.anchorNode;
        while (curr && curr !== editorRef.current) {
          if (curr instanceof HTMLElement) {
            const tag = curr.tagName.toLowerCase();
            if (tag === "pre" || tag === "code") {
              isInsideCode = true;
            }
            if (curr.classList.contains("todo-item")) {
              isInsideTodo = true;
            }
            if (["h1", "h2", "h3", "blockquote"].includes(tag)) {
              block = tag;
            }
          }
          curr = curr.parentNode;
        }
      }

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikeThrough"),
        highlight: isSelectionHighlighted(),
        h1: block === "h1",
        h2: block === "h2",
        h3: block === "h3",
        quote: block === "blockquote",
        code: isInsideCode,
        todo: isInsideTodo,
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
    } catch {}
  }, [isSelectionHighlighted]);

  // WYSIWYG Command Execution Helper (Word Style)
  const execFormat = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    checkActiveFormats();
    handleEditorInput();
  };

  // Toggle Heading (H1, H2, H3) - Click again to revert to normal paragraph
  const toggleHeading = (tag: "h1" | "h2" | "h3") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    let currentBlock = "";
    try {
      currentBlock = (document.queryCommandValue("formatBlock") || "").toLowerCase().replace(/[<>]/g, "");
    } catch {}
    
    if (currentBlock === tag || activeFormats[tag]) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    checkActiveFormats();
    handleEditorInput();
  };

  // Custom Todo Checkbox Insert (Khởi tạo Checklist thông minh)
  const insertChecklist = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!selection.isCollapsed) {
      // 1. Chuyển đổi các dòng văn bản đang bôi đen thành Checklist
      const selectedText = selection.toString();
      const lines = selectedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        const todosHtml = lines
          .map(line => `<div class="todo-item"><input type="checkbox" class="todo-checkbox" /><span>${line}</span></div>`)
          .join("");
        document.execCommand("insertHTML", false, todosHtml + "<p><br></p>");
      } else {
        document.execCommand("insertHTML", false, '<div class="todo-item"><input type="checkbox" class="todo-checkbox" /><span>Việc cần làm...</span></div><p><br></p>');
      }
    } else {
      // 2. Chèn dòng to-do mới và tự động bôi đen chữ placeholder để gõ đè ngay
      const todoDiv = document.createElement("div");
      todoDiv.className = "todo-item";
      todoDiv.innerHTML = '<input type="checkbox" class="todo-checkbox" /><span>Việc cần làm...</span>';
      
      const nextP = document.createElement("p");
      nextP.innerHTML = "<br>";

      range.deleteContents();
      range.insertNode(nextP);
      range.insertNode(todoDiv);

      const span = todoDiv.querySelector("span");
      if (span) {
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    checkActiveFormats();
    handleEditorInput();
  };

  // Custom Code Snippet Insert (Khởi tạo Khối mã Code thông minh)
  const insertCodeSnippet = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!selection.isCollapsed) {
      // 1. Bọc đoạn code/văn bản đang bôi đen vào thẻ pre code
      const selectedText = selection.toString();
      const escaped = selectedText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const codeHtml = `<pre><code>${escaped}</code></pre><p><br></p>`;
      document.execCommand("insertHTML", false, codeHtml);
    } else {
      // 2. Chèn khối code mới và tự động bôi đen placeholder để gõ code ngay
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = "// Nhập mã nguồn tại đây...";
      pre.appendChild(code);

      const nextP = document.createElement("p");
      nextP.innerHTML = "<br>";

      range.deleteContents();
      range.insertNode(nextP);
      range.insertNode(pre);

      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    checkActiveFormats();
    handleEditorInput();
  };

  // Text Highlight Toggle (Bật / Tắt Highlight vàng ấm dịu pastel)
  const toggleHighlight = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const existingHighlight = getHighlightElement(selection);

    if (existingHighlight) {
      // 1. TẮT HIGHLIGHT: Gỡ bỏ thẻ mark và giữ lại nội dung text
      const parent = existingHighlight.parentNode;
      if (parent) {
        while (existingHighlight.firstChild) {
          parent.insertBefore(existingHighlight.firstChild, existingHighlight);
        }
        parent.removeChild(existingHighlight);
        parent.normalize();
      }
    } else {
      // 2. BẬT HIGHLIGHT:
      const range = selection.getRangeAt(0);
      if (selection.isCollapsed) {
        // Nếu không bôi đen text -> Chèn thẻ mark để gõ tiếp
        const mark = document.createElement("mark");
        mark.className = "study-highlight";
        mark.textContent = "\u200B"; // zero-width space
        range.insertNode(mark);
        
        const newRange = document.createRange();
        newRange.selectNodeContents(mark);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Bôi đen text -> Bọc vùng chọn vào thẻ mark
        try {
          const mark = document.createElement("mark");
          mark.className = "study-highlight";
          const fragment = range.extractContents();
          mark.appendChild(fragment);
          range.insertNode(mark);

          // Giữ vùng chọn bôi đen vào đoạn vừa highlight
          const newRange = document.createRange();
          newRange.selectNodeContents(mark);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch {
          // Fallback với execCommand nếu gặp cấu trúc phức tạp
          document.execCommand("hiliteColor", false, "rgba(250, 204, 21, 0.35)");
        }
      }
    }
    
    checkActiveFormats();
    handleEditorInput();
  };

  // Blockquote toggle
  const toggleQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    let currentBlock = "";
    try {
      currentBlock = (document.queryCommandValue("formatBlock") || "").toLowerCase().replace(/[<>]/g, "");
    } catch {}

    if (currentBlock === "blockquote" || activeFormats.quote) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    checkActiveFormats();
    handleEditorInput();
  };

  // Comprehensive Clear Formatting handler (Xóa toàn bộ style inline, block heading, quote, highlight, checklist)
  const handleClearFormat = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // 1. Native clear formatting for inline text styles (Bold, Italic, Underline, Strikethrough)
    try {
      document.execCommand("removeFormat", false, undefined);
      document.execCommand("formatBlock", false, "<p>");
      document.execCommand("justifyLeft", false, undefined);
    } catch {}

    // 2. DOM-level cleanup for custom blocks (mark/highlight, todo items, code blocks)
    const range = selection.getRangeAt(0);
    let containerNode: Node | null = range.commonAncestorContainer;
    if (containerNode.nodeType === Node.TEXT_NODE) {
      containerNode = containerNode.parentNode;
    }

    if (containerNode && editorRef.current.contains(containerNode)) {
      // Gỡ toàn bộ thẻ mark trong vùng chọn
      const marks = (containerNode instanceof HTMLElement ? containerNode : editorRef.current).querySelectorAll("mark, .study-highlight");
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
        }
      });

      // Nếu đang đứng trong thẻ mark hoặc thẻ todo
      let ancestor: Node | null = selection.anchorNode;
      while (ancestor && ancestor !== editorRef.current) {
        if (ancestor instanceof HTMLElement) {
          if (ancestor.tagName === "MARK" || ancestor.classList.contains("study-highlight")) {
            const parent = ancestor.parentNode;
            if (parent) {
              while (ancestor.firstChild) {
                parent.insertBefore(ancestor.firstChild, ancestor);
              }
              parent.removeChild(ancestor);
            }
            break;
          }
          if (ancestor.classList.contains("todo-item")) {
            const text = ancestor.innerText.replace("Việc cần làm...", "").trim();
            const p = document.createElement("p");
            p.textContent = text || "";
            ancestor.parentNode?.replaceChild(p, ancestor);
            break;
          }
          if (ancestor.tagName === "PRE") {
            const text = ancestor.innerText;
            const p = document.createElement("p");
            p.textContent = text || "";
            ancestor.parentNode?.replaceChild(p, ancestor);
            break;
          }
        }
        ancestor = ancestor.parentNode;
      }
    }

    checkActiveFormats();
    handleEditorInput();
    toast.success("Đã xóa định dạng");
  };

  // Interactive Checklist Checkbox Clicking
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      if (target.checked) {
        target.setAttribute("checked", "true");
        const sibling = target.nextElementSibling;
        if (sibling) sibling.classList.add("todo-checked-text");
      } else {
        target.removeAttribute("checked");
        const sibling = target.nextElementSibling;
        if (sibling) sibling.classList.remove("todo-checked-text");
      }
      handleEditorInput();
    }
  };

  // Smart Keyboard Handlers (Tab indent & Enter in todo/quote/code & Backspace in todo)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    let node: Node | null = selection.anchorNode;
    let todoItem: HTMLElement | null = null;
    let preBlock: HTMLElement | null = null;

    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement) {
        if (node.classList.contains("todo-item")) {
          todoItem = node;
        }
        if (node.tagName === "PRE") {
          preBlock = node;
        }
      }
      node = node.parentNode;
    }

    // 1. Tab key indent / outdent (Hỗ trợ lồng list khi ở <li> hoặc chèn 2 khoảng trắng)
    if (e.key === "Tab") {
      e.preventDefault();
      let isInsideList = false;
      let checkNode: Node | null = selection.anchorNode;
      while (checkNode && checkNode !== editorRef.current) {
        if (checkNode instanceof HTMLElement && checkNode.tagName === "LI") {
          isInsideList = true;
          break;
        }
        checkNode = checkNode.parentNode;
      }

      if (isInsideList) {
        if (e.shiftKey) {
          document.execCommand("outdent");
        } else {
          document.execCommand("indent");
        }
      } else {
        document.execCommand("insertText", false, "  ");
      }
      handleEditorInput();
      return;
    }

    // 2. Inside Code Block (<pre>) - Nhấn Ctrl+Enter hoặc Shift+Enter để thoát khối code
    if (preBlock) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const nextP = document.createElement("p");
        nextP.innerHTML = "<br>";
        preBlock.parentNode?.insertBefore(nextP, preBlock.nextSibling);

        const newRange = document.createRange();
        newRange.selectNodeContents(nextP);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        handleEditorInput();
        return;
      }
    }

    // 3. Inside Todo Item (.todo-item)
    if (todoItem) {
      if (e.key === "Enter" && !e.shiftKey) {
        const text = todoItem.innerText.trim();
        if (!text || text === "Việc cần làm...") {
          // Todo đang trống -> nhấn Enter để thoát về dòng văn bản thường
          e.preventDefault();
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          todoItem.parentNode?.replaceChild(p, todoItem);
          
          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          handleEditorInput();
          return;
        } else {
          // Todo có chữ -> tự động sinh dòng todo tiếp theo
          e.preventDefault();
          const nextTodo = document.createElement("div");
          nextTodo.className = "todo-item";
          nextTodo.innerHTML = '<input type="checkbox" class="todo-checkbox" /><span>&nbsp;</span>';
          todoItem.parentNode?.insertBefore(nextTodo, todoItem.nextSibling);

          const span = nextTodo.querySelector("span");
          if (span) {
            const range = document.createRange();
            range.selectNodeContents(span);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          handleEditorInput();
          return;
        }
      }

      // Nhấn Backspace ở dòng todo trống -> chuyển về đoạn văn bình thường
      if (e.key === "Backspace") {
        const text = todoItem.innerText.trim();
        if (!text || text === "Việc cần làm...") {
          e.preventDefault();
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          todoItem.parentNode?.replaceChild(p, todoItem);

          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          handleEditorInput();
          return;
        }
      }
    }
  };

  // Helper trích xuất text sạch kèm định dạng Checklist [x] / [ ] khi Copy hoặc Tải file
  const getCleanExportText = (container: HTMLElement): string => {
    const clone = container.cloneNode(true) as HTMLElement;
    const todoItems = clone.querySelectorAll(".todo-item");
    todoItems.forEach((item) => {
      const checkbox = item.querySelector<HTMLInputElement>("input[type='checkbox']");
      const isChecked = checkbox?.checked || checkbox?.getAttribute("checked") === "true";
      const prefix = isChecked ? "- [x] " : "- [ ] ";
      const span = item.querySelector("span");
      const text = (span?.innerText || item.textContent || "").trim();
      const p = document.createElement("p");
      p.textContent = prefix + text;
      item.parentNode?.replaceChild(p, item);
    });
    return clone.innerText || "";
  };

  const handleCopy = () => {
    if (!editorRef.current) return;
    const text = getCleanExportText(editorRef.current);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Đã sao chép nội dung văn bản");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote || !editorRef.current) return;
    const element = document.createElement("a");
    const rawText = getCleanExportText(editorRef.current);
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto cursor-pointer"
              onClick={onClose}
            />

            {/* Main Notes Modal Window */}
            <motion.div
              key="notes-modal-panel"
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`relative z-10 w-[95vw] sm:w-[90vw] max-w-5xl h-[680px] max-h-[92vh] flex flex-col md:flex-row rounded-3xl backdrop-blur-2xl overflow-hidden select-none transition-colors duration-200 pointer-events-auto transform-gpu will-change-transform ${
                isLight
                  ? "bg-[#fafafc]/98 border border-slate-200/90 shadow-[0_25px_80px_rgba(0,0,0,0.18)] text-slate-800"
                  : "bg-[#0f1117]/96 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)] text-white"
              }`}
            >
              {/* LEFT SIDEBAR: NOTE LIST & SEARCH */}
              <div
                className={`w-full md:w-72 lg:w-80 flex flex-col border-b md:border-b-0 md:border-r shrink-0 h-[220px] md:h-full transition-colors duration-200 ${
                  isLight ? "border-slate-200/80 bg-slate-100/70" : "border-white/10 bg-white/[0.015]"
                }`}
              >
                {/* Header Sidebar */}
                <div
                  className={`p-3.5 px-4 border-b flex items-center justify-between gap-2 transition-colors duration-200 ${
                    isLight ? "border-slate-200/80" : "border-white/10"
                  }`}
                >
                  <div>
                    <span
                      className={`font-extrabold text-sm tracking-tight block leading-tight ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      Ghi chú
                    </span>
                    <span className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {notes.length} bản ghi
                    </span>
                  </div>

                  <button
                    onClick={handleCreateNote}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95 text-xs font-bold transition-all cursor-pointer ${
                      isLight
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25"
                        : "bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Tạo mới</span>
                  </button>
                </div>

                {/* Search Bar & Category Filters */}
                <div
                  className={`p-3 border-b space-y-2.5 transition-colors duration-200 ${
                    isLight ? "border-slate-200/80" : "border-white/10"
                  }`}
                >
                  <div className="relative flex items-center">
                    <Search
                      className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${
                        isLight ? "text-slate-400" : "text-slate-400"
                      }`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm nội dung ghi chú..."
                      className={`w-full pl-8.5 pr-8 py-1.5 rounded-xl border text-xs transition-all ${
                        isLight
                          ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 shadow-xs"
                          : "bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/70 focus:bg-white/[0.07]"
                      }`}
                    />
                    {Boolean(searchQuery) && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className={`absolute right-2.5 ${isLight ? "text-slate-400 hover:text-slate-700" : "text-slate-400 hover:text-white"}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5 pb-0.5">
                    {NOTE_CATEGORIES.map((cat, idx) => (
                      <button
                        key={cat || `note-cat-${idx}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? isLight
                              ? "bg-slate-900 text-white shadow-sm font-extrabold"
                              : "bg-white text-slate-950 shadow-md font-extrabold"
                            : isLight
                              ? "bg-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent"
                              : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note Item List */}
                <div className="flex-1 overflow-y-auto custom-study-scroll p-2.5 space-y-2">
                  {filteredNotes.length === 0 ? (
                    <div className={`py-12 text-center text-xs italic space-y-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                      <FileText className="w-6 h-6 mx-auto opacity-30" />
                      <p>Không tìm thấy ghi chú nào</p>
                    </div>
                  ) : (
                    filteredNotes.map((note, noteIdx) => {
                      const isActive = note.id === activeNoteId;
                      // Tách các thẻ HTML bằng khoảng trắng để tránh dính chữ
                      const plainPreview = note.content
                        .replace(/<[^>]*>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim() || "Chưa có nội dung...";
                      const preview = plainPreview.length > 55 ? plainPreview.substring(0, 55) + "..." : plainPreview;
                      const noteDate = new Date(note.updatedAt);
                      const timeStr = `${noteDate.getHours().toString().padStart(2, "0")}:${noteDate.getMinutes().toString().padStart(2, "0")}`;
                      const dateStr = `${timeStr} ${noteDate.getDate()}/${noteDate.getMonth() + 1}`;
                      const catStyle = CATEGORY_COLORS[note.category] || { 
                        bgDark: "bg-white/10", textDark: "text-slate-300", borderDark: "border-white/10",
                        bgLight: "bg-slate-100", textLight: "text-slate-700", borderLight: "border-slate-300"
                      };

                      return (
                        <div
                          key={note.id || `note-card-${noteIdx}`}
                          onClick={() => setActiveNoteId(note.id)}
                          className={`group relative p-3.5 rounded-2xl transition-all cursor-pointer border text-left ${
                            isActive
                              ? isLight
                                ? "bg-white border-emerald-500/70 shadow-sm shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                                : "bg-white/[0.08] border-emerald-400/50 shadow-lg shadow-black/40 ring-1 ring-emerald-400/25"
                              : isLight
                                ? "bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                                : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-xs font-bold truncate flex-1 tracking-tight ${
                                isActive
                                  ? isLight ? "text-emerald-700 font-extrabold" : "text-emerald-300 font-bold"
                                  : isLight ? "text-slate-800 group-hover:text-slate-950 font-semibold" : "text-slate-200 group-hover:text-white font-semibold"
                              }`}
                            >
                              {note.title || "Ghi chú không tên"}
                            </h4>

                            <button
                              onClick={(e) => promptDeleteNote(note, e)}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all cursor-pointer ${
                                isLight
                                  ? "hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                                  : "hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                              }`}
                              title="Xóa ghi chú"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className={`text-[11px] line-clamp-2 mt-1.5 font-normal leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                            {preview}
                          </p>

                          <div
                            className={`flex items-center justify-between mt-3 pt-2.5 border-t text-[10px] ${
                              isLight ? "border-slate-100" : "border-white/5"
                            }`}
                          >
                            {/* Interactive Category Tag Selector Dropdown on Note Card */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="relative inline-flex items-center group/tag"
                              title="Bấm để đổi danh mục"
                            >
                              <Tag className={`w-2.5 h-2.5 absolute left-1.5 pointer-events-none ${isLight ? catStyle.textLight : catStyle.textDark}`} />
                              <select
                                value={note.category}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCategory(e.target.value, note.id);
                                }}
                                className={`pl-5 pr-3.5 py-0.5 rounded-md text-[9px] font-bold border cursor-pointer appearance-none focus:outline-none transition-all ${
                                  isLight
                                    ? `${catStyle.bgLight} ${catStyle.textLight} ${catStyle.borderLight} hover:brightness-95 shadow-2xs`
                                    : `${catStyle.bgDark} ${catStyle.textDark} ${catStyle.borderDark} hover:bg-white/10`
                                }`}
                              >
                                {NOTE_CATEGORIES.filter((c) => c !== "Tất cả").map((cat, cIdx) => (
                                  <option
                                    key={cat || `cat-opt-${cIdx}`}
                                    value={cat}
                                    className={isLight ? "bg-white text-slate-900" : "bg-slate-900 text-white"}
                                  >
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              <span className={`pointer-events-none absolute right-1 text-[7px] font-mono opacity-60 ${isLight ? catStyle.textLight : catStyle.textDark}`}>
                                ▼
                              </span>
                            </div>

                            <span className={`font-mono text-[9px] flex items-center gap-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {dateStr}
                            </span>
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
                  <div
                    className={`p-3 px-5 border-b flex flex-col gap-2.5 shrink-0 transition-colors duration-200 ${
                      isLight ? "border-slate-200/80 bg-white/70" : "border-white/10 bg-white/[0.015]"
                    }`}
                  >
                    {/* Note Title Input & Actions */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={activeNote.title}
                          onChange={(e) => handleUpdateTitle(e.target.value)}
                          placeholder="Tiêu đề ghi chú..."
                          className={`w-full bg-transparent font-extrabold text-base sm:text-lg focus:outline-none focus:border-b pb-0.5 transition-colors tracking-tight ${
                            isLight
                              ? "text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
                              : "text-white placeholder:text-slate-500 focus:border-emerald-400"
                          }`}
                        />
                      </div>

                      {/* Header Quick Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Theme Toggle Button (Light/Dark) */}
                        <button
                          onClick={toggleTheme}
                          className={`p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                            isLight
                              ? "bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-700 shadow-2xs"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-amber-300 hover:text-amber-200"
                          }`}
                          title={isLight ? "Chuyển sang Giao diện Tối (Dark Theme)" : "Chuyển sang Giao diện Sáng (Light Theme)"}
                        >
                          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                          }`}
                          title="Sao chép toàn bộ văn bản"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">Sao chép</span>
                        </button>

                        <button
                          onClick={handleDownload}
                          className={`p-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                            isLight
                              ? "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                          }`}
                          title="Tải xuống file .txt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <div className={`w-[1px] h-4 mx-0.5 ${isLight ? "bg-slate-200" : "bg-white/10"}`} />

                        <button
                          onClick={onClose}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isLight ? "hover:bg-slate-200 text-slate-500 hover:text-slate-900" : "hover:bg-white/10 text-slate-400 hover:text-white"
                          }`}
                          title="Đóng (Esc)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Word-Style Rich Text Formatting Toolbar */}
                    <div
                      className={`flex flex-wrap items-center gap-1.5 pt-1.5 border-t text-xs ${
                        isLight ? "border-slate-200/60" : "border-white/5"
                      }`}
                    >
                      {/* Undo / Redo */}
                      <div
                        className={`flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("undo")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight ? "text-slate-600 hover:text-slate-900 hover:bg-white/80" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Hoàn tác (Ctrl+Z)"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("redo")}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isLight ? "text-slate-600 hover:text-slate-900 hover:bg-white/80" : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Làm lại (Ctrl+Y)"
                        >
                          <Redo2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Headings / Block format */}
                      <div
                        className={`flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleHeading("h1")}
                          className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            activeFormats.h1
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Tiêu đề lớn (H1) - Nhấn lần nữa để về thường"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleHeading("h2")}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            activeFormats.h2
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Tiêu đề vừa (H2) - Nhấn lần nữa để về thường"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleHeading("h3")}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                            activeFormats.h3
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Tiêu đề nhỏ (H3) - Nhấn lần nữa để về thường"
                        >
                          H3
                        </button>
                      </div>

                      {/* Bold, Italic, Underline, Strikethrough, Highlight */}
                      <div
                        className={`flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("bold")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.bold 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="In đậm (Ctrl+B)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("italic")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.italic 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="In nghiêng (Ctrl+I)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("underline")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.underline 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Gạch chân (Ctrl+U)"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("strikeThrough")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.strikethrough 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Gạch ngang chữ"
                        >
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={toggleHighlight}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.highlight 
                              ? isLight
                                ? "bg-amber-300 text-amber-950 font-bold shadow-xs border border-amber-400"
                                : "bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50 shadow-sm" 
                              : isLight
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-100/80"
                                : "text-amber-300 hover:text-amber-200 hover:bg-amber-500/20"
                          }`}
                          title={activeFormats.highlight ? "Bỏ bút dạ quang (Xóa highlight)" : "Bút dạ quang (Highlight vàng pastel)"}
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lists & Tasks */}
                      <div
                        className={`flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("insertUnorderedList")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.unorderedList 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Danh sách gạch đầu dòng (Bullets)"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("insertOrderedList")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.orderedList 
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-black border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Danh sách đánh số (1, 2, 3...)"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={insertChecklist}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.todo
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-emerald-600 hover:text-emerald-700 hover:bg-white/80"
                                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                          title="Thêm mục cần làm (Checklist)"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quotes & Code */}
                      <div
                        className={`flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={toggleQuote}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.quote
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Khối trích dẫn (Quote)"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={insertCodeSnippet}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.code
                              ? isLight
                                ? "bg-white text-emerald-700 font-black shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm"
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Khối mã code (Code Snippet - Thoát khối bằng Ctrl+Enter)"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Alignment */}
                      <div
                        className={`hidden lg:flex items-center rounded-xl p-0.5 border ${
                          isLight ? "bg-slate-200/60 border-slate-300/70" : "bg-white/[0.03] border-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("justifyLeft")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyLeft 
                              ? isLight
                                ? "bg-white text-emerald-700 font-bold shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn trái"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("justifyCenter")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyCenter 
                              ? isLight
                                ? "bg-white text-emerald-700 font-bold shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn giữa"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => execFormat("justifyRight")}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            activeFormats.justifyRight 
                              ? isLight
                                ? "bg-white text-emerald-700 font-bold shadow-xs border border-emerald-500/30"
                                : "bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm" 
                              : isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                                : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Căn phải"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Clear Formatting */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleClearFormat}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ml-auto ${
                          isLight
                            ? "bg-slate-200/60 hover:bg-slate-200 border-slate-300/70 text-slate-600 hover:text-slate-900"
                            : "bg-white/[0.03] hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
                        }`}
                        title="Xóa toàn bộ định dạng (Đưa về văn bản thuần túy)"
                      >
                        <RemoveFormatting className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* WYSIWYG ContentEditable Document Body (Seamless Spacious Canvas) */}
                  <div className="flex-1 flex overflow-hidden">
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onClick={handleEditorClick}
                      onKeyDown={handleEditorKeyDown}
                      onKeyUp={checkActiveFormats}
                      onMouseUp={checkActiveFormats}
                      onSelect={checkActiveFormats}
                      className={`${
                        isLight
                          ? "study-editor-content-light text-slate-800 selection:bg-emerald-200 selection:text-slate-950 bg-white/40"
                          : "study-editor-content text-slate-100 selection:bg-emerald-500/30 selection:text-white bg-transparent"
                      } w-full h-full overflow-y-auto custom-study-scroll px-8 py-6 text-sm sm:text-base leading-relaxed outline-none font-sans cursor-text space-y-1 transition-colors duration-200`}
                      style={{
                        minHeight: "100%",
                      }}
                    />
                  </div>

                  {/* Footer Info Bar */}
                  <div
                    className={`px-6 py-2.5 border-t flex items-center justify-between text-[11px] shrink-0 transition-colors duration-200 ${
                      isLight
                        ? "border-slate-200/80 bg-slate-100/70 text-slate-600"
                        : "border-white/10 bg-white/[0.015] text-slate-400"
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        Tự động lưu ({lastSavedTime})
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 text-[10px] font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      <span>{wordCount} từ</span>
                      <span>•</span>
                      <span>{charCount} ký tự</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center select-none ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 border ${isLight ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
                    <FileText className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                    Chưa có ghi chú nào
                  </h3>
                  <p className="text-xs max-w-xs mb-4 leading-relaxed">
                    Hãy bấm nút bên dưới để tạo bản ghi chú mới và bắt đầu ghi chép.
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      isLight
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Tạo ghi chú mới</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
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
