import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Search, Plus, Filter, X, ChevronLeft, ChevronRight,
    Layers, Globe, Lock, Clock, Edit3, Trash2, Eye, 
    CheckCircle2, AlertCircle, PlayCircle, BookOpen, GraduationCap
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import flashcardService from "../../Service/API/flashcardServiceAPI/flashcard.service";

export default function FlashcardDeckList() {
   const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        isPublic: "", // "", "true", "false"
        status: "",   // Khớp với DeckStatus Enum (ACTIVE, INACTIVE...)
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 2. FETCH DATA ---
    const fetchDecksFn = useCallback(() => flashcardService.getAllDecks(1, 100), []);
    const { data: decksResponse, loading, call: refreshDecks } = useCallApiHandler(fetchDecksFn);

    useEffect(() => {
        refreshDecks();
    }, [refreshDecks]);

    // --- 3. LOGIC LỌC DỮ LIỆU 3 TẦNG (Giữ nguyên chuẩn KoreanLab) ---
    
    // Tầng 1: Dữ liệu gốc
    const rawData = useMemo(() => decksResponse || [], [decksResponse]);

    // Tầng 2: Search nhanh (Tiêu đề & Mô tả)
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(deck =>
            [deck.title, deck.description].some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Tầng 3: Lọc nâng cao (Search + Privacy + Status)
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(deck => {
            const searchMatch = !searchTerm ||
                [deck.title, deck.description].some(field =>
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const publicMatch = filters.isPublic === "" ||
                String(deck.isPublic) === filters.isPublic;

            const statusMatch = filters.status === "" || deck.status === filters.status;

            return searchMatch && publicMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. PAGINATION ---
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, showFilters]);

    // --- 5. ĐỊNH NGHĨA CÁC CỘT (COLUMNS) ---
    const columns = [
        {
            key: "title",
            title: "Tên bộ thẻ (Deck Title)",
            render: (val, row) => (
                <div className="flex items-center gap-4 text-left py-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#2d5a2d] flex items-center justify-center text-white shadow-lg shrink-0">
                        <LayoutGrid size={22} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-black text-gray-900 uppercase tracking-tight leading-none mb-1.5">
                            {val}
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold italic line-clamp-1 max-w-[250px]">
                            {row.description || "Hệ thống Flashcard thông minh KoreanLab"}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: "flashcards",
            title: "Quy mô",
            render: (val) => (
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Layers size={12} className="text-[#2d5a2d]" />
                        <span className="text-[13px] font-black text-gray-800">{val?.length || 0}</span>
                    </div>
                    <span className="text-[8px] text-gray-400 font-black uppercase mt-1 ml-1 tracking-widest">Thẻ Flashcard</span>
                </div>
            )
        },
        {
            key: "isPublic",
            title: "Chế độ",
            render: (val) => (
                <KLBadge type={val ? "primary" : "default"}>
                    <div className="flex items-center gap-1.5">
                        {val ? <Globe size={11} /> : <Lock size={11} />}
                        <span className="text-[9px] font-black uppercase">{val ? "Công khai" : "Riêng tư"}</span>
                    </div>
                </KLBadge>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val === 'ACTIVE' ? "success" : "danger"}>
                    <div className="flex items-center gap-1.5">
                        {val === 'ACTIVE' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{val}</span>
                    </div>
                </KLBadge>
            )
        }
    ];

    // --- 6. HANDLERS ---
    const handleAction = async (type, item) => {
        if (type === 'view') {
            console.log("Xem chi tiết Deck:", item.id);
        }
        if (type === 'delete' && window.confirm(`⚠️ Bạn có chắc muốn xóa bộ thẻ "${item.title}"?`)) {
            try {
                await flashcardService.deleteDeck(item.id);
                refreshDecks();
            } catch (err) { alert("❌ Lỗi khi xóa bộ thẻ"); }
        }
    };

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Quản lý <span className="text-[#2d5a2d]">Bộ thẻ</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        Hệ thống Flashcard Deck Management
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Tạo bộ thẻ mới</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bộ thẻ theo tên..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <KLButton
                        variant={showFilters ? "primary" : "outline"}
                        icon={showFilters ? X : Filter}
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-black text-white" : ""}
                    >
                        {showFilters ? "Đóng lọc" : "Lọc nâng cao"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Quyền truy cập</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.isPublic}
                                onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })}
                            >
                                <option value="">Tất cả chế độ</option>
                                <option value="true">Công khai (Public)</option>
                                <option value="false">Riêng tư (Private)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái Deck</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Hoạt động (Active)</option>
                                <option value="INACTIVE">Tạm khóa (Inactive)</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang tải dữ liệu bộ thẻ...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            showAction={true}
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock']}
                        />

                        {/* PAGINATION (Chuẩn KoreanLab 5 nút liên tục) */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {currentActiveDataset.length} bộ decks</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all active:scale-90"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                                
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => Math.abs(page - currentPage) <= 2)
                                        .map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all active:scale-90 ${
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
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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