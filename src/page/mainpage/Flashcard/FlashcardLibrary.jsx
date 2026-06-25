import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import folderService from "../../../AdminControl/Service/API/lessonServiceAPI/folder.service";
import flashcardService from "../../../AdminControl/Service/API/lessonServiceAPI/flashcard.service";
import { Loader2 } from "lucide-react";
import {
  Layers, Plus, Search, Star, Clock, ChevronRight,
  Folder, X, BookOpen, Zap, Filter, Grid3X3, List,
  MoreHorizontal, Play,
} from "lucide-react";

// --- MOCK DATA ---
const STARRED_DECK = {
  id: "starred",
  title: "Starred Vocabulary",
  description: "Những từ bạn đã đánh dấu ⭐ từ các bộ thẻ khác",
  terms: 12,
  starred: true,
  progress: 35,
  status: "review", // review | learned | new
  lastStudied: "Hôm nay",
  color: "from-yellow-500 to-amber-600",
};

const MOCK_DECKS = [
  {
    id: 101,
    title: "Từ vựng Bài 1: Chào hỏi",
    terms: 20,
    progress: 85,
    status: "learned",
    lastStudied: "Hôm nay",
    dueCount: 0,
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 102,
    title: "Động từ bất quy tắc",
    terms: 15,
    progress: 40,
    status: "review",
    lastStudied: "2 ngày trước",
    dueCount: 8,
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 103,
    title: "Tính từ chỉ cảm xúc",
    terms: 30,
    progress: 0,
    status: "new",
    lastStudied: "Chưa học",
    dueCount: 30,
    folder: "Luyện thi Topik I",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 104,
    title: "Số đếm & Thời gian",
    terms: 25,
    progress: 60,
    status: "review",
    lastStudied: "3 ngày trước",
    dueCount: 5,
    folder: "Tiếng Hàn Sơ Cấp 1",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 105,
    title: "Từ vựng TOPIK II: Cao cấp",
    terms: 50,
    progress: 20,
    status: "review",
    lastStudied: "1 tuần trước",
    dueCount: 12,
    folder: "Luyện thi Topik II",
    color: "from-pink-500 to-rose-600",
  },
];

const MOCK_FOLDERS = [
  { id: 1, title: "Tiếng Hàn Sơ Cấp 1", count: 3, color: "#3b82f6" },
  { id: 2, title: "Luyện thi Topik I", count: 2, color: "#8b5cf6" },
  { id: 3, title: "Luyện thi Topik II", count: 1, color: "#f59e0b" },
];

function StatusBadge({ status, dueCount }) {
  if (status === "learned") {
    return (
      <span className="badge-learned flex items-center gap-1">
        ✓ Đã thuộc
      </span>
    );
  }
  if (status === "new") {
    return <span className="badge-new">✦ Mới</span>;
  }
  return (
    <span className="badge-review flex items-center gap-1">
      ⏰ {dueCount} cần ôn
    </span>
  );
}

