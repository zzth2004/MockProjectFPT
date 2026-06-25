import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
    ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit, 
    CheckCircle2, ListChecks, FileQuestion, Trash, ArrowUp, ArrowDown
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
import lessonService from "../../../../Service/API/lessonServiceAPI/lesson.service";
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
        setIsViewMode(false);
        setSelectedExercise(null);
        setFormData({
            title: "",
            description: "",
            timeLimit: 15,
            type: "practice",
            skill: "reading",
            level: "topik_1",
            lessonId: lessonId || "",
            questions: []
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (item) => {
        try {
            setIsViewMode(false);
            setSelectedExercise(item);
            setFormData({
                title: item.title || "",
                description: item.description || "",
                timeLimit: item.timeLimit || 0,
                type: item.type || "practice",
                skill: item.skill || "reading",
                level: item.level || "topik_1",
                lessonId: item.lessonId || item.lesson?.id || lessonId || "",
                questions: item.questions || []
            });
            setIsModalOpen(true);

            const detail = await exerciseService.getDetail(item.id);
            if (detail) {
                setSelectedExercise(detail);
                setFormData({
                    title: detail.title || "",
                    description: detail.description || "",
                    timeLimit: detail.timeLimit || 0,
                    type: detail.type || "practice",
                    skill: detail.skill || "reading",
                    level: detail.level || "topik_1",
                    lessonId: detail.lessonId || detail.lesson?.id || lessonId || "",
                    questions: detail.questions || []
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải chi tiết bài tập:", err);
        }
    };

    const handleAction = async (type, item) => {
        if (type === 'edit') {
            handleEdit(item);
        }
        if (type === 'view') {
            // Open read‑only modal
            setIsViewMode(true);
            setSelectedExercise(item);
            setFormData({
                title: item.title || "",
                description: item.description || "",
                timeLimit: item.timeLimit || 0,
                type: item.type || "practice",
                skill: item.skill || "reading",
                level: item.level || "topik_1",
                lessonId: item.lessonId || item.lesson?.id || lessonId || "",
                questions: item.questions || []
            });
            setIsModalOpen(true);
        }
        if (type === 'delete' && window.confirm(`⚠️ Xóa bài tập: "${item.title || ''}"?`)) {
            try {
                await exerciseService.delete(item.id);
                alert("✅ Đã xóa!");
                refreshExercises();
            } catch (err) { 
                alert("❌ Không thể xóa bài tập này."); 
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
        if (!formData.lessonId) {
            alert("Vui lòng chọn bài học");
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
                lessonId: Number(formData.lessonId),
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
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <div className="flex items-start gap-2 mb-1">
                        <FileQuestion size={16} className="text-[#2d5a2d] mt-0.5 shrink-0" />
                        <span className="text-sm font-black text-gray-800 leading-tight line-clamp-2">
                            {val || "Chưa có tiêu đề"}
                        </span>
                    </div>
                    {row.description && (
                        <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{row.description}</p>
                    )}
                </div>
            )
        },
        {
            key: "type",
            title: "Phân loại",
            render: (val, row) => (
                <div className="flex flex-col text-left gap-1">
                    <KLBadge type="primary">
                        <span className="text-[9px] font-black uppercase">{val || 'practice'}</span>
                    </KLBadge>
                    <KLBadge type="success">
                        <span className="text-[9px] font-black uppercase">Kỹ năng: {row.skill || 'reading'}</span>
                    </KLBadge>
                </div>
            )
        },
        {
            key: "questions",
            title: "Số câu hỏi",
            render: (val, row) => (
                <div className="font-black text-[#2d5a2d] bg-green-50 px-3 py-1 rounded-full inline-block text-[11px] text-center">
                    {row.questions?.length || 0} câu hỏi
                </div>
            )
        },
        {
            key: "level",
            title: "Trình độ",
            render: (val) => (
                <div className="flex items-center gap-1 font-black text-[10px] uppercase text-orange-600">
                    <BrainCircuit size={12} />
                    {val || "topik_1"}
                </div>
            )
        },
        {
            key: "timeLimit",
            title: "Thời gian",
            render: (val) => (
                <span className="text-xs text-gray-500 font-medium">
                    {val ? `${val} phút` : "Không giới hạn"}
                </span>
            )
        }
    ];

    if (isTeacher || user?.role?.toLowerCase() === "admin") {
        columns.push({
            key: "gameRoom",
            title: "Phòng live quiz",
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
                            hiddenActions={['reset', 'lock']}
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

            {/* --- QUESTION & OPTION HELPERS --- */}
            {(() => {
                // We define helper functions here to make them accessible inside the component's scope
                window.exerciseHelpers = {
                    addQuestion: () => {
                        setFormData(prev => ({
                            ...prev,
                            questions: [
                                ...prev.questions,
                                {
                                    type: "multiple_choice",
                                    questionText: "",
                                    explanation: "",
                                    points: 10,
                                    options: [
                                        { optionText: "", isCorrect: false, explanation: "" }
                                    ]
                                }
                            ]
                        }));
                    },
                    removeQuestion: (qIdx) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            copy.splice(qIdx, 1);
                            return { ...prev, questions: copy };
                        });
                    },
                    updateQuestion: (qIdx, field, value) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            copy[qIdx] = { ...copy[qIdx], [field]: value };

                            // Initialize gameData if changing to a game type and it doesn't exist
                            if (field === "type") {
                                const isGame = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(value);
                                if (isGame && !copy[qIdx].gameData) {
                                    if (value === "word_search") {
                                        copy[qIdx].gameData = { gridSize: 5, words: [] };
                                    } else if (value === "fast_match") {
                                        copy[qIdx].gameData = { gridSize: 9, pairs: [{ left: "", right: "", kor: "", vie: "" }] };
                                    } else {
                                        copy[qIdx].gameData = { pairs: [{ left: "", right: "", kor: "", vie: "" }] };
                                    }
                                }
                            }
                            return { ...prev, questions: copy };
                        });
                    },
                    moveQuestion: (qIdx, direction) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            if (direction === "up" && qIdx > 0) {
                                const temp = copy[qIdx];
                                copy[qIdx] = copy[qIdx - 1];
                                copy[qIdx - 1] = temp;
                            } else if (direction === "down" && qIdx < copy.length - 1) {
                                const temp = copy[qIdx];
                                copy[qIdx] = copy[qIdx + 1];
                                copy[qIdx + 1] = temp;
                            }
                            return { ...prev, questions: copy };
                        });
                    },
                    addOption: (qIdx) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            copy[qIdx] = {
                                ...copy[qIdx],
                                options: [
                                    ...(copy[qIdx].options || []),
                                    { optionText: "", isCorrect: false, explanation: "" }
                                ]
                            };
                            return { ...prev, questions: copy };
                        });
                    },
                    removeOption: (qIdx, oIdx) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const updatedOptions = [...(copy[qIdx].options || [])];
                            updatedOptions.splice(oIdx, 1);
                            copy[qIdx] = { ...copy[qIdx], options: updatedOptions };
                            return { ...prev, questions: copy };
                        });
                    },
                    updateOption: (qIdx, oIdx, field, value) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const updatedOptions = [...(copy[qIdx].options || [])];
                            updatedOptions[oIdx] = { ...updatedOptions[oIdx], [field]: value };
                            copy[qIdx] = { ...copy[qIdx], options: updatedOptions };
                            return { ...prev, questions: copy };
                        });
                    },
                    updateGameData: (qIdx, field, value) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const currentGD = copy[qIdx].gameData || {};
                            copy[qIdx] = {
                                ...copy[qIdx],
                                gameData: { ...currentGD, [field]: value }
                            };
                            return { ...prev, questions: copy };
                        });
                    },
                    addGamePair: (qIdx) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const currentGD = copy[qIdx].gameData || {};
                            const currentPairs = currentGD.pairs || [];
                            copy[qIdx] = {
                                ...copy[qIdx],
                                gameData: {
                                    ...currentGD,
                                    pairs: [...currentPairs, { left: "", right: "", kor: "", vie: "" }]
                                }
                            };
                            return { ...prev, questions: copy };
                        });
                    },
                    removeGamePair: (qIdx, pIdx) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const currentGD = copy[qIdx].gameData || {};
                            const currentPairs = [...(currentGD.pairs || [])];
                            currentPairs.splice(pIdx, 1);
                            copy[qIdx] = {
                                ...copy[qIdx],
                                gameData: { ...currentGD, pairs: currentPairs }
                            };
                            return { ...prev, questions: copy };
                        });
                    },
                    updateGamePair: (qIdx, pIdx, field, value) => {
                        setFormData(prev => {
                            const copy = [...prev.questions];
                            const currentGD = copy[qIdx].gameData || {};
                            const currentPairs = [...(currentGD.pairs || [])];
                            currentPairs[pIdx] = {
                                ...currentPairs[pIdx],
                                [field]: value,
                                ...(field === "left" || field === "kor" ? { left: value, kor: value } : {}),
                                ...(field === "right" || field === "vie" ? { right: value, vie: value } : {})
                            };
                            copy[qIdx] = {
                                ...copy[qIdx],
                                gameData: { ...currentGD, pairs: currentPairs }
                            };
                            return { ...prev, questions: copy };
                        });
                    }
                };
                return null;
            })()}

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
                                            <option value="final">Thi cuối khóa (Final)</option>
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

                            {/* SECTION 2: QUESTIONS LIST */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">2. Danh sách câu hỏi ({formData.questions.length})</h4>
                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={window.exerciseHelpers.addQuestion}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-[#2d5a2d] hover:bg-green-100 transition-all font-black text-xs uppercase rounded-xl"
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                            Thêm câu hỏi
                                        </button>
                                    )}
                                </div>

                                {formData.questions.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <HelpCircle size={40} className="text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm font-bold">Chưa có câu hỏi nào trong bộ đề này</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.questions.map((q, qIdx) => (
                                            <div 
                                                key={qIdx} 
                                                className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 hover:shadow-md transition-all relative"
                                            >
                                                {/* Question Card Header */}
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-xl bg-green-50 text-[#2d5a2d] font-black text-sm flex items-center justify-center">
                                                            {qIdx + 1}
                                                        </span>
                                                        <span className="text-sm font-black text-gray-700 uppercase">Câu hỏi số {qIdx + 1}</span>
                                                    </div>
                                                    
                                                    {!isViewMode && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={qIdx === 0}
                                                                onClick={() => window.exerciseHelpers.moveQuestion(qIdx, "up")}
                                                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={qIdx === formData.questions.length - 1}
                                                                onClick={() => window.exerciseHelpers.moveQuestion(qIdx, "down")}
                                                                className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                            
                                                            <select
                                                                className="px-3 py-1.5 bg-gray-50 rounded-xl border-none font-bold text-xs cursor-pointer"
                                                                value={q.type}
                                                                onChange={(e) => window.exerciseHelpers.updateQuestion(qIdx, "type", e.target.value)}
                                                            >
                                                                <option value="multiple_choice">Trắc nghiệm (Quiz)</option>
                                                                <option value="fill_blank">Điền từ (Fill Blank)</option>
                                                                <option value="true_false">Đúng/Sai (True/False)</option>
                                                                <option value="listening">Luyện nghe (Listening)</option>
                                                                <option value="speaking">Luyện nói (Speaking)</option>
                                                                <option value="writing">Luyện viết (Writing)</option>
                                                                <option value="grammar">Ngữ pháp (Grammar)</option>
                                                                <option value="matching">Trò chơi Ghép đôi (Matching)</option>
                                                                <option value="fast_match">Trò chơi Ghép nhanh (Fast Match)</option>
                                                                <option value="memory_card">Trò chơi Lật thẻ (Memory Card)</option>
                                                                <option value="word_search">Trò chơi Tìm từ (Word Search)</option>
                                                                <option value="word_match">Trò chơi Nối từ (Word Match)</option>
                                                            </select>

                                                            <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-2 py-1">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase">Điểm:</span>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    className="w-12 bg-transparent text-center border-none font-black text-xs focus:ring-0 p-0 outline-none"
                                                                    value={q.points}
                                                                    onChange={(e) => window.exerciseHelpers.updateQuestion(qIdx, "points", e.target.value)}
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => window.exerciseHelpers.removeQuestion(qIdx)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Question Content */}
                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nội dung câu hỏi *</label>
                                                    <textarea
                                                        rows={2}
                                                        required
                                                        disabled={isViewMode}
                                                        placeholder="Nhập câu hỏi... Ví dụ: Chọn từ phù hợp điền vào chỗ trống: 저는 học sinh___ 갑니다."
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                                        value={q.questionText}
                                                        onChange={(e) => window.exerciseHelpers.updateQuestion(qIdx, "questionText", e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2 text-left">
                                                     <label className="text-[10px] font-black uppercase text-gray-400 px-1">Giải thích câu hỏi (Không bắt buộc)</label>
                                                     <input
                                                         type="text"
                                                         placeholder="Ví dụ: Giải thích lý do chọn đáp án này"
                                                         disabled={isViewMode}
                                                         className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                                         value={q.explanation || ""}
                                                         onChange={(e) => window.exerciseHelpers.updateQuestion(qIdx, "explanation", e.target.value)}
                                                     />
                                                 </div>

                                                 {/* OPTIONS OR GAME DATA CONFIGURATION */}
                                                 {(() => {
                                                     const isGameType = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(q.type);
                                                     const isOptionType = ["multiple_choice", "fill_blank", "true_false", "listening", "grammar"].includes(q.type);
                                                     
                                                     if (isGameType) {
                                                         return (
                                                             <div className="space-y-4 pt-2 border-t border-dashed border-gray-100">
                                                                 <div className="bg-green-50/50 rounded-2xl p-4 border border-green-100/50">
                                                                     <span className="text-[10px] font-black uppercase text-[#2d5a2d] block mb-1">Cấu hình Trò chơi (Game Type: {q.type})</span>
                                                                     <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                                                         Trò chơi sẽ sử dụng dữ liệu gameData bên dưới để tự động tạo màn chơi cho học sinh thay vì sử dụng các đáp án trắc nghiệm thông thường.
                                                                     </p>
                                                                 </div>

                                                                 {/* If Grid Size is applicable */}
                                                                 {["fast_match", "word_search"].includes(q.type) && (
                                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                         <div className="space-y-2 text-left">
                                                                             <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kích thước lưới (Grid Size) *</label>
                                                                             <input
                                                                                 type="number"
                                                                                 min={3}
                                                                                 max={20}
                                                                                 required
                                                                                 disabled={isViewMode}
                                                                                 className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                                                                 value={q.gameData?.gridSize || (q.type === "fast_match" ? 9 : 5)}
                                                                                 onChange={(e) => window.exerciseHelpers.updateGameData(qIdx, "gridSize", Number(e.target.value))}
                                                                             />
                                                                         </div>
                                                                     </div>
                                                                 )}

                                                                 {/* If Word Search */}
                                                                 {q.type === "word_search" && (
                                                                     <div className="space-y-2 text-left">
                                                                         <label className="text-[10px] font-black uppercase text-gray-400 px-1">Danh sách từ cần tìm (Phân cách bởi dấu phẩy) *</label>
                                                                         <input
                                                                             type="text"
                                                                             required
                                                                             disabled={isViewMode}
                                                                             placeholder="Ví dụ: 투자, thị trường, 수출"
                                                                             className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                                                             value={q.gameData?.words?.join(", ") || ""}
                                                                             onChange={(e) => {
                                                                                 const wordsArr = e.target.value.split(",").map(w => w.trim()).filter(Boolean);
                                                                                 window.exerciseHelpers.updateGameData(qIdx, "words", wordsArr);
                                                                             }}
                                                                         />
                                                                     </div>
                                                                 )}

                                                                 {/* If Pair matching game (matching, fast_match, memory_card, word_match) */}
                                                                 {["matching", "fast_match", "memory_card", "word_match"].includes(q.type) && (
                                                                     <div className="space-y-3">
                                                                         <div className="flex justify-between items-center">
                                                                             <span className="text-[10px] font-black uppercase text-gray-400 px-1">Danh sách cặp ghép đôi *</span>
                                                                             {!isViewMode && (
                                                                                 <button
                                                                                     type="button"
                                                                                     onClick={() => window.exerciseHelpers.addGamePair(qIdx)}
                                                                                     className="text-xs font-black text-[#2d5a2d] hover:underline flex items-center gap-1"
                                                                                     >
                                                                                     <Plus size={12} strokeWidth={3} />
                                                                                     Thêm cặp ghép
                                                                                 </button>
                                                                             )}
                                                                         </div>

                                                                         <div className="space-y-2">
                                                                             {(q.gameData?.pairs || []).map((pair, pIdx) => (
                                                                                 <div 
                                                                                     key={pIdx} 
                                                                                     className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100"
                                                                                 >
                                                                                     <div className="flex-1">
                                                                                         <input
                                                                                             type="text"
                                                                                             required
                                                                                             disabled={isViewMode}
                                                                                             placeholder="Tiếng Hàn (Vd: học)"
                                                                                             className="w-full bg-white px-3 py-2 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 transition-all outline-none"
                                                                                             value={pair.left || pair.kor || ""}
                                                                                             onChange={(e) => window.exerciseHelpers.updateGamePair(qIdx, pIdx, "left", e.target.value)}
                                                                                         />
                                                                                     </div>

                                                                                     <span className="text-gray-400 font-bold text-xs shrink-0">↔</span>

                                                                                     <div className="flex-1">
                                                                                         <input
                                                                                             type="text"
                                                                                             required
                                                                                             disabled={isViewMode}
                                                                                             placeholder="Tiếng Việt (Vd: Học)"
                                                                                             className="w-full bg-white px-3 py-2 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 transition-all outline-none"
                                                                                             value={pair.right || pair.vie || ""}
                                                                                             onChange={(e) => window.exerciseHelpers.updateGamePair(qIdx, pIdx, "right", e.target.value)}
                                                                                         />
                                                                                     </div>

                                                                                     {!isViewMode && (
                                                                                         <button
                                                                                             type="button"
                                                                                             onClick={() => window.exerciseHelpers.removeGamePair(qIdx, pIdx)}
                                                                                             className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-all"
                                                                                         >
                                                                                             <Trash size={14} />
                                                                                         </button>
                                                                                     )}
                                                                                 </div>
                                                                             ))}
                                                                         </div>
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         );
                                                     }

                                                     if (isOptionType) {
                                                         return (
                                                             <div className="space-y-3 pt-2">
                                                                 <div className="flex justify-between items-center border-t border-dashed border-gray-100 pt-3">
                                                                     <span className="text-[10px] font-black uppercase text-gray-400 px-1">Danh sách đáp án</span>
                                                                     {!isViewMode && (
                                                                         <button
                                                                             type="button"
                                                                             onClick={() => window.exerciseHelpers.addOption(qIdx)}
                                                                             className="text-xs font-black text-[#2d5a2d] hover:underline flex items-center gap-1"
                                                                         >
                                                                             <Plus size={12} strokeWidth={3} />
                                                                             Thêm lựa chọn
                                                                         </button>
                                                                     )}
                                                                 </div>

                                                                 <div className="space-y-2">
                                                                     {(q.options || []).map((opt, oIdx) => (
                                                                         <div 
                                                                             key={oIdx} 
                                                                             className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100"
                                                                         >
                                                                             <label className="flex items-center cursor-pointer shrink-0 ml-2">
                                                                                 <input
                                                                                     type="checkbox"
                                                                                     disabled={isViewMode}
                                                                                     className="rounded border-gray-300 text-[#2d5a2d] focus:ring-[#2d5a2d]/20 w-4 h-4 cursor-pointer"
                                                                                     checked={!!opt.isCorrect}
                                                                                     onChange={(e) => window.exerciseHelpers.updateOption(qIdx, oIdx, "isCorrect", e.target.checked)}
                                                                                 />
                                                                                 <span className="text-[9px] font-black text-gray-400 uppercase ml-1.5 cursor-pointer">Đúng</span>
                                                                             </label>

                                                                             <input
                                                                                 type="text"
                                                                                 required
                                                                                 disabled={isViewMode}
                                                                                 placeholder={`Lựa chọn ${oIdx + 1}`}
                                                                                 className="flex-1 bg-white px-3 py-2 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 transition-all outline-none"
                                                                                 value={opt.optionText}
                                                                                 onChange={(e) => window.exerciseHelpers.updateOption(qIdx, oIdx, "optionText", e.target.value)}
                                                                             />

                                                                             {!isViewMode && (
                                                                                 <button
                                                                                     type="button"
                                                                                     onClick={() => window.exerciseHelpers.removeOption(qIdx, oIdx)}
                                                                                     className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-all"
                                                                                 >
                                                                                     <Trash size={14} />
                                                                                 </button>
                                                                             )}
                                                                         </div>
                                                                     ))}
                                                                 </div>
                                                             </div>
                                                         );
                                                     }

                                                     return (
                                                         <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 mt-3 text-center">
                                                             <p className="text-xs text-gray-500 font-medium">Dạng bài này ({q.type}) không yêu cầu đáp án lựa chọn hoặc cấu hình trò chơi.</p>
                                                         </div>
                                                     );
                                                 })()}
                                                </div>
                                        ))}
                                    </div>
                                )}
                            </div>

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