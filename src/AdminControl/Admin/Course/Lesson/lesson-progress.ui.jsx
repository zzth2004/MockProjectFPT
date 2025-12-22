import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Users, Clock, CheckCircle2, CircleDashed, 
  ChevronLeft, ChevronRight, Search, Filter, X, BarChart3
} from "lucide-react";

// Components của bạn
import { KLCard } from "../../../Component/Card";
import { KLTable } from "../../../Component/Table";
import { KLBadge } from "../../../Component/Badge";
import { KLButton } from "../../../Component/Button";

// Charts & Logic
import { KLDonutChart } from "../../../Chart/chart";
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import lessonProgressService from "../../../Service/API/lessonServiceAPI/lesson-progress.service";

export default function LessonProgressList({ lessonId, lessonTitle }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCompleted, setFilterCompleted] = useState(""); // "", "true", "false"
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchDataFn = useCallback(() => {
        return lessonProgressService.getAdminLessonProgress(lessonId, { 
            page: 1, 
            limit: 100 // Tải nhiều để lọc & vẽ biểu đồ tại FE
        });
    }, [lessonId]);

    const { data: progressResponse, loading, call: refresh } = useCallApiHandler(fetchDataFn);

    useEffect(() => {
        if (lessonId) refresh();
    }, [lessonId, refresh]);

    // --- 2. LOGIC LỌC DỮ LIỆU ---
    const rawItems = useMemo(() => progressResponse?.items || [], [progressResponse]);

    const filteredItems = useMemo(() => {
        return rawItems.filter(item => {
            const nameMatch = !searchTerm || 
                item.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = filterCompleted === "" || String(item.isCompleted) === filterCompleted;
            
            return nameMatch && statusMatch;
        });
    }, [rawItems, searchTerm, filterCompleted]);

    // --- 3. DỮ LIỆU BIỂU ĐỒ ---
    const chartData = useMemo(() => {
        const completed = rawItems.filter(i => i.isCompleted).length;
        const inProgress = rawItems.length - completed;
        return [
            { name: "Hoàn thành", value: completed, color: "#2d5a2d" },
            { name: "Đang học", value: inProgress, color: "#e2e8f0" }
        ];
    }, [rawItems]);

    // --- 4. PHÂN TRANG ---
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage]);

    const totalPages = Math.ceil(filteredItems.length / pageSize);

    // --- 5. ĐỊNH NGHĨA CỘT ---
    const columns = [
        {
            key: "user",
            title: "Học viên",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.fullName} 
                         className="w-8 h-8 rounded-full border" alt="avatar" />
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-gray-800">{user?.fullName}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{user?.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: "lastWatchedPosition",
            title: "Tiến độ xem",
            render: (val) => {
                const minutes = Math.floor(val / 60);
                const seconds = Math.floor(val % 60);
                return (
                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs">
                        <Clock size={12} className="text-gray-300" />
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </div>
                );
            }
        },
        {
            key: "isCompleted",
            title: "Trạng thái",
            render: (val, row) => (
                <KLBadge type={val ? "success" : "default"}>
                    <div className="flex items-center gap-1">
                        {val ? <CheckCircle2 size={10} /> : <CircleDashed size={10} />}
                        {val ? "HOÀN THÀNH" : "CHƯA XONG"}
                    </div>
                </KLBadge>
            )
        },
        {
            key: "updatedAt",
            title: "Học lần cuối",
            render: (date) => (
                <span className="text-[11px] font-bold text-gray-400">
                    {new Date(date).toLocaleString('vi-VN')}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* TOP STATS & CHART */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <KLCard className="lg:col-span-2 flex flex-col justify-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#E4FBE1] rounded-3xl">
                            <BarChart3 className="text-[#2d5a2d]" size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic">Thống kê tiến độ</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{lessonTitle}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Tổng học viên</p>
                            <p className="text-2xl font-black text-[#2d5a2d]">{rawItems.length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase">Hoàn thành</p>
                            <p className="text-2xl font-black text-blue-600">
                                {rawItems.filter(i => i.isCompleted).length}
                            </p>
                        </div>
                    </div>
                </KLCard>

                <KLCard title="Tỷ lệ hoàn thành" className="flex items-center justify-center">
                    <div className="h-48 w-full">
                         <KLDonutChart data={chartData} />
                    </div>
                </KLCard>
            </div>

            {/* FILTER BAR */}
            <KLCard className="py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm học viên..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="p-3 bg-gray-50 rounded-2xl border-none font-black text-[11px] uppercase cursor-pointer"
                        value={filterCompleted}
                        onChange={(e) => setFilterCompleted(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Đã hoàn thành</option>
                        <option value="false">Chưa hoàn thành</option>
                    </select>
                </div>
            </KLCard>

            {/* TABLE */}
            <KLCard className="p-0 overflow-hidden shadow-xl bg-transparent">
                {loading ? (
                    <div className="py-20 text-center font-black text-gray-200 animate-pulse">ĐANG TẢI TIẾN ĐỘ...</div>
                ) : (
                    <>
                        <KLTable columns={columns} data={paginatedData} showAction={false} />
                        
                        <div className="px-8 py-4 bg-white border-t border-gray-50 flex justify-between items-center rounded-b-[2.5rem]">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Trang {currentPage} / {totalPages || 1}
                            </span>
                            <div className="flex gap-2">
                                <KLButton variant="outline" className="p-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                                    <ChevronLeft size={16} />
                                </KLButton>
                                <KLButton variant="outline" className="p-2" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                                    <ChevronRight size={16} />
                                </KLButton>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}