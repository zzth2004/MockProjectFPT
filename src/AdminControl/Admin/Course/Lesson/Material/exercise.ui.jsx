import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
    ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit, 
    CheckCircle2, ListChecks, FileQuestion
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic & API
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import exerciseService from "../../../../Service/API/lessonServiceAPI/exercise.service";
import { useAuth } from "../../../../../context/authContext";

export default function ExerciseList({ lessonId, lessonTitle }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- 1. XÁC ĐỊNH ROLE & PATH ---
    const isTeacher = user?.role?.toLowerCase() === "teacher";
    const basePath = isTeacher ? "/teacher" : "/admin";

    // --- 2. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: "", 
        difficulty: "", 
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isGenerating, setIsGenerating] = useState(false);

    // --- 3. FETCH DATA ---
    const fetchExercisesFn = useCallback(() => {
        if (lessonId) {
            return exerciseService.getByLesson(lessonId, 1, 100);
        }
        return exerciseService.getAllExercises(1, 100);
    }, [lessonId]);

    const { data: exerciseResponse, loading, call: refreshExercises } = useCallApiHandler(fetchExercisesFn);

    useEffect(() => {
        refreshExercises();
    }, [refreshExercises, lessonId]);

    // --- 4. LOGIC BÓC TÁCH DỮ LIỆU TỪ API (FIXED FOR FE ONLY) ---
    const rawData = useMemo(() => {
        if (!exerciseResponse) return [];

        // Trường hợp 1: API trả về trực tiếp mảng [...]
        if (Array.isArray(exerciseResponse)) return exerciseResponse;

        // Trường hợp 2: API trả về object lồng nhau (do Service bóc tách dở dang)
        // Check res.data
        const dataLayer = exerciseResponse.data;
        if (Array.isArray(dataLayer)) return dataLayer;

        // Trường hợp 3: API trả về cấu trúc MaterialsService { exercises: { data: [...] } }
        if (exerciseResponse.exercises?.data) return exerciseResponse.exercises.data;
        if (dataLayer?.exercises?.data) return dataLayer.exercises.data;

        // Trường hợp 4: NestJS Pagination { items: [...] }
        if (exerciseResponse.items) return exerciseResponse.items;

        return [];
    }, [exerciseResponse]);

    // --- 5. LOGIC LỌC DỮ LIỆU TÌM KIẾM ---
    const filteredDataset = useMemo(() => {
        return rawData.filter(item => {
            // Tìm kiếm theo questionText hoặc Title
            const searchMatch = !searchTerm ||
                [item.questionText, item.title, item.instruction].some(f =>
                    f?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const typeMatch = filters.type === "" || item.type === filters.type;
            const difficultyMatch = filters.difficulty === "" || item.difficulty === filters.difficulty;

            return searchMatch && typeMatch && difficultyMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 6. PHÂN TRANG ---
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredDataset.slice(startIndex, startIndex + pageSize);
    }, [filteredDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDataset.length / pageSize);

    const visiblePages = useMemo(() => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i >= currentPage - 2 && i <= currentPage + 2) pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, lessonId]);

    // --- 7. HANDLERS ---
    const handleAiGenerate = async () => {
        if (!lessonId) return alert("Vui lòng chọn bài học cụ thể để AI tạo đề!");
        setIsGenerating(true);
        try {
            await exerciseService.getByLessonAi(lessonId); // Giả định endpoint AI của bạn
            alert("✅ AI đã tạo câu hỏi thành công!");
            refreshExercises();
        } catch (e) { 
            alert("AI đang bận, vui lòng thử lại sau!"); 
        } finally { 
            setIsGenerating(false); 
        }
    };

    const handleAction = async (type, item) => {
        if (type === 'edit') {
            navigate(`${basePath}/exercises/edit/${item.id}`);
        }
        if (type === 'delete' && window.confirm(`⚠️ Xóa bài tập: "${(item.questionText || item.title || '').substring(0, 30)}..."?`)) {
            try {
                await exerciseService.delete(item.id);
                alert("✅ Đã xóa!");
                refreshExercises();
            } catch (err) { 
                alert("❌ Không thể xóa bài tập này."); 
            }
        }
    };

    // --- 8. CẤU HÌNH CỘT (MAPPING ĐÚNG ENTITY) ---
    const columns = [
        {
            key: "questionText",
            title: "Nội dung bài tập",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <div className="flex items-start gap-2 mb-1">
                        <HelpCircle size={16} className="text-[#2d5a2d] mt-0.5 shrink-0" />
                        <span className="text-sm font-black text-gray-800 leading-tight line-clamp-2">
                            {val || row.title || row.instruction || "Chưa có nội dung"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <KLBadge type="info" className="text-[8px] px-1.5 py-0">
                            {row.type || 'EXERCISE'}
                        </KLBadge>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {row.options?.length || 0} Lựa chọn
                        </span>
                        {row.isAI && (
                            <KLBadge type="warning" className="text-[8px] px-1.5 py-0 flex items-center gap-1">
                                <Sparkles size={8}/> AI GEN
                            </KLBadge>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "score",
            title: "Điểm",
            render: (val) => (
                <div className="font-black text-[#2d5a2d] bg-green-50 px-3 py-1 rounded-full inline-block text-[11px]">
                    +{val || 10}
                </div>
            )
        },
        {
            key: "difficulty",
            title: "Mức độ",
            render: (val) => {
                const colors = { EASY: 'text-green-500', MEDIUM: 'text-orange-500', HARD: 'text-red-500' };
                const display = val || "MEDIUM";
                return (
                    <div className={`flex items-center gap-1 font-black text-[10px] uppercase ${colors[display] || 'text-gray-400'}`}>
                        <BrainCircuit size={12} />
                        {display}
                    </div>
                );
            }
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
                        {lessonId ? `Bài học: ${lessonTitle}` : "Kho dữ liệu câu hỏi hệ thống"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {lessonId && (
                        <KLButton 
                            variant="outline" 
                            icon={isGenerating ? Loader2 : Sparkles} 
                            onClick={handleAiGenerate}
                            className={isGenerating ? "animate-pulse" : "text-purple-600 border-purple-100"}
                            disabled={isGenerating}
                        >
                            AI Generate
                        </KLButton>
                    )}
                    <KLButton 
                        icon={Plus} 
                        className="bg-[#2d5a2d]"
                        onClick={() => navigate(`${basePath}/exercises/create`, { state: { lessonId } })}
                    >
                        Thêm câu hỏi
                    </KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nội dung bài tập..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm"
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
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Dạng bài tập</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tất cả các dạng</option>
                                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                                <option value="FILL_IN_BLANK">Điền từ</option>
                            </select>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mức độ</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                            >
                                <option value="">Tất cả mức độ</option>
                                <option value="EASY">Dễ</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HARD">Khó</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang nạp bài tập...</div>
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
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px]">
                                <span>Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1">Tìm thấy: {filteredDataset.length} bài tập</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                                <div className="flex gap-2">
                                    {visiblePages.map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${
                                                currentPage === page ? "bg-[#2d5a2d] text-white" : "bg-gray-50 text-gray-400"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 hover:bg-gray-100 transition-all"
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