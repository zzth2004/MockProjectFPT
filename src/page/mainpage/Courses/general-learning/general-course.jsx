import React, { useEffect, useCallback, useState, useMemo, memo } from "react";
import { BookOpen, Search, Filter, X, ChevronLeft, ChevronRight, Layers, AudioWaveform } from "lucide-react";
import { KLCard } from "../../../../AdminControl/Component/Card";
import { KLButton } from "../../../../AdminControl/Component/Button";
import { KLBadge } from "../../../../AdminControl/Component/Badge";
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import courseService from "../../../../AdminControl/Service/API/courseServiceAPI/course.service";
import { useNavigate } from "react-router-dom";

// --- UTILS ---
const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

// --- SUB-COMPONENTS ---

/**
 * Phân trang thông minh với Logic dấu ba chấm (...)
 */
const Pagination = memo(({ current, total, onPageChange, totalItems, pageSize }) => {
    // Logic tính toán dải trang (1 ... 4 5 6 ... 10)
    const pages = useMemo(() => {
        const range = [];
        const delta = 1;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) range.push(i);
            else if (i === current - delta - 1 || i === current + delta + 1) range.push("...");
        }
        return Array.from(new Set(range));
    }, [current, total]);

    const from = (current - 1) * pageSize + 1;
    const to = Math.min(current * pageSize, totalItems);

    return (
        <div className="mt-12 flex flex-col items-center gap-6">
            {/* Thanh phân trang chính */}
            <div className="flex flex-wrap items-center justify-center md:justify-between w-full bg-white p-3 md:px-8 md:py-4 rounded-[2rem] shadow-xl shadow-green-900/5 border border-gray-50">

                {/* Khối bên trái: Thông tin (Hidden on small mobile) */}
                <div className="hidden md:flex flex-col items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Đang hiển thị</p>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-gray-900">{from} - {to}</span>
                        <span className="text-xs font-bold text-gray-400">/ {totalItems}</span>
                    </div>
                </div>

                {/* Khối giữa: Các nút điều hướng */}
                <div className="flex items-center gap-1 md:gap-3">
                    {/* Nút Previous */}
                    <button
                        onClick={() => onPageChange(current - 1)}
                        disabled={current === 1}
                        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-green-700 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-50 disabled:hover:text-gray-400 transition-all duration-300 group shadow-sm"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>

                    {/* Dải số trang */}
                    <div className="flex items-center gap-1 md:gap-2 bg-gray-50/80 p-1 rounded-[1.5rem] border border-gray-100">
                        {pages.map((page, idx) => (
                            <button
                                key={idx}
                                disabled={page === "..."}
                                onClick={() => onPageChange(page)}
                                className={`
                                    min-w-[36px] h-9 md:min-w-[44px] md:h-11 rounded-[1rem] text-[11px] md:text-xs font-black transition-all duration-300
                                    ${page === current
                                        ? "bg-green-700 text-white shadow-lg shadow-green-200 scale-105"
                                        : page === "..."
                                            ? "text-gray-300 cursor-default"
                                            : "text-gray-500 hover:bg-white hover:text-green-700 hover:shadow-sm"}
                                `}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {/* Nút Next */}
                    <button
                        onClick={() => onPageChange(current + 1)}
                        disabled={current === total}
                        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-green-700 hover:text-white disabled:opacity-20 disabled:hover:bg-gray-50 transition-all duration-300 group shadow-sm"
                    >
                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {/* Khối bên phải: Jump to page (Optional - Hidden on mobile) */}
                <div className="hidden lg:flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-gray-400">Trang {current} / {total}</span>
                </div>
            </div>

            {/* Mobile-only info text */}
            <div className="md:hidden text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Hiển thị {from}-{to} trên tổng {totalItems} khóa học
                </p>
            </div>
        </div>
    );
});

const CourseCard = memo(({ course }) => {
    const navigate = useNavigate();
    const { title, thumbnail, level, slug, lessonsCount, salePrice, price, createdBy: creator } = course;
    const isSale = salePrice < price;

    const handleCardClick = () => {
        navigate(`/courses/${slug}`);
    };

    return (
        <KLCard
            onClick={handleCardClick}
            className="p-0 overflow-hidden flex flex-col h-full border-none shadow-md hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] group">
            <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                {thumbnail ? (
                    <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-2xl" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><BookOpen size={48} strokeWidth={1} /></div>
                )}
                <div className="absolute bottom-4 left-4">
                    <span className="px-4 py-1.5 rounded-full bg-black/70 text-white text-[10px] font-black uppercase italic backdrop-blur-md border border-white/10">
                        {level}
                    </span>
                </div>
            </div>

            <div className="p-7 flex flex-col flex-1 justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-green-700 transition-colors uppercase italic tracking-tighter">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{slug}</span>
                    </div>
                </div>

                <div className="flex items-end justify-between border-t border-dashed border-gray-100 pt-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                                {creator?.avatar ? <img src={creator.avatar} className="object-cover w-full h-full" /> : <span className="text-[10px] font-black text-green-600">{creator?.fullName?.[0]}</span>}
                            </div>
                            <span className="text-[11px] font-black text-gray-600 uppercase tracking-tight">{creator?.fullName || "Giảng viên"}</span>
                        </div>
                        <div className="flex space-bettween gap-4">
                            <KLBadge type="info" className="bg-blue-50/50 text-blue-600 border-none rounded-xl px-3 py-1 w-fit">
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase"><Layers size={12} /> {lessonsCount || 0} bài giảng</div>
                            </KLBadge>
                            <KLBadge type="info" className="bg-blue-50/50 text-green-600 border-none rounded-xl px-3 w-fit">
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase"><AudioWaveform size={12} /> {course.level}</div>
                            </KLBadge>
                        </div>

                    </div>

                    <div className="flex flex-col text-right">

                        <span className="text-xl font-black text-green-700 tracking-tighter">{formatVND(salePrice || price)}</span>
                        {isSale && <span className="text-[11px] text-gray-400 font-bold line-through opacity-70">{formatVND(price)}</span>}
                    </div>
                </div>
            </div>
        </KLCard>
    );
});

// --- MAIN COMPONENT ---
export default function CourseListGrid() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ level: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const { data: coursesResponse, loading, call: refreshCourses } = useCallApiHandler(useCallback(() => courseService.getCourseGenerals(), []));

    useEffect(() => { refreshCourses(); }, [refreshCourses]);

    const rawData = useMemo(() => {
        console.log('Courses response data:', coursesResponse);
        const res = coursesResponse?.data || coursesResponse?.items || coursesResponse;
        console.log('Raw course data:', res);
        return Array.isArray(res) ? res : (res?.items || []);
    }, [coursesResponse]);

    const filteredData = useMemo(() => {
        return rawData.filter(c => {
            const matchSearch = !searchTerm || [c.title, c.slug].some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchLevel = !filters.level || c.level === filters.level;
            return matchSearch && matchLevel;
        });
    }, [rawData, searchTerm, filters]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    useEffect(() => setCurrentPage(1), [searchTerm, filters]);

    return (
        <div className="space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 container mx-auto max-w-7xl text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b-2 border-dashed border-gray-100">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Hệ thống <span className="text-green-700">Khóa học</span>
                    </h1>
                    <p className="text-gray-400 text-[11px] font-bold tracking-[0.3em] uppercase mt-1">E-Learning Management System</p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
                    <span className="text-green-700 font-black text-xs uppercase italic tracking-widest">Tổng: {filteredData.length} khóa học</span>
                </div>
            </div>

            {/* Filters Section */}
            <KLCard className="bg-white border-none shadow-xl shadow-gray-100/50 p-6 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" size={20} />
                        <input
                            placeholder="Tìm kiếm nội dung khóa học..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-[1.5rem] border-2 border-transparent focus:border-green-700/10 focus:bg-white focus:ring-4 focus:ring-green-700/5 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <KLButton
                        variant={showFilters ? "primary" : "outline"}
                        icon={showFilters ? X : Filter}
                        onClick={() => setShowFilters(!showFilters)}
                        className={`rounded-[1.5rem] px-8 py-4 transition-all font-black text-[12px] uppercase italic tracking-wider shadow-sm ${showFilters ? 'bg-black text-white' : 'bg-green-700 text-white hover:bg-green-800'}`}
                    >
                        {showFilters ? "Đóng bộ lọc" : "Lọc nâng cao"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Trình độ học viên</label>
                                <select
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-xs uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                    value={filters.level}
                                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                >
                                    <option value="">Tất cả cấp độ</option>

                                    {/* SỬA ĐOẠN NÀY: Viết HOA toàn bộ chữ để khớp 100% với chữ trong Database */}
                                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* Grid Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(pageSize)].map((_, i) => <div key={i} className="h-[450px] animate-pulse bg-gray-100 rounded-[2.5rem]" />)}
                </div>
            ) : filteredData.length === 0 ? (
                <div className="py-32 text-center border-4 border-dashed border-gray-50 rounded-[3rem] bg-gray-50/30">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <BookOpen size={40} className="text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-black uppercase text-sm tracking-[0.2em]">Không tìm thấy dữ liệu phù hợp</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {paginatedData.map(course => <CourseCard key={course.id} course={course} />)}
                    </div>

                    <Pagination
                        current={currentPage}
                        total={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredData.length}
                        pageSize={pageSize}
                    />
                </>
            )}
        </div>
    );
}