function DeckCard({ deck, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(deck.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? "rgba(26,122,60,0.3)" : "rgba(0,0,0,0.07)",
        boxShadow: hovered
          ? "0 16px 40px rgba(26,122,60,0.1), 0 4px 12px rgba(0,0,0,0.07)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Color accent top bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${deck.color}`}
        style={{
          opacity: hovered ? 1 : 0.6,
          transition: "opacity 0.2s",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1 line-clamp-2">
              {deck.title}
            </h3>
            {deck.folder?.name && (
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <Folder size={10} />
                {deck.folder.name}
              </span>
            )}
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={deck.status || "new"} dueCount={deck.dueCount || 0} />
          <span className="text-[11px] text-gray-400 font-semibold">
            {deck.terms || deck._count?.flashcards || deck.flashcards?.length || 0} từ
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
              Tiến độ
            </span>
            <span
              className="text-[11px] font-extrabold"
              style={{ color: (deck.progress || 0) > 0 ? "#1a7a3c" : "#9ca3af" }}
            >
              {deck.progress || 0}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r ${deck.color || "from-blue-500 to-indigo-600"} transition-all duration-500`}
              style={{ width: `${deck.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={11} />
            <span className="text-[11px] font-medium">{deck.lastStudied || "Chưa học"}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #1a7a3c, #22c55e)",
              boxShadow: "0 2px 8px rgba(26,122,60,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            <Play size={10} fill="white" />
            Học ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardLibrary() {
  const navigate = useNavigate();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [folders, setFolders] = useState([]);
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      // Fetch folders and decks concurrently
      const [foldersRes, decksRes] = await Promise.all([
        folderService.getMyFolders(),
        flashcardService.getAllAccessibleDecks() // Or getMyDecks()
      ]);
      const foldersArray = Array.isArray(foldersRes) ? foldersRes : (foldersRes?.items || foldersRes?.data || []);
      setFolders(foldersArray);
      
      const decksArray = Array.isArray(decksRes) ? decksRes : (decksRes?.items || decksRes?.data || []);
      setDecks(decksArray);
    } catch (err) {
      console.error("Lỗi khi tải thư viện thẻ:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const newFolder = await folderService.createFolder({ name: newFolderName, description: "" });
      setFolders([newFolder, ...folders]);
      setNewFolderName("");
      setShowFolderModal(false);
    } catch (err) {
      console.error("Lỗi tạo thư mục:", err);
      alert("Không thể tạo thư mục. Vui lòng thử lại.");
    }
  };

  const filteredDecks = Array.isArray(decks) ? decks.filter((d) =>
    (d?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const stats = {
    total: Array.isArray(decks) ? decks.reduce((sum, d) => sum + (d._count?.flashcards || d.flashcards?.length || 0), 0) : 0,
    learned: 0, // Requires tracking logic from backend if available
    review: 0,
    newCount: Array.isArray(decks) ? decks.length : 0,
  };

  return (
    <div className="w-full min-h-screen pb-16 font-sans">

      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
              🃏 Flashcard Library
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Quản lý và ôn luyện các bộ thẻ ghi nhớ của bạn
            </p>
          </div>

          {/* Create button */}
          <div className="relative">
            <button
              onClick={() => setShowCreateOptions(!showCreateOptions)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #1a7a3c 0%, #22c55e 100%)",
                boxShadow: "0 4px 16px rgba(26,122,60,0.3)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,60,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,122,60,0.3)"; }}
            >
              <Plus size={18} />
              Tạo mới
            </button>

            {showCreateOptions && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-20"
                style={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                }}
              >
                <button
                  onClick={() => { navigate("/user/flashcards/create-set"); setShowCreateOptions(false); }}
                  className="w-full text-left px-4 py-3.5 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50"
                >
                  <div className="p-2 rounded-lg" style={{ background: "rgba(26,122,60,0.08)" }}>
                    <Layers size={16} style={{ color: "#1a7a3c" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Học phần mới</p>
                    <p className="text-[11px] text-gray-400">Tạo bộ từ vựng</p>
                  </div>
                </button>
                <button
                  onClick={() => { setShowFolderModal(true); setShowCreateOptions(false); }}
                  className="w-full text-left px-4 py-3.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Folder size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Thư mục</p>
                    <p className="text-[11px] text-gray-400">Nhóm các bộ thẻ</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Tổng từ vựng", value: stats.total, icon: "📖", color: "#3b82f6" },
            { label: "Đã thuộc", value: stats.learned, suffix: " bộ", icon: "✅", color: "#22c55e" },
            { label: "Cần ôn tập", value: stats.review, suffix: " bộ", icon: "⏰", color: "#f97316" },
            { label: "Chưa học", value: stats.newCount, suffix: " bộ", icon: "🆕", color: "#8b5cf6" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-1">
                  {s.label}
                </p>
                <p className="text-xl font-extrabold text-gray-900 leading-none">
                  {s.value}
                  {s.suffix && <span className="text-xs font-semibold text-gray-400 ml-0.5">{s.suffix}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bộ thẻ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
            style={{
              background: "white",
              border: "1.5px solid rgba(0,0,0,0.08)",
              color: "#111827",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(26,122,60,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(26,122,60,0.06)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border text-gray-600 transition-colors hover:bg-gray-50" style={{ border: "1.5px solid rgba(0,0,0,0.08)" }}>
            <Filter size={14} /> Lọc
          </button>
          <div className="flex bg-white rounded-xl border p-1" style={{ border: "1.5px solid rgba(0,0,0,0.08)" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: viewMode === "grid" ? "rgba(26,122,60,0.08)" : "transparent", color: viewMode === "grid" ? "#1a7a3c" : "#9ca3af" }}
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: viewMode === "list" ? "rgba(26,122,60,0.08)" : "transparent", color: viewMode === "list" ? "#1a7a3c" : "#9ca3af" }}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
           <Loader2 size={40} className="animate-spin text-[#1a7a3c] mb-4" />
           <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">Đang tải thư viện...</p>
        </div>
      ) : (
        <>
      {/* ── STARRED DECK (PINNED FIRST) ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-yellow-500" fill="#f59e0b" />
          <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
            Bộ thẻ đặc biệt
          </h2>
        </div>

        <div
          onClick={() => navigate(`/user/flashcards/study/${STARRED_DECK.id}`)}
          className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 group"
          style={{ boxShadow: "0 4px 20px rgba(245,158,11,0.2)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(245,158,11,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,0.2)"; }}
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #111827 0%, #1c1f2e 60%, #1a1a2e 100%)" }}
          />

          {/* Decorative blobs */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fcd34d, transparent)" }} />

          <div className="relative z-10 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <Star size={28} className="text-yellow-400" fill="#f59e0b" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-white font-extrabold text-lg">
                  {STARRED_DECK.title}
                </h3>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase"
                  style={{ background: "rgba(245,158,11,0.25)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  Đặc biệt
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {STARRED_DECK.description}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-yellow-400 font-bold text-sm">
                  ⭐ {STARRED_DECK.terms} từ đã đánh dấu
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-1 w-24 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${STARRED_DECK.progress}%`, background: "linear-gradient(90deg, #f59e0b, #fcd34d)" }}
                    />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: "#fcd34d" }}>
                    {STARRED_DECK.progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-all"
              style={{
                background: "rgba(245,158,11,0.25)",
                color: "#fcd34d",
                border: "1px solid rgba(245,158,11,0.4)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.25)"; }}
            >
              <Play size={14} fill="#fcd34d" />
              Ôn ngay
            </button>
          </div>
        </div>
      </div>

      {/* ── FOLDERS ── */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Thư mục ({folders.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onClick={() => navigate(`/user/flashcards/folder/${folder.id}`)}
                className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex items-center gap-3"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = folder.color + "40"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: folder.color + "15" }}
                >
                  <Folder size={18} style={{ color: folder.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{folder.name || folder.title}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{folder.deckCount || folder._count?.decks || 0} học phần</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DECK GRID ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">
            Học phần ({filteredDecks.length})
          </h2>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <X size={12} /> Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onClick={(id) => navigate(`/user/flashcards/study/${id}`)}
            />
          ))}

          {/* Create new card */}
          <button
            onClick={() => navigate("/user/flashcards/create-set")}
            className="min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 group transition-all"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(26,122,60,0.35)"; e.currentTarget.style.background = "rgba(26,122,60,0.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,122,60,0.1)"; }}
            >
              <Plus size={22} className="text-gray-300 group-hover:text-green-600 transition-colors" />
            </div>
            <span className="text-sm font-bold text-gray-300 group-hover:text-green-600 transition-colors">
              Tạo học phần mới
            </span>
          </button>
        </div>
      </div>

      {/* ── CREATE FOLDER MODAL ── */}
      {showFolderModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFolderModal(false); }}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Tạo thư mục mới</h2>
                <p className="text-sm text-gray-400 mt-0.5">Tổ chức các học phần khoa học hơn</p>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Tên thư mục
              </label>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
                placeholder="VD: Topik I, Sơ cấp, TOPIK II..."
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  color: "#111827",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(26,122,60,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(26,122,60,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFolderModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 transition-colors hover:bg-gray-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #1a7a3c, #22c55e)",
                  boxShadow: "0 4px 12px rgba(26,122,60,0.3)",
                }}
                onMouseEnter={(e) => { if (newFolderName.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}