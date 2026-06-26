import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
    ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit,
    CheckCircle2, ListChecks, FileQuestion, Trash, ArrowUp, ArrowDown, Code
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useMaterialQuestions from "./useMaterialQuestions";
import QuestionBuilder from "./QuestionBuilder";

// Components
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic & API
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import exerciseService from "../../../../Service/API/lessonServiceAPI/exercise.service";
import lessonService from "../../../../Service/API/lessonServiceAPI/lesson.service";
import vocabService from "../../../../Service/API/lessonServiceAPI/vocab.service";
import grammarService from "../../../../Service/API/lessonServiceAPI/grammarService.service";
import AiService from "../../../../Service/API/aiAPI/ai.service";
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
        skill: "",
        level: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null); // null = Add, else = Edit
    const [lessons, setLessons] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);


    // Exercise Composer State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        timeLimit: 15,
        type: "practice",
        skill: "reading",
        level: "topik_1",
        lessonId: lessonId || "",
        questions: []
    });

    const {
        showAiGeneratePanel, setShowAiGeneratePanel,
        aiQuestionsCount, setAiQuestionsCount,
        aiSelectedTypes, setAiSelectedTypes,
        isGeneratingQuestions, setIsGeneratingQuestions,
        showJsonInput, setShowJsonInput,
        jsonText, setJsonText,
        handleImportJson,
        handleAiGenerateQuestions,
        questionHelpers
    } = useMaterialQuestions(formData, setFormData, formData.lessonId || lessonId);

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
            const skillMatch = filters.skill === "" || item.skill === filters.skill;
            const levelMatch = filters.level === "" || item.level === filters.level;

            return searchMatch && typeMatch && skillMatch && levelMatch;
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
    const resetModalHelperStates = () => {
        setIsGeneratingQuestions(false);
        setShowJsonInput(false);
        setJsonText('');
        setShowAiGeneratePanel(false);
        setAiQuestionsCount(5);
        setAiSelectedTypes(['multiple_choice']);
    };

    const handleAddNew = () => {
        resetModalHelperStates();
        setIsViewMode(false);
        setSelectedExercise(null);
        setFormData({
            title: '',
            description: '',
            timeLimit: 15,
            type: 'practice',
            skill: 'reading',
            level: 'topik_1',
            lessonId: lessonId || '',
            questions: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (item) => {
        try {
            resetModalHelperStates();
            setIsViewMode(false);
            setSelectedExercise(item);
            setFormData({
                title: item.title || '',
                description: item.description || '',
                timeLimit: item.timeLimit || 15,
                type: item.type || 'practice',
                skill: item.skill || 'reading',
                level: item.level || 'topik_1',
                lessonId: item.lessonId || item.lesson?.id || lessonId || '',
                questions: item.questions || []
            });
            setIsModalOpen(true);

            const detail = await exerciseService.getDetail(item.id);
            if (detail) {
                setSelectedExercise(detail);
                setFormData({
                    title: detail.title || '',
                    description: detail.description || '',
                    timeLimit: detail.timeLimit || 15,
                    type: detail.type || 'practice',
                    skill: detail.skill || 'reading',
                    level: detail.level || 'topik_1',
                    lessonId: detail.lessonId || detail.lesson?.id || lessonId || '',
                    questions: detail.questions || []
                });
            }
        } catch (err) {
            console.error('Lỗi khi tải chi tiết:', err);
        }
    };

    const handleAction = async (type, item) => {
        if (type === 'edit') {
            handleEdit(item);
        }
        if (type === 'view') {
            resetModalHelperStates();
            setIsViewMode(true);
            setSelectedExercise(item);
            setFormData({
                title: item.title || '',
                description: item.description || '',
                timeLimit: item.timeLimit || 15,
                type: item.type || 'practice',
                skill: item.skill || 'reading',
                level: item.level || 'topik_1',
                lessonId: item.lessonId || item.lesson?.id || lessonId || '',
                questions: item.questions || []
            });
            setIsModalOpen(true);
        }
        if (type === 'delete' && window.confirm('⚠️ Xóa mục này?')) {
            try {
                await exerciseService.delete(item.id);
                alert('✅ Đã xóa!');
                refreshExercises();
            } catch (err) {
                alert('❌ Không thể xóa mục này.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isViewMode) return;
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tiêu đề bài tập");
            return;
        }

        setIsSaving(true);
        try {
            const formattedQuestions = formData.questions.map((q, qIdx) => {
                const isGameType = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(q.type);
                const questionPayload = {
                    id: q.id || undefined,
                    type: q.type || "multiple_choice",
                    questionText: q.questionText.trim(),
                    explanation: q.explanation?.trim() || "",
                    points: Number(q.points) || 10,
                    orderIndex: qIdx,
                };

                if (isGameType) {
                    let preparedGameData = null;
                    if (["matching", "memory_card", "word_match", "fast_match"].includes(q.type)) {
                        preparedGameData = {
                            pairs: (q.gameData?.pairs || []).map(p => {
                                const leftVal = (p.left !== undefined ? p.left : (p.kor !== undefined ? p.kor : "")).trim();
                                const rightVal = (p.right !== undefined ? p.right : (p.vie !== undefined ? p.vie : "")).trim();
                                return {
                                    left: leftVal,
                                    right: rightVal,
                                    kor: leftVal,
                                    vie: rightVal
                                };
                            })
                        };
                        if (q.type === "fast_match") {
                            preparedGameData.gridSize = Number(q.gameData?.gridSize) || 9;
                        }
                    } else if (q.type === "word_search") {
                        preparedGameData = {
                            gridSize: Number(q.gameData?.gridSize) || 5,
                            words: (q.gameData?.words || []).map(w => w.trim()).filter(Boolean)
                        };
                    }
                    questionPayload.gameData = preparedGameData;
                    questionPayload.options = [];
                } else {
                    questionPayload.gameData = null;
                    questionPayload.options = (q.options || []).map((opt, oIdx) => ({
                        id: opt.id || undefined,
                        optionText: opt.optionText.trim(),
                        isCorrect: !!opt.isCorrect,
                        orderIndex: oIdx,
                        explanation: opt.explanation?.trim() || ""
                    }));
                }
                return questionPayload;
            });

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                timeLimit: Number(formData.timeLimit) || 0,
                type: formData.type,
                skill: formData.skill,
                level: formData.level,
                lessonId: formData.lessonId ? Number(formData.lessonId) : null,
                questions: formattedQuestions
            };

            if (selectedExercise) {
                await exerciseService.update(selectedExercise.id, payload);
            } else {
                await exerciseService.create(payload);
            }
            setIsModalOpen(false);
            refreshExercises();
        } catch (error) {
            console.error("Lỗi khi lưu bài tập:", error);
            alert("Có lỗi xảy ra khi lưu bài tập. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            key: "title",
            title: "Tên bài tập",
            width: "40%",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1 min-w-[280px]">
                    <div className="flex items-start gap-2 mb-1">
                        <FileQuestion size={16} className="text-[#2d5a2d] mt-0.5 shrink-0" />
                        <span className="text-sm font-black text-gray-800 leading-tight break-words">
                            {val || "Chưa có tiêu đề"}
                        </span>
                    </div>
                    {row.description && (
                        <p className="text-[11px] text-gray-400 font-medium break-words mt-0.5">{row.description}</p>
                    )}
                </div>
            )
        },
        {
            key: "type",
            title: "Phân loại",
            width: "15%",
            className: "whitespace-nowrap",
            render: (val, row) => {
                const typeMapping = {
                    practice: { text: "Luyện tập", style: "success" },
                    midterm: { text: "Thi giữa kỳ", style: "warning" },
                    final: { text: "Thi cuối kỳ", style: "danger" },
                    topik_test: { text: "Thi TOPIK", style: "info" }
                };
                const mapped = typeMapping[val] || { text: val || 'Luyện tập', style: 'success' };
                const skillLabels = {
                    reading: "Đọc",
                    listening: "Nghe",
                    writing: "Viết",
                    grammar: "Ngữ pháp",
                    vocabulary: "Từ vựng"
                };
                const skillText = skillLabels[row.skill] || row.skill || 'Đọc';
                return (
                    <div className="flex flex-col text-left gap-1">
                        <KLBadge type={mapped.style}>
                            <span className="text-[9px] font-black uppercase">{mapped.text}</span>
                        </KLBadge>
                        <KLBadge type="info">
                            <span className="text-[9px] font-black uppercase">Kỹ năng: {skillText}</span>
                        </KLBadge>
                    </div>
                );
            }
        },
        {
            key: "questions",
            title: "Số câu hỏi",
            width: "12%",
            className: "whitespace-nowrap text-center",
            render: (val, row) => (
                <div className="font-black text-[#2d5a2d] bg-green-50 px-3 py-1 rounded-full inline-block text-[11px] text-center">
                    {row.questions?.length || 0} câu hỏi
                </div>
            )
        },
        {
            key: "level",
            title: "Trình độ",
            width: "12%",
            className: "whitespace-nowrap text-center",
            render: (val) => (
                <div className="flex items-center justify-center gap-1 font-black text-[10px] uppercase text-orange-600">
                    <BrainCircuit size={12} />
                    {val || "topik_1"}
                </div>
            )
        },
        {
            key: "timeLimit",
            title: "Thời gian",
            width: "12%",
            className: "whitespace-nowrap text-center",
            render: (val) => (
                <span className="text-xs text-gray-500 font-medium block text-center">
                    {val ? `${val} phút` : "Không giới hạn"}
                </span>
            )
        }
    ];

    if (isTeacher || user?.role?.toLowerCase() === "admin") {
        columns.push({
            key: "gameRoom",
            title: "Phòng live quiz",
            width: "14%",
            className: "whitespace-nowrap text-center",
            render: (val, row) => (
                <div className="text-center py-1">
                    <KLButton
                        size="xs"
                        className="bg-[#377437] text-[10px] font-black hover:bg-[#2a522a] text-white py-1.5 px-3 rounded-xl"
                        onClick={() => navigate(`${basePath}/game-room/host?exerciseId=${row.id}`)}
                    >
                        Tạo phòng
                    </KLButton>
                </div>
            )
        });
    }

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
                        onClick={handleAddNew}
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
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Phân loại đề</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tất cả phân loại</option>
                                <option value="practice">Luyện tập</option>
                                <option value="midterm">Thi giữa kỳ</option>
                                <option value="final">Thi cuối kỳ</option>
                                <option value="topik_test">Thi TOPIK</option>
                            </select>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kỹ năng</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.skill}
                                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                            >
                                <option value="">Tất cả kỹ năng</option>
                                <option value="reading">Đọc (Reading)</option>
                                <option value="listening">Nghe (Listening)</option>
                                <option value="writing">Viết (Writing)</option>
                                <option value="grammar">Ngữ pháp (Grammar)</option>
                                <option value="vocabulary">Từ vựng (Vocabulary)</option>
                            </select>
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                            >
                                <option value="">Tất cả trình độ</option>
                                <option value="topik_1">TOPIK 1</option>
                                <option value="topik_2">TOPIK 2</option>
                                <option value="topik_3">TOPIK 3</option>
                                <option value="topik_4">TOPIK 4</option>
                                <option value="topik_5">TOPIK 5</option>
                                <option value="topik_6">TOPIK 6</option>
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
                            hiddenActions={['reset', 'lock']}
                            actionVariant="link"
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
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${currentPage === page ? "bg-[#2d5a2d] text-white" : "bg-gray-50 text-gray-400"
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


            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">

                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {isViewMode ? "Xem Chi Tiết Bài Tập" : (selectedExercise ? "Cập Nhật Bộ Bài Tập" : "Tạo Bộ Bài Tập Mới")}
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    {isViewMode ? "Thông tin chi tiết của bài tập (đọc‑chỉ)" : (selectedExercise ? "Chỉnh sửa bộ câu hỏi và đáp án" : "Tạo mới bộ đề bài tập cho bài học")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

                            {/* SECTION 1: GENERAL INFO */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b pb-2">1. Thông tin chung bộ đề</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Title */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tiêu đề bài tập *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Ôn tập từ vựng & ngữ pháp Bài 1"
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            disabled={isViewMode}
                                        />
                                    </div>

                                    {/* Lesson Select */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Thuộc Bài Học</label>
                                        {lessonId ? (
                                            <input
                                                type="text"
                                                disabled
                                                className="w-full px-4 py-3.5 bg-gray-100 rounded-2xl border-none font-bold text-sm text-gray-500 cursor-not-allowed outline-none"
                                                value={lessonTitle || `ID: ${lessonId}`}
                                            />
                                        ) : (
                                            <select
                                                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                                value={formData.lessonId || ""}
                                                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                                                disabled={isViewMode}
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

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Type */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Phân loại *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            disabled={isViewMode}
                                        >
                                            <option value="practice">Luyện tập (Practice)</option>
                                            <option value="midterm">Thi giữa kỳ (Midterm)</option>
                                            <option value="final">Thi cuối kỳ (Final Exam)</option>
                                            <option value="topik_test">Thi TOPIK (TOPIK Test)</option>
                                        </select>
                                    </div>

                                    {/* Skill */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kỹ năng *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.skill}
                                            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                                            disabled={isViewMode}
                                        >
                                            <option value="reading">Đọc (Reading)</option>
                                            <option value="listening">Nghe (Listening)</option>
                                            <option value="writing">Viết (Writing)</option>
                                            <option value="grammar">Ngữ pháp (Grammar)</option>
                                            <option value="vocabulary">Từ vựng (Vocabulary)</option>
                                        </select>
                                    </div>

                                    {/* Level */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            disabled={isViewMode}
                                        >
                                            <option value="topik_1">TOPIK I (Cấp 1)</option>
                                            <option value="topik_2">TOPIK I (Cấp 2)</option>
                                            <option value="topik_3">TOPIK II (Cấp 3)</option>
                                            <option value="topik_4">TOPIK II (Cấp 4)</option>
                                            <option value="topik_5">TOPIK II (Cấp 5)</option>
                                            <option value="topik_6">TOPIK II (Cấp 6)</option>
                                        </select>
                                    </div>

                                    {/* Time Limit */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Thời gian (Phút)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.timeLimit}
                                            onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mô tả bài tập</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Mô tả hoặc yêu cầu làm bài..."
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={isViewMode}
                                    />
                                </div>
                            </div>

                            {/* SECTION 2: QUESTIONS LIST (Refactored to QuestionBuilder) */}
                            <QuestionBuilder
                                formData={formData}
                                isViewMode={isViewMode}
                                showAiGeneratePanel={showAiGeneratePanel}
                                setShowAiGeneratePanel={setShowAiGeneratePanel}
                                aiQuestionsCount={aiQuestionsCount}
                                setAiQuestionsCount={setAiQuestionsCount}
                                aiSelectedTypes={aiSelectedTypes}
                                setAiSelectedTypes={setAiSelectedTypes}
                                isGeneratingQuestions={isGeneratingQuestions}
                                showJsonInput={showJsonInput}
                                setShowJsonInput={setShowJsonInput}
                                jsonText={jsonText}
                                setJsonText={setJsonText}
                                handleImportJson={handleImportJson}
                                handleAiGenerateQuestions={handleAiGenerateQuestions}
                                questionHelpers={questionHelpers}
                            />
                            {/* Form Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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