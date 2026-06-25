import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Tag, Plus, Search, Calendar, Percent, DollarSign, 
    Play, Power, AlertCircle, X, ShieldAlert, BadgePercent, CheckSquare
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { KLInput } from "../../Component/Input";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import couponService from "../../Service/API/couponAPI/coupon.service";

export default function CouponManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Form States
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState("percent");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderValue, setMinOrderValue] = useState("");
    const [usageLimit, setUsageLimit] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [formError, setFormError] = useState("");

    // --- 1. FETCH DATA ---
    const fetchCouponsFn = useCallback(() => couponService.getAll(), []);
    const { data: coupons = [], loading, call: refresh } = useCallApiHandler(fetchCouponsFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "code",
            title: "Mã giảm giá",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2d5a2d] to-[#4ade80] flex items-center justify-center text-white shadow-lg shadow-green-100 flex-shrink-0">
                        <Tag size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[16px] font-black text-gray-900 leading-tight tracking-wider font-mono">{val}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">ID: #{row.id}</span>
                    </div>
                </div>
            )
        },
        {
            key: "discountType",
            title: "Loại & Trị giá",
            render: (val, row) => {
                const isPercent = val === "percent";
                return (
                    <div className="flex items-center gap-2 text-left">
                        {isPercent ? (
                            <KLBadge type="warning">
                                <div className="flex items-center gap-1 font-black">
                                    <Percent size={11} />
                                    <span>GIẢM {row.discountValue}%</span>
                                </div>
                            </KLBadge>
                        ) : (
                            <KLBadge type="info">
                                <div className="flex items-center gap-1 font-black">
                                    <DollarSign size={11} />
                                    <span>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.discountValue)}
                                    </span>
                                </div>
                            </KLBadge>
                        )}
                    </div>
                );
            }
        },
        {
            key: "minOrderValue",
            title: "Điều kiện áp dụng",
            render: (val) => (
                <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-gray-800">
                        Đơn từ {val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : "0 đ"}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Giá trị giỏ hàng tối thiểu</span>
                </div>
            )
        },
        {
            key: "usageLimit",
            title: "Số lần sử dụng",
            render: (val, row) => (
                <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-gray-800">
                        {row.usedCount || 0} / {val || "∞"}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Lượt đã dùng</span>
                </div>
            )
        },
        {
            key: "endDate",
            title: "Hạn sử dụng",
            render: (val, row) => {
                const start = row.startDate ? new Date(row.startDate).toLocaleDateString('vi-VN') : "N/A";
                const end = val ? new Date(val).toLocaleDateString('vi-VN') : "Vô thời hạn";
                return (
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-gray-700">{end}</span>
                        <span className="text-[9px] text-gray-400 uppercase mt-0.5">Bắt đầu: {start}</span>
                    </div>
                );
            }
        },
        {
            key: "isActive",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val ? "success" : "danger"}>
                    <div className="flex items-center gap-1 font-black">
                        <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {val ? "HOẠT ĐỘNG" : "ĐÃ TẮT"}
                    </div>
                </KLBadge>
            )
        }
    ];

    // --- 3. ACTIONS ---
    const handleAction = async (type, row) => {
        if (type === 'lock' || type === 'unlock') {
            const nextState = type === 'unlock';
            try {
                await couponService.updateStatus(row.id, nextState);
                refresh();
            } catch (err) {
                console.error("Lỗi cập nhật trạng thái:", err);
                alert("Không thể cập nhật trạng thái coupon");
            }
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!code.trim()) {
            setFormError("Vui lòng nhập mã giảm giá.");
            return;
        }
        if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
            setFormError("Giá trị giảm giá phải lớn hơn 0.");
            return;
        }
        if (discountType === "percent" && Number(discountValue) > 100) {
            setFormError("Phần trăm giảm giá không thể vượt quá 100%.");
            return;
        }

        const payload = {
            code: code.trim().toUpperCase(),
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
            usageLimit: usageLimit ? Number(usageLimit) : undefined,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
        };

        try {
            await couponService.create(payload);
            setIsModalOpen(false);
            // Reset form
            setCode("");
            setDiscountType("percent");
            setDiscountValue("");
            setMinOrderValue("");
            setUsageLimit("");
            setStartDate("");
            setEndDate("");
            refresh();
        } catch (err) {
            console.error("Lỗi khi tạo coupon:", err);
            setFormError(err.response?.data?.message || "Mã code đã tồn tại hoặc dữ liệu không hợp lệ.");
        }
    };

    // Filtered data based on search term
    const filteredCoupons = useMemo(() => {
        const safeCoupons = Array.isArray(coupons) ? coupons : [];
        if (!searchTerm) return safeCoupons;
        return safeCoupons.filter(item => 
            item.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [coupons, searchTerm]);

    const activeCount = useMemo(() => {
        const safeCoupons = Array.isArray(coupons) ? coupons : [];
        return safeCoupons.filter(c => c.isActive).length;
    }, [coupons]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Mã giảm giá</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Cấu hình chương trình ưu đãi & chiết khấu</p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={() => setIsModalOpen(true)}>Tạo mã mới</KLButton>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><BadgePercent size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng số mã</p>
                        <h3 className="text-2xl font-black text-gray-900">{Array.isArray(coupons) ? coupons.length : 0}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><CheckSquare size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Đang kích hoạt</p>
                        <h3 className="text-2xl font-black text-gray-900">{activeCount}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><ShieldAlert size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Ngừng hoạt động</p>
                        <h3 className="text-2xl font-black text-gray-900">{(Array.isArray(coupons) ? coupons.length : 0) - activeCount}</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH & TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[2rem]">
                <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã giảm giá..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp mã giảm giá...</div>
                ) : (
                    <KLTable 
                        columns={columns} 
                        data={filteredCoupons} 
                        onAction={handleAction}
                        hiddenActions={['reset', 'view', 'edit', 'delete']}
                    />
                )}
            </KLCard>

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left border">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Tạo mã giảm giá mới</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Thiết lập cấu hình chiết khấu & điều kiện</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="p-8 space-y-6">
                            {formError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <KLInput 
                                label="Mã giảm giá (Ví dụ: KOREA20)" 
                                placeholder="Nhập mã viết liền không dấu..." 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Loại chiết khấu</label>
                                    <select 
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                    >
                                        <option value="percent">Giảm theo %</option>
                                        <option value="fixed_amount">Số tiền cố định (đ)</option>
                                    </select>
                                </div>

                                <KLInput 
                                    label={discountType === "percent" ? "Tỷ lệ giảm (%)" : "Số tiền giảm (đ)"} 
                                    placeholder={discountType === "percent" ? "Ví dụ: 20" : "Ví dụ: 50000"} 
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <KLInput 
                                    label="Giá trị đơn tối thiểu" 
                                    placeholder="Không bắt buộc" 
                                    type="number"
                                    value={minOrderValue}
                                    onChange={(e) => setMinOrderValue(e.target.value)}
                                />
                                <KLInput 
                                    label="Giới hạn số lần dùng" 
                                    placeholder="Không bắt buộc" 
                                    type="number"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <KLInput 
                                    label="Ngày bắt đầu" 
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <KLInput 
                                    label="Ngày kết thúc" 
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 justify-end">
                                <KLButton variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Hủy</KLButton>
                                <KLButton type="submit">Xác nhận tạo</KLButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
