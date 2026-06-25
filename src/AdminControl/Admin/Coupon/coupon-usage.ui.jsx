import React, { useEffect, useCallback, useState, useMemo } from "react";
import { Tag, Search, Calendar, DollarSign, Users, ShoppingBag } from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import couponService from "../../Service/API/couponAPI/coupon.service";

export default function CouponUsageList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchUsagesFn = useCallback(() => {
        return couponService.getUsages(currentPage, pageSize, searchTerm);
    }, [currentPage, searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchUsagesFn);

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

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "order",
            title: "Mã Đơn Hàng",
            render: (val, row) => (
                <div className="flex items-center gap-3 text-left py-1">
                    <div className="w-9 h-9 rounded-xl bg-green-50 text-[#2d5a2d] flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight">
                            {row.order?.orderCode || `Đơn #${row.orderId}`}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            ID Giao dịch: {row.order?.transactionId || "Chưa có"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "coupon",
            title: "Mã giảm giá",
            render: (val, row) => (
                <div className="flex items-center gap-2 text-left">
                    <div className="w-8 h-8 rounded-lg bg-green-100/50 text-[#2d5a2d] flex items-center justify-center flex-shrink-0">
                        <Tag size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 font-mono tracking-wider">
                            {row.coupon?.code || "N/A"}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                            {row.coupon?.discountType === "percent" ? `Giảm ${row.coupon?.discountValue}%` : "Giảm giá tiền mặt"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: "user",
            title: "Khách hàng",
            render: (val, row) => (
                <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-black text-xs shrink-0">
                        {row.user?.fullName ? row.user.fullName.charAt(0).toUpperCase() : <Users size={14} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight">{row.user?.fullName || "Học viên"}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight">{row.user?.email || "---"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "discountAmount",
            title: "Số tiền giảm",
            render: (val) => (
                <span className="text-sm font-black text-green-700">
                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0)}
                </span>
            )
        },
        {
            key: "usedAt",
            title: "Thời gian sử dụng",
            render: (val) => (
                <div className="flex items-center gap-2 text-gray-500 text-left">
                    <Calendar size={13} />
                    <span className="text-xs font-bold">
                        {val ? new Date(val).toLocaleString('vi-VN') : "---"}
                    </span>
                </div>
            )
        }
    ];

    // Compute stats
    const stats = useMemo(() => {
        let totalDiscount = 0;
        dataset.forEach(item => {
            totalDiscount += Number(item.discountAmount) || 0;
        });
        const averageDiscount = dataset.length ? Math.round(totalDiscount / dataset.length) : 0;
        return {
            totalDiscount,
            averageDiscount,
            totalUsages: meta.total
        };
    }, [dataset, meta]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Lịch sử <span className="text-[#2d5a2d]">Sử dụng mã</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Thống kê áp dụng mã giảm giá của học viên</p>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><ShoppingBag size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng lượt sử dụng</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalUsages}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng chiết khấu trang này</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalDiscount)}
                        </h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Tag size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Giảm trung bình trang này</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.averageDiscount)}
                        </h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH PANEL */}
            <KLCard className="bg-white border-none shadow-sm py-4 px-6 flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã giảm giá hoặc tên học viên..."
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
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang tải lịch sử sử dụng...</div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={dataset} 
                            showAction={false}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {meta.totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {meta.total} lượt dùng</span>
                            </div>

                            {meta.totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all"
                                    >
                                        Trước
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, meta.totalPages))}
                                        disabled={currentPage === meta.totalPages}
                                        className="px-4 py-2 bg-gray-50 text-gray-400 font-bold text-xs rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </KLCard>
        </div>
    );
}
