"use client";

import { useState, useEffect } from "react";
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
  ChevronDown
} from "lucide-react";
import { KanbanBoard, KanbanCard, KanbanColumn, KanbanChecklistItem } from "./study-types";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);

  // Quick Inline Add Card state: [columnId]: text
  const [addingCardColId, setAddingCardColId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // Adding Column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

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
  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;
    const newCard: KanbanCard = {
      id: "card-" + Date.now(),
      columnId,
      title: newCardTitle.trim(),
      checklist: [],
      priority: "medium",
      createdAt: Date.now(),
    };

    updateCurrentBoard((board) => ({
      ...board,
      cards: [...board.cards, newCard],
    }));

    setNewCardTitle("");
    setAddingCardColId(null);
  };

  // Move Card between Columns
  const handleMoveCard = (cardId: string, targetColId: string) => {
    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.map((c) => (c.id === cardId ? { ...c, columnId: targetColId } : c)),
    }));
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    updateCurrentBoard((board) => ({
      ...board,
      cards: board.cards.filter((c) => c.id !== cardId),
    }));
    if (selectedCard?.id === cardId) setSelectedCard(null);
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

  // Delete Column
  const handleDeleteColumn = (colId: string) => {
    if (currentBoard.columns.length <= 1) return;
    updateCurrentBoard((board) => ({
      ...board,
      columns: board.columns.filter((c) => c.id !== colId),
      cards: board.cards.filter((c) => c.columnId !== colId),
    }));
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

  // Delete Board
  const handleDeleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      alert("Bạn phải giữ lại ít nhất 1 bảng học tập.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa bảng này?")) return;
    const updated = boards.filter((b) => b.id !== boardId);
    saveBoards(updated);
    setActiveBoardId(updated[0].id);
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-16 bottom-24 right-4 sm:right-6 left-20 sm:left-24 z-40 rounded-3xl bg-black/35 hover:bg-black/40 backdrop-blur-md border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden text-white select-none"
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
                    className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-sm sm:text-base font-black text-white flex items-center gap-2 transition-all cursor-pointer border border-white/10 shadow-sm"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>{currentBoard.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <AnimatePresence>
                    {isBoardDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 w-60 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-xs space-y-1 z-50"
                      >
                        <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                          Danh sách bảng học tập:
                        </div>
                        {boards.map((b) => (
                          <button
                            key={b.id}
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
                            <span>{b.title}</span>
                            <span className="text-[10px] text-slate-400">{b.cards.length} thẻ</span>
                          </button>
                        ))}
                      </motion.div>
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
                  onClick={() => handleDeleteBoard(currentBoard.id)}
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
                {searchQuery && (
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
                {currentBoard.columns.map((column, colIdx) => {
                  const colCards = filterCards(currentBoard.cards.filter((c) => c.columnId === column.id));

                  return (
                    <div
                      key={column.id}
                      className="w-72 sm:w-80 flex-shrink-0 flex flex-col rounded-3xl bg-black/30 hover:bg-black/40 backdrop-blur-md border border-white/10 shadow-lg p-3.5 max-h-[calc(100vh-210px)] transition-all"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            {column.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold text-slate-300">
                            {colCards.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setAddingCardColId(column.id)}
                            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Thêm thẻ mới"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {currentBoard.columns.length > 1 && (
                            <button
                              onClick={() => handleDeleteColumn(column.id)}
                              className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                              title="Xóa cột"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cards Scrollable Area */}
                      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 custom-study-scroll">
                        {colCards.map((card) => {
                          const totalCheck = card.checklist.length;
                          const doneCheck = card.checklist.filter((i) => i.completed).length;
                          const progressPercent = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;
                          const isFullyDone = totalCheck > 0 && doneCheck === totalCheck;

                          return (
                            <motion.div
                              key={card.id}
                              layoutId={card.id}
                              onClick={() => setSelectedCard(card)}
                              className="group p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/15 hover:border-sky-400/50 shadow-sm transition-all cursor-pointer space-y-2.5 relative"
                            >
                              {/* Title */}
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-semibold text-slate-100 line-clamp-3 leading-snug group-hover:text-sky-200 transition-colors">
                                  {card.title}
                                </h4>
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
                                </div>

                                {/* Quick Move Column Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                  {colIdx > 0 && (
                                    <button
                                      onClick={() => handleMoveCard(card.id, currentBoard.columns[colIdx - 1].id)}
                                      className="p-1 rounded-md hover:bg-white/20 text-white/60 hover:text-white"
                                      title={`Chuyển sang: ${currentBoard.columns[colIdx - 1].title}`}
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </button>
                                  )}
                                  {colIdx < currentBoard.columns.length - 1 && (
                                    <button
                                      onClick={() => handleMoveCard(card.id, currentBoard.columns[colIdx + 1].id)}
                                      className="p-1 rounded-md hover:bg-white/20 text-white/60 hover:text-white"
                                      title={`Chuyển sang: ${currentBoard.columns[colIdx + 1].title}`}
                                    >
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Inline Add Card Input */}
                        {addingCardColId === column.id && (
                          <div className="p-3 rounded-2xl bg-white/10 border border-emerald-400/40 space-y-2">
                            <textarea
                              rows={2}
                              placeholder="Nhập tên nhiệm vụ học tập..."
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddCard(column.id);
                                } else if (e.key === "Escape") {
                                  setAddingCardColId(null);
                                }
                              }}
                              className="w-full p-2 rounded-xl bg-slate-950/80 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 resize-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setAddingCardColId(null)}
                                className="px-2.5 py-1 rounded-lg text-[10px] text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleAddCard(column.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold shadow-md cursor-pointer"
                              >
                                Thêm
                              </button>
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
                  );
                })}

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
                {currentBoard.columns.map((col) => {
                  const colCards = filterCards(currentBoard.cards.filter((c) => c.columnId === col.id));
                  return (
                    <div key={col.id} className="p-4 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{col.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300">
                            {colCards.length}
                          </span>
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {colCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer transition-all"
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-white">{card.title}</h4>
                              {card.description && (
                                <p className="text-[10px] text-slate-400">{card.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setSelectedCard(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl p-6 space-y-5 text-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
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
                        className="w-full text-base sm:text-lg font-bold bg-transparent border-b border-white/20 focus:border-emerald-400 focus:outline-none pb-1"
                      />
                      <p className="text-xs text-slate-400">
                        Cột: <span className="font-semibold text-sky-300">{currentBoard.columns.find((c) => c.id === selectedCard.columnId)?.title}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCard(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Checklist Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>Danh sách công việc con (Checklist)</span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {selectedCard.checklist.filter((i) => i.completed).length}/{selectedCard.checklist.length}
                      </span>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-study-scroll">
                      {selectedCard.checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 group"
                        >
                          <button
                            onClick={() => handleToggleChecklist(selectedCard.id, item.id)}
                            className="flex items-center gap-2.5 text-xs text-left flex-1 cursor-pointer"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-white/40 flex-shrink-0" />
                            )}
                            <span className={item.completed ? "line-through text-slate-400" : "text-slate-200"}>
                              {item.text}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteChecklistItem(selectedCard.id, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                            title="Xóa mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Checklist Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Thêm mục việc cần làm..."
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddChecklistItem(selectedCard.id);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        onClick={() => handleAddChecklistItem(selectedCard.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleDeleteCard(selectedCard.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa thẻ này</span>
                    </button>

                    <button
                      onClick={() => setSelectedCard(null)}
                      className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                    >
                      Xong
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
