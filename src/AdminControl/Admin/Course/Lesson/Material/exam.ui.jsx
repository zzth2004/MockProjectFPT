import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Search, Plus, Edit3, Trash2, HelpCircle, Sparkles, Loader2,
    ChevronLeft, ChevronRight, Database, Filter, X, BrainCircuit,
    CheckCircle2, ListChecks, FileQuestion, Trash, ArrowUp, ArrowDown, Code,
    Mail, User, Copy, Check, ExternalLink
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
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleOpenExamCodesModal = async (exam) => {
        setActiveExamForCodes(exam);
        setIsExamCodesModalOpen(true);
        setLoadingCodes(true);
        setLoadingStudents(true);
        setSelectedStudent(null);
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
            const rawStudents = students?.items || students?.data?.items || students || [];
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

    const handleGenerateExamCode = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            alert("Vui lòng chọn học sinh!");
            return;
        }
        setIsGeneratingCode(true);
        try {
            const res = await exerciseService.generateExamCode(
                activeExamForCodes.id,
                selectedStudent.fullName || selectedStudent.name || selectedStudent.username,
                selectedStudent.email
            );
            if (res) {
                alert("✅ Đã cấp mã thi và gửi mail thành công!");
                setSelectedStudent(null);
                setStudentSearch("");
                const data = await exerciseService.listExamCodes(activeExamForCodes.id);
                setGeneratedCodes(data || []);
            }
        } catch (err) {
            console.error("Lỗi khi cấp mã thi:", err);
            alert("❌ Cấp mã thi thất bại!");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // AI & JSON helper states inside modal
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [showJsonInput, setShowJsonInput] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const [showAiGeneratePanel, setShowAiGeneratePanel] = useState(false);
    const [aiQuestionsCount, setAiQuestionsCount] = useState(5);
    const [aiSelectedTypes, setAiSelectedTypes] = useState(["multiple_choice"]);

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
    const handleAiGenerate = async () => {
        if (!lessonId) return alert("Vui lòng chọn bài học cụ thể để AI tạo đề!");
        setIsGenerating(true);
        try {
            await exerciseService.getByLessonAi(lessonId);
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

    const resetModalHelperStates = () => {
        setIsGeneratingQuestions(false);
        setShowJsonInput(false);
        setJsonText("");
        setShowAiGeneratePanel(false);
        setAiQuestionsCount(5);
        setAiSelectedTypes(["multiple_choice"]);
    };

    const handleAddNew = () => {
        resetModalHelperStates();
        setIsViewMode(false);
        setSelectedExercise(null);
        setFormData({
            title: "",
            description: "",
            timeLimit: 45,
            type: "midterm",
            skill: "reading",
            level: "topik_1",
            lessonId: lessonId || "",
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
                title: item.title || "",
                description: item.description || "",
                timeLimit: item.timeLimit || 45,
                type: item.type || "midterm",
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
                    timeLimit: detail.timeLimit || 45,
                    type: detail.type || "midterm",
                    skill: detail.skill || "reading",
                    level: detail.level || "topik_1",
                    lessonId: detail.lessonId || detail.lesson?.id || lessonId || "",
                    questions: detail.questions || []
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải chi tiết bài thi:", err);
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
                title: item.title || "",
                description: item.description || "",
                timeLimit: item.timeLimit || 45,
                type: item.type || "midterm",
                skill: item.skill || "reading",
                level: item.level || "topik_1",
                lessonId: item.lessonId || item.lesson?.id || lessonId || "",
                questions: item.questions || []
            });
            setIsModalOpen(true);
        }
        if (type === 'delete' && window.confirm(`⚠️ Xóa bài thi: "${item.title || ''}"?`)) {
            try {
                await exerciseService.delete(item.id);
                alert("✅ Đã xóa!");
                refreshExercises();
            } catch (err) {
                alert("❌ Không thể xóa bài thi này.");
            }
        }
    };

    const handleImportJson = (e) => {
        e.preventDefault();
        try {
            if (!jsonText.trim()) {
                alert("Vui lòng nhập nội dung câu hỏi hoặc JSON!");
                return;
            }

            let parsedQuestions = [];
            let importedTitle = "";
            let importedDescription = "";
            let importedLessonId = null;

            const trimmedInput = jsonText.trim();
            const isJson = trimmedInput.startsWith("{") || trimmedInput.startsWith("[");

            if (isJson) {
                let parsed = JSON.parse(trimmedInput);
                let questionsArray = [];
                if (typeof parsed === "object" && !Array.isArray(parsed)) {
                    if (parsed.title) importedTitle = parsed.title;
                    if (parsed.description) importedDescription = parsed.description;
                    if (parsed.lessonId !== undefined) importedLessonId = parsed.lessonId;

                    if (parsed.questions && Array.isArray(parsed.questions)) {
                        questionsArray = parsed.questions;
                    } else {
                        questionsArray = [parsed];
                    }
                } else if (Array.isArray(parsed)) {
                    questionsArray = parsed;
                }

                parsedQuestions = questionsArray.map(q => {
                    const type = (q.type || "multiple_choice").toLowerCase();
                    const isGame = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(type);
                    let options = [];
                    let gameData = null;

                    if (isGame) {
                        gameData = q.gameData || { pairs: [] };
                        if (gameData.pairs && Array.isArray(gameData.pairs)) {
                            gameData.pairs = gameData.pairs.map(p => {
                                const l = p.left || p.kor || "";
                                const r = p.right || p.vie || "";
                                return { left: l, right: r, kor: l, vie: r };
                            });
                        }
                    } else if (type === "fill_blank") {
                        const answerText = q.correctAnswer || (q.options && q.options.find(o => o.isCorrect)?.optionText) || "";
                        options = [{ optionText: answerText, isCorrect: true, explanation: "" }];
                    } else {
                        options = (q.options || []).map(opt => ({
                            optionText: opt.optionText || "",
                            isCorrect: !!opt.isCorrect,
                            explanation: opt.explanation || ""
                        }));
                    }

                    return {
                        type,
                        questionText: q.questionText || "Câu hỏi chưa có nội dung",
                        explanation: q.explanation || "",
                        points: Number(q.points) || (type === "true_false" ? 3 : type === "listening" ? 7 : type === "grammar" ? 6 : 5),
                        options,
                        gameData,
                        mediaUrl: q.mediaUrl || null
                    };
                });
            } else {
                const lines = trimmedInput.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

                const KNOWN_TYPES = {
                    "multiple_choice": "multiple_choice",
                    "multiplechoice": "multiple_choice",
                    "quiz": "multiple_choice",
                    "true_false": "true_false",
                    "truefalse": "true_false",
                    "tf": "true_false",
                    "fill_blank": "fill_blank",
                    "fillblank": "fill_blank",
                    "listening": "listening",
                    "grammar": "grammar",
                    "speaking": "speaking",
                    "writing": "writing",
                    "matching": "matching",
                    "fast_match": "fast_match",
                    "fastmatch": "fast_match",
                    "memory_card": "memory_card",
                    "memorycard": "memory_card",
                    "word_search": "word_search",
                    "wordsearch": "word_search",
                    "word_match": "word_match",
                    "wordmatch": "word_match"
                };

                const getNormalizedType = (str) => {
                    if (!str) return null;
                    const clean = str.trim().toLowerCase().replace(/[\s_-]/g, "");
                    return KNOWN_TYPES[clean] || null;
                };

                lines.forEach(line => {
                    const titleMatch = line.match(/^(?:tiêu đề|title|tên bài tập)\s*:\s*(.*)$/i);
                    if (titleMatch) {
                        importedTitle = titleMatch[1].trim();
                        return;
                    }

                    const descMatch = line.match(/^(?:mô tả|description)\s*:\s*(.*)$/i);
                    if (descMatch) {
                        importedDescription = descMatch[1].trim();
                        return;
                    }

                    const lessonMatch = line.match(/^(?:bài học|lesson\s*id|lessonid)\s*:\s*(.*)$/i);
                    if (lessonMatch) {
                        const idVal = parseInt(lessonMatch[1].trim(), 10);
                        if (!isNaN(idVal)) {
                            importedLessonId = idVal;
                        }
                        return;
                    }

                    const parts = line.split(/\s+-\s+/).map(p => p.trim());
                    if (parts.length < 2) return;

                    let orderIndexStr = parts[0];
                    let questionText = parts[1];
                    let orderIndex = parsedQuestions.length + 1;
                    const matchNumber = orderIndexStr.match(/\d+/);
                    if (matchNumber) {
                        orderIndex = parseInt(matchNumber[0], 10);
                    }

                    let type = "multiple_choice";
                    let rawOptionsStr = "";
                    let correctAnswerStr = "";
                    let mediaUrl = null;

                    const detectedType = getNormalizedType(parts[2]);
                    if (detectedType) {
                        type = detectedType;
                        if (type === "fill_blank") {
                            correctAnswerStr = parts[3] || "";
                            mediaUrl = parts[4] || null;
                        } else {
                            rawOptionsStr = parts[3] || "";
                            correctAnswerStr = parts[4] || "";
                            mediaUrl = parts[5] || null;
                        }
                    } else {
                        type = "multiple_choice";
                        rawOptionsStr = parts[2] || "";
                        correctAnswerStr = parts[3] || "";
                        mediaUrl = parts[4] || null;
                    }

                    let options = [];
                    if (type === "fill_blank") {
                        if (correctAnswerStr) {
                            options = [{ optionText: correctAnswerStr, isCorrect: true, explanation: "" }];
                        }
                    } else if (rawOptionsStr) {
                        const optParts = rawOptionsStr.split(/\s*[|/,;]\s*/).map(o => o.trim()).filter(Boolean);
                        options = optParts.map(optText => {
                            const isCorrect = optText.toLowerCase() === correctAnswerStr.toLowerCase();
                            return {
                                optionText: optText,
                                isCorrect: isCorrect,
                                explanation: ""
                            };
                        });

                        const hasCorrect = options.some(o => o.isCorrect);
                        if (!hasCorrect && correctAnswerStr) {
                            options = options.map(o => {
                                if (o.optionText.toLowerCase().includes(correctAnswerStr.toLowerCase()) ||
                                    correctAnswerStr.toLowerCase().includes(o.optionText.toLowerCase())) {
                                    return { ...o, isCorrect: true };
                                }
                                return o;
                            });
                        }
                    }

                    let points = 5;
                    if (type === "true_false") points = 3;
                    else if (type === "listening") points = 7;
                    else if (type === "grammar") points = 6;

                    parsedQuestions.push({
                        type,
                        questionText,
                        mediaUrl,
                        points,
                        orderIndex,
                        options,
                        explanation: ""
                    });
                });
            }

            if (parsedQuestions.length === 0) {
                alert("❌ Không tìm thấy câu hỏi hợp lệ nào trong nội dung nhập!");
                return;
            }

            setFormData(prev => {
                const newTitle = importedTitle || prev.title || "Bài tập tổng hợp: Từ vựng & Ngữ pháp cơ bản";
                const newDesc = importedDescription || prev.description || "Bài tập dành cho người học mới bắt đầu, bao gồm từ vựng, ngữ pháp, nghe và điền từ.";
                const newLessonId = importedLessonId !== null ? importedLessonId : (prev.lessonId || "");

                return {
                    ...prev,
                    title: newTitle,
                    description: newDesc,
                    lessonId: newLessonId,
                    questions: [...prev.questions, ...parsedQuestions]
                };
            });

            setJsonText("");
            setShowJsonInput(false);
            alert(`✅ Đã nhập thành công ${parsedQuestions.length} câu hỏi!`);
        } catch (err) {
            alert("❌ Lỗi khi phân tích: " + err.message);
        }
    };

    const handleAiGenerateQuestions = async () => {
        const activeLessonId = formData.lessonId || lessonId;
        if (!activeLessonId) {
            alert("Vui lòng chọn bài học trước khi tạo câu hỏi bằng AI!");
            return;
        }

        setIsGeneratingQuestions(true);
        try {
            let vocabs = [];
            let grammars = [];

            try {
                const vocabRes = await vocabService.getByLesson(activeLessonId, 1, 100);
                vocabs = Array.isArray(vocabRes) ? vocabRes : (vocabRes?.data || []);
            } catch (e) {
                console.warn("Could not load vocabularies for AI prompt context:", e);
            }

            try {
                const grammarRes = await grammarService.getByLesson(activeLessonId, 1, 100);
                grammars = Array.isArray(grammarRes) ? grammarRes : (grammarRes?.data || []);
            } catch (e) {
                console.warn("Could not load grammars for AI prompt context:", e);
            }

            const config = {
                type: "exercise",
                count: Number(aiQuestionsCount),
                exerciseTypes: aiSelectedTypes,
                jsonData: {
                    vocabularies: vocabs.map(v => ({
                        wordKorean: v.wordKorean,
                        meaningVietnamese: v.meaningVietnamese
                    })),
                    grammars: grammars.map(g => ({
                        pattern: g.pattern,
                        explanation: g.explanation
                    }))
                }
            };

            const response = await AiService.generateContent(config);

            let generatedQuestions = [];
            if (response && Array.isArray(response.questions)) {
                generatedQuestions = response.questions;
            } else if (response && Array.isArray(response)) {
                generatedQuestions = response;
            } else {
                throw new Error("Dữ liệu AI trả về không đúng cấu hình mảng câu hỏi.");
            }

            const mappedQuestions = generatedQuestions.map(q => {
                const isGame = ["matching", "fast_match", "memory_card", "word_search", "word_match"].includes(q.type);
                let options = [];
                let gameData = null;

                if (isGame) {
                    gameData = q.gameData || { pairs: [] };
                    if (gameData.pairs) {
                        gameData.pairs = gameData.pairs.map(p => {
                            const l = p.left || p.kor || "";
                            const r = p.right || p.vie || "";
                            return { left: l, right: r, kor: l, vie: r };
                        });
                    }
                } else {
                    options = (q.options || []).map(opt => ({
                        optionText: opt.optionText || "",
                        isCorrect: !!opt.isCorrect,
                        explanation: opt.explanation || ""
                      }));
                }

                return {
                    type: q.type || "multiple_choice",
                    questionText: q.questionText || "Câu hỏi chưa có nội dung",
                    explanation: q.explanation || "",
                    points: Number(q.points) || 10,
                    options,
                    gameData
                };
            });

            setFormData(prev => ({
                ...prev,
                questions: [...prev.questions, ...mappedQuestions]
            }));

            setShowAiGeneratePanel(false);
            alert(`✅ AI đã tạo thành công ${mappedQuestions.length} câu hỏi!`);
        } catch (err) {
            console.error("AI Generation failed:", err);
            alert("❌ Lỗi khi sinh câu hỏi AI: " + err.message);
        } finally {
            setIsGeneratingQuestions(false);
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
                            <form onSubmit={handleGenerateExamCode} className="flex gap-3 items-end">
                                {/* Student Picker */}
                                <div className="flex-1 space-y-1.5 relative">
                                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">
                                        Chọn Học Sinh *
                                    </label>
                                    {selectedStudent ? (
                                        /* Selected student chip */
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0">
                                                <User size={13} className="text-emerald-700" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-emerald-800 truncate">
                                                    {selectedStudent.fullName || selectedStudent.name || selectedStudent.username}
                                                </p>
                                                <p className="text-[10px] text-emerald-600 truncate">{selectedStudent.email}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedStudent(null); setStudentSearch(""); }}
                                                className="p-1 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                                            >
                                                <X size={13} className="text-emerald-500" />
                                            </button>
                                        </div>
                                    ) : (
                                        /* Search input */
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                            <input
                                                type="text"
                                                placeholder={loadingStudents ? "Đang tải danh sách..." : "Tìm kiếm theo tên hoặc email..."}
                                                disabled={loadingStudents}
                                                className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm font-bold text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                                                value={studentSearch}
                                                onChange={e => { setStudentSearch(e.target.value); setIsPickerOpen(true); }}
                                                onFocus={() => setIsPickerOpen(true)}
                                            />
                                            {/* Dropdown list */}
                                            {isPickerOpen && studentSearch.trim() && (
                                                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-56 overflow-y-auto">
                                                    {(() => {
                                                        const q = studentSearch.toLowerCase();
                                                        const filtered = studentList.filter(s =>
                                                            (s.fullName || s.name || s.username || "").toLowerCase().includes(q) ||
                                                            (s.email || "").toLowerCase().includes(q)
                                                        );
                                                        if (filtered.length === 0) return (
                                                            <div className="px-4 py-6 text-center text-[11px] text-gray-300 font-black uppercase tracking-widest">
                                                                Không tìm thấy học sinh
                                                            </div>
                                                        );
                                                        return filtered.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                                                                onClick={() => {
                                                                    setSelectedStudent(s);
                                                                    setStudentSearch("");
                                                                    setIsPickerOpen(false);
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
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isGeneratingCode || !selectedStudent}
                                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isGeneratingCode ? (
                                        <><Loader2 size={14} className="animate-spin" /> Đang cấp...</>
                                    ) : (
                                        <><Mail size={14} /> Cấp mã & Gửi mail</>
                                    )}
                                </button>
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

            {/* --- QUESTION & OPTION HELPERS --- */}
            {(() => {
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

                            {/* SECTION 2: QUESTIONS LIST */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">2. Danh sách câu hỏi ({formData.questions.length})</h4>
                                    {!isViewMode && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAiGeneratePanel(false);
                                                    setShowJsonInput(!showJsonInput);
                                                }}
                                                className={`flex items-center gap-1.5 px-4 py-2 border transition-all font-black text-xs uppercase rounded-xl ${showJsonInput
                                                    ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900"
                                                    : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <Code size={14} />
                                                Nhập nhanh câu hỏi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowJsonInput(false);
                                                    setShowAiGeneratePanel(!showAiGeneratePanel);
                                                }}
                                                className={`flex items-center gap-1.5 px-4 py-2 border transition-all font-black text-xs uppercase rounded-xl ${showAiGeneratePanel
                                                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                                                    : "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100"
                                                    }`}
                                            >
                                                <Sparkles size={14} />
                                                Tạo bằng AI
                                            </button>
                                            <button
                                                type="button"
                                                onClick={window.exerciseHelpers.addQuestion}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-[#2d5a2d] hover:bg-green-100 border border-green-100/50 transition-all font-black text-xs uppercase rounded-xl"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                                Thêm thủ công
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {showAiGeneratePanel && (
                                    <div className="p-6 bg-purple-50/50 rounded-[2rem] border border-purple-100/50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="text-purple-600 animate-pulse" size={18} />
                                                <span className="text-sm font-black uppercase text-purple-900">Tạo câu hỏi bằng AI</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowAiGeneratePanel(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-700/60 px-1">Số lượng câu hỏi</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    className="w-full px-4 py-3 bg-white rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-purple-600/20 outline-none"
                                                    value={aiQuestionsCount}
                                                    onChange={(e) => setAiQuestionsCount(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-purple-700/60 px-1">Dạng câu hỏi</label>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {[
                                                        { val: "multiple_choice", label: "Trắc nghiệm" },
                                                        { val: "fill_blank", label: "Điền từ" },
                                                        { val: "true_false", label: "Đúng/Sai" },
                                                        { val: "grammar", label: "Ngữ pháp" }
                                                    ].map(t => {
                                                        const active = aiSelectedTypes.includes(t.val);
                                                        return (
                                                            <button
                                                                key={t.val}
                                                                type="button"
                                                                onClick={() => {
                                                                    setAiSelectedTypes(prev =>
                                                                        prev.includes(t.val)
                                                                            ? prev.filter(x => x !== t.val)
                                                                            : [...prev, t.val]
                                                                    );
                                                                }}
                                                                className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all ${active
                                                                    ? "bg-purple-600 text-white shadow-sm"
                                                                    : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                                                                    }`}
                                                            >
                                                                {t.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                disabled={isGeneratingQuestions || aiSelectedTypes.length === 0}
                                                onClick={handleAiGenerateQuestions}
                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-all font-black text-xs uppercase rounded-xl shadow-md shadow-purple-600/10 active:scale-95"
                                            >
                                                {isGeneratingQuestions ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={14} />
                                                        Đang tạo câu hỏi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={14} />
                                                        Bắt đầu tạo
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showJsonInput && (
                                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200/50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Code className="text-slate-600" size={18} />
                                                <span className="text-sm font-black uppercase text-slate-900">Dán câu hỏi hoặc cấu hình JSON</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowJsonInput(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black uppercase text-slate-500">Nội dung câu hỏi (Văn bản hoặc JSON)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setJsonText(`Tiêu đề: Bài tập tổng hợp: Từ vựng & Ngữ pháp cơ bản
Mô tả: Bài tập dành cho người học mới bắt đầu, bao gồm từ vựng, ngữ pháp, nghe và điền từ.
Bài học: 1
Câu 1 - Con chó tiếng Hàn là gì? - MULTIPLE_CHOICE - 고양이 | 강아지 | 사람 | 책 - 강아지
Câu 2 - Từ nào nghĩa là 'Trường học'? - MULTIPLE_CHOICE - 학교 | 집 | 물 - 학교
Câu 3 - ‘물’ nghĩa là ‘nước’. - TRUE_FALSE - Đúng | Sai - Đúng
Câu 4 - ‘의자’ nghĩa là ‘bàn’. - TRUE_FALSE - Đúng | Sai - Sai
Câu 5 - Điền từ đúng: Tôi là học sinh = 저는 ___ 입니다. - FILL_BLANK - 학생
Câu 6 - Điền từ đúng: Cảm ơn = ___ 감사합니다. - FILL_BLANK - 정말
Câu 7 - Nghe và chọn đáp án đúng. - LISTENING - Xin chào | Tạm biệt | Cảm ơn - Xin chào - https://sample.com/audio/annyeong.mp3
Câu 8 - Chọn đáp án đúng: Dạng kính ngữ của ‘먹다’ (ăn) là: - GRAMMAR - 드시다 | 마시다 | 자다 - 드시다
Câu 9 - Từ nào nghĩa là ‘Nhà’? - MULTIPLE_CHOICE - 집 | phân loại | trường học - 집
Câu 10 - ‘한국’ nghĩa là gì? - MULTIPLE_CHOICE - Hàn Quốc | Nhật Bản | Trung Quốc - Hàn Quốc`)}
                                                    className="text-[10px] text-green-600 hover:text-green-700 font-black uppercase tracking-wider bg-green-50 hover:bg-green-100/80 transition px-2.5 py-1 rounded-lg"
                                                >
                                                    Tải dữ liệu mẫu
                                                </button>
                                            </div>
                                            <textarea
                                                rows={8}
                                                placeholder={`Dạng văn bản (mỗi dòng một câu hỏi):
Câu 1 - Con chó tiếng Hàn là gì? - MULTIPLE_CHOICE - 고양이 | 강아지 | người | sách - 강아지
Câu 2 - Điền từ đúng: Tôi là học sinh = 저는 ___ 입니다. - FILL_BLANK - 학생

Hoặc Dạng JSON (ví dụ):
{
  "lessonId": 1,
  "title": "Bài tập tổng hợp",
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "Con chó tiếng Hàn là gì?",
      "options": [
        { "optionText": "고양이", "isCorrect": false },
        { "optionText": "강아지", "isCorrect": true }
      ]
    }
  ]
}`}
                                                className="w-full px-4 py-3 bg-white rounded-2xl border-none font-mono text-xs focus:ring-2 focus:ring-slate-600/20 outline-none resize-y"
                                                value={jsonText}
                                                onChange={(e) => setJsonText(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={handleImportJson}
                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white transition-all font-black text-xs uppercase rounded-xl shadow-md active:scale-95"
                                            >
                                                <Database size={14} />
                                                Nhập câu hỏi
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {formData.questions.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                        <HelpCircle size={40} className="text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm font-bold">Chưa có câu hỏi nào trong đề thi này</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {formData.questions.map((q, qIdx) => (
                                            <div
                                                key={qIdx}
                                                className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 hover:shadow-md transition-all relative"
                                            >
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

                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nội dung câu hỏi *</label>
                                                    <textarea
                                                        rows={2}
                                                        required
                                                        disabled={isViewMode}
                                                        placeholder="Nhập câu hỏi..."
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

                                                                {["fast_match", "word_search"].includes(q.type) && (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-2 text-left">
                                                                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kích thước lưới (Grid Size)</label>
                                                                            <input
                                                                                type="number"
                                                                                min={3}
                                                                                max={15}
                                                                                disabled={isViewMode}
                                                                                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none font-bold text-xs focus:ring-2 focus:ring-green-600/20 outline-none"
                                                                                value={q.gameData?.gridSize || 5}
                                                                                onChange={(e) => window.exerciseHelpers.updateGameData(qIdx, "gridSize", e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {q.type === "word_search" ? (
                                                                    <div className="space-y-2 text-left">
                                                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Từ khóa ẩn (Cách nhau bằng dấu phẩy)</label>
                                                                        <input
                                                                            type="text"
                                                                            disabled={isViewMode}
                                                                            placeholder="Ví dụ: KOREA, SEOUL, KIMCHI"
                                                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border-none font-bold text-xs focus:ring-2 focus:ring-green-600/20 outline-none"
                                                                            value={(q.gameData?.words || []).join(", ")}
                                                                            onChange={(e) => {
                                                                                const words = e.target.value.split(",").map(w => w.trim());
                                                                                window.exerciseHelpers.updateGameData(qIdx, "words", words);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[10px] font-black uppercase text-gray-400">Danh sách cặp nối ({q.gameData?.pairs?.length || 0})</span>
                                                                            {!isViewMode && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => window.exerciseHelpers.addGamePair(qIdx)}
                                                                                    className="text-[10px] font-black uppercase text-[#2d5a2d] bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100"
                                                                                >
                                                                                    + Thêm cặp ghép
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {(q.gameData?.pairs || []).map((pair, pIdx) => (
                                                                                <div key={pIdx} className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        required
                                                                                        disabled={isViewMode}
                                                                                        placeholder="Cột trái (Tiếng Hàn)"
                                                                                        className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none"
                                                                                        value={pair.left || pair.kor || ""}
                                                                                        onChange={(e) => window.exerciseHelpers.updateGamePair(qIdx, pIdx, "left", e.target.value)}
                                                                                    />
                                                                                    <span className="text-gray-300 font-bold">⇄</span>
                                                                                    <input
                                                                                        type="text"
                                                                                        required
                                                                                        disabled={isViewMode}
                                                                                        placeholder="Cột phải (Tiếng Việt)"
                                                                                        className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none"
                                                                                        value={pair.right || pair.vie || ""}
                                                                                        onChange={(e) => window.exerciseHelpers.updateGamePair(qIdx, pIdx, "right", e.target.value)}
                                                                                    />
                                                                                    {!isViewMode && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => window.exerciseHelpers.removeGamePair(qIdx, pIdx)}
                                                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                                                        >
                                                                                            <X size={14} />
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
                                                        const isFillBlank = q.type === "fill_blank";
                                                        return (
                                                            <div className="space-y-3 pt-2 border-t border-dashed border-gray-100">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-[10px] font-black uppercase text-gray-400">
                                                                        {isFillBlank ? "Đáp án đúng cho câu điền từ" : "Danh sách đáp án lựa chọn"}
                                                                    </span>
                                                                    {!isViewMode && !isFillBlank && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => window.exerciseHelpers.addOption(qIdx)}
                                                                            className="text-[10px] font-black uppercase text-[#2d5a2d] bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100"
                                                                        >
                                                                            + Thêm đáp án
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    {(q.options || []).map((opt, oIdx) => (
                                                                        <div key={oIdx} className="flex items-center gap-3">
                                                                            {!isViewMode && (
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded text-green-600 border-gray-300 focus:ring-green-500"
                                                                                    checked={!!opt.isCorrect}
                                                                                    onChange={(e) => window.exerciseHelpers.updateOption(qIdx, oIdx, "isCorrect", e.target.checked)}
                                                                                />
                                                                            )}
                                                                            {isViewMode && (
                                                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${opt.isCorrect ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                                                                                    {opt.isCorrect ? "✓" : "✗"}
                                                                                </span>
                                                                            )}
                                                                            <input
                                                                                type="text"
                                                                                required
                                                                                disabled={isViewMode}
                                                                                placeholder={isFillBlank ? "Nhập từ cần điền đúng..." : `Đáp án số ${oIdx + 1}`}
                                                                                className={`flex-1 px-4 py-2 bg-gray-50 rounded-xl border-none font-bold text-xs outline-none ${opt.isCorrect ? "ring-2 ring-green-600/20 bg-white" : ""}`}
                                                                                value={opt.optionText}
                                                                                onChange={(e) => window.exerciseHelpers.updateOption(qIdx, oIdx, "optionText", e.target.value)}
                                                                            />
                                                                            {!isViewMode && !isFillBlank && (
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={(q.options || []).length <= 1}
                                                                                    onClick={() => window.exerciseHelpers.removeOption(qIdx, oIdx)}
                                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
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
