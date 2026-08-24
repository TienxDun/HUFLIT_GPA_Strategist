"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  X, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreHorizontal, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Calendar, 
  Sparkles,
  AlertCircle,
  FolderPlus,
  ChevronDown,
  GripVertical,
  Columns,
  Check,
  AlignLeft
} from "lucide-react";
import { KanbanBoard, KanbanCard, KanbanColumn, KanbanChecklistItem } from "./study-types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface StudyTasksWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "huflit_study_kanban_boards_v3";
const ACTIVE_BOARD_KEY = "huflit_study_active_board_id_v3";

const DEFAULT_BOARDS: KanbanBoard[] = [
  {
    id: "board-default",
    title: "Nhiệm vụ học tập",
    createdAt: Date.now(),
    columns: [
      { id: "col-todo", title: "Cần làm", order: 1 },
      { id: "col-in-progress", title: "Đang làm", order: 2 },
      { id: "col-done", title: "Đã xong", order: 3 },
    ],
    cards: []
  }
];

export const StudyTasksWidget = ({ isOpen, onClose }: StudyTasksWidgetProps) => {
  const [boards, setBoards] = useState<KanbanBoard[]>(DEFAULT_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string>("board-default");
  // Delete Confirmation States
  const [boardToDelete, setBoardToDelete] = useState<KanbanBoard | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(null);
  const [cardToDelete, setCardToDelete] = useState<KanbanCard | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);

  // Quick Inline Add Card state: [columnId]: text
  const [addingCardColId, setAddingCardColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardPriority, setNewCardPriority] = useState<"high" | "medium" | "low">("medium");

  // Adding Column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Editing Column Title inline
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Card Modal Status Dropdown
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Board Dropdown & Editing
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [editingBoardTitleText, setEditingBoardTitleText] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBoards(parsed);
        }
      }
      const savedActive = localStorage.getItem(ACTIVE_BOARD_KEY);
      if (savedActive) {
        setActiveBoardId(savedActive);
      }
    } catch {}
  }, []);

  // Save to localStorage
  const saveBoards = (updated: KanbanBoard[]) => {
    setBoards(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const currentBoard = boards.find((b) => b.id === activeBoardId) || boards[0] || DEFAULT_BOARDS[0];

  // Helper to update current board
  const updateCurrentBoard = (mutator: (board: KanbanBoard) => KanbanBoard) => {
    const updated = boards.map((b) => (b.id === currentBoard.id ? mutator(b) : b));
    saveBoards(updated);
  };

  // Add Card
  const handleAddCard = (columnId: string, openDetail: boolean = false) => {
    if (!newCardTitle.trim()) return;
    const newCard: KanbanCard = {
      id: "card-" + Date.now(),
      columnId,
      title: newCardTitle.trim(),
      description: newCardDescription.trim() || undefined,
      checklist: [],
      priority: newCardPriority,
      createdAt: Date.now(),
    };

    updateCurrentBoard((board) => ({
      ...board,
      cards: [...board.cards, newCard],
    }));

    setNewCardTitle("");
    setNewCardDescription("");
    setNewCardPriority("medium");
    setAddingCardColId(null);

    if (openDetail) {
      setSelectedCard(newCard);
    }
  };

  // Drag & Drop States
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [dragOverCardPosition, setDragOverCardPosition] = useState<"before" | "after" | null>(null);
  const [draggingColId, setDraggingColId] = useState<string | null>(null);
  const [dragOverColTargetId, setDragOverColTargetId] = useState<string | null>(null);

  // Card Drag Handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string, sourceColId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "CARD", cardId, sourceColId }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColId(null);
    setDragOverCardId(null);
    setDragOverCardPosition(null);
  };

  const handleCardDragOverCol = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleCardDragOverCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const targetRect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - targetRect.top;
    const position = offsetY < targetRect.height / 2 ? "before" : "after";

    setDragOverCardId(targetCardId);
    setDragOverCardPosition(position);
  };

  const handleCardDrop = (e: React.DragEvent, targetColId: string, targetCardId?: string, overridePosition?: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    const position = overridePosition || dragOverCardPosition || "after";
    setDragOverColId(null);
    setDragOverCardId(null);
    setDragOverCardPosition(null);
    setDraggingCardId(null);

    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.type === "CARD" && data.cardId) {
        const { cardId } = data;
        updateCurrentBoard((board) => {
          const cardIndex = board.cards.findIndex((c) => c.id === cardId);
          if (cardIndex === -1) return board;

          const movedCard = { ...board.cards[cardIndex], columnId: targetColId };
          const remainingCards = board.cards.filter((c) => c.id !== cardId);

          if (targetCardId && targetCardId !== cardId) {
            const targetIndex = remainingCards.findIndex((c) => c.id === targetCardId);
            if (targetIndex !== -1) {
              const insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
              remainingCards.splice(insertIndex, 0, movedCard);
              return { ...board, cards: remainingCards };
            }
          }

          // Insert into target column
          return { ...board, cards: [...remainingCards, movedCard] };
        });
      }
    } catch {}
  };

  // Column Drag Handlers
  const [dragOverColPosition, setDragOverColPosition] = useState<"before" | "after" | null>(null);

  const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: "COLUMN", colId }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingColId(colId);
  };

  const handleColumnDragEnd = () => {
    setDraggingColId(null);
    setDragOverColTargetId(null);
    setDragOverColPosition(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const targetRect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - targetRect.left;
    const position = offsetX < targetRect.width / 2 ? "before" : "after";

    setDragOverColTargetId(targetColId);
    setDragOverColPosition(position);
  };

  const handleColumnDrop = (e: React.DragEvent, targetColId: string, overridePosition?: "before" | "after") => {
    e.preventDefault();
    e.stopPropagation();
    const position = overridePosition || dragOverColPosition || "after";
    setDraggingColId(null);
    setDragOverColTargetId(null);
    setDragOverColPosition(null);

    const rawData = e.dataTransfer.getData("text/plain");
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.type === "COLUMN" && data.colId && data.colId !== targetColId) {
        const { colId } = data;
        updateCurrentBoard((board) => {
          const sourceIdx = board.columns.findIndex((c) => c.id === colId);
          if (sourceIdx === -1) return board;

          const movedCol = board.columns[sourceIdx];
          const remaining = board.columns.filter((c) => c.id !== colId);
          const targetIdx = remaining.findIndex((c) => c.id === targetColId);
          if (targetIdx === -1) return board;

          const insertIdx = position === "after" ? targetIdx + 1 : targetIdx;
          remaining.splice(insertIdx, 0, movedCol);

          return {
            ...board,
            columns: remaining.map((col, idx) => ({ ...col, order: idx + 1 })),
          };
        });
      }
    } catch {}
  };

  // Quick Move Column (Left / Right click)
  const handleQuickMoveColumn = (colId: string, direction: "left" | "right") => {
    updateCurrentBoard((board) => {
      const idx = board.columns.findIndex((c) => c.id === colId);
      if (idx === -1) return board;
      const targetIdx = direction === "left" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= board.columns.length) return board;

      const newCols = [...board.columns];
      const [removed] = newCols.splice(idx, 1);
      newCols.splice(targetIdx, 0, removed);

      return {
        ...board,
        columns: newCols.map((col, i) => ({ ...col, order: i + 1 })),
      };
    });
  };

  // Move Card between Columns (Click)
  const handleMoveCard = (cardId: string, targetColId: string) => {
    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.map((c) => (c.id === cardId ? { ...c, columnId: targetColId } : c)),
    }));
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, columnId: targetColId } : null));
    }
  };

  // Delete Card Prompt & Confirm
  const promptDeleteCard = (card: KanbanCard) => {
    setCardToDelete(card);
  };

  const handleConfirmDeleteCard = () => {
    if (!cardToDelete) return;
    const cardId = cardToDelete.id;
    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.filter((c) => c.id !== cardId),
    }));
    if (selectedCard?.id === cardId) setSelectedCard(null);
    toast.success(`Đã xóa thẻ "${cardToDelete.title}"`);
    setCardToDelete(null);
  };

  // Add Column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newCol: KanbanColumn = {
      id: "col-" + Date.now(),
      title: newColumnTitle.trim(),
      order: currentBoard.columns.length + 1,
    };
    updateCurrentBoard((board) => ({
      ...board,
      columns: [...board.columns, newCol],
    }));
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  // Delete Column Prompt & Confirm
  const promptDeleteColumn = (col: KanbanColumn) => {
    if (currentBoard.columns.length <= 1) {
      toast.error("Phải giữ lại ít nhất 1 cột trong bảng.");
      return;
    }
    setColumnToDelete(col);
  };

  const handleConfirmDeleteColumn = () => {
    if (!columnToDelete) return;
    const colId = columnToDelete.id;
    updateCurrentBoard((board) => ({
      ...board,
      columns: board.columns.filter((c) => c.id !== colId),
      cards: board.cards.filter((c) => c.columnId !== colId),
    }));
    toast.success(`Đã xóa cột "${columnToDelete.title}"`);
    setColumnToDelete(null);
  };

  // Rename Column
  const handleRenameColumn = (colId: string) => {
    const trimmed = editingColumnTitle.trim();
    if (trimmed) {
      updateCurrentBoard((board) => ({
        ...board,
        columns: board.columns.map((c) => (c.id === colId ? { ...c, title: trimmed } : c)),
      }));
    }
    setEditingColumnId(null);
    setEditingColumnTitle("");
  };

  // Toggle Checklist Item in Card
  const handleToggleChecklist = (cardId: string, itemId: string) => {
    updateCurrentBoard((board) => {
      const updatedCards = board.cards.map((c) => {
        if (c.id !== cardId) return c;
        const updatedList = c.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...c, checklist: updatedList };
      });
      return { ...board, cards: updatedCards };
    });

    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          checklist: prev.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        };
      });
    }
  };

  // Add Checklist Item to Card
  const [newChecklistText, setNewChecklistText] = useState("");
  const handleAddChecklistItem = (cardId: string) => {
    if (!newChecklistText.trim()) return;
    const newItem: KanbanChecklistItem = {
      id: "chk-" + Date.now(),
      text: newChecklistText.trim(),
      completed: false,
    };

    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.map((c) =>
        c.id === cardId ? { ...c, checklist: [...c.checklist, newItem] } : c
      ),
    }));

    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, checklist: [...prev.checklist, newItem] } : null));
    }
    setNewChecklistText("");
  };

  // Delete Checklist Item
  const handleDeleteChecklistItem = (cardId: string, itemId: string) => {
    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.map((c) =>
        c.id === cardId
          ? { ...c, checklist: c.checklist.filter((it) => it.id !== itemId) }
          : c
      ),
    }));

    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) =>
        prev ? { ...prev, checklist: prev.checklist.filter((it) => it.id !== itemId) } : null
      );
    }
  };

  // Create New Board
  const handleCreateBoard = () => {
    const title = prompt("Nhập tên bảng học tập mới:");
    if (!title || !title.trim()) return;
    const newBoard: KanbanBoard = {
      id: "board-" + Date.now(),
      title: title.trim(),
      createdAt: Date.now(),
      columns: [
        { id: "col-" + Date.now() + "-1", title: "Cần làm", order: 1 },
        { id: "col-" + Date.now() + "-2", title: "Đang làm", order: 2 },
        { id: "col-" + Date.now() + "-3", title: "Đã xong", order: 3 },
      ],
      cards: [],
    };
    const updated = [...boards, newBoard];
    saveBoards(updated);
    setActiveBoardId(newBoard.id);
    try {
      localStorage.setItem(ACTIVE_BOARD_KEY, newBoard.id);
    } catch {}
  };

  // Delete Board Prompt & Confirm
  const promptDeleteBoard = (board: KanbanBoard) => {
    if (boards.length <= 1) {
      toast.error("Bạn phải giữ lại ít nhất 1 bảng học tập.");
      return;
    }
    setBoardToDelete(board);
  };

  const handleConfirmDeleteBoard = () => {
    if (!boardToDelete) return;
    const boardId = boardToDelete.id;
    const updated = boards.filter((b) => b.id !== boardId);
    saveBoards(updated);
    setActiveBoardId(updated[0].id);
    toast.success(`Đã xóa bảng "${boardToDelete.title}"`);
    setBoardToDelete(null);
  };

  // Filter cards by search
  const filterCards = (cards: KanbanCard[]) => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        c.checklist.some((it) => it.text.toLowerCase().includes(q))
    );
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="tasks-widget-modal-fragment">
          {/* Backdrop to close Task Board when clicking outside */}
          <motion.div
            key="tasks-widget-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            key="tasks-widget-panel"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 bottom-24 left-1/2 -translate-x-1/2 w-[94vw] sm:w-[80vw] z-40 rounded-3xl bg-black/35 hover:bg-black/40 backdrop-blur-md border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden text-white select-none"
          >
          {/* TOP HEADER BAR (Sang trọng, tinh gọn, tích hợp bộ chọn bảng) */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 z-20 bg-white/[0.02]">
            {/* Left: Board Selector Pill & Management */}
            <div className="flex items-center gap-2.5">
              {isEditingBoardTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingBoardTitleText}
                    onChange={(e) => setEditingBoardTitleText(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/30 text-base font-bold text-white focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (editingBoardTitleText.trim()) {
                        updateCurrentBoard((b) => ({ ...b, title: editingBoardTitleText.trim() }));
                      }
                      setIsEditingBoardTitle(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                  >
                    Lưu
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                    className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-sm sm:text-base font-black text-white flex items-center gap-2 transition-all cursor-pointer border border-white/10 shadow-sm max-w-[200px] sm:max-w-xs"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate max-w-[110px] sm:max-w-[180px]" title={currentBoard.title}>
                      {currentBoard.title}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  </button>

                  <AnimatePresence>
                    {isBoardDropdownOpen && (
                      <React.Fragment key="board-dropdown-fragment">
                        {/* Backdrop to close on click outside */}
                        <div 
                          key="board-dropdown-backdrop"
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsBoardDropdownOpen(false)} 
                        />
                        <motion.div
                          key="board-dropdown-panel"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full mt-2 left-0 w-64 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-xs space-y-1 z-50"
                        >
                          <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                            Danh sách bảng học tập:
                          </div>
                        {boards.map((b, bIdx) => (
                          <button
                            key={b.id || `board-${bIdx}`}
                            onClick={() => {
                              setActiveBoardId(b.id);
                              setIsBoardDropdownOpen(false);
                              try {
                                localStorage.setItem(ACTIVE_BOARD_KEY, b.id);
                              } catch {}
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                              b.id === currentBoard.id
                                ? "bg-emerald-500/20 text-emerald-300 font-bold"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="truncate flex-1 mr-2" title={b.title}>{b.title}</span>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{b.cards.length} thẻ</span>
                          </button>
                        ))}
                        </motion.div>
                      </React.Fragment>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Edit Board Name */}
              <button
                onClick={() => {
                  setEditingBoardTitleText(currentBoard.title);
                  setIsEditingBoardTitle(true);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                title="Sửa tên bảng"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Delete Board */}
              {boards.length > 1 && (
                <button
                  onClick={() => promptDeleteBoard(currentBoard)}
                  className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Xóa bảng này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Create Board Button in Header */}
              <button
                onClick={handleCreateBoard}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-400/30 transition-all cursor-pointer"
                title="Tạo bảng mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tạo bảng</span>
              </button>
            </div>

            {/* Right: Search, Views, Close */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thẻ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-black/40 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50 backdrop-blur-md"
                />
                {Boolean(searchQuery) && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-md">
                <button
                  onClick={() => setViewMode("board")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "board"
                      ? "bg-white/20 text-white shadow-sm font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                  title="Chế độ bảng Kanban"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bảng</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white/20 text-white shadow-sm font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                  title="Chế độ danh sách"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN KANBAN BOARD VIEW */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6 pb-6 custom-study-scroll">
            {viewMode === "board" ? (
              <div className="flex items-start gap-5 min-w-max">
                {/* Active dragging items lookup */}
                {(() => {
                  const draggingCard = currentBoard.cards.find((c) => c.id === draggingCardId);
                  const draggingCol = currentBoard.columns.find((c) => c.id === draggingColId);

                  // Check if column move actually changes its order
                  const isMeaningfulColMove = (targetColId: string, position: "before" | "after"): boolean => {
                    if (!draggingColId || draggingColId === targetColId || currentBoard.columns.length <= 1) return false;
                    const sourceIdx = currentBoard.columns.findIndex((c) => c.id === draggingColId);
                    const targetIdx = currentBoard.columns.findIndex((c) => c.id === targetColId);
                    if (sourceIdx === -1 || targetIdx === -1) return false;

                    if (sourceIdx < targetIdx) {
                      if (position === "before" && targetIdx === sourceIdx + 1) return false;
                    }
                    if (sourceIdx > targetIdx) {
                      if (position === "after" && targetIdx === sourceIdx - 1) return false;
                    }
                    return true;
                  };

                  // Check if card move actually changes its position
                  const isMeaningfulCardMove = (targetCard: KanbanCard, position: "before" | "after", currentCards: KanbanCard[]): boolean => {
                    if (!draggingCard || draggingCard.id === targetCard.id) return false;
                    if (draggingCard.columnId !== targetCard.columnId) return true; // Cross-column is always meaningful

                    const sourceIdx = currentCards.findIndex((c) => c.id === draggingCard.id);
                    const targetIdx = currentCards.findIndex((c) => c.id === targetCard.id);
                    if (sourceIdx === -1 || targetIdx === -1) return false;

                    if (sourceIdx < targetIdx) {
                      if (position === "before" && targetIdx === sourceIdx + 1) return false;
                    }
                    if (sourceIdx > targetIdx) {
                      if (position === "after" && targetIdx === sourceIdx - 1) return false;
                    }
                    return true;
                  };

                  // Helper: Card Live Preview Placeholder
                  const renderCardPlaceholder = (targetColId: string, targetCardId?: string, overridePos?: "before" | "after") => (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCardDrop(e, targetColId, targetCardId, overridePos);
                      }}
                      className="p-3 rounded-2xl border-2 border-dashed border-sky-400/60 bg-sky-500/10 backdrop-blur-md space-y-2 select-none shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-pulse cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-sky-200 line-clamp-2">
                          {draggingCard?.title || "Nhiệm vụ"}
                        </span>
                        {Boolean(draggingCard?.priority) && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            draggingCard?.priority === "high" ? "bg-rose-500/30 text-rose-200 border border-rose-400/40" :
                            draggingCard?.priority === "medium" ? "bg-amber-500/30 text-amber-200 border border-amber-400/40" :
                            "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                          }`}>
                            {draggingCard?.priority === "high" ? "Cao" : draggingCard?.priority === "medium" ? "Vừa" : "Thấp"}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-sky-300/70 font-semibold flex items-center gap-1">
                        <span>↓ Thả để đặt thẻ vào đây</span>
                      </div>
                    </div>
                  );

                  // Helper: Column Live Preview Placeholder
                  const renderColumnPlaceholder = (targetColId: string, overridePos: "before" | "after") => (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleColumnDrop(e, targetColId, overridePos);
                      }}
                      className="w-72 sm:w-80 flex-shrink-0 flex flex-col rounded-3xl border-2 border-dashed border-sky-400/60 bg-sky-500/10 backdrop-blur-md p-3.5 min-h-[260px] shadow-[0_0_20px_rgba(56,189,248,0.2)] select-none animate-pulse cursor-pointer"
                    >
                      {/* Column Header Preview */}
                      <div className="flex items-center justify-between pb-3 px-1 border-b border-sky-400/20">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-sky-400" />
                          <h3 className="text-sm font-bold text-sky-100 tracking-wide">
                            {draggingCol?.title || "Danh sách"}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-[10px] font-extrabold text-sky-300">
                            Vị trí mới
                          </span>
                        </div>
                      </div>

                      {/* Body placeholder */}
                      <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <div className="p-2.5 rounded-2xl bg-sky-400/15 border border-sky-400/30 text-sky-300">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-sky-200">
                          Thả để di chuyển danh sách đến đây
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {currentBoard.columns.map((column, colIdx) => {
                        const colCards = filterCards(currentBoard.cards.filter((c) => c.columnId === column.id));
                        const isColumnDragging = draggingColId === column.id;
                        const isColDragOverBefore = dragOverColTargetId === column.id && dragOverColPosition === "before" && isMeaningfulColMove(column.id, "before");
                        const isColDragOverAfter = dragOverColTargetId === column.id && dragOverColPosition === "after" && isMeaningfulColMove(column.id, "after");
                        const isColCardDragOver = dragOverColId === column.id && draggingCardId !== null && draggingCard?.columnId !== column.id;

                        return (
                          <div key={column.id || `col-${colIdx}`} className="flex items-start gap-5 flex-shrink-0">
                            {/* Live Preview Column Placeholder (Before) */}
                            {isColDragOverBefore && renderColumnPlaceholder(column.id, "before")}

                            <div
                              onDragOver={(e) => {
                                if (draggingColId) {
                                  handleColumnDragOver(e, column.id);
                                } else if (draggingCardId) {
                                  handleCardDragOverCol(e, column.id);
                                }
                              }}
                              onDrop={(e) => {
                                if (draggingColId) {
                                  handleColumnDrop(e, column.id);
                                } else if (draggingCardId) {
                                  handleCardDrop(e, column.id);
                                }
                              }}
                              className={`w-72 sm:w-80 flex-shrink-0 flex flex-col rounded-3xl backdrop-blur-md border shadow-lg p-3.5 max-h-[calc(100vh-210px)] transition-all ${
                                isColumnDragging
                                  ? "opacity-25 scale-95 border-dashed border-white/20 bg-white/[0.02] shadow-none"
                                  : isColCardDragOver
                                  ? "border-sky-400/40 bg-sky-500/[0.03]"
                                  : "bg-black/30 hover:bg-black/40 border-white/10"
                              }`}
                            >
                              {/* Column Header (Draggable for reordering lists) */}
                              <div 
                                draggable={editingColumnId !== column.id}
                                onDragStart={(e) => {
                                  if (editingColumnId === column.id) {
                                    e.preventDefault();
                                    return;
                                  }
                                  handleColumnDragStart(e, column.id);
                                }}
                                onDragEnd={handleColumnDragEnd}
                                className="flex items-center justify-between pb-3 px-1 border-b border-white/10 cursor-grab active:cursor-grabbing select-none group/colheader gap-1.5"
                                title="Nắm giữ để kéo thả đổi vị trí danh sách"
                              >
                                {editingColumnId === column.id ? (
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={editingColumnTitle}
                                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleRenameColumn(column.id);
                                        } else if (e.key === "Escape") {
                                          setEditingColumnId(null);
                                        }
                                      }}
                                      onBlur={() => handleRenameColumn(column.id)}
                                      className="w-full px-2.5 py-1 rounded-xl bg-black/60 border border-sky-400/80 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                                      autoFocus
                                      onFocus={(e) => e.target.select()}
                                      maxLength={50}
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
                                    <GripVertical className="w-3.5 h-3.5 text-white/30 group-hover/colheader:text-white/70 transition-colors flex-shrink-0" />
                                    <h3
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingColumnId(column.id);
                                        setEditingColumnTitle(column.title);
                                      }}
                                      className="text-sm font-bold text-white tracking-wide truncate max-w-full hover:bg-white/10 hover:text-sky-200 px-1.5 py-0.5 rounded-lg cursor-text transition-colors border border-transparent hover:border-white/10"
                                      title="Nhấn để đổi tên danh sách"
                                    >
                                      {column.title}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold text-slate-300 flex-shrink-0">
                                      {colCards.length}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {currentBoard.columns.length > 1 && (
                                    <button
                                      onClick={() => promptDeleteColumn(column)}
                                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                                      title="Xóa cột"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Cards Scrollable Area */}
                              <div 
                                onDragOver={(e) => handleCardDragOverCol(e, column.id)}
                                onDrop={(e) => handleCardDrop(e, column.id)}
                                className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 custom-study-scroll min-h-[80px]"
                              >
                                {colCards.map((card, cardIdx) => {
                                  const totalCheck = card.checklist.length;
                                  const doneCheck = card.checklist.filter((i) => i.completed).length;
                                  const progressPercent = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;
                                  const isFullyDone = totalCheck > 0 && doneCheck === totalCheck;
                                  const isCardDragging = draggingCardId === card.id;
                                  const isDragOverBefore = dragOverCardId === card.id && dragOverCardPosition === "before" && isMeaningfulCardMove(card, "before", colCards);
                                  const isDragOverAfter = dragOverCardId === card.id && dragOverCardPosition === "after" && isMeaningfulCardMove(card, "after", colCards);

                                  return (
                                    <div key={card.id || `card-${cardIdx}`} className="space-y-2">
                                      {/* Live Preview Card Placeholder (Before) */}
                                      {isDragOverBefore && renderCardPlaceholder(column.id, card.id, "before")}

                                      {/* Card Content */}
                                      <div
                                        draggable
                                        onDragStart={(e) => handleCardDragStart(e, card.id, column.id)}
                                        onDragEnd={handleCardDragEnd}
                                        onDragOver={(e) => handleCardDragOverCard(e, card.id)}
                                        onDrop={(e) => handleCardDrop(e, column.id, card.id)}
                                        onClick={() => setSelectedCard(card)}
                                        className={`group p-3 rounded-2xl backdrop-blur-md border shadow-sm transition-all cursor-grab active:cursor-grabbing space-y-2.5 relative select-none ${
                                          isCardDragging
                                            ? "opacity-25 border-dashed border-white/20 bg-white/[0.02] shadow-none"
                                            : "bg-white/[0.08] hover:bg-white/[0.14] border-white/12 hover:border-white/25"
                                        }`}
                                      >
                                        {/* Title & Grip */}
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-3 leading-snug break-words [overflow-wrap:anywhere] group-hover:text-sky-200 transition-colors">
                                            {card.title}
                                          </h4>
                                          <GripVertical className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Progress bar if checklist exists */}
                                        {totalCheck > 0 && (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                              <span className="flex items-center gap-1">
                                                <CheckSquare className="w-3 h-3 text-emerald-400" />
                                                <span>{doneCheck}/{totalCheck}</span>
                                              </span>
                                              <span>{progressPercent}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                                              <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                  isFullyDone
                                                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                                    : "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                                                }`}
                                                style={{ width: `${progressPercent}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {/* Card Footer Quick Actions */}
                                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                                          <div className="flex items-center gap-1.5">
                                            {card.priority === "high" && (
                                              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-400/30">
                                                Cao
                                              </span>
                                            )}
                                            {card.priority === "medium" && (
                                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-400/30">
                                                Vừa
                                              </span>
                                            )}
                                            {card.priority === "low" && (
                                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-400/30">
                                                Thấp
                                              </span>
                                            )}
                                          </div>

                                          {/* Quick Move Column Buttons */}
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            {colIdx > 0 && (
                                              <button
                                                onClick={() => handleMoveCard(card.id, currentBoard.columns[colIdx - 1].id)}
                                                className="p-1 rounded-md hover:bg-white/20 text-white/60 hover:text-white cursor-pointer"
                                                title={`Chuyển sang: ${currentBoard.columns[colIdx - 1].title}`}
                                              >
                                                <ArrowLeft className="w-3 h-3" />
                                              </button>
                                            )}
                                            {colIdx < currentBoard.columns.length - 1 && (
                                              <button
                                                onClick={() => handleMoveCard(card.id, currentBoard.columns[colIdx + 1].id)}
                                                className="p-1 rounded-md hover:bg-white/20 text-white/60 hover:text-white cursor-pointer"
                                                title={`Chuyển sang: ${currentBoard.columns[colIdx + 1].title}`}
                                              >
                                                <ArrowRight className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Live Preview Card Placeholder (After) */}
                                      {isDragOverAfter && renderCardPlaceholder(column.id, card.id, "after")}
                                    </div>
                                  );
                                })}

                                {/* Live Preview Card Placeholder in Empty Column */}
                                {colCards.length === 0 && isColCardDragOver && (
                                  renderCardPlaceholder(column.id)
                                )}

                        {/* Inline Add Card Input */}
                        {addingCardColId === column.id && (
                          <div className="p-3 rounded-2xl bg-black/50 border border-white/20 shadow-xl space-y-2.5 backdrop-blur-xl">
                            {/* Title */}
                            <input
                              type="text"
                              placeholder="Tiêu đề nhiệm vụ..."
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCard(column.id);
                                } else if (e.key === "Escape") {
                                  setAddingCardColId(null);
                                }
                              }}
                              className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                              autoFocus
                            />

                            {/* Description */}
                            <textarea
                              rows={2}
                              placeholder="Mô tả chi tiết (tùy chọn)..."
                              value={newCardDescription}
                              onChange={(e) => setNewCardDescription(e.target.value)}
                              className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
                            />

                            {/* Priority Selector */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mức độ ưu tiên:</span>
                              <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold">
                                {[
                                  { value: "high", label: "Cao", activeClass: "bg-rose-500 text-white font-extrabold shadow-sm", idleClass: "text-rose-400/80 hover:text-rose-300" },
                                  { value: "medium", label: "Vừa", activeClass: "bg-amber-500 text-slate-950 font-extrabold shadow-sm", idleClass: "text-amber-400/80 hover:text-amber-300" },
                                  { value: "low", label: "Thấp", activeClass: "bg-emerald-500 text-slate-950 font-extrabold shadow-sm", idleClass: "text-emerald-400/80 hover:text-emerald-300" },
                                ].map((p) => {
                                  const isSelected = newCardPriority === p.value;
                                  return (
                                    <button
                                      key={p.value}
                                      type="button"
                                      onClick={() => setNewCardPriority(p.value as "high" | "medium" | "low")}
                                      className={`py-1 rounded-lg text-center transition-all cursor-pointer ${
                                        isSelected ? p.activeClass : `${p.idleClass} hover:bg-white/5`
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingCardColId(null);
                                  setNewCardTitle("");
                                  setNewCardDescription("");
                                  setNewCardPriority("medium");
                                }}
                                className="px-2 py-1 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                              >
                                Hủy
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleAddCard(column.id, true)}
                                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all cursor-pointer"
                                  title="Thêm và mở modal thêm checklist ngay"
                                >
                                  + Chi tiết
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCard(column.id, false)}
                                  className="px-3.5 py-1 rounded-xl bg-white text-black hover:bg-slate-200 text-[11px] font-extrabold shadow-md transition-all cursor-pointer"
                                >
                                  Thêm
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Add Card Button */}
                      {addingCardColId !== column.id && (
                        <button
                          onClick={() => {
                            setAddingCardColId(column.id);
                            setNewCardTitle("");
                          }}
                          className="mt-2 w-full py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm thẻ</span>
                        </button>
                      )}
                    </div>

                    {/* Live Preview Column Placeholder (After Column) */}
                    {isColDragOverAfter && renderColumnPlaceholder(column.id, "after")}
                  </div>
                );
              })}
            </>
          );
        })()}

                {/* + Thêm danh sách (Add Column Card) */}
                <div className="w-72 sm:w-80 flex-shrink-0">
                  {isAddingColumn ? (
                    <div className="p-3.5 rounded-3xl bg-black/40 border border-white/20 space-y-2 backdrop-blur-md">
                      <input
                        type="text"
                        placeholder="Tên danh sách mới..."
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddColumn();
                          if (e.key === "Escape") setIsAddingColumn(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/20 text-xs text-white focus:outline-none focus:border-sky-400"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsAddingColumn(false)}
                          className="px-2.5 py-1 rounded-lg text-[10px] text-white/60 hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleAddColumn}
                          className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold"
                        >
                          Thêm danh sách
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingColumn(true)}
                      className="w-full py-3.5 rounded-3xl border-2 border-dashed border-white/20 hover:border-sky-400/60 hover:bg-white/5 text-xs font-bold text-white/60 hover:text-sky-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm danh sách</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* LIST VIEW MODE */
              <div className="max-w-4xl mx-auto space-y-6">
                {currentBoard.columns.map((col, colIdx) => {
                  const colCards = filterCards(currentBoard.cards.filter((c) => c.columnId === col.id));
                  return (
                    <div key={col.id || `col-list-${colIdx}`} className="p-4 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        {editingColumnId === col.id ? (
                          <div className="flex items-center gap-2 max-w-xs flex-1">
                            <input
                              type="text"
                              value={editingColumnTitle}
                              onChange={(e) => setEditingColumnTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleRenameColumn(col.id);
                                } else if (e.key === "Escape") {
                                  setEditingColumnId(null);
                                }
                              }}
                              onBlur={() => handleRenameColumn(col.id)}
                              className="w-full px-2.5 py-1 rounded-xl bg-black/60 border border-sky-400/80 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-sky-400"
                              autoFocus
                              onFocus={(e) => e.target.select()}
                              maxLength={50}
                            />
                          </div>
                        ) : (
                          <h3
                            onClick={() => {
                              setEditingColumnId(col.id);
                              setEditingColumnTitle(col.title);
                            }}
                            className="font-bold text-sm text-white flex items-center gap-2 hover:text-sky-200 cursor-text transition-colors"
                            title="Nhấn để đổi tên danh sách"
                          >
                            <span>{col.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300">
                              {colCards.length}
                            </span>
                          </h3>
                        )}
                      </div>

                      <div className="space-y-2">
                        {colCards.map((card, cardIdx) => (
                          <div
                            key={card.id || `card-list-${cardIdx}`}
                            onClick={() => setSelectedCard(card)}
                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition-all gap-3"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-white break-words [overflow-wrap:anywhere]">{card.title}</h4>
                              {Boolean(card.description) && (
                                <p className="text-[10px] text-slate-400 break-words [overflow-wrap:anywhere]">{card.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              {card.priority === "high" && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-400/30">
                                  Cao
                                </span>
                              )}
                              {card.priority === "medium" && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-400/30">
                                  Vừa
                                </span>
                              )}
                              {card.priority === "low" && (
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-400/30">
                                  Thấp
                                </span>
                              )}
                              {card.checklist.length > 0 && (
                                <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                                  {card.checklist.filter((i) => i.completed).length}/{card.checklist.length}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CARD DETAILS MODAL (Popout when clicking a card) */}
          <AnimatePresence>
            {selectedCard && (
              <motion.div
                key={`card-details-modal-${selectedCard.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => {
                  setSelectedCard(null);
                  setIsStatusDropdownOpen(false);
                }}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 16 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg rounded-3xl bg-[#14161b]/98 backdrop-blur-2xl border border-white/12 shadow-[0_30px_70px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.08)] p-6 space-y-5 text-white"
                >
                  {/* Header: Title Input & Close */}
                  <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/10">
                    <div className="space-y-1 flex-1 min-w-0">
                      <input
                        type="text"
                        value={selectedCard.title}
                        onChange={(e) => {
                          const updatedTitle = e.target.value;
                          setSelectedCard((prev) => (prev ? { ...prev, title: updatedTitle } : null));
                          updateCurrentBoard((b) => ({
                            ...b,
                            cards: b.cards.map((c) => (c.id === selectedCard.id ? { ...c, title: updatedTitle } : c)),
                          }));
                        }}
                        className="w-full text-base sm:text-lg font-bold bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-white/30 text-white focus:text-sky-100 transition-colors"
                        placeholder="Tiêu đề nhiệm vụ..."
                      />
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                        <span>Bảng: <strong className="text-slate-300">{currentBoard.title}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCard(null);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                      title="Đóng (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Status & Priority: Elegant Balanced Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status: Custom Dropdown Menu */}
                    <div className="space-y-1.5 relative">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Danh sách / Cột
                      </label>
                      
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full h-10 px-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] focus:border-sky-400/60 border border-white/[0.12] text-xs font-bold text-white flex items-center justify-between transition-all cursor-pointer shadow-sm"
                      >
                        <span className="truncate mr-2 font-bold text-slate-100">
                          {currentBoard.columns.find((c) => c.id === selectedCard.columnId)?.title || "Chọn danh sách"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isStatusDropdownOpen ? "rotate-180 text-sky-400" : ""}`} />
                      </button>

                      {/* Dropdown Options */}
                      <AnimatePresence>
                        {isStatusDropdownOpen && (
                          <React.Fragment key="card-status-dropdown-fragment">
                            <div 
                              key="card-status-backdrop"
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsStatusDropdownOpen(false);
                              }} 
                            />
                            <motion.div
                              key="card-status-panel"
                              initial={{ opacity: 0, y: 6, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full mt-1.5 left-0 w-full p-1.5 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-48 overflow-y-auto custom-study-scroll space-y-1"
                            >
                            {currentBoard.columns.map((col, colIdx) => {
                              const isActive = selectedCard.columnId === col.id;
                              const count = currentBoard.cards.filter((c) => c.columnId === col.id).length;
                              return (
                                <button
                                  key={col.id || `col-opt-${colIdx}`}
                                  type="button"
                                  onClick={() => {
                                    handleMoveCard(selectedCard.id, col.id);
                                    setIsStatusDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                                    isActive
                                      ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 font-extrabold shadow-sm"
                                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate mr-2">
                                    {isActive && <Check className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
                                    <span className="truncate">{col.title}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{count} thẻ</span>
                                </button>
                              );
                            })}
                            </motion.div>
                          </React.Fragment>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Priority: Segmented Control (Matched Height) */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Mức độ ưu tiên
                      </label>
                      <div className="h-10 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] items-center">
                        {[
                          { value: "high", label: "Cao", activeClass: "bg-rose-500 text-white font-extrabold shadow-[0_0_12px_rgba(244,63,94,0.45)] border-rose-400/40", idleClass: "text-rose-300/60 hover:text-rose-200 hover:bg-rose-500/10" },
                          { value: "medium", label: "Vừa", activeClass: "bg-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.45)] border-amber-300/40", idleClass: "text-amber-300/60 hover:text-amber-200 hover:bg-amber-500/10" },
                          { value: "low", label: "Thấp", activeClass: "bg-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(52,211,153,0.45)] border-emerald-300/40", idleClass: "text-emerald-300/60 hover:text-emerald-200 hover:bg-emerald-500/10" },
                        ].map((p) => {
                          const isSelected = selectedCard.priority === p.value;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => {
                                const updatedPriority = p.value as "high" | "medium" | "low";
                                setSelectedCard((prev) => (prev ? { ...prev, priority: updatedPriority } : null));
                                updateCurrentBoard((b) => ({
                                  ...b,
                                  cards: b.cards.map((c) => (c.id === selectedCard.id ? { ...c, priority: updatedPriority } : c)),
                                }));
                              }}
                              className={`h-full rounded-xl text-xs font-bold text-center transition-all cursor-pointer truncate px-1 flex items-center justify-center border border-transparent ${
                                isSelected ? p.activeClass : p.idleClass
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Description Section */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                      <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mô tả chi tiết</span>
                    </label>
                    <textarea
                      placeholder="Thêm mô tả hoặc ghi chú thêm cho nhiệm vụ..."
                      value={selectedCard.description || ""}
                      spellCheck={false}
                      onChange={(e) => {
                        const updatedDesc = e.target.value;
                        setSelectedCard((prev) => (prev ? { ...prev, description: updatedDesc } : null));
                        updateCurrentBoard((b) => ({
                          ...b,
                          cards: b.cards.map((c) => (c.id === selectedCard.id ? { ...c, description: updatedDesc } : c)),
                        }));
                      }}
                      className="w-full p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] focus:bg-black/40 border border-white/[0.08] focus:border-sky-400/40 text-xs text-white placeholder-white/30 focus:outline-none resize-none h-20 transition-all font-normal leading-relaxed"
                    />
                  </div>

                  {/* 3. Checklist Section */}
                  <div className="space-y-2.5 pt-1">
                    {(() => {
                      const totalCheck = selectedCard.checklist.length;
                      const doneCheck = selectedCard.checklist.filter((i) => i.completed).length;
                      const progressPercent = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;
                      const isFullyDone = totalCheck > 0 && doneCheck === totalCheck;

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Danh sách công việc con</span>
                            </span>
                            {totalCheck > 0 && (
                              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                                <span>{doneCheck}/{totalCheck}</span>
                                <span className="text-white/40">({progressPercent}%)</span>
                              </span>
                            )}
                          </div>

                          {/* Progress Bar inside Modal */}
                          {totalCheck > 0 && (
                            <div className="w-full h-1.5 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isFullyDone
                                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                    : "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}

                          {/* Checklist Items */}
                          {totalCheck > 0 && (
                            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-study-scroll">
                              {selectedCard.checklist.map((item, itemIdx) => (
                                <div
                                  key={item.id || `chk-${itemIdx}`}
                                  className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] group transition-all"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChecklist(selectedCard.id, item.id)}
                                    className="flex items-center gap-2.5 text-xs text-left min-w-0 flex-1 cursor-pointer mr-2"
                                  >
                                    {item.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-white/40 group-hover:text-white/70 flex-shrink-0" />
                                    )}
                                    <span className={`break-words [overflow-wrap:anywhere] min-w-0 flex-1 leading-snug ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                                      {item.text}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChecklistItem(selectedCard.id, item.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer flex-shrink-0"
                                    title="Xóa mục"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Add Checklist Input Bar */}
                    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] focus-within:border-sky-400/40 transition-all">
                      <input
                        type="text"
                        placeholder="Thêm mục việc cần làm..."
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddChecklistItem(selectedCard.id);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-transparent border-0 text-xs text-white placeholder-white/30 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddChecklistItem(selectedCard.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => promptDeleteCard(selectedCard)}
                      className="px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa thẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCard(null);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="px-6 py-2 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 text-xs font-black shadow-[0_4px_16px_rgba(255,255,255,0.2)] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Xong</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>

    {/* Delete Confirmation Dialogs (outside AnimatePresence — each has its own internal AnimatePresence) */}
    <ConfirmDeleteModal
      isOpen={!!boardToDelete}
      onClose={() => setBoardToDelete(null)}
      onConfirm={handleConfirmDeleteBoard}
      title="Xác nhận xóa bảng học tập"
      description="Bạn có chắc chắn muốn xóa toàn bộ bảng này và tất cả các thẻ công việc bên trong không?"
      itemName={boardToDelete?.title}
      confirmText="Xóa bảng"
      cancelText="Hủy bỏ"
    />

    <ConfirmDeleteModal
      isOpen={!!columnToDelete}
      onClose={() => setColumnToDelete(null)}
      onConfirm={handleConfirmDeleteColumn}
      title="Xác nhận xóa danh sách cột"
      description="Toàn bộ các thẻ nhiệm vụ trong cột này sẽ bị xóa vĩnh viễn."
      itemName={columnToDelete?.title}
      confirmText="Xóa cột"
      cancelText="Hủy bỏ"
    />

    <ConfirmDeleteModal
      isOpen={!!cardToDelete}
      onClose={() => setCardToDelete(null)}
      onConfirm={handleConfirmDeleteCard}
      title="Xác nhận xóa thẻ công việc"
      description="Bạn có chắc chắn muốn xóa thẻ nhiệm vụ này không?"
      itemName={cardToDelete?.title}
      confirmText="Xóa thẻ"
      cancelText="Hủy bỏ"
    />
    </>
  );
};
