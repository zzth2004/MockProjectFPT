import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Award, ShieldAlert, BadgeCheck, Plus, Search, 
    X, Users, AlertCircle, Loader2, Sparkles, Image
} from "lucide-react";
import { BadgeIcon } from "./badge-studio.ui.jsx";
// Components
import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLBadge } from "../../Component/Badge";
import { KLButton } from "../../Component/Button";
import { KLInput } from "../../Component/Input";

// Logic
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import gamificationService from "../../Service/API/gamificationAPI/gamification.service";
import userService from "../../Service/API/userServiceAPI/user.service";

export default function BadgesManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);

    // Create Form states
    const [badgeName, setBadgeName] = useState("");
    const [badgeSlug, setBadgeSlug] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [description, setDescription] = useState("");
    const [createError, setCreateError] = useState("");
    const [isSavingBadge, setIsSavingBadge] = useState(false);

    // Award Form states
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedBadgeId, setSelectedBadgeId] = useState("");
    const [userSearchText, setUserSearchText] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [awardError, setAwardError] = useState("");
    const [isAwarding, setIsAwarding] = useState(false);

    // --- 1. FETCH DATA (Badges list) ---
    const fetchBadgesFn = useCallback(() => {
        return gamificationService.getAllBadges();
    }, []);

    const { data: rawBadges, loading, call: refresh } = useCallApiHandler(fetchBadgesFn);
    const badgesResponse = Array.isArray(rawBadges) ? rawBadges : [];

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Fetch all users when award modal is opened
    useEffect(() => {
        if (isAwardModalOpen) {
            userService.getAllUsers(1, 200)
                .then(res => {
                    const list = res?.data || res?.items || res || [];
                    setAllUsers(Array.isArray(list) ? list : []);
                })
                .catch(err => console.error("Error loading users:", err));
        }
    }, [isAwardModalOpen]);

    // Filter users list based on userSearchText
    const filteredUsersForSelect = useMemo(() => {
        const text = userSearchText.trim().toLowerCase();
        if (!text) return allUsers;
        return allUsers.filter(u => 
            u.fullName?.toLowerCase().includes(text) || 
            u.email?.toLowerCase().includes(text) ||
            u.username?.toLowerCase().includes(text)
        );
    }, [allUsers, userSearchText]);

    // Filtered badges for search display
    const filteredBadges = useMemo(() => {
        const list = Array.isArray(badgesResponse) ? badgesResponse : [];
        if (!searchTerm) return list;
        return list.filter(badge => 
            badge.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [badgesResponse, searchTerm]);

    const handleCreateBadgeSubmit = async (e) => {
        e.preventDefault();
        setCreateError("");

        if (!badgeName.trim()) {
            setCreateError("Vui lòng nhập tên huy hiệu.");
            return;
        }

        setIsSavingBadge(true);
        try {
            await gamificationService.createBadge({
                name: badgeName.trim(),
                slug: badgeSlug.trim() || undefined,
                iconUrl: iconUrl.trim() || undefined,
                description: description.trim() || undefined
            });
            setIsCreateModalOpen(false);
            setBadgeName("");
            setBadgeSlug("");
            setIconUrl("");
            setDescription("");
            refresh();
        } catch (err) {
            console.error("Lỗi khi tạo huy hiệu:", err);
            setCreateError(err.response?.data?.message || "Tên huy hiệu hoặc slug đã tồn tại.");
        } finally {
            setIsSavingBadge(false);
        }
    };

    const handleAwardBadgeSubmit = async (e) => {
        e.preventDefault();
        setAwardError("");

        if (!selectedUser) {
            setAwardError("Vui lòng chọn học viên nhận huy hiệu.");
            return;
        }
        if (!selectedBadgeId) {
            setAwardError("Vui lòng chọn huy hiệu muốn tặng.");
            return;
        }

        setIsAwarding(true);
        try {
            await gamificationService.awardBadge(selectedUser.id, Number(selectedBadgeId));
            setIsAwardModalOpen(false);
            setSelectedUser(null);
            setUserSearchText("");
            setSelectedBadgeId("");
            alert("🏆 Đã tặng huy hiệu thành công cho học viên!");
        } catch (err) {
            console.error("Lỗi khi tặng huy hiệu:", err);
            setAwardError(err.response?.data?.message || "Lỗi hệ thống khi trao tặng huy hiệu.");
        } finally {
            setIsAwarding(false);
        }
    };

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Huy hiệu <span className="text-[#2d5a2d]">& Danh hiệu</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Cấu hình và trao tặng danh hiệu vinh danh học viên</p>
                </div>
                <div className="flex gap-2">
                    <KLButton variant="outline" icon={Sparkles} onClick={() => setIsAwardModalOpen(true)}>Tặng huy hiệu</KLButton>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={() => setIsCreateModalOpen(true)}>Tạo huy hiệu mới</KLButton>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><Award size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng số huy hiệu hệ thống</p>
                        <h3 className="text-2xl font-black text-gray-900">{badgesResponse.length} huy hiệu</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><BadgeCheck size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Đang hiển thị</p>
                        <h3 className="text-2xl font-black text-gray-900">{badgesResponse.length} đang kích hoạt</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH PANEL */}
            <KLCard className="bg-white border-none shadow-sm py-4 px-6 flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm huy hiệu theo tên hoặc mô tả..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </KLCard>

            {/* BADGES DISPLAY GRID */}
            {loading ? (
                <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang nạp danh sách huy hiệu...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredBadges.map((badge) => (
                        <KLCard 
                            key={badge.id} 
                            className="bg-white p-6 rounded-[2rem] border-none shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Decorative background shape */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-all duration-500 opacity-50 z-0"></div>

                            {/* Badge Icon Container */}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-inner relative z-10 border border-green-100/50 mb-4 group-hover:scale-105 transition-all duration-300 p-2">
                                <BadgeIcon iconUrl={badge.iconUrl} name={badge.name} size={48} />
                            </div>

                            {/* Info */}
                            <div className="relative z-10 flex flex-col items-center flex-1">
                                <h4 className="text-base font-black text-gray-900 leading-snug group-hover:text-[#2d5a2d] transition-colors">{badge.name}</h4>
                                <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase mt-1.5 tracking-wider border border-gray-100/30">
                                    {badge.slug || "slug-empty"}
                                </span>
                                <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed">
                                    {badge.description || "Chưa có mô tả điều kiện cho huy hiệu này."}
                                </p>
                            </div>
                        </KLCard>
                    ))}

                    {filteredBadges.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 italic font-black text-gray-400 uppercase tracking-widest">
                            Không tìm thấy huy hiệu phù hợp
                        </div>
                    )}
                </div>
            )}

            {/* CREATE BADGE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Header */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Tạo Huy hiệu mới</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Cấu hình tên và biểu tượng cho phần thưởng vinh danh</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateBadgeSubmit} className="p-8 space-y-6">
                            {createError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{createError}</span>
                                </div>
                            )}

                            <KLInput 
                                label="Tên Huy hiệu (Ví dụ: Thợ Săn Điểm Số)" 
                                placeholder="Nhập tên vinh danh..." 
                                value={badgeName}
                                onChange={(e) => setBadgeName(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <KLInput 
                                    label="Mã định danh (Slug - Để trống tự tạo)" 
                                    placeholder="Ví dụ: tho-san-diem-so" 
                                    value={badgeSlug}
                                    onChange={(e) => setBadgeSlug(e.target.value)}
                                />
                                <KLInput 
                                    label="Link Ảnh Biểu Tượng (Icon URL)" 
                                    placeholder="https://example.com/badge.png" 
                                    value={iconUrl}
                                    onChange={(e) => setIconUrl(e.target.value)}
                                />
                            </div>

                            <KLInput 
                                label="Điều kiện đạt được (Mô tả)" 
                                placeholder="Đạt được 1000 điểm đầu tiên trong hệ thống..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <div className="flex gap-4 pt-4 justify-end">
                                <KLButton variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>Hủy</KLButton>
                                <KLButton type="submit" disabled={isSavingBadge}>
                                    {isSavingBadge ? <Loader2 size={16} className="animate-spin" /> : "Xác nhận tạo"}
                                </KLButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AWARD BADGE MODAL */}
            {isAwardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Header */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Tặng Huy hiệu vinh danh</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Trao tặng danh hiệu trực tiếp cho học sinh xuất sắc</p>
                            </div>
                            <button onClick={() => setIsAwardModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAwardBadgeSubmit} className="p-8 space-y-6">
                            {awardError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{awardError}</span>
                                </div>
                            )}

                            {/* User Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Chọn học viên nhận</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Tìm học viên theo tên/email..."
                                        value={userSearchText}
                                        onChange={(e) => {
                                            setUserSearchText(e.target.value);
                                            setSelectedUser(null);
                                        }}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                    />
                                    {selectedUser && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-50 text-[#2d5a2d] font-black text-[10px] uppercase px-3 py-1 rounded-full border border-green-200">
                                            Đã Chọn
                                        </div>
                                    )}
                                </div>

                                {/* User options list */}
                                {!selectedUser && userSearchText.trim().length > 0 && (
                                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl bg-white shadow-sm mt-1 p-2 space-y-1">
                                        {filteredUsersForSelect.slice(0, 5).map(u => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUser(u);
                                                    setUserSearchText(u.fullName || "");
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl flex flex-col"
                                            >
                                                <span className="text-sm font-bold text-gray-800">{u.fullName}</span>
                                                <span className="text-[10px] text-gray-400">{u.email || u.username}</span>
                                            </button>
                                        ))}
                                        {filteredUsersForSelect.length === 0 && (
                                            <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase italic">Không tìm thấy học viên</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Badge Selection */}
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Chọn Huy hiệu trao tặng</label>
                                <select 
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                    value={selectedBadgeId}
                                    onChange={(e) => setSelectedBadgeId(e.target.value)}
                                >
                                    <option value="">-- Click chọn huy hiệu --</option>
                                    {badgesResponse.map(badge => (
                                        <option key={badge.id} value={badge.id}>{badge.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4 justify-end">
                                <KLButton variant="outline" type="button" onClick={() => setIsAwardModalOpen(false)}>Hủy</KLButton>
                                <KLButton type="submit" disabled={isAwarding}>
                                    {isAwarding ? <Loader2 size={16} className="animate-spin" /> : "Trao Tặng"}
                                </KLButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
