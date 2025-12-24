import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight, 
  Plus, Calendar, Video, School, User, Trash2, Settings, BookOpen, 
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { useNavigate } from "react-router-dom";


// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";

export default function CourseClassList() {
    const navigate = useNavigate();
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: "", // UPCOMING, ONGOING, FINISHED, CANCELLED
    });

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 2. FETCH DATA ---
    const fetchClassesFn = useCallback(() => courseClassService.getAllClasses(1, 100), []);
    const { data: classResponse, loading, call: refreshClasses } = useCallApiHandler(fetchClassesFn);

    useEffect(() => {
        refreshClasses();
    }, [refreshClasses]);

    // --- 3. LOGIC LỌC DỮ LIỆU (CLIENT-SIDE) ---
    const rawData = useMemo(() => classResponse?.data || [], [classResponse]);

    // Lọc theo search (Tên lớp hoặc Tên giáo viên)
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(item => 
            [item.name, item.teacher?.fullName, item.course?.title].some(field => 
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Lọc nâng cao
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(item => {
            const searchMatch = !searchTerm || 
                [item.name, item.teacher?.fullName, item.course?.title].some(field => 
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            const statusMatch = !filters.status || item.status === filters.status;
            return searchMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. TOÁN TỬ 3 NGÔI & PHÂN TRANG ---
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(start, start + pageSize);
    }, [currentActiveDataset, currentPage]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filters, showFilters]);

    // --- 5. ACTION HANDLERS ---
    // --- 5. ACTION HANDLERS ---
const handleAction = async (type, item) => {
    switch (type) {
        case 'view': // 👇 Xử lý khi nhấn nút Chi tiết (Eye icon)
            navigate(`/admin/classes/${item.id}`);
            break;

        case 'edit': // 👇 Xử lý khi nhấn nút Sửa
            navigate(`/admin/classes/edit/${item.id}`);
            break;

        case 'delete':
            if (window.confirm("⚠️ Chỉ xóa được lớp CHƯA CÓ HỌC VIÊN. Bạn chắc chắn muốn xóa?")) {
                try {
                    await courseClassService.deleteClass(item.id);
                    alert("✅ Đã xóa lớp học!");
                    refreshClasses();
                } catch (error) {
                    alert("❌ Không thể xóa (Lớp có học viên hoặc lỗi hệ thống)");
                }
            }
            break;
        default: break;
    }
};

    // --- 6. ĐỊNH NGHĨA CỘT ---
   const columns = [
    {
        key: "name",
        title: "Lớp học",
        render: (val, row) => (
            // 👇 Thêm onClick và class hover
            <div 
                className="flex flex-col text-left cursor-pointer group" 
                onClick={() => navigate(`/admin/classes/${row.id}`)}
            >
                <span className="text-[15px] font-black text-gray-800 leading-tight group-hover:text-[#2d5a2d] transition-colors">
                    {val}
                </span>
                <span className="text-[10px] text-[#2d5a2d] font-bold uppercase tracking-tighter">
                    Khóa: {row.course?.title}
                </span>
            </div>
        )
    },
    // ... giữ nguyên các cột khác (teacher, startDate, googleMeetLink, status)
    {
        key: "teacher",
        title: "Giáo viên",
        render: (teacher) => (
            <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-600">{teacher?.fullName || "Chưa gán"}</span>
            </div>
        )
    },
    {
        key: "startDate",
        title: "Lịch khai giảng",
        render: (date) => (
            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1 text-gray-700 font-bold text-[13px]">
                    <Calendar size={12} />
                    {new Date(date).toLocaleDateString('vi-VN')}
                </div>
            </div>
        )
    },
    {
        key: "googleMeetLink",
        title: "Liên kết",
        render: (val, row) => (
            <div className="flex gap-2">
                {val && (
                    <a href={val} target="_blank" rel="noreferrer" title="Vào học Meet" onClick={(e) => e.stopPropagation()}>
                        <Video size={18} className="text-red-500 hover:scale-110 transition-transform" />
                    </a>
                )}
                {row.googleClassroomLink && (
                    <a href={row.googleClassroomLink} target="_blank" rel="noreferrer" title="Vào Classroom" onClick={(e) => e.stopPropagation()}>
                        <School size={18} className="text-green-600 hover:scale-110 transition-transform" />
                    </a>
                )}
            </div>
        )
    },
    {
        key: "status",
        title: "Trạng thái",
        render: (status) => {
            const configs = {
                UPCOMING: { type: 'info', text: 'Sắp mở' },
                ONGOING: { type: 'success', text: 'Đang học' },
                FINISHED: { type: 'default', text: 'Kết thúc' },
                CANCELLED: { type: 'danger', text: 'Đã hủy' }
            };
            const config = configs[status] || configs.UPCOMING;
            return <KLBadge type={config.type}>{config.text}</KLBadge>;
        }
    }
];

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900 uppercase italic">Quản lý <span className="text-[#2d5a2d]">Lớp học</span></h1>
                <KLButton onClick={() => navigate("/admin/classes/create")} icon={Plus} className="bg-[#2d5a2d]">Tạo lớp mới</KLButton>
            </div>

            {/* BỘ LỌC TÌM KIẾM */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input type="text" placeholder="Tìm tên lớp, giáo viên..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <KLButton variant={showFilters ? "primary" : "outline"} icon={showFilters ? X : Filter} onClick={() => setShowFilters(!showFilters)}>
                        {showFilters ? "Đóng lọc" : "Lọc trạng thái"}
                    </KLButton>
                </div>
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4">
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tình trạng lớp</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="UPCOMING">Sắp khai giảng</option>
                                <option value="ONGOING">Đang diễn ra</option>
                                <option value="FINISHED">Đã kết thúc</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* BẢNG DỮ LIỆU */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent">
                {loading ? <div className="py-24 text-center font-black animate-pulse">ĐANG TẢI LỚP HỌC...</div> : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={paginatedData} 
                            onAction={handleAction} 
                            showAction={true} 
                            hiddenActions={['reset']} // Ẩn nút Reset vì Lớp học không có mật khẩu
                        />

                        {/* PHÂN TRANG UI */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-between items-center rounded-b-[2.5rem]">
                            <div className="text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase block">Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng: {currentActiveDataset.length} lớp</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 transition-all active:scale-90"><ChevronLeft size={20} strokeWidth={3} /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1 ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100" : "bg-gray-50 text-gray-400"}`}>{i + 1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-20 transition-all active:scale-90"><ChevronRight size={20} strokeWidth={3} /></button>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}