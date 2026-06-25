import React, { useEffect, useCallback, useState, useMemo } from "react";
import { 
  Search, Filter, X, ChevronLeft, ChevronRight, 
  UserPlus, Calendar, BookOpen, GraduationCap, 
  CheckCircle2, Clock, Ban, BarChart3, Users,
  Award, ArrowRight, ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { KLCard } from "../../Component/Card";
import { KLTable } from "../../Component/Table";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";

import useCallApiHandler from "../../../hooks/HookHander/useCallApiHandler";
import enrollmentService from "../../Service/API/courseServiceAPI/user-enrollment.service";
import { useAuth } from "../../../context/authContext";
import userService from "../../Service/API/userServiceAPI/user.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";

export default function UserEnrollmentList() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const userRole = user?.role?.toUpperCase() || "";
    const currentUserId = user?.id;

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const pageSize = 5;

    // --- MODAL STATES ---
    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    const [studentsList, setStudentsList] = useState([]);
    const [coursesList, setCoursesList] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [enrollUserId, setEnrollUserId] = useState("");
    const [enrollCourseId, setEnrollCourseId] = useState("");
    const [enrollClassId, setEnrollClassId] = useState("");

    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [transferClassId, setTransferClassId] = useState("");
    const [transferClassesList, setTransferClassesList] = useState([]);

    // --- 1. FETCH DATA ---
    const fetchFn = useCallback(() => {
        if (userRole === 'STUDENT') {
            return enrollmentService.getByUser(currentUserId);
        }
        // Admin or Teacher: server-side search, status and pagination
        return enrollmentService.getAll({ 
            page: currentPage, 
            limit: pageSize, 
            search: searchTerm, 
            status: statusFilter || undefined 
        });
    }, [currentUserId, userRole, currentPage, searchTerm, statusFilter]);

    const { data: response, loading, call: refresh } = useCallApiHandler(fetchFn);

    useEffect(() => {
        if (user) {
            refresh();
        }
    }, [refresh, user, currentPage, searchTerm, statusFilter]);

    // Reset page on search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // --- 2. PAGINATION & DATA NORMALIZATION ---
    const rawData = useMemo(() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        return [];
    }, [response]);

    const totalPages = useMemo(() => {
        if (!response) return 1;
        if (Array.isArray(response)) return Math.ceil(response.length / pageSize);
        if (typeof response.lastPage === 'number') return response.lastPage;
        return Math.ceil(rawData.length / pageSize);
    }, [response, rawData, pageSize]);

    const totalItems = useMemo(() => {
        if (!response) return 0;
        if (Array.isArray(response)) return response.length;
        if (typeof response.total === 'number') return response.total;
        return rawData.length;
    }, [response, rawData]);

    const paginatedData = useMemo(() => {
        if (userRole === 'STUDENT') {
            const start = (currentPage - 1) * pageSize;
            return rawData.slice(start, start + pageSize);
        }
        return rawData; // Server-side paginated
    }, [rawData, currentPage, userRole]);

    // --- 3. QUICK ACTIONS ---
    const handleStatusUpdate = async (id, status) => {
        if (window.confirm(`Xác nhận chuyển trạng thái ghi danh sang ${status}?`)) {
            try {
                await enrollmentService.updateStatus(id, status);
                alert("✅ Cập nhật trạng thái thành công!");
                refresh();
            } catch (e) {
                alert(e.response?.data?.message || "Lỗi khi cập nhật trạng thái");
            }
        }
    };

    // --- ENROLL ACTION ---
    const openEnrollModal = async () => {
        setIsEnrollOpen(true);
        setEnrollUserId("");
        setEnrollCourseId("");
        setEnrollClassId("");
        setClassesList([]);
        try {
            // Fetch students & courses
            const [studentsRes, coursesRes] = await Promise.all([
                userService.getStudents(1, 1000),
                courseService.getAllCourses(1, 100)
            ]);
            setStudentsList(studentsRes?.data || studentsRes || []);
            setCoursesList(coursesRes?.data || coursesRes || []);
        } catch (e) {
            console.error("Lỗi tải danh sách để ghi danh:", e);
        }
    };

    const handleEnrollCourseChange = async (e) => {
        const courseId = e.target.value;
        setEnrollCourseId(courseId);
        setEnrollClassId("");
        setClassesList([]);
        if (courseId) {
            try {
                const classesRes = await courseClassService.getClassesByCourse(courseId);
                setClassesList(classesRes || []);
            } catch (e) {
                console.error("Lỗi tải danh sách lớp học:", e);
            }
        }
    };

    const handleEnrollSubmit = async () => {
        if (!enrollUserId || !enrollCourseId) {
            alert("Vui lòng chọn đầy đủ Học viên và Khóa học!");
            return;
        }
        try {
            await enrollmentService.enroll({
                userId: Number(enrollUserId),
                courseId: Number(enrollCourseId),
                classId: enrollClassId ? Number(enrollClassId) : null
            });
            alert("✅ Ghi danh học viên thành công!");
            setIsEnrollOpen(false);
            refresh();
        } catch (e) {
            alert(e.response?.data?.message || "Lỗi khi ghi danh");
        }
    };

    // --- TRANSFER ACTION ---
    const openTransferModal = async (enrollment) => {
        setSelectedEnrollment(enrollment);
        setTransferClassId("");
        setTransferClassesList([]);
        setIsTransferOpen(true);
        try {
            const classesRes = await courseClassService.getClassesByCourse(enrollment.courseId);
            setTransferClassesList(classesRes || []);
        } catch (e) {
            console.error("Lỗi tải danh sách lớp chuyển đổi:", e);
        }
    };

    const handleTransferSubmit = async () => {
        if (!transferClassId) {
            alert("Vui lòng chọn lớp học mới!");
            return;
        }
        try {
            await enrollmentService.transferClass(selectedEnrollment.id, Number(transferClassId));
            alert("✅ Chuyển lớp cho học viên thành công!");
            setIsTransferOpen(false);
            refresh();
        } catch (e) {
            alert(e.response?.data?.message || "Lỗi khi chuyển lớp");
        }
    };

    // --- 4. COLUMNS DEFINITION ---
    const columns = [
        ...(userRole !== 'STUDENT' ? [{
            key: "user",
            title: "Học viên",
            render: (student) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase border border-blue-100">
                        {student?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[14px] font-bold text-gray-800 leading-tight">
                            {student?.fullName || "Chưa cập nhật"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                            {student?.email || "N/A"}
                        </span>
                    </div>
                </div>
            )
        }] : []),
        {
            key: "course",
            title: "Khóa học & Lớp",
            render: (val, row) => (
                <div className="flex flex-col text-left py-1">
                    <span className="text-[14px] font-black text-gray-900 leading-tight mb-0.5">{val?.title || "Unknown Course"}</span>
                    <div className="flex items-center gap-2">
                        <GraduationCap size={12} className="text-[#2d5a2d]" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Lớp: {row.class?.name || "Chưa phân lớp"}</span>
                    </div>
                </div>
            )
        },
        {
            key: "progressPercent",
            title: "Tiến độ",
            render: (val) => (
                <div className="w-full max-w-[120px] space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black italic">
                        <span className="text-gray-400">HOÀN THÀNH</span>
                        <span className="text-[#2d5a2d]">{val || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#2d5a2d] to-[#4ade80] transition-all duration-1000" style={{ width: `${val || 0}%` }} />
                    </div>
                </div>
            )
        },
        {
            key: "enrolledAt",
            title: "Ngày tham gia",
            render: (date) => (
                <div className="flex items-center gap-2 text-gray-400 font-bold text-[13px]">
                    <Clock size={14} />
                    {date ? new Date(date).toLocaleDateString('vi-VN') : "---"}
                </div>
            )
        },
        {
            key: "status",
            title: "Trạng thái",
            render: (status) => {
                const config = {
                    ACTIVE: { type: 'success', text: 'Đang học', icon: CheckCircle2 },
                    COMPLETED: { type: 'info', text: 'Hoàn thành', icon: BarChart3 },
                    CANCELLED: { type: 'danger', text: 'Đã hủy', icon: Ban },
                }[status] || { type: 'default', text: status, icon: Clock };
                
                return (
                    <KLBadge type={config.type}>
                        <div className="flex items-center gap-1">
                            <config.icon size={10} />
                            <span className="font-black text-[10px] uppercase">{config.text}</span>
                        </div>
                    </KLBadge>
                );
            }
        },
        ...(userRole !== 'STUDENT' ? [{
            key: "id",
            title: "Duyệt & Chuyển",
            render: (id, row) => (
                <div className="flex items-center gap-2 justify-end">
                    {row.status === 'ACTIVE' && (
                        <>
                            <button 
                                onClick={() => handleStatusUpdate(id, 'COMPLETED')} 
                                className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-[10px] font-black uppercase flex items-center gap-1 active:scale-95 transition-all border border-green-100"
                                title="Đánh dấu hoàn thành"
                            >
                                <Award size={12} /> Hoàn thành
                            </button>
                            {userRole === 'ADMIN' && (
                                <button 
                                    onClick={() => openTransferModal(row)}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-black uppercase flex items-center gap-1 active:scale-95 transition-all border border-blue-100"
                                    title="Chuyển sang lớp khác"
                                >
                                    <ArrowRight size={12} /> Chuyển lớp
                                </button>
                            )}
                        </>
                    )}
                </div>
            )
        }] : [])
    ];

    // --- 5. DEFAULT ACTIONS HANDLER ---
    const handleAction = async (type, item) => {
        if (type === 'delete') { // Hủy ghi danh
            if (item.status === 'CANCELLED') {
                alert("Ghi danh này đã bị hủy trước đó!");
                return;
            }
            if (item.status === 'COMPLETED') {
                alert("Không thể hủy ghi danh khóa học đã hoàn thành!");
                return;
            }
            if (window.confirm("Bạn có chắc chắn muốn hủy ghi danh khóa học này?")) {
                try {
                    await enrollmentService.cancel(item.id);
                    alert("✅ Đã hủy ghi danh thành công!");
                    refresh();
                } catch (e) {
                    alert(e.response?.data?.message || "Lỗi khi hủy");
                }
            }
        } else if (type === 'view') {
            if (item.class?.id) {
                const basePath = userRole === 'TEACHER' ? '/teacher' : '/admin';
                navigate(`${basePath}/classes/${item.class.id}`);
            } else {
                alert("Ghi danh chưa có thông tin lớp học!");
            }
        }
    };

    return (
        <div className="space-y-6 p-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none italic">
                        Lộ trình <span className="text-[#2d5a2d]">Học tập</span>
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
                        Quản lý danh sách ghi danh và tiến độ học tập
                    </p>
                </div>
                {userRole === 'ADMIN' && (
                    <KLButton 
                        icon={UserPlus} 
                        className="bg-[#2d5a2d] hover:bg-[#1a3d1a] shadow-lg shadow-green-100"
                        onClick={openEnrollModal}
                    >
                        Ghi danh học viên
                    </KLButton>
                )}
            </div>

            <KLCard className="bg-white border-none shadow-sm p-5">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo học viên, khóa học hoặc lớp..." 
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-[#2d5a2d]/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {userRole !== 'STUDENT' && (
                        <div className="w-full md:w-48">
                            <select 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-sm cursor-pointer outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang học</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                    )}
                </div>
            </KLCard>

            <KLCard className="p-0 overflow-hidden shadow-xl border-none">
                {loading ? (
                    <div className="py-20 text-center animate-pulse font-black text-gray-400 uppercase tracking-widest">Đang tải tiến độ...</div>
                ) : (
                    <>
                        <KLTable 
                            columns={columns} 
                            data={paginatedData} 
                            onAction={handleAction} 
                            hiddenActions={['edit', 'reset', 'lock']} // Chỉ hiện View và Delete (Hủy)
                        />

                        {/* PHÂN TRANG */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-between items-center">
                            <div className="flex flex-col text-left">
                                <span className="text-[11px] font-black text-gray-800 uppercase">Trang {currentPage} / {totalPages || 1}</span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase italic tracking-wider">Tổng số: {totalItems} lượt ghi danh</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                    disabled={currentPage === 1} 
                                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all"
                                >
                                    <ChevronLeft size={18} strokeWidth={3} />
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNumber = i + 1;
                                    return (
                                        <button 
                                            key={pageNumber} 
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`w-11 h-11 rounded-2xl font-black text-xs transition-all ${currentPage === pageNumber ? "bg-[#2d5a2d] text-white shadow-xl shadow-green-100" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                    disabled={currentPage === totalPages || totalPages === 0} 
                                    className="p-3 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-10 active:scale-90 transition-all"
                                >
                                    <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </KLCard>

            {/* ENROLL MODAL */}
            {isEnrollOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black uppercase text-gray-950 flex items-center gap-2 italic">
                            <UserPlus className="text-[#2d5a2d]" /> Ghi danh <span className="text-[#2d5a2d]">học viên</span>
                        </h2>
                        <button onClick={() => setIsEnrollOpen(false)} className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                            <X size={18} />
                        </button>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Chọn học viên</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={enrollUserId} onChange={e => setEnrollUserId(e.target.value)}>
                                    <option value="">-- Chọn học viên --</option>
                                    {studentsList.map(s => (
                                        <option key={s.id} value={s.id}>{s.fullName || s.username} ({s.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Chọn khóa học</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={enrollCourseId} onChange={handleEnrollCourseChange}>
                                    <option value="">-- Chọn khóa học --</option>
                                    {coursesList.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Chọn lớp học (Tùy chọn)</label>
                                <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={enrollClassId} onChange={e => setEnrollClassId(e.target.value)}>
                                    <option value="">-- Tự động phân lớp (Lớp trống &lt; 15 học sinh) --</option>
                                    {classesList.map(cl => (
                                        <option key={cl.id} value={cl.id}>{cl.name} (Sĩ số: {cl.enrollments?.length || 0}/15)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                            <button onClick={() => setIsEnrollOpen(false)} className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={handleEnrollSubmit} className="px-6 py-3 rounded-2xl font-bold bg-[#2d5a2d] text-white hover:bg-[#1a3d1a] shadow-lg shadow-green-100 transition-colors">Ghi danh</button>
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSFER CLASS MODAL */}
            {isTransferOpen && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black uppercase text-gray-950 flex items-center gap-2 italic">
                            <ArrowRight className="text-blue-600" /> Chuyển lớp <span className="text-blue-600">học viên</span>
                        </h2>
                        <button onClick={() => setIsTransferOpen(false)} className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                            <X size={18} />
                        </button>
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <ShieldAlert className="text-blue-600 mt-0.5" size={18} />
                            <div className="text-left text-sm text-blue-900">
                                <p className="font-black">Học viên: {selectedEnrollment.user?.fullName}</p>
                                <p className="font-bold text-xs opacity-75 mt-0.5">Khóa học: {selectedEnrollment.course?.title}</p>
                                <p className="font-bold text-xs opacity-75">Lớp hiện tại: {selectedEnrollment.class?.name || "Chưa có lớp"}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Lớp học mục tiêu mới</label>
                            <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={transferClassId} onChange={e => setTransferClassId(e.target.value)}>
                                <option value="">-- Chọn lớp học mới --</option>
                                {transferClassesList
                                .filter(cl => cl.id !== selectedEnrollment.classId)
                                .map(cl => (
                                    <option key={cl.id} value={cl.id}>{cl.name} (Sĩ số: {cl.enrollments?.length || 0}/{cl.maxStudents || 30})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                            <button onClick={() => setIsTransferOpen(false)} className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Hủy</button>
                            <button onClick={handleTransferSubmit} className="px-6 py-3 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-colors">Xác nhận chuyển</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}