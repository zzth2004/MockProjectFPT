import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
  ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit, 
  CheckCircle2, ListChecks, FileQuestion
} from "lucide-react";

// Components (Giữ nguyên hệ thống component KL của bạn)
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import exerciseService from "../../../../Service/API/lessonServiceAPI/exercise.service"; // Giả định service của bạn

export default function ExerciseList({ lessonId, lessonTitle }) {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: "", // Trắc nghiệm, Điền từ, Sắp xếp câu...
        difficulty: "", // Dễ, Trung bình, Khó
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isGenerating, setIsGenerating] = useState(false);

    // --- 2. FETCH DATA ---
    const fetchExercisesFn = useCallback(() => {
        if (lessonId) {
            return exerciseService.getByLesson(lessonId, 1, 100);
        }
        return exerciseService.getAllExercises(1, 100);
    }, [lessonId]);

    const { data: exerciseResponse, loading, call: refreshExercises } = useCallApiHandler(fetchExercisesFn);

    useEffect(() => {
        refreshExercises();
    }, [refreshExercises]);

    // --- 3. LOGIC LỌC DỮ LIỆU 3 TẦNG ---

    // Tầng 1: Raw
    const rawData = useMemo(() => exerciseResponse?.data || [], [exerciseResponse]);

    // Tầng 2: Search Only (Lọc theo câu hỏi hoặc gợi ý)
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(item =>
            [item.question, item.instruction].some(f =>
                f?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Tầng 3: Advanced (Search + Loại bài tập + Độ khó)
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(item => {
            const searchMatch = !searchTerm ||
                [item.question, item.instruction].some(f =>
                    f?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const typeMatch = filters.type === "" || item.type === filters.type;
            const difficultyMatch = filters.difficulty === "" || item.difficulty === filters.difficulty;

            return searchMatch && typeMatch && difficultyMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. PAGINATION LOGIC ---
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    const visiblePages = useMemo(() => {
        const totalVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
        let end = Math.min(totalPages, start + totalVisible - 1);
        if (end === totalPages) start = Math.max(1, totalPages - totalVisible + 1);
        if (start === 1) end = Math.min(totalPages, totalVisible);
        
        const pages = [];
        for (let i = start; i <= end; i++) { if(i > 0) pages.push(i); }
        return pages;
    }, [currentPage, totalPages]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, showFilters, lessonId]);

    // --- 5. HANDLERS ---
    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            // Giả định logic gọi AI tạo bài tập dựa trên lessonId
            await exerciseService.aiGenerateByLesson(lessonId);
            refreshExercises();
        } catch (e) { alert("AI đang bận thiết kế câu hỏi..."); }
        finally { setIsGenerating(false); }
    };

    const handleAction = async (type, item) => {
        if (type === 'delete' && window.confirm(`⚠️ Xóa câu hỏi: "${item.question.substring(0, 20)}..."?`)) {
            try {
                await exerciseService.delete(item.id);
                refreshExercises();
            } catch (err) { alert("❌ Lỗi khi xóa bài tập"); }
        }
    };

    // --- 6. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "question",
            title: "Nội dung câu hỏi",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <div className="flex items-start gap-2 mb-1">
                        <HelpCircle size={16} className="text-[#2d5a2d] mt-0.5 shrink-0" />
                        <span className="text-sm font-black text-gray-800 leading-tight line-clamp-2">{val}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {row.options?.length || 0} Lựa chọn
                        </span>
                        {!lessonId && (
                            <div className="flex items-center gap-1 border-l pl-2 border-gray-100">
                                <FileQuestion size={10} className="text-gray-300" />
                                <span className="text-[9px] text-gray-400 font-bold uppercase">
                                    {row.lesson?.title}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "type",
            title: "Loại hình",
            render: (val) => (
                <KLBadge type={val === 'multiple_choice' ? 'primary' : 'success'}>
                    <span className="text-[9px] font-black uppercase">
                        {val === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền từ'}
                    </span>
                </KLBadge>
            )
        },
        {
            key: "difficulty",
            title: "Độ khó",
            render: (val) => {
                const colors = { easy: 'text-green-500', medium: 'text-orange-500', hard: 'text-red-500' };
                return (
                    <div className={`flex items-center gap-1 font-black text-[10px] uppercase ${colors[val] || 'text-gray-400'}`}>
                        <BrainCircuit size={12} />
                        {val || "N/A"}
                    </div>
                );
            }
        },
        {
            key: "score",
            title: "Điểm số",
            render: (val) => (
                <div className="font-black text-gray-700 bg-gray-50 px-3 py-1 rounded-full inline-block text-[11px]">
                    +{val || 10} pts
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
                        Quản lý <span className="text-[#2d5a2d]">Bài tập</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        {lessonId ? `Bài tập cho: ${lessonTitle}` : "Kho câu hỏi hệ thống"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton 
                        variant="outline" 
                        icon={isGenerating ? Loader2 : Sparkles} 
                        onClick={handleAiGenerate}
                        className={isGenerating ? "animate-pulse" : "text-purple-600 border-purple-100"}
                        disabled={isGenerating}
                    >
                        AI Generate
                    </KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Thêm câu hỏi</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nội dung câu hỏi..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
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
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Dạng bài tập</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tất cả các dạng</option>
                                <option value="multiple_choice">Trắc nghiệm</option>
                                <option value="fill_in_blank">Điền từ vào chỗ trống</option>
                                <option value="reorder">Sắp xếp câu</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mức độ</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                            >
                                <option value="">Tất cả mức độ</option>
                                <option value="easy">Dễ (Cơ bản)</option>
                                <option value="medium">Trung bình</option>
                                <option value="hard">Khó (Nâng cao)</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang tải câu hỏi...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            showAction={true}
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock', 'view']}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1">Tổng cộng: {currentActiveDataset.length} câu hỏi</span>
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
                                    {visiblePages.map((page) => (
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