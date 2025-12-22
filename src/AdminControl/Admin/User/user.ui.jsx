import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Users, UserPlus, Search, Filter, Mail, ShieldCheck,
    X, ChevronLeft, ChevronRight, UserCheck, UserX
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import userService from "../../Service/API/userServiceAPI/user.service";
// import authService from "../../../services/authService"

export default function UserList() {
    // --- 1. STATES ---
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        role: "",
        level: "",
        isActive: ""
    });

    // States cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // --- 2. FETCH DATA ---
    const fetchUsersFn = useCallback(() => userService.getAllUsers(1, 100), []);
    const { data: usersData, loading, call: refreshUsers } = useCallApiHandler(fetchUsersFn);

    useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    // --- 3. LOGIC LỌC DỮ LIỆU ---

    // Dữ liệu gốc từ API
    const rawData = useMemo(() => usersData?.data || [], [usersData]);

    // Dữ liệu chỉ lọc theo ô Search
    const searchOnlyData = useMemo(() => {
        if (!searchTerm) return rawData;
        return rawData.filter(user =>
            [user.fullName, user.email, user.username].some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rawData, searchTerm]);

    // Dữ liệu lọc nâng cao (Search + Dropdowns)
    const advancedFilteredData = useMemo(() => {
        return rawData.filter(user => {
            const searchMatch = !searchTerm ||
                [user.fullName, user.email, user.username].some(field =>
                    field?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            const roleMatch = !filters.role || user.role === filters.role;
            const levelMatch = !filters.level || user.level === filters.level;
            const statusMatch = filters.isActive === "" || String(user.isActive) === filters.isActive;

            return searchMatch && roleMatch && levelMatch && statusMatch;
        });
    }, [rawData, searchTerm, filters]);

    // --- 4. LOGIC PHÂN TRANG (PAGINATION) ---

    // Xác định dataset hiện tại dựa trên trạng thái UI (Toán tử 3 ngôi)
    const currentActiveDataset = useMemo(() => {
        if (!searchTerm && !showFilters) return rawData;
        return showFilters ? advancedFilteredData : searchOnlyData;
    }, [searchTerm, showFilters, rawData, advancedFilteredData, searchOnlyData]);

    // Tính toán dữ liệu cho trang hiện tại
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return currentActiveDataset.slice(startIndex, startIndex + pageSize);
    }, [currentActiveDataset, currentPage, pageSize]);

    const totalPages = Math.ceil(currentActiveDataset.length / pageSize);

    // Reset về trang 1 mỗi khi thay đổi bộ lọc hoặc tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, showFilters]);

    // --- 5. HANDLERS ---
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilters({ role: "", level: "", isActive: "" });
        setCurrentPage(1);
    };

    const toggleFilters = () => {
        if (showFilters) setFilters({ role: "", level: "", isActive: "" });
        setShowFilters(!showFilters);
    };

    // Hàm xử lý hành động từ Table
    // Trong UserList.jsx
    const handleAction = async (type, user) => {
        switch (type) {
            case 'reset':
                if (window.confirm(`Reset mật khẩu cho ${user.email}?`)) {
                    try {
                        // Giả sử bạn có hàm resetPassword trong service
                        // await userService.resetPassword(user.id);
                        alert("✅ Đã gửi yêu cầu cấp lại mật khẩu!");
                    } catch (err) {
                        alert("❌ Lỗi khi reset mật khẩu");
                    }
                }
                break;

            case 'lock':
            case 'unlock':
                const isLocking = type === 'lock';
                if (window.confirm(`${isLocking ? 'Khóa' : 'Mở khóa'} tài khoản ${user.username}?`)) {
                    try {
                        // await userService.updateStatus(user.id, !isLocking);
                        refreshUsers(); // Tải lại dữ liệu để cập nhật icon Lock/Unlock
                    } catch (err) {
                        alert("❌ Thao tác thất bại");
                    }
                }
                break;

            case 'delete':
                if (window.confirm("⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này?")) {
                    console.log("🚀 [API] Đang gọi Xóa tài khoản ID:", user.id);
                    try {
                        // 🚩 Gọi API từ service (Không dùng 'this')
                        await userService.softDeleteUser(user.id);

                        // ✅ Thông báo và tải lại danh sách mới
                        alert("✅ Đã xóa học viên thành công!");
                        refreshUsers();
                    } catch (error) {
                        console.error("Lỗi khi xóa:", error);
                        alert("❌ Không thể xóa người dùng này. Vui lòng thử lại!");
                    }
                }
                break;

            default:
                break;
        }
    };

    // Định nghĩa các cột
    const columns = [
        {
            key: "fullName",
            title: "Người dùng",
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E4FBE1] text-[#2d5a2d] flex items-center justify-center font-black uppercase border-2 border-[#E4FBE1]">
                        {(val || row.username || "U")[0]}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[15px] font-black text-gray-800 leading-tight">{val || row.username}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-left">ID: #{row.id}</span>
                    </div>
                </div>
            )
        },
        { key: "email", title: "Liên hệ" },
        {
            key: "role",
            title: "Phân quyền",
            render: (role) => (
                <KLBadge type={role === 'admin' ? 'warning' : 'success'}>
                    <span className="uppercase text-[10px] font-black">{role}</span>
                </KLBadge>
            )
        },
        { key: "level", title: "Trình độ", render: (v) => v?.toUpperCase() || "---" },
        {
            key: "isActive",
            title: "Trạng thái",
            render: (isActive) => (
                <span className={`text-[12px] font-black uppercase ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {isActive ? '● Active' : '● Locked'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-700">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                        Quản lý <span className="text-[#2d5a2d]">Nhân sự</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">KoreanLab System Admin</p>
                </div>
                <KLButton icon={UserPlus} className="bg-[#2d5a2d]">Thêm thành viên</KLButton>
            </div>

            {/* --- THANH TÌM KIẾM & BỘ LỌC --- */}
            <KLCard className="bg-white border-none shadow-sm py-5 px-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhanh..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <KLButton
                        variant={showFilters ? "primary" : "outline"}
                        icon={showFilters ? X : Filter}
                        onClick={toggleFilters}
                        className={showFilters ? "bg-black text-white border-black" : ""}
                    >
                        {showFilters ? "Đóng bộ lọc" : "Lọc nâng cao"}
                    </KLButton>
                </div>

                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-dashed border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Quyền hệ thống</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.role} onChange={(e) => handleFilterChange("role", e.target.value)}>
                                <option value="">Tất cả vai trò</option>
                                <option value="admin">Quản trị viên</option>
                                <option value="teacher">Giáo viên</option>
                                <option value="student">Học sinh</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trình độ</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.level} onChange={(e) => handleFilterChange("level", e.target.value)}>
                                <option value="">Tất cả trình độ</option>
                                <option value="topik_1">TOPIK 1</option>
                                <option value="topik_2">TOPIK 2</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái</label>
                            <select className="w-full p-3.5 bg-gray-50 rounded-xl border-none font-black text-[11px] uppercase cursor-pointer"
                                value={filters.isActive} onChange={(e) => handleFilterChange("isActive", e.target.value)}>
                                <option value="">Tất cả</option>
                                <option value="true">Active</option>
                                <option value="false">Locked</option>
                            </select>
                        </div>
                    </div>
                )}
            </KLCard>

            {/* --- TABLE SECTION --- */}
            <KLCard className="p-0 overflow-hidden border-none shadow-xl bg-transparent relative">
                {loading ? (
                    <div className="py-24 text-center flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#2d5a2d] rounded-full animate-spin mb-4"></div>
                        <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Đang nạp dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={paginatedData}
                            showAction={true}
                            /* 🚩 BỔ SUNG: Truyền hàm handleAction vào Table */
                            onAction={handleAction}
                            /* 🚩 BỔ SUNG: Chỉ hiện Mật khẩu, Khóa, Xóa */
                            hiddenActions={['view', 'edit']}
                        />

                        {/* --- FOOTER & PAGINATION UI --- */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest leading-none">
                                    Trang {currentPage} / {totalPages || 1}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                    Hiển thị {paginatedData.length} / {currentActiveDataset.length} kết quả
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
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-2xl font-black text-xs transition-all active:scale-90 ${currentPage === i + 1
                                                    ? "bg-[#2d5a2d] text-white shadow-lg shadow-green-100"
                                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                                }`}
                                        >
                                            {i + 1}
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