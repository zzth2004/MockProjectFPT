import React, { useEffect, useCallback, useState } from "react";
import { 
    Zap, Plus, Crown, Calendar, CreditCard, 
    ShieldCheck, Clock, CheckCircle2, AlertCircle 
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
    const { data: plans, loading, call: refresh } = useCallApiHandler(fetchPlansFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "name",
            title: "Tên gói cước",
            render: (val, row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2d5a2d] to-[#4ade80] flex items-center justify-center text-white shadow-lg shadow-green-100">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[15px] font-black text-gray-900 leading-tight">{val}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{row.id} - Premium Plan</span>
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
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Thanh toán một lần</span>
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
                    {val ? "ĐANG MỞ BÁN" : "TẠM DỪNG"}
                </KLBadge>
            )
        }
    ];

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Quản lý <span className="text-[#2d5a2d]">Gói cước</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Cấu hình gói hội viên & Quyền lợi học tập</p>
                </div>
                <div className="flex gap-2">
                    <KLButton icon={Plus} className="bg-[#2d5a2d]">Tạo gói mới</KLButton>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><Crown size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Gói Premium</p>
                        <h3 className="text-2xl font-black text-gray-900">{plans?.length || 0}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><ShieldCheck size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Hội viên mới</p>
                        <h3 className="text-2xl font-black text-gray-900">+12</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl"><CreditCard size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Doanh thu tháng</p>
                        <h3 className="text-2xl font-black text-gray-900">12.5M</h3>
                    </div>
                </KLCard>
            </div>

            {/* TABLE SECTION */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp cấu hình...</div>
                ) : (
                    <KLTable 
                        columns={columns} 
                        data={plans || []} 
                        onAction={(type, row) => console.log(type, row)}
                        hiddenActions={['reset', 'lock', 'view']}
                    />
                )}
            </KLCard>
        </div>
    );
}