import React, { useEffect, useCallback, useState, useMemo, memo } from "react";
import { 
  BookOpen, Search, Filter, X, ChevronLeft, ChevronRight, 
  Layers, AudioWaveform, MessageCircle, Star, Users 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- IMPORT COMPONENTS TỪ ADMIN CONTROL ---
import { KLCard } from "../../../AdminControl/Component/Card";
import { KLButton } from "../../../AdminControl/Component/Button";
import { KLBadge } from "../../../AdminControl/Component/Badge";

// --- IMPORT HOOKS & SERVICES ---
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";

// --- UTILS ---
const formatVND = (price) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

// --- SUB-COMPONENTS ---

/**
 * Phân trang thông minh (Smart Pagination)
 */
const Pagination = memo(({ current, total, onPageChange, totalItems, pageSize }) => {
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
            <div className="flex flex-wrap items-center justify-center md:justify-between w-full bg-white p-3 md:px-8 md:py-4 rounded-[2rem] shadow-xl shadow-green-900/5 border border-gray-50">
                <div className="hidden md:flex flex-col items-start">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Đang hiển thị</p>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-gray-900">{from} - {to}</span>
                        <span className="text-xs font-bold text-gray-400">/ {totalItems}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                    <button
                        onClick={() => onPageChange(current - 1)}
                        disabled={current === 1}
                        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-[#377437] hover:text-white disabled:opacity-20 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1 md:gap-2 bg-gray-50/80 p-1 rounded-[1.5rem] border border-gray-100">
                        {pages.map((page, idx) => (
                            <button
                                key={idx}
                                disabled={page === "..."}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[36px] h-9 md:min-w-[44px] md:h-11 rounded-[1rem] text-[11px] md:text-xs font-black transition-all
                                    ${page === current ? "bg-[#377437] text-white shadow-lg" : "text-gray-500 hover:bg-white"}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(current + 1)}
                        disabled={current === total}
                        className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gray-50 text-gray-400 hover:bg-[#377437] hover:text-white disabled:opacity-20 transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-gray-400 italic">Trang {current} / {total}</span>
                </div>
            </div>
        </div>
    );
});

/**
 * Thẻ khóa học (Course Card)
 */
const CourseCard = memo(({ course }) => {
    const navigate = useNavigate();
    const { id, title, thumbnail, level, lessonsCount, salePrice, price, createdBy, classesCount } = course;
    const isSale = salePrice > 0 && salePrice < price;

    return (
        <KLCard
            onClick={() => navigate(`/user/active-courses/detail/${id}`)}
            className="p-0 overflow-hidden flex flex-col h-full border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[2.5rem] group cursor-pointer"
        >
            <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                <img 
                    src={thumbnail || "https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg"} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-4 left-4">
                    <KLBadge className="bg-white/90 backdrop-blur-md text-[#377437] border-none font-black text-[9px] uppercase px-3 py-1.5 rounded-full shadow-sm">
                        {level}
                    </KLBadge>
                </div>
                {isSale && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg animate-pulse">
                        HOT SALE
                    </div>
                )}
            </div>

            <div className="p-7 flex flex-col flex-1 justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-2 mb-3 group-hover:text-[#377437] transition-colors uppercase italic tracking-tighter">
                        {title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase">
                            <Layers size={12} /> {lessonsCount || 0} bài học
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-xl text-[9px] font-black uppercase">
                            <Users size={12} /> {classesCount || 0} lớp học
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-6 mt-auto">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-white overflow-hidden ring-2 ring-gray-50 shadow-sm">
                            {createdBy?.avatar ? <img src={createdBy.avatar} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black bg-green-50 text-[#377437]">{createdBy?.fullName?.[0]}</div>}
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight line-clamp-1">
                            {createdBy?.fullName || "Giảng viên"}
                        </span>
                    </div>

                    <div className="flex flex-col text-right">
                        <span className="text-xl font-black text-[#377437] tracking-tighter">
                            {formatVND(isSale ? salePrice : price)}
                        </span>
                        {isSale && (
                            <span className="text-[10px] text-gray-400 font-bold line-through opacity-70">
                                {formatVND(price)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </KLCard>
    );
});

// --- MAIN COMPONENT ---
export default function ActiveCourses() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ level: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // Call API từ Service
    const { data: coursesResponse, loading, call: fetchCourses } = useCallApiHandler(
        useCallback(() => courseService.getAllCourses(1, 100), [])
    );

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    // Xử lý dữ liệu thô
    const rawData = useMemo(() => {
        const res = coursesResponse?.data || coursesResponse?.items || coursesResponse;
        return Array.isArray(res) ? res : [];
    }, [coursesResponse]);

    // Logic lọc (Search & Filter Level)
    const filteredData = useMemo(() => {
        return rawData.filter(c => {
            const matchSearch = !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchLevel = !filters.level || c.level === filters.level;
            return matchSearch && matchLevel;
        });
    }, [rawData, searchTerm, filters]);

    // Logic phân trang
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    useEffect(() => setCurrentPage(1), [searchTerm, filters]);

    return (
        <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-10 space-y-10 animate-in fade-in duration-700 relative">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-dashed border-gray-200 container mx-auto max-w-7xl">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                        Active <span className="text-[#377437]">Courses</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.4em] uppercase mt-3 ml-1">
                        Korean Language Learning Platform
                    </p>
                </div>
                <div className="hidden md:block">
                    <KLBadge className="bg-[#377437]/10 text-[#377437] border-none px-5 py-2 rounded-2xl font-black text-xs uppercase italic tracking-widest">
                        Tổng số: {filteredData.length} khóa học
                    </KLBadge>
                </div>
            </div>

            {/* Toolbar Section */}
            <div className="container mx-auto max-w-7xl">
                <KLCard className="bg-white border-none shadow-xl shadow-gray-200/40 p-6 rounded-[2.5rem]">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#377437] transition-colors" size={20} />
                            <input
                                placeholder="Bạn muốn học gì hôm nay?..."
                                className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[1.8rem] border-2 border-transparent focus:border-[#377437]/20 focus:bg-white focus:ring-8 focus:ring-[#377437]/5 transition-all font-bold text-sm outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <KLButton
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-[1.8rem] px-10 py-5 transition-all font-black text-[11px] uppercase italic tracking-widest flex gap-2
                                ${showFilters ? 'bg-black text-white' : 'bg-[#377437] text-white hover:bg-[#2d5e2d] shadow-lg shadow-green-100'}`}
                        >
                            {showFilters ? <X size={16}/> : <Filter size={16}/>}
                            {showFilters ? "Đóng bộ lọc" : "Lọc trình độ"}
                        </KLButton>
                    </div>

                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-dashed border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-[0.2em]">Trình độ</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-xs uppercase cursor-pointer hover:bg-gray-100 transition-colors outline-none"
                                        value={filters.level}
                                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                    >
                                        <option value="">Tất cả cấp độ</option>
                                        {['beginer', 'intermediate', 'advanced'].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </KLCard>
            </div>

            {/* Grid Content Section */}
            <div className="container mx-auto max-w-7xl pb-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(pageSize)].map((_, i) => (
                            <div key={i} className="h-[480px] animate-pulse bg-white rounded-[2.5rem] shadow-sm border border-gray-50" />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={48} className="text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-black uppercase text-sm tracking-[0.3em]">Không tìm thấy khóa học phù hợp</p>
                        <KLButton variant="outline" className="mt-6 rounded-xl" onClick={() => {setSearchTerm(""); setFilters({level: ""})}}>Xóa tất cả bộ lọc</KLButton>
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

            {/* Nút Chat nổi giữ nguyên từ yêu cầu */}
            <div className="fixed bottom-10 right-10 z-50">
                <button className="w-20 h-20 bg-[#242424] text-white rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-6 transition-all group overflow-hidden">
                    <div className="relative">
                        <MessageCircle size={36} className="group-hover:scale-110 transition-transform"/>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#242424]"></div>
                    </div>
                </button>
            </div>
        </div>
    );
}