import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Search, Plus, Filter, X, ChevronLeft, ChevronRight,
    Layers, Globe, Lock, Clock, Edit3, Trash2, Eye, 
    CheckCircle2, AlertCircle, PlayCircle, BookOpen, GraduationCap,
    LayoutGrid, Loader2
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import flashcardService from "../../Service/API/lessonServiceAPI/flashcard.service";

export default function FlashcardDeckList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        isPublic: "", // "", "true", "false"
        status: "",   // Khớp với DeckStatus Enum (ACTIVE, INACTIVE...)
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(null); // null = Add, else = Edit
    const [isSaving, setIsSaving] = useState(false);
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewDeckDetails, setViewDeckDetails] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isPublic: true,
        status: "ACTIVE"
    });

    // --- Create Deck Import States ---
    const [createMode, setCreateMode] = useState("manual"); // "manual" or "import"
    const [importSubMode, setImportSubMode] = useState("text"); // "text" or "json"
    const [importText, setImportText] = useState("");
    const [jsonText, setJsonText] = useState("");

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
            title: formData.title || "Tiếng Hàn Chuyên ngành IT",
            description: formData.description || "Từ vựng tiếng Hàn dùng trong công việc lập trình, phát triển phần mềm và kỹ thuật.",
            createdBy: selectedDeck?.createdBy || 1,
            isPublic: formData.isPublic !== undefined ? formData.isPublic : false,
            status: formData.status || "ACTIVE",
            flashcards
        };
    }, [importText, formData, selectedDeck]);

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
        link.download = `${formData.title || "deck"}_config.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert("📥 Đã tải xuống file cấu hình JSON!");
    };

    // --- 2. FETCH DATA ---
    const fetchDecksFn = useCallback(() => flashcardService.getAllDecks(1, 100), []);
    const { data: decksResponse, loading, call: refreshDecks } = useCallApiHandler(fetchDecksFn);

    useEffect(() => {
        refreshDecks();
    }, [refreshDecks]);

    // --- 3. LOGIC LỌC DỮ LIỆU 3 TẦNG (Giữ nguyên chuẩn KoreanLab) ---
    
    // Tầng 1: Dữ liệu gốc
    const rawData = useMemo(() => {
        if (!decksResponse) return [];
        if (Array.isArray(decksResponse)) return decksResponse;
        if (Array.isArray(decksResponse.data)) return decksResponse.data;
        if (decksResponse.items && Array.isArray(decksResponse.items)) return decksResponse.items;
        return [];
    }, [decksResponse]);

    // Tầng 2: Search nhanh (Tiêu đề & Mô tả)
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(deck =>
            [deck.title, deck.description].some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Tầng 3: Lọc nâng cao (Search + Privacy + Status)
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(deck => {
            const searchMatch = !searchTerm ||
                [deck.title, deck.description].some(field =>
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const publicMatch = filters.isPublic === "" ||
                String(deck.isPublic) === filters.isPublic;

            const statusMatch = filters.status === "" || deck.status === filters.status;

            return searchMatch && publicMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. PAGINATION ---
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, showFilters]);

    // --- 5. ĐỊNH NGHĨA CÁC CỘT (COLUMNS) ---
    const columns = [
        {
            key: "title",
            title: "Tên bộ thẻ (Deck Title)",
            render: (val, row) => (
                <div className="flex items-center gap-4 text-left py-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#2d5a2d] flex items-center justify-center text-white shadow-lg shrink-0">
                        <LayoutGrid size={22} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-black text-gray-900 uppercase tracking-tight leading-none mb-1.5">
                            {val}
                        </span>
                        <p className="text-[10px] text-gray-400 font-bold italic line-clamp-1 max-w-[250px]">
                            {row.description || "Hệ thống Flashcard thông minh KoreanLab"}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: "flashcards",
            title: "Quy mô",
            render: (val, row) => (
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Layers size={12} className="text-[#2d5a2d]" />
                        <span className="text-[13px] font-black text-gray-800">{row.cardCount ?? val?.length ?? 0}</span>
                    </div>
                    <span className="text-[8px] text-gray-400 font-black uppercase mt-1 ml-1 tracking-widest">Thẻ Flashcard</span>
                </div>
            )
        },
        {
            key: "isPublic",
            title: "Chế độ",
            render: (val) => (
                <KLBadge type={val ? "primary" : "default"}>
                    <div className="flex items-center gap-1.5">
                        {val ? <Globe size={11} /> : <Lock size={11} />}
                        <span className="text-[9px] font-black uppercase">{val ? "Công khai" : "Riêng tư"}</span>
                    </div>
                </KLBadge>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val === 'ACTIVE' ? "success" : "danger"}>
                    <div className="flex items-center gap-1.5">
                        {val === 'ACTIVE' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{val}</span>
                    </div>
                </KLBadge>
            )
        }
    ];

    // --- 6. HANDLERS ---
    const handleAddNew = () => {
        setSelectedDeck(null);
        setFormData({
            title: "",
            description: "",
            isPublic: true,
            status: "ACTIVE"
        });
        setCreateMode("manual");
        setImportSubMode("text");
        setImportText("");
        setJsonText("");
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        const rolePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';
        navigate(`${rolePath}/flashcards/${item.id}/edit`);
    };

    const handleView = async (item) => {
        setLoadingDetail(true);
        setViewDeckDetails(item);
        setIsViewModalOpen(true);
        try {
            const detail = await flashcardService.getDeckDetail(item.id);
            if (detail) {
                setViewDeckDetails(detail);
            }
        } catch (err) {
            console.error("Lỗi khi tải chi tiết bộ thẻ:", err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tên bộ thẻ");
            return;
        }

        let cardsToImport = [];
        if (createMode === "import") {
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
                        cardsToImport = parsed;
                    } else if (parsed && typeof parsed === 'object') {
                        if (Array.isArray(parsed.flashcards)) {
                            cardsToImport = parsed.flashcards;
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
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                isPublic: !!formData.isPublic,
                status: formData.status
            };

            if (selectedDeck) {
                await flashcardService.updateDeck(selectedDeck.id, payload);
                alert("✅ Cập nhật bộ thẻ thành công!");
            } else {
                const newDeck = await flashcardService.createDeck(payload);
                if (createMode === "import" && cardsToImport.length > 0) {
                    await flashcardService.addCardsBulk(newDeck.id, cardsToImport);
                    alert(`✅ Tạo bộ thẻ và import thành công ${cardsToImport.length} thẻ!`);
                } else {
                    alert("✅ Tạo bộ thẻ mới thành công!");
                }
            }
            setIsModalOpen(false);
            refreshDecks();
        } catch (err) {
            console.error("Lỗi khi lưu bộ thẻ:", err);
            alert("Không thể lưu bộ thẻ. Vui lòng kiểm tra lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (type, item) => {
        if (type === 'view') {
            handleView(item);
        }
        if (type === 'edit') {
            handleEdit(item);
        }
        if (type === 'delete' && window.confirm(`⚠️ Bạn có chắc muốn xóa bộ thẻ "${item.title}"?`)) {
            try {
                await flashcardService.deleteDeck(item.id);
                refreshDecks();
            } catch (err) { alert("❌ Lỗi khi xóa bộ thẻ"); }
        }
    };

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Quản lý <span className="text-[#2d5a2d]">Bộ thẻ</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        Hệ thống Flashcard Deck Management
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={handleAddNew}>Tạo bộ thẻ mới</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bộ thẻ theo tên..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all"
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
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Quyền truy cập</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.isPublic}
                                onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })}
                            >
                                <option value="">Tất cả chế độ</option>
                                <option value="true">Công khai (Public)</option>
                                <option value="false">Riêng tư (Private)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái Deck</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Hoạt động (Active)</option>
                                <option value="INACTIVE">Tạm khóa (Inactive)</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest">Đang tải dữ liệu bộ thẻ...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            showAction={true}
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock']}
                        />

                        {/* PAGINATION (Chuẩn KoreanLab 5 nút liên tục) */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {currentActiveDataset.length} bộ decks</span>
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
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => Math.abs(page - currentPage) <= 2)
                                        .map((page) => (
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

            {/* CREATE / EDIT DECK MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`bg-white rounded-[2.5rem] w-full transition-all duration-300 overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left ${createMode === 'import' ? 'max-w-4xl' : 'max-w-lg'}`}>
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {selectedDeck ? "Cập Nhật Bộ Thẻ" : "Tạo Bộ Thẻ Mới"}
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    {selectedDeck ? "Chỉnh sửa tiêu đề và cấu hình bộ thẻ" : "Tạo mới bộ học tập flashcard từ vựng"}
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
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            
                            {/* Mode selector at the very top of form */}
                            {!selectedDeck && (
                                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setCreateMode("manual")}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            createMode === "manual"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        Tạo thủ công
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreateMode("import")}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                                            createMode === "import"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        Tạo & Nhập nhanh từ JSON / Text
                                    </button>
                                </div>
                            )}

                            <div className={createMode === "import" && !selectedDeck ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-6"}>
                                
                                {/* COLUMN 1: DECK INFO */}
                                <div className="space-y-6">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tên bộ thẻ *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ví dụ: Từ vựng Động từ Sơ cấp 1"
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mô tả bộ thẻ</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Ví dụ: Tổng hợp các động từ bất quy tắc thường gặp..."
                                            className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Privacy Status */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái hoạt động</label>
                                            <select
                                                className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none cursor-pointer"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="ACTIVE">Hoạt động (Active)</option>
                                                <option value="INACTIVE">Tạm khóa (Inactive)</option>
                                            </select>
                                        </div>

                                        {/* Public Access */}
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer select-none hover:bg-gray-100/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#2d5a2d] focus:ring-[#2d5a2d]/20 w-4 h-4 cursor-pointer"
                                                    checked={formData.isPublic}
                                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                                />
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[11px] font-black uppercase text-gray-700">Công khai</span>
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Mọi người đều xem được</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMN 2: CARDS IMPORT */}
                                {createMode === "import" && !selectedDeck && (
                                    <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            {/* Sub-mode selector */}
                                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setImportSubMode("text")}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
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
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
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
                                                            Mặt trước - Mặt sau (Mỗi thẻ 1 dòng) *
                                                        </label>
                                                        <textarea
                                                            rows={4}
                                                            required
                                                            placeholder={`Ví dụ:\n개발자 (Gaebalja) - Lập trình viên / Developer.\n프로그래밍 (Peurogeuraeming) - Lập trình / Programming.`}
                                                            className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-y"
                                                            value={importText}
                                                            onChange={(e) => setImportText(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Live JSON Preview */}
                                                    <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] font-black uppercase text-gray-400">File JSON cấu hình tự động</span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCopyJson}
                                                                    className="px-2.5 py-1 text-[8px] font-black uppercase bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                                                                >
                                                                    Sao chép
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleDownloadJson}
                                                                    className="px-2.5 py-1 text-[8px] font-black uppercase bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                                                                >
                                                                    Tải file
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            rows={5}
                                                            readOnly
                                                            className="w-full p-3 bg-gray-900 text-green-400 font-mono text-[10px] rounded-xl border-none outline-none resize-none"
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
                                                        rows={9}
                                                        required
                                                        placeholder={`Ví dụ:\n[\n  { "frontText": "학교", "backText": "Trường học" }\n]`}
                                                        className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none font-mono text-xs focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-y"
                                                        value={jsonText}
                                                        onChange={(e) => setJsonText(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
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

            {/* VIEW DECK DETAILS MODAL */}
            {isViewModalOpen && viewDeckDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 text-left font-sans">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#2d5a2d]/10 flex items-center justify-center border border-[#2d5a2d]/25 text-[#2d5a2d] shrink-0 shadow-sm">
                                    <Layers size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-800 leading-tight tracking-tight line-clamp-1 max-w-[420px]">
                                        {viewDeckDetails.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${viewDeckDetails.isPublic ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-500 border border-slate-200/60"}`}>
                                            {viewDeckDetails.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                                            {viewDeckDetails.isPublic ? "Công khai" : "Riêng tư"}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${viewDeckDetails.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${viewDeckDetails.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
                                            {viewDeckDetails.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-650 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 shrink-0 border border-slate-100"
                            >
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            
                            {/* Description */}
                            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Mô tả học phần</span>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    {viewDeckDetails.description || "Không có mô tả nào cho bộ thẻ này."}
                                </p>
                            </div>

                            {/* Cards list */}
                            <div className="space-y-4">
                                <span className="text-xs font-bold text-slate-550 uppercase tracking-wider block">
                                    Danh sách thẻ học ({viewDeckDetails.flashcards?.length || 0} thẻ)
                                </span>
                                
                                {loadingDetail ? (
                                    <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="animate-spin text-[#2d5a2d]" size={24} />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang tải thẻ học...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(viewDeckDetails.flashcards || []).map((card, cIdx) => (
                                            <div 
                                                key={card.id || cIdx} 
                                                className="col-span-1 bg-white rounded-3xl border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
                                            >
                                                {/* Card Header */}
                                                <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Thẻ #{cIdx + 1}</span>
                                                    <span className="text-[8px] font-black text-[#2d5a2d] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 uppercase tracking-wider">
                                                        Flashcard
                                                    </span>
                                                </div>

                                                {/* Content Faces Grid */}
                                                <div className="grid grid-cols-2 flex-1 min-h-[110px]">
                                                    {/* Front Face */}
                                                    <div className="p-4 bg-emerald-50/10 flex flex-col justify-center items-center text-center border-r border-dashed border-slate-100">
                                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1 opacity-70">Mặt trước</span>
                                                        <p className="text-sm font-black text-[#2d5a2d] leading-normal break-words w-full">
                                                            {card.frontText}
                                                        </p>
                                                    </div>

                                                    {/* Back Face */}
                                                    <div className="p-4 bg-slate-50/10 flex flex-col justify-center items-center text-center">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Mặt sau</span>
                                                        <p className="text-xs font-bold text-slate-700 leading-normal break-words w-full">
                                                            {card.backText}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(viewDeckDetails.flashcards || []).length === 0 && (
                                            <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                                                <Layers size={36} className="text-slate-300 mb-2" />
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Chưa có thẻ nào trong học phần này</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
                            <span className="text-[11px] font-semibold text-slate-400 tracking-wide hidden sm:inline-block">DATT LMS Smart Flashcards</span>
                            <button
                                type="button"
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all active:scale-95 text-xs uppercase tracking-wider"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}