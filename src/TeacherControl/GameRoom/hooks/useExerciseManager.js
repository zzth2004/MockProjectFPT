import { useState, useEffect, useCallback } from "react";
import axiosClient from "../../../api/axiosAPI";
import exerciseService from "../../../AdminControl/Service/API/lessonServiceAPI/exercise.service.jsx";
import { useAuth } from "../../../context/authContext";

const SAMPLE_JSON = {
  title: "Bài tập ôn tập từ vựng chủ đề gia đình",
  description: "Hãy chọn đáp án đúng nhất để hoàn thành câu hỏi.",
  timeLimit: 15,
  questions: [
    {
      type: "multiple_choice",
      questionText: "다음 단어의 뜻으로 알맞은 것을 고르십시오: '어머니'",
      explanation: "'어머니' có nghĩa là 'mẹ' trong tiếng Hàn.",
      points: 10,
      options: [
        { optionText: "Mẹ", isCorrect: true, explanation: "Đúng." },
        { optionText: "Bố", isCorrect: false, explanation: "'Bố' trong tiếng Hàn là '아버지'." },
        { optionText: "Anh trai", isCorrect: false, explanation: "'Anh trai' là '형' hoặc '오빠'." },
        { optionText: "Em gái", isCorrect: false, explanation: "'Em gái' là '여동생'." },
      ],
    },
  ],
};

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (res?.items && Array.isArray(res.items)) return res.items;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
}

