import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Plus, Edit3, Trash2, Video, FileText, 
  Clock, ChevronLeft, ChevronRight,
  Layers, Database, BookOpen, Layout, Filter, X
} from "lucide-react";

// Components
import { KLCard } from "../../../Component/Card";
import { KLTable } from "../../../Component/Table";
import { KLButton } from "../../../Component/Button";
import { KLBadge } from "../../../Component/Badge";

// Logic
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";

export default function LessonList({ courseId, courseTitle }) {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        isFree: "", // "true", "false" hoặc ""
    });

    // States cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 2. FETCH DATA ---
    // Gọi API linh hoạt (Lấy theo Course hoặc Lấy tất cả - Tải 100 để lọc tại FE)
    const fetchLessonsFn = useCallback(() => {
        if (courseId) {
            return lessonService.getByCourse(courseId, 1, 100);
        }
        return lessonService.getAllLesson(1, 100);
    }, [courseId]);

    const { data: lessonsResponse, loading, call: refreshLessons } = useCallApiHandler(fetchLessonsFn);

    useEffect(() => {
        refreshLessons();
    }, [refreshLessons]);

    // --- 3. LOGIC LỌC DỮ LIỆU ---

    // Dữ liệu gốc từ API
    const rawData = useMemo(() => lessonsResponse?.data || [], [lessonsResponse]);

    // Dữ liệu lọc tổng hợp (Search + Advanced Filter)
    const filteredDataset = useMemo(() => {
        return rawData.filter(lesson => {
            const searchMatch = !searchTerm ||
                lesson.title?.toLowerCase().includes(searchTerm.toLowerCase());

            const statusMatch = filters.isFree === "" ||
                String(lesson.isFree) === filters.isFree;

            return searchMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. LOGIC PHÂN TRANG (PAGINATION) ---

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredDataset.slice(startIndex, startIndex + pageSize);
    }, [filteredDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredDataset.length / pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, showFilters]);

    // --- 5. HANDLERS ---
    const handleAction = async (type, lesson) => {
        switch (type) {
            case 'edit':
                console.log("Mở modal sửa bài học:", lesson.id);
                break;
            case 'delete':
                if (window.confirm(`⚠️ Bạn có chắc chắn muốn XÓA bài học: ${lesson.title}?`)) {
                    try {
                        await lessonService.delete(lesson.id);
                        alert("✅ Đã xóa bài học thành công!");
                        refreshLessons();
                    } catch (error) {
                        alert("❌ Lỗi khi xóa bài học");
                    }
                }
                break;
            default: break;
        }
    };

    // Định nghĩa các cột
    const columns = [
        {
            key: "orderIndex",
            title: "STT",
            render: (val) => (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 font-black text-gray-400 text-[11px]">
                    {val < 10 ? `0${val}` : val}
                </div>
            )
        },
        {
            key: "title",
            title: "Thông tin bài giảng",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <span className="text-[14px] font-black text-gray-900 leading-tight mb-1">{val}</span>
                    <div className="flex items-center gap-2">
                        {row.videoUrl ? (
                            <span className="flex items-center gap-1 text-[9px] text-blue-500 font-bold uppercase tracking-tighter">
                                <Video size={10} /> Video Lesson
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[9px] text-orange-500 font-bold uppercase tracking-tighter">
                                <FileText size={10} /> Document
                            </span>
                        )}
                        {!courseId && (
                            <div className="flex items-center gap-1 border-l pl-2 border-gray-100">
                                <BookOpen size={10} className="text-gray-300" />
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Khóa: {row.course?.title}</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: "duration",
            title: "Thời lượng",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
                    <Clock size={12} className="text-gray-300" />
                    {val ? `${val} phút` : "---"}
                </div>
            )
        },
        {
            key: "isFree",
            title: "Truy cập",
            render: (val) => (
                <KLBadge type={val ? "success" : "default"}>
                    {val ? "HỌC THỬ" : "NỘI BỘ"}
                </KLBadge>
            )
        }
    ];

    // Logic 5 trang liên tục
    const visiblePages = (() => {
        const totalVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(totalVisible / 2));
        let end = Math.min(totalPages, start + totalVisible - 1);
        if (end === totalPages) start = Math.max(1, totalPages - totalVisible + 1);
        if (start === 1) end = Math.min(totalPages, totalVisible);
        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    })();

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Quản lý <span className="text-[#2d5a2d]">Bài giảng</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                        {courseId ? `Khóa học: ${courseTitle}` : "Hệ thống học liệu KoreanLab"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={Database} onClick={() => lessonService.seedData().then(() => refreshLessons())}>Seed JSON</KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Thêm bài học</KLButton>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tiêu đề bài học..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <KLButton
                        variant={showFilters ? "primary" : "outline"}
                        icon={showFilters ? X : Filter}
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-black text-white border-black" : ""}
                    >
                        {showFilters ? "Đóng lọc" : "Lọc nâng cao"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Loại truy cập</label>
                            <select
                                className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.isFree}
                                onChange={(e) => setFilters({ ...filters, isFree: e.target.value })}
                            >
                                <option value="">Tất cả bài học</option>
                                <option value="true">Bài học miễn phí</option>
                                <option value="false">Bài học nội bộ</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp bài giảng...</div>
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
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
                                    Trang {currentPage} / {totalPages || 1}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                    Tổng: {filteredDataset.length} bài học
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${currentPage === page
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
        </div>
    );
}