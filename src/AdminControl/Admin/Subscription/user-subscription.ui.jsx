import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Users, Plus, Crown, Calendar, CreditCard, 
    ShieldCheck, Clock, CheckCircle2, AlertCircle,
    Edit3, Trash2, Loader2, X, Search, Filter
} from "lucide-react";

import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import subscriptionService from "../../Service/API/subscriptonAPI/subscription.service";

export default function UserSubscriptionList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchSubsFn = useCallback(() => {
        return subscriptionService.adminGetAllSubscriptions(currentPage, pageSize, searchTerm);
    }, [currentPage, searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchSubsFn);

    useEffect(() => {
        refresh();
    }, [refresh, currentPage, searchTerm]);

    // Data parsing
    const dataset = useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        return [];
    }, [response]);

    const meta = useMemo(() => {
        if (response && response.meta) return response.meta;
        return { total: dataset.length, totalPages: 1 };
    }, [response, dataset]);

    // --- 2. MODAL & EDIT STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        status: "active",
        endDate: ""
    });

    const handleEdit = (sub) => {
        setSelectedSub(sub);
        // Format date string for datetime-local or date input
        const dateObj = sub.endDate ? new Date(sub.endDate) : new Date();
        const dateString = dateObj.toISOString().split('T')[0];
        
        setFormData({
            status: sub.status || "active",
            endDate: dateString
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.status) {
            alert("Vui lòng chọn trạng thái");
            return;
        }

        setIsSaving(true);
        try {
            await subscriptionService.adminUpdateSubscriptionStatus(
                selectedSub.id, 
                formData.status, 
                formData.endDate
            );
            alert("✅ Cập nhật đăng ký thành công!");
            setIsModalOpen(false);
            refresh();
        } catch (err) {
            console.error("Lỗi khi cập nhật đăng ký học viên:", err);
            alert("Không thể cập nhật. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 3. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "user",
            title: "Học viên",
            render: (val) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-500 font-black shrink-0">
                        {val?.fullName ? val.fullName.charAt(0).toUpperCase() : <Users size={16} />}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-gray-900 leading-tight">{val?.fullName || "Học viên ẩn"}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight">{val?.email || "---"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "plan",
            title: "Học phần / Gói cước",
            render: (val) => (
                <div className="flex items-center gap-2 text-left">
                    <Crown size={14} className="text-amber-500" />
                    <span className="text-sm font-black text-gray-800">{val?.name || "Gói cước lẻ"}</span>
                </div>
            )
        },
        {
            key: "startDate",
            title: "Ngày bắt đầu",
            render: (val) => (
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={13} />
                    <span className="text-xs font-bold">{val ? new Date(val).toLocaleDateString('vi-VN') : "---"}</span>
                </div>
            )
        },
        {
            key: "endDate",
            title: "Ngày kết thúc",
            render: (val) => {
                const isOverdue = val ? new Date(val) < new Date() : false;
                return (
                    <div className={`flex items-center gap-2 ${isOverdue ? "text-red-500 font-bold" : "text-gray-500"}`}>
                        <Calendar size={13} />
                        <span className="text-xs font-bold">{val ? new Date(val).toLocaleDateString('vi-VN') : "---"}</span>
                    </div>
                );
            }
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val) => {
                let type = "default";
                let label = val ? val.toUpperCase() : "UNSET";

                if (val === "active") {
                    type = "success";
                    label = "ĐANG HOẠT ĐỘNG";
                } else if (val === "expired") {
                    type = "danger";
                    label = "HẾT HẠN";
                } else if (val === "cancelled") {
                    type = "default";
                    label = "ĐÃ HỦY GÓI";
                } else if (val === "past_due") {
                    type = "warning";
                    label = "CHƯA THANH TOÁN";
                }

                return (
                    <KLBadge type={type}>
                        <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
                    </KLBadge>
                );
            }
        }
    ];

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Đăng ký <span className="text-[#2d5a2d]">Học viên</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Quản lý và kích hoạt gói học viên hội viên</p>
                </div>
            </div>

            {/* SEARCH PANEL */}
            <KLCard className="bg-white border-none shadow-sm py-4 px-6 flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học viên theo tên hoặc gói học..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </KLCard>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-xl border-none">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang tải lịch sử...</div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={dataset} 
                            showAction={true}
                            onAction={(type, row) => handleEdit(row)}
                            hiddenActions={['reset', 'lock', 'delete', 'view']}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {meta.totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {meta.total} lượt đăng ký</span>
                            </div>

                            {meta.totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100"
                                    >
                                        Trước
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, meta.totalPages))}
                                        disabled={currentPage === meta.totalPages}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </KLCard>

            {/* EDIT STATUS & EXPIRY MODAL */}
            {isModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    Điều Chỉnh Đăng Ký
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    Thay đổi hạn sử dụng hoặc trạng thái kích hoạt của học viên
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
                            
                            {/* Member info */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Học viên</p>
                                <p className="text-sm font-black text-gray-800">{selectedSub.user?.fullName}</p>
                                <p className="text-xs text-gray-500 font-bold">{selectedSub.plan?.name}</p>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Trạng thái đăng ký *</label>
                                <select
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-black text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none cursor-pointer"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Đang hoạt động (Active)</option>
                                    <option value="expired">Đã hết hạn (Expired)</option>
                                    <option value="cancelled">Hủy/Tạm ngưng (Cancelled)</option>
                                    <option value="past_due">Nợ phí/Chưa kích hoạt (Past Due)</option>
                                </select>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Hạn kết thúc (Gia hạn) *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
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
        </div>
    );
}
