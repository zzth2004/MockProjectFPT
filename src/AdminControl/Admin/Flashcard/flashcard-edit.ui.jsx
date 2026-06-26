import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Plus, Trash2, Edit3, Save, Layers, Loader2, X,
    CheckCircle2, AlertCircle, Globe, Lock, Info, Check, Sparkles
} from "lucide-react";
import { KLCard } from "../../Component/Card";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import flashcardService from "../../Service/API/lessonServiceAPI/flashcard.service";
import aiService from "../../Service/API/aiAPI/ai.service";

export default function FlashcardDeckEdit() {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isTeacher = location.pathname.startsWith("/teacher");
    const backPath = isTeacher ? "/teacher/flashcards" : "/admin/flashcards";

    // --- Loading & Saving States ---
    const [loading, setLoading] = useState(true);
    const [isSavingDeck, setIsSavingDeck] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    
    // --- Data States ---
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    
    // --- Form States ---
    const [deckForm, setDeckForm] = useState({
        title: "",
        description: "",
        isPublic: true,
        status: "ACTIVE"
    });

    const [newCard, setNewCard] = useState({
        frontText: "",
        backText: ""
    });

    // --- Mode selector & JSON/AI import states ---
    const [addMode, setAddMode] = useState("manual"); // "manual", "json", "ai"
    const [jsonText, setJsonText] = useState("");
    const [importText, setImportText] = useState("");
    const [importSubMode, setImportSubMode] = useState("text"); // "text" or "json"
    const [isImportingJson, setIsImportingJson] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [aiCount, setAiCount] = useState(10);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // --- Live JSON Conversion ---
    const currentDeckJson = useMemo(() => {
        const lines = importText.split("\n");
        const flashcards = [];
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            const parts = line.split(/\s*[-–—]\s*/);
            if (parts.length >= 2) {
                const frontText = parts[0].trim();
                const backText = parts.slice(1).join(" - ").trim();
                if (frontText && backText) {
                    flashcards.push({
                        frontText,
                        backText,
                        frontAudio: null,
                        backImage: null
                    });
                }
            }
        }

        return {
            title: deck?.title || deckForm.title || "Tiếng Hàn Chuyên ngành IT",
            description: deck?.description || deckForm.description || "Từ vựng tiếng Hàn dùng trong công việc lập trình, phát triển phần mềm và kỹ thuật.",
            createdBy: deck?.createdBy || 1,
            isPublic: deck?.isPublic !== undefined ? deck.isPublic : false,
            status: deck?.status || "ACTIVE",
            flashcards
        };
    }, [importText, deck, deckForm]);

    const handleCopyJson = () => {
        const jsonString = JSON.stringify(currentDeckJson, null, 2);
        navigator.clipboard.writeText(jsonString);
        alert("📋 Đã sao chép cấu hình JSON vào bộ nhớ tạm!");
    };

    const handleDownloadJson = () => {
        const jsonStr = JSON.stringify(currentDeckJson, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${deck?.title || "deck"}_config.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("📥 Đã tải xuống file cấu hình JSON!");
    };

    // --- Card Edit State ---
    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardForm, setEditingCardForm] = useState({
        frontText: "",
        backText: ""
    });

    // --- Fetch Deck details ---
    const fetchDeckDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await flashcardService.getDeckDetail(deckId);
            if (data) {
                setDeck(data);
                setCards(data.flashcards || []);
                setDeckForm({
                    title: data.title || "",
                    description: data.description || "",
                    isPublic: !!data.isPublic,
                    status: data.status || "ACTIVE"
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải chi tiết bộ thẻ:", err);
            alert("Không thể tải thông tin bộ thẻ này. Vui lòng quay lại.");
            navigate(backPath);
        } finally {
            setLoading(false);
        }
    }, [deckId, navigate, backPath]);

    useEffect(() => {
        if (deckId) {
            fetchDeckDetails();
        }
    }, [deckId, fetchDeckDetails]);

    // --- Handle Deck Info Save ---
    const handleSaveDeckInfo = async (e) => {
        e.preventDefault();
        if (!deckForm.title.trim()) {
            alert("Vui lòng nhập tên bộ thẻ");
            return;
        }

        setIsSavingDeck(true);
        try {
            const payload = {
                title: deckForm.title.trim(),
                description: deckForm.description.trim(),
                isPublic: !!deckForm.isPublic,
                status: deckForm.status
            };

            await flashcardService.updateDeck(deckId, payload);
            alert("✅ Cập nhật thông tin bộ thẻ thành công!");
            // Refresh local state title
            setDeck(prev => ({ ...prev, ...payload }));
        } catch (err) {
            console.error("Lỗi khi lưu thông tin bộ thẻ:", err);
            alert("Không thể lưu thông tin bộ thẻ. Vui lòng kiểm tra lại.");
        } finally {
            setIsSavingDeck(false);
        }
    };

    // --- Handle Add Card ---
    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!newCard.frontText.trim() || !newCard.backText.trim()) {
            alert("Vui lòng điền đầy đủ mặt trước và mặt sau thẻ");
            return;
        }

        setIsAddingCard(true);
        try {
            const payload = {
                deckId: Number(deckId),
                frontText: newCard.frontText.trim(),
                backText: newCard.backText.trim()
            };

            const created = await flashcardService.addCard(payload);
            alert("✅ Thêm thẻ mới thành công!");
            setCards(prev => [...prev, created]);
            setNewCard({ frontText: "", backText: "" });
        } catch (err) {
            console.error("Lỗi khi thêm thẻ:", err);
            alert("Không thể thêm thẻ mới. Vui lòng kiểm tra lại quyền sở hữu bộ thẻ.");
        } finally {
            setIsAddingCard(false);
        }
    };

    const handleImportJson = async (e) => {
        e.preventDefault();
        let cardsToImport = [];

        if (importSubMode === "text") {
            cardsToImport = currentDeckJson.flashcards;
            if (cardsToImport.length === 0) {
                alert("❌ Không tìm thấy thẻ hợp lệ theo định dạng 'Mặt trước - Mặt sau'. Vui lòng nhập mỗi dòng dạng 'Mặt trước - Mặt sau'.");
                return;
            }
        } else {
            const inputText = jsonText.trim();
            if (!inputText) {
                alert("❌ Vui lòng nhập nội dung JSON");
                return;
            }

            try {
                const parsed = JSON.parse(inputText);
                if (Array.isArray(parsed)) {
                    // Format: [ { frontText, backText }, ... ]
                    cardsToImport = parsed;
                } else if (parsed && typeof parsed === 'object') {
                    // Format: { title, description, flashcards: [ ... ], ... }
                    if (Array.isArray(parsed.flashcards)) {
                        cardsToImport = parsed.flashcards;

                        // Optionally update Deck info if present
                        const deckUpdatePayload = {};
                        if (parsed.title) deckUpdatePayload.title = parsed.title;
                        if (parsed.description) deckUpdatePayload.description = parsed.description;
                        if (parsed.isPublic !== undefined) deckUpdatePayload.isPublic = !!parsed.isPublic;
                        if (parsed.status) deckUpdatePayload.status = parsed.status;

                        if (Object.keys(deckUpdatePayload).length > 0) {
                            try {
                                await flashcardService.updateDeck(deckId, deckUpdatePayload);
                                setDeckForm(prev => ({ ...prev, ...deckUpdatePayload }));
                                setDeck(prev => ({ ...prev, ...deckUpdatePayload }));
                            } catch (err) {
                                console.warn("Không thể cập nhật thông tin tiêu đề/mô tả bộ thẻ:", err);
                            }
                        }
                    } else {
                        alert("❌ Đối tượng JSON phải chứa mảng 'flashcards' làm danh sách các thẻ.");
                        return;
                    }
                }
            } catch (err) {
                alert("❌ Lỗi cú pháp JSON. Vui lòng kiểm tra lại cấu trúc JSON của bạn.");
                return;
            }
        }

        // Validate that all cards contain frontText and backText
        const isAllValid = cardsToImport.every(
            (c) => c && typeof c.frontText === "string" && typeof c.backText === "string"
        );
        if (!isAllValid) {
            alert("❌ Dữ liệu thẻ không hợp lệ. Mỗi thẻ bắt buộc phải có thuộc tính 'frontText' và 'backText'.");
            return;
        }

        setIsImportingJson(true);
        try {
            const added = await flashcardService.addCardsBulk(Number(deckId), cardsToImport);
            alert(`✅ Đã import thành công ${added.length || cardsToImport.length} thẻ mới vào học phần!`);
            fetchDeckDetails();
            setJsonText("");
            setImportText("");
        } catch (err) {
            console.error("Lỗi khi import thẻ:", err);
            alert("Không thể import thẻ. Vui lòng kiểm tra lại quyền sở hữu bộ thẻ.");
        } finally {
            setIsImportingJson(false);
        }
    };

    const handleGenerateAi = async (e) => {
        e.preventDefault();
        if (!aiTopic.trim()) return;

        setIsGeneratingAi(true);
        try {
            const config = {
                type: "flashcard",
                jsonData: aiTopic.trim(),
                count: Number(aiCount)
            };

            await aiService.generateFlashcards(Number(deckId), config);
            alert(`✅ AI đã tạo thành công ${aiCount} thẻ mới và lưu vào học phần!`);
            fetchDeckDetails();
            setAiTopic("");
        } catch (err) {
            console.error("Lỗi khi tạo thẻ bằng AI:", err);
            alert("Tạo thẻ bằng AI thất bại. Vui lòng kiểm tra lại khóa API hoặc thử lại sau.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // --- Handle Start Edit Card ---
    const handleStartEditCard = (card) => {
        setEditingCardId(card.id);
        setEditingCardForm({
            frontText: card.frontText || "",
            backText: card.backText || ""
        });
    };

    // --- Handle Save Card Edit ---
    const handleSaveCardEdit = async (cardId) => {
        if (!editingCardForm.frontText.trim() || !editingCardForm.backText.trim()) {
            alert("Mặt trước và mặt sau thẻ không được để trống");
            return;
        }

        try {
            const payload = {
                deckId: Number(deckId),
                frontText: editingCardForm.frontText.trim(),
                backText: editingCardForm.backText.trim()
            };

            const updated = await flashcardService.updateCard(cardId, payload);
            alert("✅ Cập nhật thẻ thành công!");
            setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updated } : c));
            setEditingCardId(null);
        } catch (err) {
            console.error("Lỗi khi sửa thẻ:", err);
            alert("Không thể cập nhật thẻ. Vui lòng thử lại.");
        }
    };

    // --- Handle Delete Card ---
    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa thẻ này khỏi học phần?")) {
            return;
        }

        try {
            await flashcardService.deleteCard(cardId);
            alert("✅ Đã xóa thẻ thành công!");
            setCards(prev => prev.filter(c => c.id !== cardId));
        } catch (err) {
            console.error("Lỗi khi xóa thẻ:", err);
            alert("Không thể xóa thẻ này. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return (
            <div className="py-32 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#2d5a2d]" size={36} />
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">
                    Đang tải học phần & thẻ học...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-500">
            {/* HEADER & QUAY LẠI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(backPath)}
                        className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                            Sửa <span className="text-[#2d5a2d]">Học phần</span>
                        </h1>
                        <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                            {deck?.title || "Hệ thống Flashcard Deck Management"}
                        </p>
                    </div>
                </div>
                <div>
                    <KLBadge type={deck?.isPublic ? "primary" : "default"}>
                        <div className="flex items-center gap-1.5 py-0.5">
                            {deck?.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{deck?.isPublic ? "Công khai" : "Riêng tư"}</span>
                        </div>
                    </KLBadge>
                </div>
            </div>

            {/* MAIN TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: EDIT DECK INFO */}
                <div className="lg:col-span-1 space-y-6 text-left">
                    <KLCard className="bg-white border-none shadow-sm py-6 px-7">
                        <h2 className="text-md font-black text-gray-900 uppercase tracking-tight mb-5 flex items-center gap-2">
                            <Layers size={18} className="text-[#2d5a2d]" />
                            Thông tin bộ thẻ
                        </h2>
                        
                        <form onSubmit={handleSaveDeckInfo} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Tên bộ thẻ *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Tên học phần từ vựng..."
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white focus:border-green-600/20 transition-all outline-none"
                                    value={deckForm.title}
                                    onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Mô tả học phần</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tóm tắt nội dung các thẻ học..."
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white focus:border-green-600/20 transition-all outline-none resize-none"
                                    value={deckForm.description}
                                    onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400">Trạng thái hoạt động</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-black text-[11px] uppercase focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none cursor-pointer"
                                    value={deckForm.status}
                                    onChange={(e) => setDeckForm({ ...deckForm, status: e.target.value })}
                                >
                                    <option value="ACTIVE">Hoạt động (Active)</option>
                                    <option value="INACTIVE">Tạm khóa (Inactive)</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 cursor-pointer select-none hover:bg-gray-100/30 transition-all">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#2d5a2d] focus:ring-[#2d5a2d]/20 w-4 h-4 cursor-pointer"
                                        checked={deckForm.isPublic}
                                        onChange={(e) => setDeckForm({ ...deckForm, isPublic: e.target.checked })}
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black uppercase text-gray-700">Công khai bộ thẻ</span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Cho phép mọi học viên đều học được</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-100/55 flex justify-end">
                                <KLButton
                                    type="submit"
                                    disabled={isSavingDeck}
                                    icon={isSavingDeck ? Loader2 : Save}
                                    className="bg-[#2d5a2d] w-full text-xs font-black uppercase py-3"
                                >
                                    {isSavingDeck ? "Đang lưu..." : "Lưu cấu hình deck"}
                                </KLButton>
                            </div>
                        </form>
                    </KLCard>
                </div>

                {/* COLUMN 2: CARDS LIST MANAGEMENT */}
                <div className="lg:col-span-2 space-y-6 text-left">
                    
                    {/* ADD NEW CARD FORM */}
                    <KLCard className="bg-white border-none shadow-sm py-6 px-7">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                            <h2 className="text-md font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <Plus size={18} className="text-[#2d5a2d]" />
                                Thêm thẻ học mới
                            </h2>
                            <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl">
                                {[
                                    { id: "manual", label: "Thủ công" },
                                    { id: "json", label: "Import JSON" },
                                    { id: "ai", label: "Tạo bằng AI" }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setAddMode(mode.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            addMode === mode.id
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MODE 1: MANUAL */}
                        {addMode === "manual" && (
                            <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mặt trước (Tiếng Hàn/Câu hỏi) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: 학교"
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
                                        value={newCard.frontText}
                                        onChange={(e) => setNewCard({ ...newCard, frontText: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mặt sau (Tiếng Việt/Đáp án) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ví dụ: Trường học"
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
                                        value={newCard.backText}
                                        onChange={(e) => setNewCard({ ...newCard, backText: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-2">
                                    <KLButton
                                        type="submit"
                                        disabled={isAddingCard}
                                        icon={isAddingCard ? Loader2 : Plus}
                                        className="bg-black text-white hover:bg-gray-800 text-xs font-black uppercase px-6 py-3"
                                    >
                                        {isAddingCard ? "Đang thêm..." : "Thêm thẻ vào bộ"}
                                    </KLButton>
                                </div>
                            </form>
                        )}

                        {/* MODE 2: JSON IMPORT */}
                        {addMode === "json" && (
                            <form onSubmit={handleImportJson} className="space-y-4">
                                {/* Sub-mode selector */}
                                <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setImportSubMode("text")}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            importSubMode === "text"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-400 hover:text-gray-700"
                                        }`}
                                    >
                                        Nhập Dạng Text (Front - Back)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImportSubMode("json")}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            importSubMode === "json"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-400 hover:text-gray-700"
                                        }`}
                                    >
                                        Cấu hình JSON trực tiếp
                                    </button>
                                </div>

                                {importSubMode === "text" ? (
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">
                                                Nhập Mặt trước - Mặt sau (Mỗi thẻ 1 dòng) *
                                            </label>
                                            <textarea
                                                rows={5}
                                                required
                                                placeholder={`Ví dụ:\n개발자 (Gaebalja) - Lập trình viên / Developer.\n프로그래밍 (Peurogeuraeming) - Lập trình / Programming.`}
                                                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none resize-y"
                                                value={importText}
                                                onChange={(e) => setImportText(e.target.value)}
                                            />
                                            <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-wider">
                                                Dùng dấu gạch ngang (-) để ngăn cách mặt trước và mặt sau.
                                            </p>
                                        </div>

                                        {/* Configured JSON Preview */}
                                        <div className="space-y-2 mt-4 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-gray-400">
                                                    File JSON cấu hình tự động
                                                </label>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyJson}
                                                        className="px-3 py-1.5 text-[9px] font-black uppercase bg-white border border-gray-200 text-gray-705 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                                                    >
                                                        Sao chép JSON
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleDownloadJson}
                                                        className="px-3 py-1.5 text-[9px] font-black uppercase bg-white border border-gray-200 text-gray-705 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                                                    >
                                                        Tải file .json
                                                    </button>
                                                </div>
                                            </div>
                                            <textarea
                                                rows={8}
                                                readOnly
                                                className="w-full p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-2xl border-none outline-none resize-none"
                                                value={JSON.stringify(currentDeckJson, null, 2)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">
                                            Nội dung JSON cấu hình *
                                        </label>
                                        <textarea
                                            rows={8}
                                            required
                                            placeholder={`Ví dụ:\n[\n  { "frontText": "학교", "backText": "Trường học" },\n  { "frontText": "학생", "backText": "Học sinh" }\n]`}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-mono text-xs focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none resize-y"
                                            value={jsonText}
                                            onChange={(e) => setJsonText(e.target.value)}
                                        />
                                        <p className="text-[9px] text-gray-400 font-bold px-1 uppercase tracking-wider">
                                            Nhập mảng các thẻ hoặc JSON có chứa thuộc tính "flashcards" chứa mảng thẻ.
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <KLButton
                                        type="submit"
                                        disabled={isImportingJson}
                                        icon={isImportingJson ? Loader2 : Plus}
                                        className="bg-black text-white hover:bg-gray-800 text-xs font-black uppercase px-6 py-3"
                                    >
                                        {isImportingJson ? "Đang import..." : "Import danh sách thẻ"}
                                    </KLButton>
                                </div>
                            </form>
                        )}

                        {/* MODE 3: AI GENERATION */}
                        {addMode === "ai" && (
                            <form onSubmit={handleGenerateAi} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="md:col-span-3 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Chủ đề hoặc nội dung cần AI tạo thẻ *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Từ vựng về gia đình, các câu giao tiếp chào hỏi..."
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Số lượng thẻ (1-50)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={50}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-sm focus:ring-2 focus:ring-green-600/10 focus:bg-white transition-all outline-none"
                                            value={aiCount}
                                            onChange={(e) => setAiCount(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <KLButton
                                        type="submit"
                                        disabled={isGeneratingAi}
                                        icon={isGeneratingAi ? Loader2 : Sparkles}
                                        className="bg-[#2d5a2d] hover:bg-[#204020] text-white text-xs font-black uppercase px-6 py-3"
                                    >
                                        {isGeneratingAi ? "AI đang tạo thẻ..." : "Bắt đầu tạo bằng AI"}
                                    </KLButton>
                                </div>
                            </form>
                        )}
                    </KLCard>

                    {/* LIST OF EXISTING CARDS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-widest">
                                Danh sách thẻ hiện có ({cards.length} thẻ)
                            </span>
                        </div>

                        <div className="space-y-3.5">
                            {cards.map((card, idx) => (
                                <div
                                    key={card.id || idx}
                                    className={`bg-white rounded-3xl border shadow-sm p-6 transition-all duration-200 ${
                                        editingCardId === card.id
                                            ? "border-green-300 ring-2 ring-green-600/5 bg-green-50/5"
                                            : "border-gray-100 hover:border-gray-200"
                                    }`}
                                >
                                    {editingCardId === card.id ? (
                                        /* CARD EDIT MODE */
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                                                Đang sửa thẻ #{idx + 1}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">Mặt trước *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm focus:ring-2 focus:ring-green-600/10 outline-none"
                                                        value={editingCardForm.frontText}
                                                        onChange={(e) => setEditingCardForm({ ...editingCardForm, frontText: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase text-gray-400 px-1">Mặt sau *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm focus:ring-2 focus:ring-green-600/10 outline-none"
                                                        value={editingCardForm.backText}
                                                        onChange={(e) => setEditingCardForm({ ...editingCardForm, backText: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2.5 pt-2 border-t border-dashed border-gray-200/60">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCardId(null)}
                                                    className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                                                >
                                                    <X size={13} />
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveCardEdit(card.id)}
                                                    className="px-4 py-2 text-xs font-black text-white bg-[#2d5a2d] hover:bg-[#204020] rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                                                >
                                                    <Check size={13} />
                                                    Lưu thẻ
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* CARD DISPLAY MODE */
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex gap-5 flex-1 items-center">
                                                {/* Card number badge */}
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100/70 flex items-center justify-center text-xs font-black text-gray-400 shrink-0">
                                                    #{idx + 1}
                                                </div>
                                                
                                                {/* Text Content Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 flex-1">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-gray-300 block mb-0.5 tracking-wider">Mặt trước</span>
                                                        <span className="text-base font-black text-[#2d5a2d] tracking-tight">{card.frontText}</span>
                                                    </div>
                                                    <div className="border-t md:border-t-0 md:border-l border-gray-50 pt-1.5 md:pt-0 md:pl-8">
                                                        <span className="text-[9px] font-black uppercase text-gray-300 block mb-0.5 tracking-wider">Mặt sau</span>
                                                        <span className="text-sm font-bold text-gray-600">{card.backText}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1 items-center shrink-0">
                                                <button
                                                    onClick={() => handleStartEditCard(card)}
                                                    className="p-2.5 rounded-xl text-[#2d5a2d] hover:bg-[#E4FBE1] active:scale-90 transition-all"
                                                    title="Sửa nội dung thẻ"
                                                >
                                                    <Edit3 size={15} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCard(card.id)}
                                                    className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 active:scale-90 transition-all"
                                                    title="Xóa thẻ khỏi bộ"
                                                >
                                                    <Trash2 size={15} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {cards.length === 0 && (
                                <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 italic font-black text-gray-400 uppercase tracking-widest">
                                    Bộ học phần này chưa có thẻ học nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
