import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight, 
  UserPlus, Calendar, BookOpen, GraduationCap, 
  CheckCircle2, Clock, Ban, BarChart3, Users
} from "lucide-react";

import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import enrollmentService from "../../Service/API/courseServiceAPI/user-enrollment.service";

export default function UserEnrollmentList({ currentUserId, userRole }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 1. FETCH DATA ---
    // Giả sử API trả về danh sách ghi danh cho Admin thấy hết, Student thấy của mình
    const fetchFn = useCallback(() => {
        if (userRole === 'STUDENT') return enrollmentService.getByUser(currentUserId);
        // Với Admin, bạn có thể tạo API getAll, ở đây tạm dùng getByUser
        return enrollmentService.getByUser(currentUserId); 
    }, [currentUserId, userRole]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchFn);

    // --- 2. LOGIC LỌC & PHÂN TRANG ---
    const rawData = useMemo(() => response || [], [response]);
    const filteredData = useMemo(() => {
        return rawData.filter(item => 
            item.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [rawData, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Thuật toán 5 số trang liên tục
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

    // --- 3. ĐỊNH NGHĨA CỘT ---
    const columns = [
        {
            key: "course",
            title: "Khóa học & Lớp",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <span className="text-[15px] font-black text-gray-900 leading-tight mb-0.5">{val?.title}</span>
                    <div className="flex items-center gap-2">
                        <GraduationCap size={12} className="text-[#2d5a2d]" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Lớp: {row.class?.name}</span>
                    </div>
                </div>
            )
        },
        {
            key: "progressPercent",
            title: "Tiến độ",
            render: (val) => (
                <div className="w-full max-w-[120px] space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black italic">
                        <span className="text-gray-400">COMPLETED</span>
                        <span className="text-[#2d5a2d]">{val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#2d5a2d] to-[#4ade80] transition-all duration-1000" style={{ width: `${val}%` }} />
                    </div>
                </div>
            )
        },
        {
            key: "enrolledAt",
            title: "Ngày tham gia",
            render: (date) => (
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[13px]">
                    <Clock size={14} />
                    {new Date(date).toLocaleDateString('vi-VN')}
                </div>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (status) => {
                const config = {
                    ACTIVE: { type: 'success', text: 'Đang học', icon: CheckCircle2 },
                    COMPLETED: { type: 'info', text: 'Hoàn thành', icon: BarChart3 },
                    CANCELLED: { type: 'danger', text: 'Đã hủy', icon: Ban },
                }[status] || { type: 'default', text: status, icon: Clock };
                
                return (
                    <KLBadge type={config.type}>
                        <div className="flex items-center gap-1">
                            <config.icon size={10} />
                            <span className="font-black text-[10px] uppercase">{config.text}</span>
                        </div>
                    </KLBadge>
                );
            }
        }
    ];

    // --- 4. ACTION HANDLERS ---
    const handleAction = async (type, item) => {
        if (type === 'delete') { // Hành động "Hủy" trong UI Table
            if (window.confirm("Bạn có chắc chắn muốn hủy ghi danh khóa học này?")) {
                try {
                    await enrollmentService.cancel(item.id);
                    alert("Đã hủy ghi danh thành công!");
                    refresh();
                } catch (e) {
                    alert(e.response?.data?.message || "Lỗi khi hủy");
                }
            }
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none">
                        Lộ trình <span className="text-[#2d5a2d]">Học tập</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
                        Quản lý ghi danh và tiến độ cá nhân
                    </p>
                </div>
                {userRole === 'ADMIN' && <KLButton icon={UserPlus} className="bg-blue-600">Ghi danh học viên</KLButton>}
            </div>

            <KLCard className="bg-white border-none shadow-sm p-5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên khóa học hoặc lớp..." 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-[2rem] border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </KLCard>

            <KLCard className="p-0 overflow-hidden shadow-2xl border-none">
                {loading ? (
                    <div className="py-20 text-center animate-pulse font-black text-gray-200 uppercase tracking-widest">Đang tải tiến độ...</div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={paginatedData} 
                            onAction={handleAction} 
                            hiddenActions={['edit', 'reset', 'lock']} // Chỉ hiện nút Xóa (Hủy)
                        />

                        {/* PHÂN TRANG */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-between items-center">
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase">Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">KoreanLab Learning Management</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all">
                                    <ChevronLeft size={18} strokeWidth={3} />
                                </button>
                                {getPaginationRange().map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-11 h-11 rounded-2xl font-black text-xs transition-all ${currentPage === p ? "bg-[#2d5a2d] text-white shadow-xl shadow-green-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all">
                                    <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}