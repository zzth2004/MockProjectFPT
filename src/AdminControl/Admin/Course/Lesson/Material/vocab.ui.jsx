import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Plus, Edit3, Trash2, Volume2, Sparkles, Loader2,
  ChevronLeft, ChevronRight, Database, Filter, X, Languages, BookCopy, BookOpen
} from "lucide-react";

// Components
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import vocabService from "../../../../Service/API/lessonServiceAPI/vocab.service";
import lessonService from "../../../../Service/API/lessonServiceAPI/lesson.service";

export default function VocabList({ lessonId, lessonTitle }) {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        partOfSpeech: "", // Danh từ, Động từ, Tính từ...
    });

    // States cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [translatingId, setTranslatingId] = useState(null);

    // --- Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState(null); // null = Add, else = Edit
    const [lessons, setLessons] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        wordKorean: "",
        meaningVietnamese: "",
        partOfSpeech: "noun",
        level: "topik_1",
        pronunciationAudio: "",
        exampleKorean: "",
        exampleVietnamese: "",
        lessonId: lessonId || ""
    });

    // --- 2. FETCH DATA ---
    const fetchVocabsFn = useCallback(() => {
        // Nếu có lessonId thì lấy theo bài, ngược lại lấy tất cả
        if (lessonId) {
            return vocabService.getByLesson(lessonId, 1, 100);
        }
        return vocabService.getAllVocab(1, 100);
    }, [lessonId]);

    const { data: vocabResponse, loading, call: refreshVocabs } = useCallApiHandler(fetchVocabsFn);

    useEffect(() => {
        refreshVocabs();
    }, [refreshVocabs]);

    // --- 3. LOGIC LỌC DỮ LIỆU (3 TẦNG GIỐNG LESSONLIST) ---

    // Tầng 1: Dữ liệu gốc từ API
    const rawData = useMemo(() => vocabResponse?.data || [], [vocabResponse]);

    // Tầng 2: Dữ liệu chỉ lọc theo ô Search (Hàn, Hán, Việt)
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(item =>
            [item.wordKorean, item.wordHanja, item.meaningVietnamese].some(f =>
                f?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Tầng 3: Dữ liệu lọc nâng cao (Search + Loại từ)
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(item => {
            const searchMatch = !searchTerm ||
                [item.wordKorean, item.wordHanja, item.meaningVietnamese].some(f =>
                    f?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const typeMatch = filters.partOfSpeech === "" ||
                item.partOfSpeech === filters.partOfSpeech;

            return searchMatch && typeMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. LOGIC PHÂN TRANG (PAGINATION) ---

    // Xác định dataset hiện tại dựa trên trạng thái UI (Toán tử 3 ngôi)
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    // Logic 5 ô trang liên tục
    const visiblePages = useMemo(() => {
        const totalVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
        let end = Math.min(totalPages, start + totalVisible - 1);
        if (end === totalPages) start = Math.max(1, totalPages - totalVisible + 1);
        if (start === 1) end = Math.min(totalPages, totalVisible);
        
        const pages = [];
        for (let i = start; i <= end; i++) {
            if(i > 0) pages.push(i);
        }
        return pages;
    }, [currentPage, totalPages]);

    // Reset về trang 1 mỗi khi thay đổi bộ lọc hoặc tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, showFilters, lessonId]);

    // --- 5. HANDLERS ---
    const handleAiTranslate = async (item) => {
        setTranslatingId(item.id);
        try {
            const res = await vocabService.aiTranslateVocab(item.wordKorean);
            await vocabService.update(item.id, { meaningVietnamese: res.meaningVietnamese });
            refreshVocabs();
        } catch (e) { alert("AI đang bận..."); }
        finally { setTranslatingId(null); }
    };

    useEffect(() => {
        if (!lessonId) {
            lessonService.getAllLesson(1, 1000)
                .then(res => {
                    if (res && Array.isArray(res.data)) {
                        setLessons(res.data);
                    } else if (Array.isArray(res)) {
                        setLessons(res);
                    }
                })
                .catch(err => console.error("Lỗi khi lấy bài học:", err));
        }
    }, [lessonId]);

    const handleAddNew = () => {
        setSelectedVocab(null);
        setFormData({
            wordKorean: "",
            meaningVietnamese: "",
            partOfSpeech: "noun",
            level: "topik_1",
            pronunciationAudio: "",
            exampleKorean: "",
            exampleVietnamese: "",
            lessonId: lessonId || ""
        });
        setIsModalOpen(true);
    };

    const handleAction = async (type, item) => {
        if (type === 'edit') {
            try {
                setSelectedVocab(item);
                setFormData({
                    wordKorean: item.wordKorean || "",
                    meaningVietnamese: item.meaningVietnamese || "",
                    partOfSpeech: item.partOfSpeech || "noun",
                    level: item.level || "topik_1",
                    pronunciationAudio: item.pronunciationAudio || "",
                    exampleKorean: item.exampleKorean || "",
                    exampleVietnamese: item.exampleVietnamese || "",
                    lessonId: item.lessonId || item.lesson?.id || lessonId || ""
                });
                setIsModalOpen(true);

                const detail = await vocabService.getDetail(item.id);
                if (detail) {
                    setSelectedVocab(detail);
                    setFormData({
                        wordKorean: detail.wordKorean || "",
                        meaningVietnamese: detail.meaningVietnamese || "",
                        partOfSpeech: detail.partOfSpeech || "noun",
                        level: detail.level || "topik_1",
                        pronunciationAudio: detail.pronunciationAudio || "",
                        exampleKorean: detail.exampleKorean || "",
                        exampleVietnamese: detail.exampleVietnamese || "",
                        lessonId: detail.lessonId || detail.lesson?.id || lessonId || ""
                    });
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết từ vựng:", err);
            }
        } else if (type === 'delete' && window.confirm(`⚠️ Xóa từ vựng: ${item.wordKorean}?`)) {
            try {
                await vocabService.delete(item.id);
                alert("✅ Đã xóa thành công!");
                refreshVocabs();
            } catch (err) { 
                alert("❌ Lỗi khi xóa từ vựng"); 
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.wordKorean.trim()) {
            alert("Vui lòng nhập từ vựng tiếng Hàn");
            return;
        }
        if (!formData.meaningVietnamese.trim()) {
            alert("Vui lòng nhập nghĩa tiếng Việt");
            return;
        }
        if (!formData.lessonId) {
            alert("Vui lòng chọn bài học");
            return;
        }

        setIsSaving(true);
        try {
            if (selectedVocab) {
                const payload = {
                    wordKorean: formData.wordKorean.trim(),
                    meaningVietnamese: formData.meaningVietnamese.trim(),
                    partOfSpeech: formData.partOfSpeech,
                    level: formData.level,
                    pronunciationAudio: formData.pronunciationAudio.trim(),
                    exampleKorean: formData.exampleKorean.trim(),
                    exampleVietnamese: formData.exampleVietnamese.trim()
                };
                await vocabService.update(selectedVocab.id, payload);
            } else {
                const payload = {
                    wordKorean: formData.wordKorean.trim(),
                    meaningVietnamese: formData.meaningVietnamese.trim(),
                    partOfSpeech: formData.partOfSpeech,
                    level: formData.level,
                    pronunciationAudio: formData.pronunciationAudio.trim(),
                    exampleKorean: formData.exampleKorean.trim(),
                    exampleVietnamese: formData.exampleVietnamese.trim(),
                    lessonId: Number(formData.lessonId)
                };
                await vocabService.create(payload);
            }
            setIsModalOpen(false);
            refreshVocabs();
        } catch (error) {
            console.error("Lỗi khi lưu từ vựng:", error);
            alert("Có lỗi xảy ra khi lưu từ vựng. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleFilters = () => {
        if (showFilters) setFilters({ partOfSpeech: "" });
        setShowFilters(!showFilters);
    };

    // Định nghĩa các cột
    const columns = [
        {
            key: "wordKorean",
            title: "Từ vựng & Hanja",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[18px] font-black text-[#2d5a2d] leading-none">{val}</span>
                        <Volume2 size={14} className="text-gray-300 cursor-pointer hover:text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hán: {row.wordHanja || "---"}</span>
                        {!lessonId && (
                            <div className="flex items-center gap-1 border-l pl-2 border-gray-100">
                                <BookOpen size={10} className="text-gray-300" />
                                <span className="text-[9px] text-gray-400 font-bold uppercase truncate max-w-[100px]">
                                    Bài: {row.lesson?.title}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "partOfSpeech",
            title: "Loại từ",
            render: (val) => (
                <KLBadge type={val === 'noun' ? 'primary' : 'success'}>
                    <span className="text-[9px] font-black uppercase">{val || "N/A"}</span>
                </KLBadge>
            )
        },
        {
            key: "meaningVietnamese",
            title: "Nghĩa tiếng Việt",
            render: (val, row) => (
                <div className="flex items-center gap-3 group min-w-[180px]">
                    <span className="text-sm font-black text-gray-700">{val || "---"}</span>
                    <button 
                        onClick={() => handleAiTranslate(row)} 
                        disabled={translatingId === row.id}
                        className={`p-1.5 rounded-lg transition-all ${translatingId === row.id ? "animate-spin text-gray-300" : "opacity-0 group-hover:opacity-100 text-purple-600 bg-purple-50 hover:scale-110"}`}
                    >
                        {translatingId === row.id ? <Loader2 size={14} /> : <Sparkles size={14} />}
                    </button>
                </div>
            )
        },
        {
            key: "example",
            title: "Ví dụ minh họa",
            render: (_, row) => (
                <div className="flex flex-col text-left max-w-[250px]">
                    <p className="text-[11px] font-bold text-gray-600 italic line-clamp-1">"{row.exampleKorean}"</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">→ {row.exampleVietnamese}</p>
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
                        Quản lý <span className="text-[#2d5a2d]">Từ vựng</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        {lessonId ? `Học liệu bài: ${lessonTitle}` : "Hệ thống từ vựng KoreanLab"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={Database} onClick={() => vocabService.seedData().then(() => refreshVocabs())}>Seed JSON</KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={handleAddNew}>Thêm từ mới</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm từ vựng, nghĩa, Hanja..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
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
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Loại từ (Từ loại)</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.partOfSpeech}
                                onChange={(e) => setFilters({ ...filters, partOfSpeech: e.target.value })}
                            >
                                <option value="">Tất cả loại từ</option>
                                <option value="noun">Danh từ</option>
                                <option value="verb">Động từ</option>
                                <option value="adjective">Tính từ</option>
                                <option value="adverb">Trạng từ</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang nạp từ vựng...</div>
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
                                <span className="text-[10px] text-gray-400 font-bold mt-1">Tổng: {currentActiveDataset.length} từ vựng</span>
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {selectedVocab ? "Cập Nhật Từ Vựng" : "Thêm Từ Vựng Mới"}
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    {selectedVocab ? "Chỉnh sửa thông tin từ vựng" : "Tạo từ vựng mới cho hệ thống"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                            
                            {/* Grid 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Word Korean */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Từ vựng (Tiếng Hàn) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: 학교"
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.wordKorean}
                                        onChange={(e) => setFormData({ ...formData, wordKorean: e.target.value })}
                                    />
                                </div>

                                {/* Meaning Vietnamese */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nghĩa tiếng Việt *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: Trường học"
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.meaningVietnamese}
                                        onChange={(e) => setFormData({ ...formData, meaningVietnamese: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Grid 3 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Part Of Speech */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Loại từ *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.partOfSpeech}
                                        onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                                    >
                                        <option value="noun">Danh từ (Noun)</option>
                                        <option value="verb">Động từ (Verb)</option>
                                        <option value="adjective">Tính từ (Adjective)</option>
                                        <option value="adverb">Trạng từ (Adverb)</option>
                                        <option value="particle">Tiểu từ (Particle)</option>
                                        <option value="phrase">Cụm từ (Phrase)</option>
                                        <option value="idiom">Thành ngữ (Idiom)</option>
                                        <option value="grammar">Ngữ pháp (Grammar)</option>
                                        <option value="CONJUNCTION">Liên từ (Conjunction)</option>
                                        <option value="PREPOSITION">Giới từ (Preposition)</option>
                                    </select>
                                </div>

                                {/* TOPIK Level */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    >
                                        <option value="topik_1">TOPIK I (Cấp 1)</option>
                                        <option value="topik_2">TOPIK I (Cấp 2)</option>
                                        <option value="topik_3">TOPIK II (Cấp 3)</option>
                                        <option value="topik_4">TOPIK II (Cấp 4)</option>
                                        <option value="topik_5">TOPIK II (Cấp 5)</option>
                                        <option value="topik_6">TOPIK II (Cấp 6)</option>
                                    </select>
                                </div>

                                {/* Lesson ID */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Thuộc Bài Học *</label>
                                    {lessonId ? (
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl border-none font-bold text-sm text-gray-500 cursor-not-allowed outline-none"
                                            value={lessonTitle || `ID: ${lessonId}`}
                                        />
                                    ) : (
                                        <select
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.lessonId}
                                            onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                                        >
                                            <option value="">-- Chọn bài học --</option>
                                            {lessons.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>
                                                    [{lesson.level?.toUpperCase()}] {lesson.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Pronunciation Audio Link */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Link phát âm (Audio URL)</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: https://example.com/audio/school.mp3"
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                    value={formData.pronunciationAudio}
                                    onChange={(e) => setFormData({ ...formData, pronunciationAudio: e.target.value })}
                                />
                            </div>

                            {/* Example Korean */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Ví dụ Tiếng Hàn</label>
                                <textarea
                                    rows={2}
                                    placeholder="Ví dụ: 저는 학교에 갑니다."
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                    value={formData.exampleKorean}
                                    onChange={(e) => setFormData({ ...formData, exampleKorean: e.target.value })}
                                />
                            </div>

                            {/* Example Vietnamese */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Ví dụ dịch Tiếng Việt</label>
                                <textarea
                                    rows={2}
                                    placeholder="Ví dụ: Tôi đi đến trường."
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                    value={formData.exampleVietnamese}
                                    onChange={(e) => setFormData({ ...formData, exampleVietnamese: e.target.value })}
                                />
                            </div>

                            {/* Form Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3.5 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all active:scale-95 text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-3.5 rounded-2xl bg-[#2d5a2d] hover:bg-[#204020] text-white font-bold transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : (
                                        "Lưu lại"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}