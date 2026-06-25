import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    Trophy, Medal, Star, Flame, Crown, BookOpen, Shield, Heart, Zap, 
    Compass, Target, Gift, Award, Sparkles, Plus, Copy, Check, 
    AlertCircle, Loader2 
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLButton } from "../../Component/Button";
import { KLInput } from "../../Component/Input";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import gamificationService from "../../Service/API/gamificationAPI/gamification.service";

// Shared BadgeIcon component for presets and standard URLs
export function BadgeIcon({ iconUrl, name, size = 48 }) {
    if (!iconUrl) {
        return <Award size={size} className="text-[#2d5a2d] drop-shadow" />;
    }

    if (iconUrl.startsWith("preset:")) {
        const [_, theme, shape, icon] = iconUrl.split(":");
        
        const colors = {
            gold: { start: "#fef08a", middle: "#fbbf24", end: "#b45309", text: "#451a03" },
            silver: { start: "#f8fafc", middle: "#cbd5e1", end: "#64748b", text: "#0f172a" },
            bronze: { start: "#ffedd5", middle: "#d97706", end: "#7c2d12", text: "#431407" },
            ruby: { start: "#fecdd3", middle: "#f43f5e", end: "#9f1239", text: "#ffffff" },
            emerald: { start: "#a7f3d0", middle: "#10b981", end: "#064e3b", text: "#ffffff" },
            sapphire: { start: "#bfdbfe", middle: "#3b82f6", end: "#1e3a8a", text: "#ffffff" },
            amethyst: { start: "#f5d0fe", middle: "#d946ef", end: "#701a75", text: "#ffffff" },
            fire: { start: "#ffedd5", middle: "#f97316", end: "#dc2626", text: "#ffffff" }
        };

        const themeColor = colors[theme] || colors.gold;

        const paths = {
            shield: "M12 2L2 5v6c0 5.5 3.8 10.7 10 12c6.2-1.3 10-6.5 10-12V5l-10-3z",
            hexagon: "M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z",
            star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
            diamond: "M12 2L22 12L12 22L2 12Z",
            circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2z"
        };

        const shapePath = paths[shape] || paths.shield;

        const icons = {
            trophy: Trophy,
            medal: Medal,
            star: Star,
            flame: Flame,
            crown: Crown,
            book: BookOpen,
            shield: Shield,
            heart: Heart,
            zap: Zap,
            compass: Compass,
            target: Target,
            gift: Gift
        };

        const IconComponent = icons[icon] || Trophy;

        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-md">
                    <defs>
                        <linearGradient id={`grad-${theme}-${shape}-${icon}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: themeColor.start }} />
                            <stop offset="50%" style={{ stopColor: themeColor.middle }} />
                            <stop offset="100%" style={{ stopColor: themeColor.end }} />
                        </linearGradient>
                    </defs>
                    <path d={shapePath} fill={`url(#grad-${theme}-${shape}-${icon})`} stroke="#ffffff" strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{ color: themeColor.text }}>
                    <IconComponent size={Math.round(size * 0.55)} className="drop-shadow-sm stroke-[2.5]" />
                </div>
            </div>
        );
    }

    return (
        <img 
            src={iconUrl} 
            alt={name || "Badge"} 
            className="w-full h-full object-contain"
            onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
            }}
        />
    );
}

