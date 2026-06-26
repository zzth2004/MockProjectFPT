import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
    ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit,
    CheckCircle2, ListChecks, FileQuestion, Trash, ArrowUp, ArrowDown, Code,
    Mail, User, Copy, Check, ExternalLink
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
import userService from "../../../../Service/API/userServiceAPI/user.service";

export default function ExamList({ lessonId, lessonTitle }) {
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

    // --- Exam Code Management States ---
    const [isExamCodesModalOpen, setIsExamCodesModalOpen] = useState(false);
    const [activeExamForCodes, setActiveExamForCodes] = useState(null);


    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    // --- Student Picker States ---
    const [studentList, setStudentList] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleOpenExamCodesModal = async (exam) => {
        setActiveExamForCodes(exam);
        setIsExamCodesModalOpen(true);
        setLoadingCodes(true);
        setLoadingStudents(true);
        setSelectedStudents([]);
        setStudentSearch("");
        setStudentList([]);
        try {
            const [codes, students] = await Promise.all([
                exerciseService.listExamCodes(exam.id),
                isTeacher
                    ? userService.getStudents(1, 200)  // teacher: students from their classes
                    : userService.getAllUsers(1, 200)   // admin: all users, will filter by role
            ]);
            setGeneratedCodes(codes || []);
            // Normalize: always work with array of { id, fullName, email }
            let rawStudents = students?.items || students?.data?.items || students?.data || students || [];
            if (!Array.isArray(rawStudents)) rawStudents = [];
            const studentOnly = rawStudents.filter(s =>
                !s.role || s.role?.toLowerCase() === "student"
            );
            setStudentList(studentOnly);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
        } finally {
            setLoadingCodes(false);
            setLoadingStudents(false);
        }
    };

    const handleGenerateExamCode = async (studentsToGenerate) => {
        if (!studentsToGenerate || studentsToGenerate.length === 0) {
            alert("Vui lòng chọn ít nhất một học sinh!");
            return;
        }

        setIsGeneratingCode(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const generatePromises = studentsToGenerate.map(student => {
                const name = student.fullName || student.name || student.username;
                const email = student.email;
                return exerciseService.generateExamCode(activeExamForCodes.id, name, email);
            });

            const results = await Promise.allSettled(generatePromises);

            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    successCount++;
                } else {
                    failCount++;
                    console.error("Lỗi cấp mã cho 1 học sinh:", result.reason);
                }
            });

            if (successCount > 0) {
                alert(`✅ Đã cấp mã thi và gửi mail thành công cho ${successCount} học sinh! ${failCount > 0 ? `(Thất bại ${failCount})` : ''}`);
                setSelectedStudents([]);
                setStudentSearch("");
                const data = await exerciseService.listExamCodes(activeExamForCodes.id);
                setGeneratedCodes(data || []);
            } else {
                alert("❌ Cấp mã thi thất bại cho tất cả học sinh đã chọn!");
            }
        } catch (err) {
            console.error("Lỗi hệ thống khi cấp mã thi:", err);
            alert("❌ Đã xảy ra lỗi không mong muốn!");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };


    // Exercise Composer State - Tailored for Exams
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        timeLimit: 45, // Default exam time limit
        type: "midterm",
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

        if (Array.isArray(exerciseResponse)) return exerciseResponse;

        const dataLayer = exerciseResponse.data;
        if (Array.isArray(dataLayer)) return dataLayer;

        if (exerciseResponse.exercises?.data) return exerciseResponse.exercises.data;
        if (dataLayer?.exercises?.data) return dataLayer.exercises.data;

        if (exerciseResponse.items) return exerciseResponse.items;

        return [];
    }, [exerciseResponse]);

    // --- 5. LOGIC LỌC DỮ LIỆU TÌM KIẾM ---
    const filteredDataset = useMemo(() => {
        return rawData.filter(item => {
            // Filter strictly for midterm, final, and topik exams (exclude practice quizzes)
            const isExam = ["midterm", "final", "topik_test"].includes(item.type);
            if (!isExam) return false;

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
            timeLimit: 45,
            type: 'midterm',
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
                timeLimit: item.timeLimit || 45,
                type: item.type || 'midterm',
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
                    timeLimit: detail.timeLimit || 45,
                    type: detail.type || 'midterm',
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
                timeLimit: item.timeLimit || 45,
                type: item.type || 'midterm',
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
            alert("Vui lòng nhập tiêu đề bài thi");
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
                timeLimit: Number(formData.timeLimit) || 45,
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
            console.error("Lỗi khi lưu bài thi:", error);
            alert("Có lỗi xảy ra khi lưu bài thi. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            key: "title",
            title: "Tên bài thi",
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
            title: "Phân loại bài thi",
            width: "15%",
            className: "whitespace-nowrap",
            render: (val, row) => {
                const typeMapping = {
                    midterm: { text: "Thi giữa kỳ", style: "warning" },
                    final: { text: "Thi cuối kỳ", style: "danger" },
                    topik_test: { text: "Thi TOPIK", style: "info" }
                };
                const mapped = typeMapping[val] || { text: "Thi giữa kỳ", style: "warning" };
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
            key: "takeExam",
            title: "Trang thi",
            width: "12%",
            className: "whitespace-nowrap text-center",
            render: (val, row) => (
                <div className="text-center py-1">
                    <a
                        href={`/user/exams/take/${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap"
                    >
                        <ExternalLink size={11} /> Vào làm bài
                    </a>
                </div>
            )
        });
        columns.push({
            key: "examCodes",
            title: "Mã thi cử",
            width: "14%",
            className: "whitespace-nowrap text-center",
            render: (val, row) => (
                <div className="text-center py-1">
                    <KLButton
                        size="xs"
                        className="bg-emerald-600 text-[10px] font-black hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xl flex items-center gap-1.5 mx-auto"
                        onClick={() => handleOpenExamCodesModal(row)}
                    >
                        <Code size={12} /> Cấp Mã Thi
                    </KLButton>
                </div>
            )
        });
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
                        Quản lý <span className="text-[#2d5a2d]">Bài Thi</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        {lessonId ? `Bài học: ${lessonTitle}` : "Kho đề thi chính thức của hệ thống"}
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
                        Thêm bài thi mới
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
                            placeholder="Tìm kiếm tiêu đề, câu hỏi..."
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
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Loại bài thi</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">Tất cả loại bài thi</option>
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
                                <option value="topik_1">TOPIK I (Cấp 1)</option>
                                <option value="topik_2">TOPIK I (Cấp 2)</option>
                                <option value="topik_3">TOPIK II (Cấp 3)</option>
                                <option value="topik_4">TOPIK II (Cấp 4)</option>
                                <option value="topik_5">TOPIK II (Cấp 5)</option>
                                <option value="topik_6">TOPIK II (Cấp 6)</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang tải đề thi...</div>
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
                                <span className="text-[10px] text-gray-400 font-bold mt-1">Tìm thấy: {filteredDataset.length} đề thi</span>
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

            {/* --- EXAM CODE MANAGEMENT MODAL --- */}
            {isExamCodesModalOpen && activeExamForCodes && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    🔐 Quản lý Mã Thi
                                </h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5 truncate max-w-[360px]">
                                    {activeExamForCodes.title}
                                </p>
                            </div>
                            <button
                                onClick={() => { setIsExamCodesModalOpen(false); setActiveExamForCodes(null); }}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={22} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Generate Code Form */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-emerald-50/30 shrink-0">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                {isTeacher ? "Cấp mã cho học sinh trong lớp" : "Cấp mã cho học viên"}
                            </p>
                            <p className="text-[9px] text-slate-400 mb-4">
                                {isTeacher
                                    ? "Chọn học sinh từ danh sách lớp bạn đang dạy"
                                    : "Chọn học viên từ toàn bộ hệ thống"}
                            </p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleGenerateExamCode(selectedStudents);
                            }} className="flex flex-col gap-3">

                                <div className="w-full space-y-2 relative">
                                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">
                                        Chọn Học Sinh (Có thể chọn nhiều) *
                                    </label>

                                    {/* Danh sách học sinh đã chọn */}
                                    {selectedStudents.length > 0 && (
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                            {selectedStudents.map((student, index) => (
                                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                                    <div className="w-6 h-6 rounded-md bg-emerald-200 flex items-center justify-center shrink-0">
                                                        <User size={12} className="text-emerald-700" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-emerald-800 truncate max-w-[150px]">
                                                            {student.fullName || student.name || student.username}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedStudents(prev => prev.filter((_, i) => i !== index))}
                                                        className="p-1 hover:bg-emerald-100 rounded-lg transition-colors shrink-0 ml-1"
                                                    >
                                                        <X size={12} className="text-emerald-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-3 items-start">
                                        <div className="flex-1 relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={loadingStudents ? "Đang tải danh sách..." : "Tìm và chọn học sinh..."}
                                                disabled={loadingStudents}
                                                className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                                                value={studentSearch}
                                                onChange={e => { setStudentSearch(e.target.value); setIsPickerOpen(true); }}
                                                onFocus={() => setIsPickerOpen(true)}
                                            />

                                            {isPickerOpen && studentSearch.trim() && (
                                                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-56 overflow-y-auto">
                                                    {(() => {
                                                        const q = studentSearch.toLowerCase();
                                                        const filtered = studentList.filter(s => {
                                                            const matchesSearch = (s.fullName || s.name || s.username || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
                                                            const isNotSelected = !selectedStudents.some(selected => selected.email === s.email);
                                                            return matchesSearch && isNotSelected;
                                                        });

                                                        if (filtered.length === 0) return (
                                                            <div className="px-4 py-6 text-center text-[11px] text-gray-300 font-black uppercase tracking-widest">
                                                                Không tìm thấy hoặc đã được chọn
                                                            </div>
                                                        );
                                                        return filtered.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                                                                onClick={() => {
                                                                    setSelectedStudents(prev => [...prev, s]);
                                                                    setStudentSearch("");
                                                                    setIsPickerOpen(true);
                                                                }}
                                                            >
                                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                                                    <User size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-black text-slate-800 truncate">
                                                                        {s.fullName || s.name || s.username}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                                                                </div>
                                                            </button>
                                                        ));
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isGeneratingCode || selectedStudents.length === 0}
                                            className="px-5 py-3 h-[46px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            {isGeneratingCode ? (
                                                <><Loader2 size={14} className="animate-spin" /> Đang cấp...</>
                                            ) : (
                                                <><Mail size={14} /> Gửi mã ({selectedStudents.length})</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Code List */}
                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
                                Danh sách mã đã cấp ({generatedCodes.length} mã)
                            </p>
                            {loadingCodes ? (
                                <div className="text-center py-12 text-gray-300 font-black uppercase tracking-widest text-[10px] animate-pulse">
                                    Đang tải...
                                </div>
                            ) : generatedCodes.length === 0 ? (
                                <div className="text-center py-12 text-gray-300 font-black uppercase tracking-widest text-[10px]">
                                    Chưa có mã nào được cấp cho bài thi này.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {generatedCodes.map((cred, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/80 transition-all">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                                <User size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 truncate">{cred.studentName}</p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">{cred.studentEmail}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-sm text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl tracking-widest">
                                                    {cred.code}
                                                </span>
                                                <button
                                                    onClick={() => handleCopyCode(cred.code)}
                                                    title="Sao chép mã"
                                                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-emerald-600"
                                                >
                                                    {copiedCode === cred.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${cred.isUsed ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600"}`}>
                                                {cred.isUsed ? "Đã dùng" : "Chưa dùng"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">

                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {isViewMode ? "Xem Chi Tiết Đề Thi" : (selectedExercise ? "Cập Nhật Bộ Đề Thi" : "Tạo Đề Thi Mới")}
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    {isViewMode ? "Thông tin chi tiết của đề thi (đọc-chỉ)" : (selectedExercise ? "Chỉnh sửa câu hỏi và đáp án bài thi" : "Tạo mới đề thi đánh giá cho hệ thống")}
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
                                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b pb-2">1. Thông tin chung bài thi</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Title */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tiêu đề bài thi *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Đề thi Giữa kỳ TOPIK I - Đọc & Viết"
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
                                    {/* Type - strictly restricted to Exam classifications */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Phân loại *</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            disabled={isViewMode}
                                        >
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
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Thời gian (Phút) *</label>
                                        <input
                                            type="number"
                                            min={1}
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.timeLimit}
                                            onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                            disabled={isViewMode}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mô tả bài thi</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Mô tả hoặc ghi chú làm bài..."
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
                                    className="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-250 text-gray-500 font-bold transition-all active:scale-95 text-sm"
                                >
                                    Đóng
                                </button>
                                {!isViewMode && (
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
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
