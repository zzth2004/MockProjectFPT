import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Plus, Edit3, Trash2, BookOpen, 
  ChevronLeft, ChevronRight, Hash, Database, Filter, X, 
  Info, Languages
} from "lucide-react";

// Components
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import grammarService from "../../../../Service/API/lessonServiceAPI/grammarService.service";

export default function GrammarList({ lessonId, lessonTitle }) {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        level: "",
        isActive: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 2. FETCH DATA ---
    const fetchGrammarsFn = useCallback(() => {
        if (lessonId) {
            return grammarService.getByLesson(lessonId, 1, 100);
        }
        return grammarService.getAllGrammar(1, 100);
    }, [lessonId]);

    const { data: grammarResponse, loading, call: refresh } = useCallApiHandler(fetchGrammarsFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // --- 3. LOGIC LỌC DỮ LIỆU ---
    const rawData = useMemo(() => grammarResponse?.data || [], [grammarResponse]);

    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(item =>
            [item.pattern, item.explanation, item.meaning].some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    const advancedFilteredData = useMemo(() => {
        return rawData.filter(item => {
            const searchMatch = !searchTerm ||
                [item.pattern, item.explanation, item.meaning].some(field =>
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            const levelMatch = !filters.level || item.level === filters.level;
            const statusMatch = filters.isActive === "" || String(item.isActive) === filters.isActive;
            return searchMatch && levelMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. LOGIC PHÂN TRANG (PAGINATION) ---
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    // 🚀 LOGIC HIỂN THỊ 5 TRANG LIÊN TỤC (SLIDING WINDOW)
    const visiblePages = useMemo(() => {
        const totalVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
        let end = Math.min(totalPages, start + totalVisible - 1);

        if (end === totalPages) {
            start = Math.max(1, totalPages - totalVisible + 1);
        }
        if (start === 1) {
            end = Math.min(totalPages, totalVisible);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, showFilters, lessonId]);

    // --- 5. HANDLERS ---
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilters({ level: "", isActive: "" });
        setCurrentPage(1);
    };

    const toggleFilters = () => {
        if (showFilters) setFilters({ level: "", isActive: "" });
        setShowFilters(!showFilters);
    };

    const handleAction = async (type, item) => {
        switch (type) {
            case 'edit':
                console.log("Mở modal sửa:", item.id);
                break;
            case 'delete':
                if (window.confirm(`Xóa cấu trúc: ${item.pattern}?`)) {
                    await grammarService.delete(item.id);
                    refresh();
                }
                break;
            default: break;
        }
    };

    const columns = [
        {
            key: "pattern",
            title: "Cấu trúc & Giải thích",
            render: (val, row) => (
                <div className="flex flex-col text-left py-2">
                    <span className="text-[16px] font-black text-[#2d5a2d] leading-tight mb-1">{val}</span>
                    <div className="flex items-center gap-2">
                        <KLBadge type="warning">
                            <span className="text-[9px] font-black uppercase">Level: {row.lesson?.level || 'N/A'}</span>
                        </KLBadge>
                        {!lessonId && (
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest border-l pl-2">
                                Bài: {row.lesson?.title || "---"}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "usageNote",
            title: "Ý nghĩa",
            render: (val) => (
                <div className="flex items-center gap-2 text-gray-700 font-light text-sm">
                    <Languages size={14} className="text-gray-300" />
                    <span>{val || "---"}</span>
                </div>
            )
        },
        {
            key: "exampleKorean",
            title: "Ví dụ minh họa",
            render: (val, row) => (
                <div className="flex flex-col text-left max-w-[280px]">
                    <p className="text-[11px] font-black text-gray-600 italic line-clamp-1">"{val}"</p>
                    <p className="text-[10px] text-gray-400 font-bold truncate">→ {row.exampleVietnamese}</p>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Quản lý <span className="text-[#2d5a2d]">Ngữ pháp</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        {lessonId ? `Học liệu bài: ${lessonTitle}` : "Hệ thống ngữ pháp KoreanLab"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={Database} onClick={() => grammarService.seedData().then(() => refresh())}>Seed Data</KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Thêm mới</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <KLButton
                        variant={showFilters ? "primary" : "outline"}
                        icon={showFilters ? X : Filter}
                        onClick={toggleFilters}
                        className={showFilters ? "bg-black text-white" : ""}
                    >
                        {showFilters ? "Đóng lọc" : "Lọc nâng cao"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px]"
                                value={filters.level} onChange={(e) => handleFilterChange("level", e.target.value)}>
                                <option value="">Tất cả trình độ</option>
                                <option value="topik_1">TOPIK 1</option>
                                <option value="topik_2">TOPIK 2</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={resetFilters} className="text-[10px] font-black text-red-500 uppercase underline mb-3">Xóa bộ lọc</button>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE & PAGINATION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse">ĐANG TẢI...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            showAction={true}
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock', 'view']}
                        />

                        {/* FOOTER PAGINATION */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
                                    Trang {currentPage} / {totalPages || 1}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                    Tìm thấy {currentActiveDataset.length} kết quả
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>

                                <div className="flex gap-2">
                                    {visiblePages.map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${
                                                currentPage === page 
                                                ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100" 
                                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90"
                                >
                                    <ChevronRight size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}