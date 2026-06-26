import { useState } from "react";
import vocabService from "../../../../Service/API/lessonServiceAPI/vocab.service";
import grammarService from "../../../../Service/API/lessonServiceAPI/grammarService.service";
import AiService from "../../../../Service/API/aiAPI/ai.service";

export default function useMaterialQuestions(formData, setFormData, lessonId = null) {
    const [showAiGeneratePanel, setShowAiGeneratePanel] = useState(false);
    const [aiQuestionsCount, setAiQuestionsCount] = useState(5);
    const [aiSelectedTypes, setAiSelectedTypes] = useState(["multiple_choice", "fill_blank"]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

    const [showJsonInput, setShowJsonInput] = useState(false);
    const [jsonText, setJsonText] = useState("");

    // --- JSON / EXCEL IMPORT ---
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


    // --- AI GENERATE ---
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


    // --- QUESTION HELPERS ---
    const questionHelpers = {
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

    return {
        showAiGeneratePanel, setShowAiGeneratePanel,
        aiQuestionsCount, setAiQuestionsCount,
        aiSelectedTypes, setAiSelectedTypes,
        isGeneratingQuestions, setIsGeneratingQuestions,
        showJsonInput, setShowJsonInput,
        jsonText, setJsonText,
        handleImportJson,
        handleAiGenerateQuestions,
        questionHelpers
    };
}
