import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
    Trophy, Medal, Plus, Search, Award, Star, 
    X, Users, AlertCircle, Loader2 
} from "lucide-react";

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

export default function PointsManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

    // Form states
    const [selectedUser, setSelectedUser] = useState(null);
    const [pointsToAdd, setPointsToAdd] = useState("");
    const [sourceType, setSourceType] = useState("lesson");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Searchable users list for point reward form
    const [allUsers, setAllUsers] = useState([]);
    const [userSearchText, setUserSearchText] = useState("");

    // --- 1. FETCH DATA (Leaderboard) ---
    const fetchLeaderboardFn = useCallback(() => {
        return gamificationService.getLeaderboard(50);
    }, []);

    const { data: leaderboardResponse = [], loading, call: refresh } = useCallApiHandler(fetchLeaderboardFn);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Fetch all users when modal is opened for user selection
    useEffect(() => {
        if (isPointsModalOpen) {
            userService.getAllUsers(1, 200)
                .then(res => {
                    const list = res?.data || res?.items || res || [];
                    setAllUsers(Array.isArray(list) ? list : []);
                })
                .catch(err => console.error("Error loading users:", err));
        }
    }, [isPointsModalOpen]);

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

    // Prepare table dataset with Rank
    const dataset = useMemo(() => {
        const list = Array.isArray(leaderboardResponse) ? leaderboardResponse : [];
        const sortedList = [...list].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        return sortedList.map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }, [leaderboardResponse]);

    // Search filter for local display of leaderboard
    const filteredDataset = useMemo(() => {
        if (!searchTerm) return dataset;
        const s = searchTerm.toLowerCase();
        return dataset.filter(item => 
            item.user?.fullName?.toLowerCase().includes(s) || 
            item.user?.email?.toLowerCase().includes(s) ||
            item.user?.username?.toLowerCase().includes(s)
        );
    }, [dataset, searchTerm]);

    const handleOpenPointsModal = (userObj) => {
        setSelectedUser(userObj || null);
        if (userObj) {
            setUserSearchText(userObj.fullName || "");
        } else {
            setUserSearchText("");
        }
        setPointsToAdd("");
        setSourceType("lesson");
        setDescription("");
        setFormError("");
        setIsPointsModalOpen(true);
    };

    const handleAddPointsSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!selectedUser) {
            setFormError("Vui lòng chọn học viên nhận điểm.");
            return;
        }
        if (!pointsToAdd || isNaN(pointsToAdd) || Number(pointsToAdd) <= 0) {
            setFormError("Số điểm cộng phải là số dương lớn hơn 0.");
            return;
        }

        setIsSaving(true);
        try {
            await gamificationService.addPoints(selectedUser.id, {
                points: Number(pointsToAdd),
                sourceType,
                description: description.trim() || undefined
            });
            setIsPointsModalOpen(false);
            refresh();
        } catch (err) {
            console.error("Lỗi khi cộng điểm:", err);
            setFormError(err.response?.data?.message || "Lỗi hệ thống khi cộng điểm.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 2. COLUMNS DEFINITION ---
    const columns = [
        {
            key: "rank",
            title: "Hạng",
            render: (val) => {
                if (val === 1) return <div className="flex justify-center items-center w-7 h-7 rounded-full bg-yellow-400 text-white font-black mx-auto"><Trophy size={14} /></div>;
                if (val === 2) return <div className="flex justify-center items-center w-7 h-7 rounded-full bg-slate-300 text-white font-black mx-auto"><Medal size={14} /></div>;
                if (val === 3) return <div className="flex justify-center items-center w-7 h-7 rounded-full bg-amber-600 text-white font-black mx-auto"><Medal size={14} /></div>;
                return <span className="text-gray-400 font-bold flex justify-center text-center">#{val}</span>;
            }
        },
        {
            key: "user",
            title: "Học viên",
            render: (val, row) => (
                <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 font-black text-xs overflow-hidden shrink-0">
                        {row.user?.avatar ? (
                            <img src={row.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            row.user?.fullName?.charAt(0).toUpperCase() || <Users size={14} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight">{row.user?.fullName || "Học viên"}</span>
                        <span className="text-[10px] text-gray-400 font-bold tracking-tight">{row.user?.username || row.user?.email || "---"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "currentLevel",
            title: "Cấp độ",
            render: (val) => (
                <KLBadge type="info">
                    <div className="flex items-center gap-1 font-black">
                        <Star size={11} className="fill-blue-500 text-blue-500" />
                        <span>CẤP {val || 1}</span>
                    </div>
                </KLBadge>
            )
        },
        {
            key: "totalPoints",
            title: "Điểm tích lũy",
            render: (val) => (
                <div className="flex items-center gap-1.5 text-left font-black text-[#2d5a2d]">
                    <Star size={14} className="fill-[#2d5a2d] text-[#2d5a2d]" />
                    <span>{new Intl.NumberFormat().format(val || 0)} KP</span>
                </div>
            )
        },
        {
            key: "id",
            title: "Thao tác",
            render: (val, row) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleOpenPointsModal(row.user)}
                        className="px-3 py-2 bg-green-50 hover:bg-green-100 text-[#2d5a2d] border border-green-200 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1"
                    >
                        <Award size={13} />
                        Thưởng điểm
                    </button>
                </div>
            )
        }
    ];

    // Compute metrics
    const topPlayer = useMemo(() => dataset[0]?.user?.fullName || "Chưa có", [dataset]);
    const totalKP = useMemo(() => dataset.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0), [dataset]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Điểm thưởng <span className="text-[#2d5a2d]">& Cấp độ</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Quản lý bảng xếp hạng điểm thưởng (Korean Points)</p>
                </div>
                <div>
                    <KLButton icon={Plus} className="bg-[#2d5a2d]" onClick={() => handleOpenPointsModal(null)}>Thưởng điểm thủ công</KLButton>
                </div>
            </div>

            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl"><Trophy size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Top 1 hiện tại</p>
                        <h3 className="text-lg font-black text-gray-900 truncate max-w-[180px]">{topPlayer}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-[#2d5a2d] rounded-2xl"><Star size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Tổng điểm cấp phát</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat().format(totalKP)} KP
                        </h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Users size={24} /></div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Học viên tham gia</p>
                        <h3 className="text-2xl font-black text-gray-900">{dataset.length} học viên</h3>
                    </div>
                </KLCard>
            </div>

            {/* SEARCH PANEL */}
            <KLCard className="bg-white border-none shadow-sm py-4 px-6 flex items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm học viên trên bảng xếp hạng..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </KLCard>

            {/* LEADERBOARD TABLE */}
            <KLCard className="p-0 overflow-hidden shadow-xl border-none">
                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">Đang tải bảng xếp hạng...</div>
                ) : (
                    <KLTable 
                        columns={columns} 
                        data={filteredDataset} 
                        showAction={false}
                    />
                )}
            </KLCard>

            {/* AWARD POINTS MODAL */}
            {isPointsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        
                        {/* Header */}
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Cộng điểm học viên</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Điều chỉnh điểm số thưởng nóng thủ công</p>
                            </div>
                            <button onClick={() => setIsPointsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddPointsSubmit} className="p-8 space-y-6">
                            {formError && (
                                <div className="p-4 bg-red-50 rounded-2xl flex items-start gap-3 text-red-700 font-bold text-xs">
                                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* User Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Chọn học viên nhận điểm</label>
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

                            <div className="grid grid-cols-2 gap-4">
                                <KLInput 
                                    label="Số điểm muốn cộng (KP)" 
                                    placeholder="Ví dụ: 100" 
                                    type="number"
                                    value={pointsToAdd}
                                    onChange={(e) => setPointsToAdd(e.target.value)}
                                />

                                <div className="flex flex-col gap-2 w-full">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Loại hoạt động</label>
                                    <select 
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 outline-none focus:border-[#2d5a2d] transition-all"
                                        value={sourceType}
                                        onChange={(e) => setSourceType(e.target.value)}
                                    >
                                        <option value="lesson">Bài học (Lesson)</option>
                                        <option value="exercise">Bài tập (Exercise)</option>
                                        <option value="streak">Chuỗi học tập (Streak)</option>
                                        <option value="purchase">Mua hàng (Purchase)</option>
                                        <option value="referral">Giới thiệu (Referral)</option>
                                    </select>
                                </div>
                            </div>

                            <KLInput 
                                label="Lý do cộng điểm (Mô tả)" 
                                placeholder="Ví dụ: Thưởng nóng hoàn thành bài xuất sắc..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <div className="flex gap-4 pt-4 justify-end">
                                <KLButton variant="outline" type="button" onClick={() => setIsPointsModalOpen(false)}>Hủy</KLButton>
                                <KLButton type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Thưởng Điểm"}
                                </KLButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
