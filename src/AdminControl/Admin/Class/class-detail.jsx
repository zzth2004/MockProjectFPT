import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Trash2, Users, Calendar, Clock, 
  Link as LinkIcon, Mail, Search, UserPlus, 
  CheckCircle, XCircle, School, ArrowRight, Ban, X, ShieldAlert,
  GraduationCap
} from "lucide-react";

// Services & Context
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import enrollmentService from "../../Service/API/courseServiceAPI/user-enrollment.service";
import userService from "../../Service/API/userServiceAPI/user.service";
import { useAuth } from "../../../context/authContext";

// Status Badge Component
const StatusBadge = ({ status }) => {
    const styles = {
        UPCOMING: "bg-blue-50 text-blue-600 border-blue-100",
        ONGOING: "bg-green-50 text-green-700 border-green-100/60",
        FINISHED: "bg-gray-50 text-gray-500 border-gray-100",
        CANCELLED: "bg-red-50 text-red-500 border-red-100",
    };
    return (
        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles.UPCOMING}`}>
            {status}
        </span>
    );
};

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal and Search States
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [transferClassesList, setTransferClassesList] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [transferClassId, setTransferClassId] = useState("");
  const [searchStudentTerm, setSearchStudentTerm] = useState(""); 

  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const basePath = isTeacher ? "/teacher" : "/admin"; 

  // --- FETCH DATA ---
  const fetchDetail = async () => {
    try {
      const data = await courseClassService.getClassDetail(id);
      setClassData(data);
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Không tìm thấy lớp học hoặc bạn không có quyền truy cập!");
      navigate(`${basePath}/classes`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, navigate, basePath]);

  const handleDelete = async () => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa lớp học này không? Hành động này không thể hoàn tác.")) {
        try {
            await courseClassService.deleteClass(id);
            alert("✅ Đã xóa lớp học thành công!");
            navigate(`${basePath}/classes`);
        } catch (error) {
            alert("❌ Không thể xóa lớp học (Có thể do đã có học viên hoặc lỗi Server).");
        }
    }
  };

  const handleOpenAddStudent = async () => {
    setIsAddStudentOpen(true);
    setSelectedStudentId("");
    try {
      const res = await userService.getStudents(1, 1000);
      setStudentsList(res?.data || res || []);
    } catch (e) {
      console.error("Lỗi tải học sinh:", e);
    }
  };

  const handleAddStudentSubmit = async () => {
    if (!selectedStudentId) {
      alert("Vui lòng chọn học viên!");
      return;
    }
    try {
      await enrollmentService.enroll({
        userId: Number(selectedStudentId),
        courseId: classData.course?.id,
        classId: Number(id)
      });
      alert("✅ Thêm học viên vào lớp thành công!");
      setIsAddStudentOpen(false);
      fetchDetail();
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi khi thêm học viên");
    }
  };

  const handleOpenTransfer = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setTransferClassId("");
    setIsTransferOpen(true);
    try {
      const res = await courseClassService.getClassesByCourse(classData.course?.id);
      setTransferClassesList(res || []);
    } catch (e) {
      console.error("Lỗi tải lớp học:", e);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferClassId) {
      alert("Vui lòng chọn lớp học mục tiêu!");
      return;
    }
    try {
      await enrollmentService.transferClass(selectedEnrollment.id, Number(transferClassId));
      alert("✅ Chuyển lớp cho học viên thành công!");
      setIsTransferOpen(false);
      fetchDetail();
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi khi chuyển lớp");
    }
  };

  const handleCancelEnrollment = async (enrollmentId) => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn hủy học viên này ra khỏi lớp học?")) {
      try {
        await enrollmentService.cancel(enrollmentId);
        alert("✅ Hủy học viên khỏi lớp thành công!");
        fetchDetail();
      } catch (e) {
        alert(e.response?.data?.message || "Lỗi khi hủy ghi danh");
      }
    }
  };

  const enrolledStudents = useMemo(() => {
    if (!classData?.enrollments) return [];
    const activeEnrollments = classData.enrollments.filter(e => e.status !== 'CANCELLED');
    if (!searchStudentTerm) return activeEnrollments;
    return activeEnrollments.filter(e => 
      e.user?.fullName?.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      e.user?.email?.toLowerCase().includes(searchStudentTerm.toLowerCase())
    );
  }, [classData, searchStudentTerm]);

  const availableStudents = useMemo(() => {
    const currentStudentIds = classData?.enrollments
      ?.filter(e => e.status !== 'CANCELLED')
      ?.map(e => e.user?.id) || [];
    return studentsList.filter(s => !currentStudentIds.includes(s.id));
  }, [studentsList, classData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-3">
        <div className="w-10 h-10 border-4 border-[#2d5a2d] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải dữ liệu lớp học...</span>
      </div>
    );
  }

  if (!classData) return null;

  const enrolledCount = classData.enrollments?.filter(e => e.status !== 'CANCELLED').length || 0;
  const maxStudents = classData.maxStudents || 30;
  const progressPercent = Math.min((enrolledCount / maxStudents) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20 p-4 md:p-8 animate-in fade-in duration-500 text-left">
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate(`${basePath}/classes`)} 
             className="w-12 h-12 rounded-2xl bg-white text-gray-500 hover:text-[#2d5a2d] hover:bg-green-50 flex items-center justify-center shadow-sm border border-gray-100/70 transition-all active:scale-95"
           >
              <ArrowLeft size={20} strokeWidth={2.5} />
           </button>
           <div>
              <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tight line-clamp-1">
                    {classData.name}
                  </h1>
                  <StatusBadge status={classData.status} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Khóa học: <span className="text-[#2d5a2d] font-black cursor-pointer hover:underline" onClick={() => navigate(`${basePath}/courses/${classData.course?.id}/detail`)}>
                      {classData.course?.title || "Unknown Course"}
                  </span>
              </p>
           </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
           <button 
             onClick={() => navigate(`${basePath}/classes/edit/${classData.id}`)}
             className="flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
           >
              <Edit3 size={16} /> Chỉnh sửa
           </button>

           {user?.role === 'admin' && (
             <button 
               onClick={handleDelete}
               className="flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 transition-all active:scale-95"
             >
                <Trash2 size={16} /> Xóa lớp học
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto items-start">
        
        {/* STUDENTS LIST (LEFT COLUMN) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Toolbar Panel */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100/80 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#2d5a2d]">
                        <Users size={22} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Danh sách học viên</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">Tổng cộng: {enrolledCount} / {maxStudents} học viên đăng ký</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"/>
                        <input 
                            type="text" 
                            placeholder="Tìm học viên..." 
                            className="pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-600/10 focus:bg-white w-full sm:w-48 transition-all"
                            value={searchStudentTerm}
                            onChange={(e) => setSearchStudentTerm(e.target.value)}
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <button 
                            onClick={handleOpenAddStudent}
                            className="bg-black text-white hover:bg-gray-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                        >
                            <UserPlus size={14} /> Thêm HV
                        </button>
                    )}
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Học viên</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Liên hệ</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tham gia</th>
                                {user?.role === 'admin' && <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {enrolledStudents.length > 0 ? (
                                enrolledStudents.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2d5a2d] flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                                    {enrollment.user?.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-gray-800">{enrollment.user?.fullName || "Unknown User"}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Mã số: {enrollment.user?.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 text-left">
                                                <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                    <Mail size={12} className="text-gray-400"/> {enrollment.user?.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-bold text-gray-500">
                                                {new Date(enrollment.enrolledAt || enrollment.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        {user?.role === 'admin' && (
                                            <td className="p-6 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button 
                                                        onClick={() => handleOpenTransfer(enrollment)}
                                                        className="px-3 py-2 bg-blue-50/40 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl transition-all flex items-center gap-1 text-[9px] font-black uppercase border border-blue-100/50 active:scale-95"
                                                        title="Chuyển lớp"
                                                    >
                                                        <ArrowRight size={11} strokeWidth={2.5} /> Chuyển
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCancelEnrollment(enrollment.id)}
                                                        className="px-3 py-2 bg-red-50/40 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all flex items-center gap-1 text-[9px] font-black uppercase border border-red-100/50 active:scale-95"
                                                        title="Hủy học"
                                                    >
                                                        <Ban size={11} strokeWidth={2.5} /> Hủy
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={user?.role === 'admin' ? 4 : 3} className="p-12 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                                        Không tìm thấy học viên nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* SIDEBAR INFO (RIGHT COLUMN) */}
        <div className="space-y-6">
            
            {/* TEACHER IN CHARGE */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/80 text-left">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Giảng viên phụ trách</h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2d5a2d] flex items-center justify-center font-black text-sm uppercase shadow-sm">
                        {classData.teacher?.fullName?.charAt(0).toUpperCase() || "G"}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-black text-gray-900 text-md truncate">{classData.teacher?.fullName || "Chưa gán GV"}</h4>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 truncate mt-1">
                            <Mail size={11}/> {classData.teacher?.email || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* CLASS DETAILS */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/80 space-y-5 text-left">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin lớp học</h3>
                    <button 
                        onClick={() => navigate(`${basePath}/classes/edit/${classData.id}`)}
                        className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-green-50 hover:text-[#2d5a2d] transition-all"
                        title="Chỉnh sửa thông tin"
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
                
                {/* Start Date */}
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-gray-400 border border-slate-100/60"><Calendar size={16}/></div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide leading-none mb-1">Ngày khai giảng</p>
                        <p className="text-xs font-bold text-gray-800">
                            {classData.startDate ? new Date(classData.startDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                        </p>
                    </div>
                </div>

                {/* Schedule */}
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-gray-400 border border-slate-100/60"><Clock size={16}/></div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wide leading-none mb-1">Lịch học</p>
                        <p className="text-xs font-bold text-gray-800">
                            {classData.scheduleDescription || "Chưa có lịch cụ thể"}
                        </p>
                    </div>
                </div>

                {/* Sĩ số Progress Bar */}
                <div className="pt-2 border-t border-slate-100/60">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Sĩ số lớp</span>
                        <span className="text-xs font-black text-[#2d5a2d]">{enrolledCount} / {maxStudents}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2d5a2d] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* ONLINE ROOMS CARD */}
            <div className="bg-[#2d5a2d] p-6 rounded-[2rem] shadow-lg shadow-green-950/15 text-white relative overflow-hidden text-left">
                <div className="relative z-10 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider opacity-80">Phòng học liên kết</h3>
                    
                    <div className="space-y-1">
                        <p className="text-[8px] font-black opacity-60 uppercase tracking-widest">Google Meet</p>
                        {classData.googleMeetLink ? (
                            <a href={classData.googleMeetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-black text-sm hover:underline truncate">
                                <LinkIcon size={14} /> Vào lớp Google Meet
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50 text-[11px] font-bold uppercase tracking-wider">
                                <XCircle size={14} /> Chưa liên kết
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-white/20 space-y-1">
                        <p className="text-[8px] font-black opacity-60 uppercase tracking-widest">Google Classroom</p>
                        {classData.googleClassroomLink ? (
                            <a href={classData.googleClassroomLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-black text-sm hover:underline">
                                <School size={14} /> Xem lớp học Google Classroom
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50 text-[11px] font-bold uppercase tracking-wider">
                                <XCircle size={14} /> Chưa liên kết
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200 text-left">
                  <h2 className="text-xl font-black uppercase text-gray-950 flex items-center gap-2 italic">
                      <UserPlus className="text-[#2d5a2d]" /> Thêm học viên <span className="text-[#2d5a2d]">vào lớp</span>
                  </h2>
                  <button onClick={() => setIsAddStudentOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-150 transition-colors">
                      <X size={18} />
                  </button>
                  <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Chọn học viên chưa tham gia lớp</label>
                      <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                          <option value="">-- Chọn học viên --</option>
                          {availableStudents.map(s => (
                              <option key={s.id} value={s.id}>{s.fullName || s.username} ({s.email})</option>
                          ))}
                      </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                      <button onClick={() => setIsAddStudentOpen(false)} className="px-6 py-3.5 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all text-sm">Hủy</button>
                      <button onClick={handleAddStudentSubmit} className="px-6 py-3.5 rounded-2xl font-bold bg-[#2d5a2d] hover:bg-[#204020] text-white transition-all text-sm active:scale-95 shadow-md">Thêm vào lớp</button>
                  </div>
              </div>
          </div>
      )}

      {/* TRANSFER STUDENT MODAL */}
      {isTransferOpen && selectedEnrollment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200 text-left">
                  <h2 className="text-xl font-black uppercase text-gray-950 flex items-center gap-2 italic">
                      <ArrowRight className="text-blue-600" /> Chuyển lớp <span className="text-blue-600">học viên</span>
                  </h2>
                  <button onClick={() => setIsTransferOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-150 transition-colors">
                      <X size={18} />
                  </button>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <ShieldAlert className="text-blue-600 mt-0.5" size={18} />
                      <div className="text-left text-sm text-blue-900">
                          <p className="font-black">Học viên: {selectedEnrollment.user?.fullName}</p>
                          <p className="font-bold text-xs opacity-75 mt-0.5">Khóa học: {classData.course?.title}</p>
                          <p className="font-bold text-xs opacity-75">Lớp hiện tại: {classData.name}</p>
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Lớp học mục tiêu mới</label>
                      <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={transferClassId} onChange={e => setTransferClassId(e.target.value)}>
                          <option value="">-- Chọn lớp học mới --</option>
                          {transferClassesList
                          .filter(cl => cl.id !== classData.id)
                          .map(cl => (
                              <option key={cl.id} value={cl.id}>{cl.name} (Sĩ số: {cl.enrollments?.length || 0}/{cl.maxStudents || 30})</option>
                          ))}
                      </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                      <button onClick={() => setIsTransferOpen(false)} className="px-6 py-3.5 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-all text-sm">Hủy</button>
                      <button onClick={handleTransferSubmit} className="px-6 py-3.5 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm active:scale-95 shadow-md">Xác nhận chuyển</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}