export default function BadgeStudio() {
    // Config States
    const [selectedTheme, setSelectedTheme] = useState("gold");
    const [selectedShape, setSelectedShape] = useState("shield");
    const [selectedIcon, setSelectedIcon] = useState("trophy");

    // Form Details
    const [badgeName, setBadgeName] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Derived preset code
    const presetCode = useMemo(() => {
        return `preset:${selectedTheme}:${selectedShape}:${selectedIcon}`;
    }, [selectedTheme, selectedShape, selectedIcon]);

    // Themes definition
    const themes = [
        { id: "gold", label: "Vàng Kim", bg: "bg-yellow-400" },
        { id: "silver", label: "Bạc Ánh", bg: "bg-slate-300" },
        { id: "bronze", label: "Đồng Đỏ", bg: "bg-amber-700" },
        { id: "ruby", label: "Hồng Ngọc", bg: "bg-rose-500" },
        { id: "emerald", label: "Lục Bảo", bg: "bg-emerald-500" },
        { id: "sapphire", label: "Lam Bảo", bg: "bg-blue-500" },
        { id: "amethyst", label: "Thạch Anh", bg: "bg-purple-500" },
        { id: "fire", label: "Ngọn Lửa", bg: "bg-orange-500" },
    ];

    // Shapes definition
    const shapes = [
        { id: "shield", label: "Khiên Thần" },
        { id: "hexagon", label: "Lục Giác" },
        { id: "star", label: "Ngôi Sao" },
        { id: "diamond", label: "Kim Cương" },
        { id: "circle", label: "Vòng Tròn" }
    ];

    // Icons definition
    const icons = [
        { id: "trophy", icon: Trophy, label: "Cúp" },
        { id: "medal", icon: Medal, label: "Huy chương" },
        { id: "star", icon: Star, label: "Sao" },
        { id: "flame", icon: Flame, label: "Lửa" },
        { id: "crown", icon: Crown, label: "Vương miện" },
        { id: "book", icon: BookOpen, label: "Sách" },
        { id: "shield", icon: Shield, label: "Khiên" },
        { id: "heart", icon: Heart, label: "Tim" },
        { id: "zap", icon: Zap, label: "Sấm sét" },
        { id: "compass", icon: Compass, label: "La bàn" },
        { id: "target", icon: Target, label: "Bia bắn" },
        { id: "gift", icon: Gift, label: "Hộp quà" }
    ];

    // Presets templates library
    const templates = [
        {
            name: "Học Chăm Chỉ",
            description: "Hoàn thành chuỗi học tập liên tiếp 7 ngày",
            theme: "emerald",
            shape: "shield",
            icon: "flame"
        },
        {
            name: "Chiến Thần Từ Vựng",
            description: "Học thuộc lòng hơn 200 từ vựng",
            theme: "gold",
            shape: "hexagon",
            icon: "book"
        },
        {
            name: "Vua Giải Đố",
            description: "Đạt điểm tối đa 10/10 trong 5 bài tập liên tục",
            theme: "ruby",
            shape: "star",
            icon: "crown"
        },
        {
            name: "Kỷ Lục Gia",
            description: "Tích lũy được 5,000 Korean Points",
            theme: "sapphire",
            shape: "diamond",
            icon: "trophy"
        },
        {
            name: "Thành Viên Tích Cực",
            description: "Tham gia thảo luận đóng góp nhiều bình luận nhất",
            theme: "amethyst",
            shape: "circle",
            icon: "heart"
        },
        {
            name: "Nhà Thám Hiểm",
            description: "Hoàn thành bài kiểm tra TOPIK đầu tiên",
            theme: "silver",
            shape: "shield",
            icon: "compass"
        }
    ];

    const applyTemplate = (tpl) => {
        setSelectedTheme(tpl.theme);
        setSelectedShape(tpl.shape);
        setSelectedIcon(tpl.icon);
        setBadgeName(tpl.name);
        setDescription(tpl.description);
        setFormError("");
        setSaveSuccess(false);
    };

    const handleCopyPreset = () => {
        navigator.clipboard.writeText(presetCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleCreateBadge = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaveSuccess(false);

        if (!badgeName.trim()) {
            setFormError("Vui lòng nhập tên huy hiệu.");
            return;
        }

        setIsSaving(true);
        try {
            await gamificationService.createBadge({
                name: badgeName.trim(),
                iconUrl: presetCode,
                description: description.trim() || undefined
            });
            setSaveSuccess(true);
            setBadgeName("");
            setDescription("");
        } catch (err) {
            console.error("Lỗi khi tạo huy hiệu:", err);
            setFormError(err.response?.data?.message || "Tên huy hiệu đã tồn tại trong hệ thống.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700 text-left">
            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                    Thiết kế <span className="text-[#2d5a2d]">Huy hiệu</span>
                </h1>
                <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Hệ thống tạo mẫu & cấu hình Huy hiệu vector độc quyền</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COL: CUSTOMIZER CONTROLS */}
                <div className="lg:col-span-7 space-y-6">
                    <KLCard className="bg-white border-none shadow-sm p-8 space-y-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic border-b pb-3">1. Cấu hình diện mạo</h3>

                        {/* Theme picker */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Chủ đề & Màu sắc</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setSelectedTheme(theme.id)}
                                        className={`p-2 rounded-2xl flex flex-col items-center gap-1 border-2 text-[10px] font-black transition-all ${
                                            selectedTheme === theme.id 
                                                ? "border-[#2d5a2d] bg-green-50/50 text-[#2d5a2d]" 
                                                : "border-gray-100 bg-white hover:bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full ${theme.bg} shadow-sm border border-black/10`}></div>
                                        <span>{theme.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Shape picker */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Khung hình dáng</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {shapes.map((shape) => (
                                    <button
                                        key={shape.id}
                                        onClick={() => setSelectedShape(shape.id)}
                                        className={`py-3 px-2 rounded-2xl border-2 text-xs font-black transition-all uppercase tracking-wider text-center ${
                                            selectedShape === shape.id 
                                                ? "border-[#2d5a2d] bg-green-50/50 text-[#2d5a2d]" 
                                                : "border-gray-100 bg-white hover:bg-gray-50 text-gray-600"
                                        }`}
                                    >
                                        {shape.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icon picker */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Biểu tượng cốt lõi</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {icons.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setSelectedIcon(item.id)}
                                            className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 border-2 text-[10px] font-black transition-all ${
                                                selectedIcon === item.id 
                                                    ? "border-[#2d5a2d] bg-green-50/50 text-[#2d5a2d]" 
                                                    : "border-gray-100 bg-white hover:bg-gray-50 text-gray-500"
                                            }`}
                                        >
                                            <IconComponent size={20} className={selectedIcon === item.id ? "text-[#2d5a2d]" : "text-gray-400"} />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </KLCard>

                    <KLCard className="bg-white border-none shadow-sm p-8 space-y-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic border-b pb-3">2. Chi tiết Huy hiệu</h3>
                        
                        <form onSubmit={handleCreateBadge} className="space-y-4">
                            {formError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {saveSuccess && (
                                <div className="p-4 bg-green-50 rounded-2xl flex items-start gap-3 text-green-800 font-bold text-xs border border-green-200">
                                    <Sparkles className="shrink-0 text-green-600 mt-0.5" size={16} />
                                    <span>✅ Đã tạo thành công Huy hiệu mới và lưu vào cơ sở dữ liệu! Bạn có thể trao tặng ngay ở tab Huy hiệu.</span>
                                </div>
                            )}

                            <KLInput 
                                label="Tên Huy hiệu vinh danh" 
                                placeholder="Ví dụ: Chiến Thần Ngữ Pháp"
                                value={badgeName}
                                onChange={(e) => setBadgeName(e.target.value)}
                            />

                            <KLInput 
                                label="Điều kiện đạt được (Mô tả)" 
                                placeholder="Đạt điểm tuyệt đối trong 5 bài test ngữ pháp đầu tiên..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <div className="pt-2 flex justify-end">
                                <KLButton type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 bg-[#2d5a2d]">
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Tạo Huy hiệu mới"}
                                </KLButton>
                            </div>
                        </form>
                    </KLCard>
                </div>

                {/* RIGHT COL: INTERACTIVE PREVIEW & PRESETS */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Badge Preview Card */}
                    <KLCard className="bg-gradient-to-br from-gray-900 to-slate-950 p-8 border-none shadow-2xl rounded-[2.5rem] text-center flex flex-col items-center relative overflow-hidden group">
                        {/* Decorative glow background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/0 to-green-500/10 opacity-30 z-0 pointer-events-none"></div>

                        <span className="text-[9px] text-[#4ade80] bg-green-950 border border-green-800 px-3 py-1 rounded-full uppercase font-black tracking-widest relative z-10 mb-6">
                            Bản xem trước thiết kế
                        </span>

                        {/* Interactive Badge Container */}
                        <div className="w-40 h-40 flex items-center justify-center relative z-10 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out cursor-pointer drop-shadow-xl">
                            <BadgeIcon iconUrl={presetCode} size={144} />
                        </div>

                        {/* Metadata display */}
                        <div className="relative z-10 space-y-2 mb-6">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                                {badgeName.trim() || "Chưa Đặt Tên"}
                            </h4>
                            <p className="text-xs text-gray-400 max-w-[280px] font-medium leading-relaxed">
                                {description.trim() || "Mô tả điều kiện nhận huy hiệu sẽ xuất hiện ở đây khi bạn nhập."}
                            </p>
                        </div>

                        {/* Generated Preset string output */}
                        <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-3 text-left relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-gray-500 tracking-wider">Mã Preset Vector</span>
                                <span className="text-xs font-mono font-bold text-[#4ade80] tracking-tight">{presetCode}</span>
                            </div>
                            <button
                                onClick={handleCopyPreset}
                                className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white rounded-xl transition-all border border-white/5 flex-shrink-0"
                                title="Copy mã thiết kế"
                            >
                                {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </KLCard>

                    {/* Presets Library */}
                    <KLCard className="bg-white border-none shadow-sm p-6 space-y-4">
                        <div className="border-b pb-2">
                            <h3 className="text-sm font-black text-gray-900 uppercase italic">Thư viện huy hiệu mẫu</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Click để áp dụng mẫu thiết kế có sẵn nhanh chóng</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
                            {templates.map((tpl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => applyTemplate(tpl)}
                                    className="w-full p-3 bg-gray-50 hover:bg-green-50/40 border border-gray-100 hover:border-green-100 text-left rounded-2xl flex items-center justify-between transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 flex-shrink-0">
                                            <BadgeIcon iconUrl={`preset:${tpl.theme}:${tpl.shape}:${tpl.icon}`} size={36} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-800 leading-none group-hover:text-[#2d5a2d] transition-colors">{tpl.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold mt-1 line-clamp-1">{tpl.description}</span>
                                        </div>
                                    </div>
                                    <div className="text-[8px] font-black uppercase text-[#2d5a2d] bg-green-50 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        Áp dụng
                                    </div>
                                </button>
                            ))}
                        </div>
                    </KLCard>
                </div>
            </div>
        </div>
    );
}
