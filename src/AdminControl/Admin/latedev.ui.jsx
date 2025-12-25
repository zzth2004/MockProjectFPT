import React from "react";
import { 
    Construction, 
    Hammer, 
    Clock, 
    ArrowLeft, 
    Cpu, 
    Wrench, 
    Sparkles,
    LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Components
import { KLCard } from "../Component/Card";
import { KLButton } from "../Component/Button";
import { KLBadge } from "../Component/Badge";

export default function LateDevPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <KLCard className="max-w-2xl w-full bg-white border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden relative">
                
                {/* BACKGROUND DECORATION */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Construction size={200} strokeWidth={1} />
                </div>

                <div className="p-12 flex flex-col items-center text-center relative z-10">
                    
                    {/* ICON ANIMATION */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#2d5a2d] to-[#4ade80] flex items-center justify-center text-white shadow-2xl shadow-green-200 animate-bounce">
                            <Hammer size={40} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center text-white animate-pulse">
                            <Sparkles size={14} fill="currentColor" />
                        </div>
                    </div>

                    {/* CONTENT */}
                    <KLBadge type="warning" className="mb-4">
                        <div className="flex items-center gap-2 px-2">
                            <Clock size={12} strokeWidth={3} />
                            <span className="font-black text-[10px] uppercase tracking-widest">Đang triển khai</span>
                        </div>
                    </KLBadge>

                    <h1 className="text-5xl font-black text-gray-950 uppercase italic tracking-tighter leading-tight mb-4">
                        Tính năng đang <br />
                        <span className="text-[#2d5a2d]">Phát triển</span>
                    </h1>

                    <p className="text-gray-400 font-bold text-sm max-w-md leading-relaxed mb-10">
                        Chúng mình đang nỗ lực hoàn thiện hệ thống này để mang lại trải nghiệm tốt nhất cho bạn. 
                        Vui lòng quay lại sau một vài bản cập nhật tới nhé!
                    </p>

                    {/* DEV PROGRESS LIST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                            <div className="text-[#2d5a2d]"><Cpu size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Hệ thống</p>
                                <p className="text-xs font-black text-gray-700 uppercase italic">Tối ưu API</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                            <div className="text-blue-500"><Wrench size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Giao diện</p>
                                <p className="text-xs font-black text-gray-700 uppercase italic">UX/UI Design</p>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <KLButton 
                            variant="outline" 
                            icon={ArrowLeft} 
                            onClick={() => navigate(-1)}
                            className="border-gray-200"
                        >
                            Quay lại
                        </KLButton>
                        <KLButton 
                            icon={LayoutDashboard} 
                            className="bg-black shadow-xl shadow-gray-200"
                            onClick={() => navigate("/user/dashboard")}
                        >
                            Về Dashboard
                        </KLButton>
                    </div>
                </div>

                {/* FOOTER STRIPE */}
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#2d5a2d] to-transparent opacity-20"></div>
            </KLCard>
        </div>
    );
}