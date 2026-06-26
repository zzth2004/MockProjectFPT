import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    Users, Plus, Crown, Calendar, CreditCard,
    ShieldCheck, Clock, CheckCircle2, AlertCircle,
    Edit3, Trash2, Loader2, X, Search, Filter, ShoppingBag, Eye, DollarSign
} from "lucide-react";

import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import orderService from "../../Service/API/orderAPI/order.service";

export default function OrderList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 1. FETCH DATA ---
    const fetchOrdersFn = useCallback(() => {
        return orderService.getAllOrders(currentPage, pageSize, searchTerm);
    }, [currentPage, searchTerm]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchOrdersFn);

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

    // --- 2. DETAILS MODAL & PAYMENT SIMULATION ---
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleCompleteOrder = async (order) => {
        if (!window.confirm(`💳 Bạn có muốn duyệt và giả lập thanh toán THÀNH CÔNG cho đơn hàng ${order.orderCode}?`)) {
            return;
        }

        setIsCompleting(true);
        try {
            await orderService.completeOrder(order.id);
            alert("✅ Xác nhận thanh toán thành công và kích hoạt dịch vụ!");
            refresh();
            if (isDetailOpen && selectedOrder?.id === order.id) {
                setIsDetailOpen(false);
            }
        } catch (err) {
            console.error("Lỗi khi xác nhận đơn hàng:", err);
            alert("❌ Lỗi khi duyệt đơn hàng");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleAction = (type, row) => {
        if (type === 'view') {
            handleViewDetail(row);
        }
    };

    // --- 3. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "orderCode",
            title: "Mã Đơn Hàng",
            render: (val) => (
                <div className="flex flex-col text-left py-1">
                    <span className="text-sm font-black text-gray-900 leading-tight">{val}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mã thanh toán</span>
                </div>
            )
        },
        {
            key: "user",
            title: "Khách hàng",
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-500 font-black shrink-0">
                        {val?.fullName ? val.fullName.charAt(0).toUpperCase() : <Users size={16} />}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-sm font-black text-gray-900 leading-tight">{val?.fullName || "Khách vãng lai"}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight">{val?.email || "---"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "finalAmount",
            title: "Thành tiền",
            render: (val) => (
                <span className="text-sm font-black text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                </span>
            )
        },
        {
            key: "paymentMethod",
            title: "Thanh toán",
            render: (val) => {
                let text = val || "BANK_TRANSFER";
                if (val === "bank_transfer") text = "Chuyển khoản";
                else if (val === "momo") text = "Ví MoMo";
                else if (val === "stripe") text = "Thẻ Quốc Tế";
                return (
                    <span className="text-xs font-bold text-gray-500 uppercase">{text}</span>
                );
            }
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (val, row) => {
                let type = "default";
                let label = val ? val.toUpperCase() : "PENDING";

                if (val === "paid") {
                    type = "success";
                    label = "ĐÃ THANH TOÁN";
                } else if (val === "pending") {
                    type = "warning";
                    label = "CHỜ DUYỆT";
                } else if (val === "cancelled") {
                    type = "danger";
                    label = "ĐÃ HỦY";
                }

                return (
                    <div className="flex items-center gap-2">
                        <KLBadge type={type}>
                            <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
                        </KLBadge>

                        {val === "pending" && (
                            <button
                                onClick={() => handleCompleteOrder(row)}
                                className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-[#2d5a2d] border border-green-200 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Duyệt
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            key: "createdAt",
            title: "Ngày tạo",
            render: (val) => (
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={13} />
                    <span className="text-xs font-bold">{val ? new Date(val).toLocaleDateString('vi-VN') : "---"}</span>
                </div>
            )
        }
    ];

    // Compute metrics
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let pendingCount = 0;

        dataset.forEach(ord => {
            if (ord.status === 'paid') {
                totalRevenue += Number(ord.finalAmount) || 0;
            } else if (ord.status === 'pending') {
                pendingCount++;
            }
        });

        return { totalRevenue, pendingCount, totalCount: meta.total };
    }, [dataset, meta]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Đơn hàng</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Duyệt đơn hàng và doanh thu hệ thống</p>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><DollarSign size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Doanh thu hiện tại</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                        </h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Clock size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Đơn chờ thanh toán</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.pendingCount}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><ShoppingBag size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng số đơn hàng</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.totalCount}</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH PANEL */}
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng theo mã hoặc tên khách hàng..."
                    // w-full giúp input giãn hết mức có thể trong div cha
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-full border border-green-200 font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-xl border-none">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang tải lịch sử đơn hàng...</div>
                ) : (
                    <>
                        <KLTable
                            columns={columns}
                            data={dataset}
                            showAction={true}
                            onAction={handleAction}
                            hiddenActions={['reset', 'lock', 'delete', 'edit']}
                        />

                        {/* PAGINATION */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 rounded-b-[2.5rem]">
                            <div className="flex flex-col text-left font-black text-gray-800 uppercase text-[11px] leading-tight">
                                <span>Trang {currentPage} / {meta.totalPages || 1}</span>
                                <span className="text-[10px] text-gray-400 font-bold mt-1 tracking-wider">Tổng cộng: {meta.total} đơn hàng</span>
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

            {/* VIEW ORDER ITEMS DETAIL MODAL */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">

                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    Chi Tiết Đơn Hàng
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    Mã đơn: {selectedOrder.orderCode}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailOpen(false)}
                                className="p-2 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">

                            {/* Member info */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-xs">
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-wide">Khách hàng</p>
                                    <p className="font-black text-gray-800 mt-1">{selectedOrder.user?.fullName}</p>
                                    <p className="text-gray-500 font-bold">{selectedOrder.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold uppercase tracking-wide">Phương thức</p>
                                    <p className="font-black text-gray-800 mt-1 uppercase">{selectedOrder.paymentMethod}</p>
                                    <p className="text-gray-500 font-bold">Ngày tạo: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Sản phẩm đăng ký</label>
                                <div className="space-y-2">
                                    {(selectedOrder.items || []).map((item, idx) => (
                                        <div key={item.id || idx} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-green-50 text-[#2d5a2d] flex items-center justify-center text-xs font-black">
                                                    #{idx + 1}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-xs font-black text-gray-800">{item.itemTitle || "Sản phẩm / Học phần"}</span>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.itemType}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-gray-800">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t border-dashed border-gray-100 pt-4 flex flex-col gap-2 text-xs font-bold text-gray-500">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Khuyến mãi ({selectedOrder.couponCode || "Không dùng"})</span>
                                    <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.discountAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-50 pt-2">
                                    <span>Tổng cộng</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.finalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsDetailOpen(false)}
                                className="px-6 py-3 rounded-2xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all active:scale-95 text-xs uppercase"
                            >
                                Đóng
                            </button>
                            {selectedOrder.status === "pending" && (
                                <button
                                    type="button"
                                    disabled={isCompleting}
                                    onClick={() => handleCompleteOrder(selectedOrder)}
                                    className="px-6 py-3 rounded-2xl bg-[#2d5a2d] hover:bg-[#204020] text-white font-bold transition-all active:scale-95 text-xs uppercase flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isCompleting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                    Duyệt Thanh Toán
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
