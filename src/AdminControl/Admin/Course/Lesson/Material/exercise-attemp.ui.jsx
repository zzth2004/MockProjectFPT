import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, Clock, BookOpen, 
  BarChart3, RotateCcw, Target
} from "lucide-react";

// Components
import { KLCard } from "../../../../Component/Card";
import { KLTable } from "../../../../Component/Table";
import { KLButton } from "../../../../Component/Button";
import { KLBadge } from "../../../../Component/Badge";

// Logic
import useCallApiHandler from "../../../../../hooks/HookHander/useCallApiHandler";
import exerciseService from "../../../../Service/API/lessonServiceAPI/exercise.service";

export default function AttemptList({ exerciseId, userId }) {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: "", 
        minScore: "",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;

    // --- 2. DEBOUNCE LOGIC ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // --- 3. FETCH DATA ---
    const fetchAttemptsFn = useCallback(() => {
        // Sử dụng đúng tên hàm đã khai báo trong service
        return exerciseService.getAllAttemptsAdmin(1, 100, debouncedSearch, exerciseId);
    }, [exerciseId, debouncedSearch]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchAttemptsFn);

    useEffect(() => { refresh(); }, [refresh]);

    // --- 4. KHẮC PHỤC LỖI .FILTER (Kiểm tra dữ liệu an toàn) ---
    const rawData = useMemo(() => {
        if (!response) return [];
        // Nếu backend trả về { items: [] }
        if (response.items && Array.isArray(response.items)) return response.items;
        // Nếu backend trả về { data: [] }
        if (response.data && Array.isArray(response.data)) return response.data;
        // Nếu bản thân response là mảng
        if (Array.isArray(response)) return response;
        return [];
    }, [response]);

    const filteredData = useMemo(() => {
        // Đảm bảo rawData luôn là mảng trước khi filter
        if (!Array.isArray(rawData)) return [];
        
        return rawData.filter(item => {
            const statusMatch = filters.status === "" || 
                (filters.status === "correct" ? item.isCorrect : !item.isCorrect);
            
            const scoreMatch = filters.minScore === "" || 
                Number(item.score) >= parseFloat(filters.minScore);

            return statusMatch && scoreMatch;
        });
    }, [rawData, filters]);

    // --- 5. PAGINATION ---
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const getPaginationRange = () => {
        const totalVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
        let end = Math.min(totalPages, start + totalVisible - 1);
        if (end === totalPages) start = Math.max(1, totalPages - totalVisible + 1);
        if (start === 1) end = Math.min(totalPages, totalVisible);
        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    // --- 6. COLUMNS DEFINITION ---
    const columns = useMemo(() => {
        const cols = [
            {
                key: "exercise",
                title: "Bài tập & Thời gian",
                render: (val, row) => (
                    <div className="flex flex-col text-left py-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Target size={14} className="text-[#2d5a2d]" />
                            <span className="text-[13px] font-black text-gray-900 uppercase tracking-tight line-clamp-1">
                                {row.exercise?.title || `Bài tập #${row.exerciseId}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold ml-6">
                            <Clock size={10} />
                            {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : "---"}
                        </div>
                    </div>
                )
            }
        ];

        if (!exerciseId) {
            cols.push({
                key: "user",
                title: "Học viên",
                render: (user) => (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-[10px] font-black uppercase border border-orange-100">
                            {user?.fullName?.[0] || "U"}
                        </div>
                        <span className="text-xs font-bold text-gray-600">{user?.fullName || "N/A"}</span>
                    </div>
                )
            });
        }

        cols.push(
            {
                key: "userAnswer",
                title: "Đáp án",
                render: (val) => {
                    let displayText = "---";
                    if (val && typeof val === 'object') {
                        if (Array.isArray(val)) {
                            const correctCount = val.filter(a => a?.isCorrect).length;
                            displayText = `${correctCount}/${val.length} câu đúng`;
                        } else {
                            displayText = val.isCorrect ? "Đúng (1/1)" : "Sai (0/1)";
                        }
                    } else if (val) {
                        displayText = String(val);
                    }
                    return (
                        <div className="max-w-[150px]">
                            <p className="text-[11px] font-bold text-gray-500 italic truncate bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                {displayText}
                            </p>
                        </div>
                    );
                }
            },
            {
                key: "isCorrect",
                title: "Kết quả",
                render: (val) => (
                    <KLBadge type={val ? 'success' : 'danger'}>
                        <div className="flex items-center gap-1 min-w-[60px] justify-center">
                            {val ? <CheckCircle2 size={11} strokeWidth={3} /> : <XCircle size={11} strokeWidth={3} />}
                            <span className="text-[10px] font-black uppercase">{val ? "Đúng" : "Sai"}</span>
                        </div>
                    </KLBadge>
                )
            },
            {
                key: "score",
                title: "Điểm",
                render: (val) => (
                    <div className="flex flex-col items-center">
                        <span className={`text-lg font-black leading-none ${val >= 5 ? 'text-[#2d5a2d]' : 'text-red-500'}`}>
                            {Number(val).toFixed(1)}
                        </span>
                        <span className="text-[8px] text-gray-300 font-black uppercase mt-0.5 tracking-tighter">Points</span>
                    </div>
                )
            }
        );
        return cols;
    }, [exerciseId]);

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">
                        Kết quả <span className="text-[#2d5a2d]">Luyện tập</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-2 italic">
                        {exerciseId ? `Chi tiết kết quả bài tập` : "Quản lý toàn bộ kết quả hệ thống"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={RotateCcw} onClick={refresh}>Làm mới</KLButton>
                    <KLButton icon={BarChart3} className="bg-black shadow-xl shadow-gray-200">Báo cáo</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-[#2d5a2d] animate-pulse' : 'text-gray-300'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên học viên, bài tập..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
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
                        {showFilters ? "Đóng" : "Lọc"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Kết quả đáp án</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                <option value="">Tất cả</option>
                                <option value="correct">Chính xác</option>
                                <option value="incorrect">Chưa chính xác</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Điểm tối thiểu</label>
                            <input type="number" className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px]"
                                placeholder="Ví dụ: 5.0" value={filters.minScore}
                                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} />
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE */}
            <KLCard className="p-0 overflow-hidden border-none shadow-2xl bg-white rounded-[2.5rem]">
                {loading && rawData.length === 0 ? (
                    <div className="py-24 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest italic">Đang đồng bộ kết quả...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            onAction={(type, item) => console.log(type, item)}
                            hiddenActions={['edit', 'reset', 'lock', 'view']}
                        />

                        {/* PAGINATION */}
                        <div className="px-10 py-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase block">Trang {currentPage} / {totalPages}</span>
                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter mt-1 italic">Hiển thị {filteredData.length} kết quả</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all hover:bg-gray-100"><ChevronLeft size={20} strokeWidth={3} /></button>
                                
                                <div className="flex gap-2">
                                    {getPaginationRange().map(p => (
                                        <button key={p} onClick={() => setCurrentPage(p)}
                                            className={`w-11 h-11 rounded-2xl font-black text-xs transition-all ${currentPage === p ? "bg-[#2d5a2d] text-white shadow-xl shadow-green-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all hover:bg-gray-100"><ChevronRight size={20} strokeWidth={3} /></button>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}