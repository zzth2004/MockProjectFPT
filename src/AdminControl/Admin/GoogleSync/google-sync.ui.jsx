import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
    ShieldCheck, Video, School, RefreshCw, Search, CheckCircle2, XCircle,
    Users, Calendar, Link as LinkIcon, AlertCircle, Check, ExternalLink,
    ArrowRight, Sparkles, BookOpen
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { KLTable } from "../../Component/Table";

// API services
import googleService from "../../Service/API/googleAPI/google.service";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";

export default function GoogleSyncManagement() {
    const [googleConnected, setGoogleConnected] = useState(false);
    const [googleEmail, setGoogleEmail] = useState("");
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SYNCED, NOT_SYNCED
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Action execution states
    const [actionLoading, setActionLoading] = useState({}); // { classId_actionType: boolean }
    const [syncResult, setSyncResult] = useState(null); // Result data for details modal
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);


    const checkGoogleStatus = async () => {
        try {
            setCheckingStatus(true);
            const status = await googleService.checkStatus();
            setGoogleConnected(!!status.connected);
        } catch (error) {
            console.error("Lỗi kiểm tra Google status:", error);
            setGoogleConnected(false);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const data = await googleService.connect();
            if (data && data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            alert("Không thể kết nối tài khoản Google: " + (error.response?.data?.message || error.message));
        }
    };

    // Listen to Google redirect callback params
    useEffect(() => {
        checkGoogleStatus();

        const params = new URLSearchParams(window.location.search);
        if (params.get("google") === "connected") {
            const email = params.get("email");
            setGoogleEmail(email || "");
            // Clear url parameters without reloading page
            window.history.replaceState({}, document.title, window.location.pathname);
            checkGoogleStatus();
        }
    }, []);

    const isTeacher = window.location.pathname.startsWith("/teacher");

    // --- 2. FETCH CLASSES DATA ---
    const fetchClassesFn = useCallback(() => {
        if (isTeacher) {
            return courseClassService.getMyClassOfTeacher();
        }
        return courseClassService.getAllClasses(currentPage, pageSize, searchTerm, "");
    }, [currentPage, searchTerm, isTeacher]);

    const { data: response, loading, call: refreshClasses } = useCallApiHandler(fetchClassesFn);

    useEffect(() => {
        refreshClasses();
    }, [refreshClasses]);

    const classesList = useMemo(() => {
        let raw = Array.isArray(response) ? response : (response?.data || []);

        // If we are a teacher and have search query, filter client-side since my-classes is a flat array
        if (isTeacher && searchTerm) {
            raw = raw.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (statusFilter === "ALL") return raw;
        if (statusFilter === "SYNCED") {
            return raw.filter(c => !!c.googleClassroomId && !!c.googleMeetLink);
        }
        if (statusFilter === "NOT_SYNCED") {
            return raw.filter(c => !c.googleClassroomId || !c.googleMeetLink);
        }
        return raw;
    }, [response, statusFilter, isTeacher, searchTerm]);

    // --- 3. SYNC ACTIONS ---
    const handleCreateClassroom = async (classId) => {
        const key = `${classId}_classroom`;
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            const res = await courseClassService.createClassroom(classId);
            const classroomLink = res?.googleClassroomLink || res?.data?.googleClassroomLink;
            setSyncResult({
                className: res?.name || res?.data?.name || "Lớp học",
                googleClassroomLink: classroomLink,
                isCreation: true,
                success: true
            });
            setIsSyncModalOpen(true);
            refreshClasses();
        } catch (error) {
            alert("Tạo lớp Google Classroom thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleCreateMeet = async (classId) => {
        const key = `${classId}_meet`;
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            await courseClassService.createMeet(classId);
            refreshClasses();
        } catch (error) {
            alert("Tạo lịch Google Meet thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleSyncRoster = async (classId, className) => {
        const key = `${classId}_sync`;
        setActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            const result = await courseClassService.syncClassroom(classId);
            const currentClass = classesList.find(c => c.id === classId);
            setSyncResult({
                className,
                googleClassroomLink: currentClass?.googleClassroomLink,
                ...result
            });
            setIsSyncModalOpen(true);
            refreshClasses();
        } catch (error) {
            alert("Đồng bộ danh sách lớp học thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // --- 4. COLUMNS FOR CLASS TABLE ---
    const columns = [
        {
            key: "name",
            title: "Lớp học & Giáo viên",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <span className="text-[15px] font-black text-gray-900 leading-tight">{val}</span>
                    <span className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                        GV: {row.teacher?.fullName || "Chưa phân công"}
                    </span>
                </div>
            )
        },
        {
            key: "course",
            title: "Khóa học",
            render: (val) => (
                <div className="text-left py-1">
                    <span className="text-[14px] font-black text-gray-700">{val?.title || "---"}</span>
                </div>
            )
        },
        {
            key: "googleClassroomLink",
            title: "Google Classroom",
            render: (val, row) => {
                if (val) {
                    return (
                        <div className="flex flex-col items-start gap-1 py-1">
                            <KLBadge type="success">
                                <span className="flex items-center gap-1 font-bold text-[10px]">
                                    <School size={10} /> ĐÃ ĐỒNG BỘ
                                </span>
                            </KLBadge>
                            <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#2d5a2d] hover:underline font-black flex items-center gap-1 mt-1 uppercase"
                            >
                                Đi đến GG Class <ExternalLink size={10} />
                            </a>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col items-start py-1">
                        <KLBadge type="danger">CHƯA TẠO</KLBadge>
                    </div>
                );
            }
        },
        {
            key: "googleMeetLink",
            title: "Google Meet / Event",
            render: (val, row) => {
                if (val) {
                    return (
                        <div className="flex flex-col items-start gap-1 py-1">
                            <KLBadge type="info">
                                <span className="flex items-center gap-1 font-bold text-[10px]">
                                    <Video size={10} /> ĐÃ TẠO LỊCH
                                </span>
                            </KLBadge>
                            <a
                                href={val}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 mt-1"
                            >
                                Link phòng Meet <ExternalLink size={10} />
                            </a>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col items-start py-1">
                        <KLBadge type="danger">CHƯA TẠO LỊCH</KLBadge>
                    </div>
                );
            }
        },
        {
            key: "enrollments",
            title: "Học viên (LMS)",
            render: (val) => (
                <div className="text-center py-1">
                    <span className="text-[14px] font-black text-gray-800 flex items-center justify-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        {val?.length || 0}
                    </span>
                </div>
            )
        },
        {
            key: "actions",
            title: "Thao tác đồng bộ",
            render: (val, row) => {
                const classroomLoading = actionLoading[`${row.id}_classroom`];
                const meetLoading = actionLoading[`${row.id}_meet`];
                const syncLoading = actionLoading[`${row.id}_sync`];

                return (
                    <div className="flex items-center justify-end gap-3 py-1 font-bold">
                        {!row.googleClassroomId ? (
                            <button
                                onClick={() => handleCreateClassroom(row.id)}
                                disabled={classroomLoading}
                                className="text-[12px] font-black text-[#2d5a2d] hover:text-[#204020] hover:underline inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer bg-transparent border-none p-0 disabled:opacity-50 transition-colors"
                            >
                                {classroomLoading ? "Đang tạo..." : "Tạo Classroom"}
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSyncRoster(row.id, row.name)}
                                    disabled={syncLoading}
                                    className="text-[12px] font-black text-[#2d5a2d] hover:text-[#204020] hover:underline inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer bg-transparent border-none p-0 disabled:opacity-50 transition-colors"
                                >
                                    {syncLoading ? <RefreshCw size={12} className="animate-spin mr-1" /> : <RefreshCw size={12} className="mr-1" />}
                                    Đồng bộ
                                </button>
                                {row.googleClassroomLink && (
                                    <>
                                        <span className="text-gray-300 font-normal">|</span>
                                        <a
                                            href={row.googleClassroomLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[12px] font-black text-[#2d5a2d] hover:text-[#204020] hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
                                        >
                                            Đi đến GG Class <ExternalLink size={12} />
                                        </a>
                                    </>
                                )}
                            </div>
                        )}

                        {!row.googleMeetLink && (
                            <>
                                <span className="text-gray-300 font-normal">|</span>
                                <button
                                    onClick={() => handleCreateMeet(row.id)}
                                    disabled={meetLoading}
                                    className="text-[12px] font-black text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 uppercase tracking-wider cursor-pointer bg-transparent border-none p-0 disabled:opacity-50 transition-colors"
                                >
                                    {meetLoading ? "Đang tạo..." : "Tạo Lịch/Meet"}
                                </button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    // Compute Stats
    const stats = useMemo(() => {
        const list = Array.isArray(response) ? response : (response?.data || []);
        const totalClasses = list.length;
        const totalClassroom = list.filter(c => !!c.googleClassroomId).length;
        const totalMeet = list.filter(c => !!c.googleMeetLink).length;
        const totalLocalStudents = list.reduce((acc, c) => acc + (c.enrollments?.length || 0), 0);

        return { totalClasses, totalClassroom, totalMeet, totalLocalStudents };
    }, [response]);

    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Đồng bộ <span className="text-[#2d5a2d]">Classroom</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">
                        {isTeacher ? "Hệ thống đồng bộ Lớp học & Meet Google Classroom dành cho Giáo viên" : "Hệ thống đồng bộ Lớp học & Meet Google Classroom"}
                    </p>
                </div>
            </div>



            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all rounded-2xl">
                    <div className="p-3 bg-gray-50 text-gray-600 rounded-xl"><BookOpen size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Tổng số lớp học</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.totalClasses}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all rounded-2xl">
                    <div className="p-3 bg-green-50 text-[#2d5a2d] rounded-xl"><School size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Classroom liên kết</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.totalClassroom}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all rounded-2xl">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Video size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Đã tạo Google Meet</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.totalMeet}</h3>
                    </div>
                </KLCard>
                <KLCard className="bg-white p-4 border-none shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all rounded-2xl">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Users size={20} /></div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Học viên đang học</p>
                        <h3 className="text-xl font-black text-gray-900">{stats.totalLocalStudents}</h3>
                    </div>
                </KLCard>
            </div>

            {/* CLASS LIST TABLE */}
            <KLCard className="p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[2rem]">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm lớp học..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        {["ALL", "SYNCED", "NOT_SYNCED"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${statusFilter === filter ? "bg-[#E4FBE1] text-[#2d5a2d]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                            >
                                {filter === "ALL" ? "Tất cả" : filter === "SYNCED" ? "Đã đồng bộ" : "Chưa đồng bộ"}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center font-black text-gray-200 uppercase tracking-widest animate-pulse">
                        Đang tải danh sách lớp học...
                    </div>
                ) : (
                    <KLTable
                        columns={columns}
                        data={classesList}
                        showAction={false} // Disable default detail/edit/delete actions
                    />
                )}
            </KLCard>

            {/* SYNC RESULTS MODAL */}
            {isSyncModalOpen && syncResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 text-left">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight italic flex items-center gap-2">
                                <Sparkles className="text-[#2d5a2d]" /> {syncResult.isCreation ? "Tạo lớp thành công" : "Kết quả đồng bộ"}
                            </h3>
                            <button
                                onClick={() => setIsSyncModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="bg-green-50 text-green-800 p-4 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                                <div>
                                    <h4 className="font-black text-sm uppercase">{syncResult.isCreation ? "Đã tạo thành công!" : "Đồng bộ thành công!"}</h4>
                                    <p className="text-xs font-bold mt-1 text-green-700">Lớp: {syncResult.className}</p>
                                </div>
                            </div>

                            {syncResult.isCreation ? (
                                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                                    <p className="text-xs text-gray-600 font-bold">
                                        Google Classroom đã được khởi tạo thành công trên hệ thống Google.
                                    </p>
                                    {syncResult.googleClassroomLink && (
                                        <p className="text-xs text-gray-500 font-medium">
                                            Bạn có thể đi đến Google Classroom ngay bây giờ để quản lý tài liệu và bài tập.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Học viên LMS</p>
                                            <p className="text-2xl font-black text-gray-900 mt-1">{syncResult.localStudentsCount}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Classroom members</p>
                                            <p className="text-2xl font-black text-[#2d5a2d] mt-1">{syncResult.googleStudentsCount}</p>
                                        </div>
                                    </div>

                                    {/* Invited emails */}
                                    <div>
                                        <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Đã gửi thư mời mới ({syncResult.invitedEmails?.length || 0})
                                        </h5>
                                        {syncResult.invitedEmails?.length > 0 ? (
                                            <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-xl custom-scrollbar border">
                                                {syncResult.invitedEmails.map((email, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                                        <Check className="text-green-600" size={12} />
                                                        {email}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 font-bold italic bg-gray-50 p-3 rounded-xl border">Không có học sinh mới cần mời.</p>
                                        )}
                                    </div>

                                    {/* Already connected */}
                                    <div>
                                        <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                                            Đã tham gia lớp học ({syncResult.alreadyInClassroom?.length || 0})
                                        </h5>
                                        {syncResult.alreadyInClassroom?.length > 0 ? (
                                            <div className="space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-xl custom-scrollbar border">
                                                {syncResult.alreadyInClassroom.map((email, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                        <CheckCircle2 className="text-blue-500" size={12} />
                                                        {email}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 font-bold italic bg-gray-50 p-3 rounded-xl border">Chưa có học sinh nào chấp nhận lời mời.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50/50 flex justify-between items-center">
                            {syncResult.googleClassroomLink ? (
                                <a
                                    href={syncResult.googleClassroomLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2.5 bg-[#2d5a2d] hover:bg-[#204020] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2"
                                >
                                    <School size={14} /> Đi đến GG Class
                                </a>
                            ) : <div></div>}
                            <KLButton onClick={() => setIsSyncModalOpen(false)}>Đóng</KLButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
