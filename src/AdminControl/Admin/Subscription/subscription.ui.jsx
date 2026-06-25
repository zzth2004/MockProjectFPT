import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Zap, Plus, Crown, Calendar, CreditCard, 
    ShieldCheck, Clock, CheckCircle2, AlertCircle,
    Edit3, Trash2, Loader2, X, AlertTriangle, Check
} from "lucide-react";

import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import subscriptionService from "../../Service/API/subscriptonAPI/subscription.service";

export default function SubscriptionPlanList() {
    // --- 1. FETCH DATA ---
    const fetchPlansFn = useCallback(() => subscriptionService.getPlans(), []);
    const { data: plansResponse, loading, call: refresh } = useCallApiHandler(fetchPlansFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Handle payload if wrapped
    const plans = useMemo(() => {
        if (!plansResponse) return [];
        if (Array.isArray(plansResponse)) return plansResponse;
        if (Array.isArray(plansResponse.data)) return plansResponse.data;
        return [];
    }, [plansResponse]);

    // --- 2. MODAL & FORM STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // null = Add, else = Edit
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price: 0,
        durationDays: 30,
        description: "",
        isActive: true
    });

    // --- 3. ACTIONS ---
    const handleAddNew = () => {
        setSelectedPlan(null);
        setFormData({
            name: "",
            slug: "",
            price: 0,
            durationDays: 30,
            description: "",
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name || "",
            slug: plan.slug || "",
            price: Number(plan.price) || 0,
            durationDays: Number(plan.durationDays) || 30,
            description: plan.description || "",
            isActive: plan.isActive !== false
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (plan) => {
        if (window.confirm(`⚠️ Bạn có chắc chắn muốn ngưng hoạt động gói cước "${plan.name}"?`)) {
            try {
                await subscriptionService.deletePlan(plan.id);
                alert("✅ Ngưng hoạt động gói cước thành công!");
                refresh();
            } catch (err) {
                console.error("Lỗi khi xóa gói cước:", err);
                alert("❌ Lỗi khi ngưng hoạt động gói cước");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.slug.trim()) {
            alert("Vui lòng điền đầy đủ tên gói và mã định danh (slug)");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name.trim(),
                slug: formData.slug.trim().toLowerCase().replace(/\s+/g, '-'),
                price: Number(formData.price),
                durationDays: Number(formData.durationDays),
                description: formData.description.trim(),
                isActive: !!formData.isActive
            };

            if (selectedPlan) {
                await subscriptionService.updatePlan(selectedPlan.id, payload);
                alert("✅ Cập nhật gói cước thành công!");
            } else {
                await subscriptionService.createPlan(payload);
                alert("✅ Tạo gói cước mới thành công!");
            }
            setIsModalOpen(false);
            refresh();
        } catch (err) {
            console.error("Lỗi khi lưu gói cước:", err);
            alert("Không thể lưu gói cước. Vui lòng kiểm tra lại dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = (type, row) => {
        if (type === 'edit') {
            handleEdit(row);
        } else if (type === 'delete') {
            handleDelete(row);
        }
    };

    // Auto slug generation based on name
    const handleNameChange = (val) => {
        const slug = val
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove accent marks
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9\s-]/g, "") // remove special characters
            .trim()
            .replace(/\s+/g, "-");
        
        setFormData(prev => ({
            ...prev,
            name: val,
            // Only update slug if it was empty or matches previous slug generation
            slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") ? slug : prev.slug
        }));
    };

    // --- 4. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "name",
            title: "Tên gói cước",
            render: (val, row) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2d5a2d] to-[#4ade80] flex items-center justify-center text-white shadow-lg shrink-0">
                        <Zap size={22} fill="currentColor" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[15px] font-black text-gray-900 leading-tight mb-1">{val}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{row.slug || "premium-plan"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "price",
            title: "Học phí",
            render: (val) => (
                <div className="flex flex-col text-left">
                    <span className="text-[15px] font-black text-gray-800">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Thanh toán một lần</span>
                </div>
            )
        },
        {
            key: "durationDays",
            title: "Thời hạn",
            render: (val) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="text-sm font-black">{val} Ngày</span>
                </div>
            )
        },
        {
            key: "isActive",
            title: "Trạng thái",
            render: (val) => (
                <KLBadge type={val ? "success" : "danger"}>
                    <div className="flex items-center gap-1.5 py-0.5">
                        {val ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        <span className="text-[9px] font-black uppercase tracking-wider">{val ? "Đang mở bán" : "Tạm dừng"}</span>
                    </div>
                </KLBadge>
            )
        }
    ];

    // Compute metrics
    const stats = useMemo(() => {
        const total = plans.length;
        const active = plans.filter(p => p.isActive).length;
        return { total, active };
    }, [plans]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Gói cước</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Cấu hình gói hội viên & Quyền lợi học tập</p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={handleAddNew}>Tạo gói mới</KLButton>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><Crown size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng số gói</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><ShieldCheck size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Gói đang mở bán</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.active}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><CreditCard size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Hình thức đóng gói</p>
                        <h3 className="text-sm font-black text-gray-900 uppercase">Theo số ngày học</h3>
                    </div>
                </KLCard>
            </div>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-xl border-none">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp cấu hình...</div>
                ) : (
                    <KLTable 
                        columns={columns} 
                        data={plans} 
                        showAction={true}
                        onAction={handleAction}
                        hiddenActions={['reset', 'lock', 'view']}
                    />
                )}
            </KLCard>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {selectedPlan ? "Cập Nhật Gói Cước" : "Tạo Gói Cước Mới"}
                                </h3>
                                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                    {selectedPlan ? "Chỉnh sửa giá và quyền lợi gói hội viên" : "Thiết lập gói học hội viên mới trên hệ thống"}
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
                            
                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tên gói cước *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Gói Premium 6 Tháng"
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                />
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mã định danh (Slug) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: premium-6-months"
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Học phí (VND) *</label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>

                                {/* Duration Days */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 px-1">Thời hạn (Ngày) *</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Mô tả gói cước</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ví dụ: Học viên được truy cập toàn bộ tài nguyên khóa học cao cấp, hệ thống flashcard thông minh..."
                                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-green-600/20 focus:bg-white transition-all outline-none resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Active Status */}
                            <div className="space-y-2 flex flex-col justify-end">
                                <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer select-none hover:bg-gray-100/50 transition-all">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#2d5a2d] focus:ring-[#2d5a2d]/20 w-4 h-4 cursor-pointer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <div className="flex flex-col text-left">
                                        <span className="text-[11px] font-black uppercase text-gray-700">Mở bán gói cước này</span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Cho phép người học đăng ký mua gói</span>
                                    </div>
                                </label>
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