export default function useExerciseManager(addLog) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [selectedEx, setSelectedEx] = useState(null);

  // Preview Modal
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Creation State
  const [createTab, setCreateTab] = useState("manual");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  // Manual Builder Form
  const [manualForm, setManualForm] = useState({
    title: "", description: "", timeLimit: 15, skill: "reading", level: "topik_1",
  });
  const [questions, setQuestions] = useState([]);

  // JSON Tab Form
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_JSON, null, 2));

  // Import Tab Form
  const [importFile, setImportFile] = useState(null);
  const [importMode, setImportMode] = useState("topik_test");
  const [importLevel, setImportLevel] = useState("topik_1");
  const [importSkill, setImportSkill] = useState("reading");

  // AI Generation Form
  const [aiTopic, setAiTopic] = useState("Từ vựng về Thời tiết");
  const [aiCount, setAiCount] = useState(5);
  const [aiLevel, setAiLevel] = useState("topik_1");

  // Load JSON templates on mount
  const loadJsonTemplate = useCallback(async () => {
    try {
      const res = await axiosClient.get("/game-rooms/exercises/json-template");
      const tpl = res.data?.data || res.data;
      if (tpl) setJsonText(JSON.stringify(tpl, null, 2));
    } catch { /* Keep local fallback */ }
  }, []);

  // Fetch exercises based on role and filters
  const loadExercises = useCallback(async (q = "") => {
    setLoadingEx(true);
    const role = user?.role?.toLowerCase();
    const isAdmin = role === "admin";
    const isTeacher = role === "teacher";

    try {
      if (isTeacher) {
        // Teacher uses route: /materials/teacher/my-exercises
        addLog("Đang tải danh sách bài tập của giáo viên...", "info");
        const resOwn = await axiosClient.get("/materials/teacher/my-exercises", {
          params: { page: 1, limit: 100 }
        });
        const itemsOwn = resOwn.data?.data?.items || resOwn.data?.items || resOwn.data?.data || resOwn.data || [];

        // Also fetch system exercises (createdBy / createdById is null) to allow selection
        const resPublic = await exerciseService.getAllExercises(1, 100, q);
        const itemsPublic = extractList(resPublic).filter(
          ex => !ex.createdBy && !ex.createdById
        );

        // Merge and deduplicate by id
        const merged = [...itemsOwn, ...itemsPublic];
        const uniqueMap = new Map();
        merged.forEach(ex => uniqueMap.set(ex.id, ex));

        let list = Array.from(uniqueMap.values());
        if (q) {
          list = list.filter(ex => (ex.title || "").toLowerCase().includes(q.toLowerCase()));
        }
        setExercises(list);
      } else if (isAdmin) {
        // Admin gets all exercises
        addLog("Đang tải danh sách bài tập (Admin)...", "info");
        const res = await axiosClient.get("/game-rooms/exercises", {
          params: { page: 1, limit: 100, search: q }
        });
        const d = res.data?.data || res.data;
        setExercises(extractList(d));
      } else {
        // Standard User or general fallback: visible to standard users are createdBy = user.id or null
        const res = await exerciseService.getAllExercises(1, 100, q);
        const items = extractList(res);
        const filtered = items.filter(ex => {
          const creatorId = ex.createdById || ex.createdBy?.id || ex.createdBy;
          return !creatorId || Number(creatorId) === Number(user?.id);
        });
        setExercises(filtered);
      }
    } catch (e) {
      // Fallback in case endpoints fail
      try {
        const res2 = await exerciseService.getAllExercises(1, 100, q);
        const items = extractList(res2);

        // Apply FE filter rule:
        // Admin sees all, User & Teacher see createdBy = user.id or null
        if (isAdmin) {
          setExercises(items);
        } else {
          const filtered = items.filter(ex => {
            const creatorId = ex.createdById || ex.createdBy?.id || ex.createdBy;
            return !creatorId || Number(creatorId) === Number(user?.id);
          });
          setExercises(filtered);
        }
      } catch (e2) {
        addLog("Lỗi tải bài tập: " + e2.message, "error");
      }
    } finally {
      setLoadingEx(false);
    }
  }, [user, addLog]);

  // Preview logic
  const handlePreview = useCallback(async (ex) => {
    setShowPreview(true);
    setLoadingPreview(true);
    setPreview(null);
    try {
      const d = await exerciseService.getDetail(ex.id);
      setPreview(d);
    } catch (e) {
      addLog("Lỗi preview: " + e.message, "error");
    } finally {
      setLoadingPreview(false);
    }
  }, [addLog]);

  // Manual Question Builder Helpers
  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, {
      id: Date.now(),
      type: "multiple_choice",
      questionText: "",
      points: 10,
      explanation: "",
      options: [
        { id: 1, optionText: "", isCorrect: true },
        { id: 2, optionText: "", isCorrect: false },
        { id: 3, optionText: "", isCorrect: false },
      ],
    }]);
  }, []);

  const updateQuestion = useCallback((qid, field, val) => {
    setQuestions(prev => prev.map(q => q.id === qid ? { ...q, [field]: val } : q));
  }, []);

  const updateOption = useCallback((qid, oid, field, val) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q;
      const opts = q.options.map(o => {
        if (o.id !== oid) return field === "isCorrect" ? { ...o, isCorrect: false } : o;
        return { ...o, [field]: val };
      });
      return { ...q, options: opts };
    }));
  }, []);

  const removeQuestion = useCallback((qid) => {
    setQuestions(prev => prev.filter(q => q.id !== qid));
  }, []);

  // Creation Actions
  const handleCreateManual = useCallback(async () => {
    if (!manualForm.title.trim()) {
      addLog("Cần nhập tiêu đề bài tập!", "error");
      return;
    }
    if (questions.length === 0) {
      addLog("Thêm ít nhất 1 câu hỏi!", "error");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...manualForm,
        timeLimit: Number(manualForm.timeLimit),
        createdBy: user?.id,
        questions: questions.map(({ id, ...q }) => ({
          ...q,
          options: q.options.map(({ id: oid, ...o }) => o),
        })),
      };
      const res = await axiosClient.post("/game-rooms/exercises/manual", payload);
      const d = res.data?.data || res.data;
      addLog(`✅ Tạo thủ công thành công! ID: ${d.id} - ${d.title}`, "success");
      setCreateResult(d);
      setSelectedEx(d);
      loadExercises();
    } catch (e) {
      addLog("Lỗi tạo thủ công: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setCreating(false);
    }
  }, [manualForm, questions, user, loadExercises, addLog]);

  const handleCreateJson = useCallback(async () => {
    let body;
    try {
      body = JSON.parse(jsonText);
    } catch {
      addLog("JSON không hợp lệ!", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await axiosClient.post("/game-rooms/exercises/json", {
        ...body,
        createdBy: user?.id,
      });
      const d = res.data?.data || res.data;
      addLog(`✅ Tạo từ JSON thành công! ID: ${d.id} - ${d.title}`, "success");
      setCreateResult(d);
      setSelectedEx(d);
      loadExercises();
    } catch (e) {
      addLog("Lỗi tạo từ JSON: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setCreating(false);
    }
  }, [jsonText, user, loadExercises, addLog]);

  const handleImport = useCallback(async () => {
    if (!importFile) {
      addLog("Chọn file trước!", "error");
      return;
    }
    setCreating(true);
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("level", importLevel);
    fd.append("skill", importSkill);
    fd.append("mode", importMode);
    if (user?.id) fd.append("createdBy", String(user.id));

    try {
      const res = await axiosClient.post("/game-rooms/exercises/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data?.data || res.data;
      addLog(`✅ Import AI thành công! ID: ${d.id} - ${d.title}`, "success");
      setCreateResult(d);
      setSelectedEx(d);
      loadExercises();
    } catch (e) {
      addLog("Lỗi import: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setCreating(false);
    }
  }, [importFile, importLevel, importSkill, importMode, user, loadExercises, addLog]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) {
      addLog("Nhập chủ đề!", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await axiosClient.post("/game-rooms/exercises/ai", {
        topic: aiTopic,
        count: Number(aiCount),
        createdBy: user?.id,
      });
      const d = res.data?.data || res.data;
      addLog(`✅ AI sinh bài tập thành công! ID: ${d.id} - ${d.title}`, "success");
      setCreateResult(d);
      setSelectedEx(d);
      loadExercises();
    } catch (e) {
      addLog("Lỗi AI generate: " + (e.response?.data?.message || e.message), "error");
    } finally {
      setCreating(false);
    }
  }, [aiTopic, aiCount, user, loadExercises, addLog]);

  // Initial loads
  useEffect(() => {
    loadExercises();
    loadJsonTemplate();
  }, [loadExercises, loadJsonTemplate]);

  return {
    exercises,
    loadingEx,
    searchQ,
    setSearchQ,
    selectedEx,
    setSelectedEx,
    preview,
    loadingPreview,
    showPreview,
    setShowPreview,
    handlePreview,

    // Form inputs and triggers
    createTab,
    setCreateTab,
    creating,
    createResult,
    manualForm,
    setManualForm,
    questions,
    addQuestion,
    updateQuestion,
    updateOption,
    removeQuestion,
    jsonText,
    setJsonText,
    importFile,
    setImportFile,
    importMode,
    setImportMode,
    importLevel,
    setImportLevel,
    importSkill,
    setImportSkill,
    aiTopic,
    setAiTopic,
    aiCount,
    setAiCount,
    aiLevel,
    setAiLevel,

    // Actions
    loadExercises,
    handleCreateManual,
    handleCreateJson,
    handleImport,
    handleAiGenerate,
  };
}
