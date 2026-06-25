import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Trash2, Users, Calendar, Clock, 
  Link as LinkIcon, Mail, Search, UserPlus, 
  CheckCircle, XCircle, School, ArrowRight, Ban, X, ShieldAlert 
} from "lucide-react";

// Services & Context
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import enrollmentService from "../../Service/API/courseServiceAPI/user-enrollment.service";
import userService from "../../Service/API/userServiceAPI/user.service";
import { useAuth } from "../../../context/authContext"; // ✅ 1. Import Auth

// Component con: Badge trạng thái
const StatusBadge = ({ status }) => {
    const styles = {
        UPCOMING: "bg-blue-50 text-blue-600 border-blue-100",
        ONGOING: "bg-green-50 text-green-600 border-green-100",
        FINISHED: "bg-gray-50 text-gray-500 border-gray-100",
        CANCELLED: "bg-red-50 text-red-500 border-red-100",
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[status] || styles.UPCOMING}`}>
            {status}
        </span>
    );
};

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ 2. Lấy thông tin User
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  // States cho các Modal và Tìm kiếm
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [transferClassesList, setTransferClassesList] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [transferClassId, setTransferClassId] = useState("");
  const [searchStudentTerm, setSearchStudentTerm] = useState(""); 

  // ✅ 3. Xác định đường dẫn cơ sở (Base Path) dựa trên Role
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
      navigate(`${basePath}/classes`); // Redirect về đúng danh sách
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, navigate, basePath]);

  // --- ACTION HANDLERS ---
  const handleDelete = async () => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa lớp học này không? Hành động này không thể hoàn tác.")) {
        try {
            await courseClassService.deleteClass(id);
            alert("✅ Đã xóa lớp học thành công!");
            navigate(`${basePath}/classes`); // Redirect về đúng danh sách
        } catch (error) {
            alert("❌ Không thể xóa lớp học (Có thể do đã có học viên hoặc lỗi Server).");
        }
    }
  };

  // --- THÊM HỌC VIÊN VÀO LỚP ---
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
      fetchDetail(); // Refresh data
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi khi thêm học viên");
    }
  };

  // --- CHUYỂN LỚP CHO HỌC VIÊN ---
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
      fetchDetail(); // Refresh data
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi khi chuyển lớp");
    }
  };

  // --- HỦY GHI DANH KHỎI LỚP ---
  const handleCancelEnrollment = async (enrollmentId) => {
    if (window.confirm("⚠️ Bạn có chắc chắn muốn hủy học viên này ra khỏi lớp học?")) {
      try {
        await enrollmentService.cancel(enrollmentId);
        alert("✅ Hủy học viên khỏi lớp thành công!");
        fetchDetail(); // Refresh data
      } catch (e) {
        alert(e.response?.data?.message || "Lỗi khi hủy ghi danh");
      }
    }
  };

  // Lọc học sinh phía Client theo ô tìm kiếm
  const enrolledStudents = useMemo(() => {
    if (!classData?.enrollments) return [];
    const activeEnrollments = classData.enrollments.filter(e => e.status !== 'CANCELLED');
    if (!searchStudentTerm) return activeEnrollments;
    return activeEnrollments.filter(e => 
      e.user?.fullName?.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
      e.user?.email?.toLowerCase().includes(searchStudentTerm.toLowerCase())
    );
  }, [classData, searchStudentTerm]);

  // Lọc học viên trong dropdown thêm (loại trừ các bạn đã có trong lớp)
  const availableStudents = useMemo(() => {
    const currentStudentIds = classData?.enrollments
      ?.filter(e => e.status !== 'CANCELLED')
      ?.map(e => e.user?.id) || [];
    return studentsList.filter(s => !currentStudentIds.includes(s.id));
  }, [studentsList, classData]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang tải dữ liệu...</div>;
  if (!classData) return null;

  // Tính toán sĩ số
  const enrolledCount = classData.enrollments?.filter(e => e.status !== 'CANCELLED').length || 0;
  const maxStudents = classData.maxStudents || 30;
  const progressPercent = Math.min((enrolledCount / maxStudents) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#F8F9FC]/90 backdrop-blur-sm z-30 py-2">
        <div className="flex items-center gap-4">
           {/* Nút Back về danh sách lớp */}
           <button onClick={() => navigate(`${basePath}/classes`)} className="w-10 h-10 rounded-xl bg-white text-gray-500 hover:bg-gray-100 hover:text-[#2d5a2d] flex items-center justify-center shadow-sm transition-all">
              <ArrowLeft size={20} />
           </button>
           <div>
              <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-gray-900 uppercase italic line-clamp-1">{classData.name}</h1>
                  <StatusBadge status={classData.status} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Khóa: <span className="text-[#2d5a2d] cursor-pointer hover:underline" onClick={() => navigate(`${basePath}/courses/${classData.course?.id}/detail`)}>
                      {classData.course?.title || "Unknown Course"}
                  </span>
              </p>
           </div>
        </div>
        
        <div className="flex gap-3">
           {/* 👇 NÚT SỬA LỚP */}
           <button 
             onClick={() => navigate(`${basePath}/classes/edit/${classData.id}`)}
             className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
           >
              <Edit3 size={18} /> <span className="hidden md:inline">Sửa lớp</span>
           </button>

           {/* Nút Xóa */}
           {user?.role === 'admin' && (
             <button 
               onClick={handleDelete}
               className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 flex items-center gap-2 transition-all hover:scale-105"
             >
                <Trash2 size={18} /> <span className="hidden md:inline">Xóa</span>
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* --- CỘT TRÁI: DANH SÁCH SINH VIÊN --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Thanh công cụ */}
            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#2d5a2d]/5 rounded-full flex items-center justify-center text-[#2d5a2d]">
                        <Users size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-gray-900">Danh sách học viên</h3>
                        <p className="text-xs font-medium text-gray-400">Tổng: {enrolledCount} / {maxStudents} học viên</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative hidden md:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Tìm tên, email..." 
                            className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-1 focus:ring-[#2d5a2d]"
                            value={searchStudentTerm}
                            onChange={(e) => setSearchStudentTerm(e.target.value)}
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <button 
                            onClick={handleOpenAddStudent}
                            className="bg-[#2d5a2d] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a3d1a] transition-all active:scale-95"
                        >
                            <UserPlus size={16} /> Thêm HV
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Học viên</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Liên hệ</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Ngày tham gia</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right"># Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {enrolledStudents.length > 0 ? (
                                enrolledStudents.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm uppercase">
                                                    {enrollment.user?.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-800">{enrollment.user?.fullName || "Unknown User"}</p>
                                                    <p className="text-[10px] font-medium text-gray-400">ID: {enrollment.user?.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1 text-left">
                                                <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                    <Mail size={12} className="text-gray-400"/> {enrollment.user?.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-bold text-gray-600">
                                                {new Date(enrollment.enrolledAt || enrollment.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            {/* Thao tác nhanh cho Admin */}
                                            {user?.role === 'admin' && (
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button 
                                                        onClick={() => handleOpenTransfer(enrollment)}
                                                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase border border-blue-100"
                                                        title="Chuyển lớp"
                                                    >
                                                        <ArrowRight size={12} /> Chuyển lớp
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCancelEnrollment(enrollment.id)}
                                                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase border border-red-100"
                                                        title="Hủy học"
                                                    >
                                                        <Ban size={12} /> Hủy học
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-400 font-medium text-sm">
                                        Không tìm thấy học viên nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN LỚP --- */}
        <div className="space-y-6">
            
            {/* 1. THẺ GIÁO VIÊN */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Giáo viên phụ trách</h3>
                <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-black text-xl border-2 border-white shadow-sm">
                        {classData.teacher?.fullName?.charAt(0).toUpperCase() || "G"}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-bold text-gray-900 text-lg truncate">{classData.teacher?.fullName || "Chưa gán GV"}</h4>
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1 truncate mt-0.5">
                            <Mail size={12}/> {classData.teacher?.email || "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. THÔNG TIN CHI TIẾT */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 text-left">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin chi tiết</h3>
                    {/* 👇 NÚT SỬA NHỎ */}
                    <button 
                        onClick={() => navigate(`${basePath}/classes/edit/${classData.id}`)}
                        className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-[#2d5a2d] hover:text-white transition-all"
                        title="Chỉnh sửa thông tin"
                    >
                        <Edit3 size={14} />
                    </button>
                </div>
                
                {/* Ngày khai giảng */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Calendar size={18}/></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Ngày khai giảng</p>
                        <p className="text-sm font-bold text-gray-800">
                            {classData.startDate ? new Date(classData.startDate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                        </p>
                    </div>
                </div>

                {/* Lịch học */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><Clock size={18}/></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Lịch học</p>
                        <p className="text-sm font-bold text-gray-800">
                            {classData.scheduleDescription || "Chưa có lịch cụ thể"}
                        </p>
                    </div>
                </div>

                {/* Sĩ số Progress Bar */}
                <div className="pt-2">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Sĩ số lớp</span>
                        <span className="text-xs font-black text-[#2d5a2d]">{enrolledCount} / {maxStudents}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2d5a2d] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 3. LIÊN KẾT ONLINE */}
            <div className="bg-[#2d5a2d] p-6 rounded-[2rem] shadow-lg shadow-green-900/20 text-white relative overflow-hidden text-left">
                <div className="relative z-10 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Phòng học Online</h3>
                    
                    <div>
                        <p className="text-[10px] font-bold opacity-70 mb-1 uppercase">Google Meet</p>
                        {classData.googleMeetLink ? (
                            <a href={classData.googleMeetLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold hover:underline truncate">
                                <LinkIcon size={16} /> Vào lớp ngay
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50 text-sm font-medium">
                                <XCircle size={16} /> Chưa có link Meet
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-white/20">
                        <p className="text-[10px] font-bold opacity-70 mb-1 uppercase">Google Classroom</p>
                        {classData.googleClassroomLink ? (
                            <a href={classData.googleClassroomLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold hover:underline">
                                <School size={16} /> Xem bài tập
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 opacity-50 text-sm font-medium">
                                <XCircle size={16} /> Chưa có link Classroom
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

        </div>
      </div>

      {/* --- MODAL THÊM HỌC VIÊN --- */}
      {isAddStudentOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
                  <h2 className="text-xl font-black uppercase text-gray-950 flex items-center gap-2 italic">
                      <UserPlus className="text-[#2d5a2d]" /> Thêm học viên <span className="text-[#2d5a2d]">vào lớp</span>
                  </h2>
                  <button onClick={() => setIsAddStudentOpen(false)} className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                      <X size={18} />
                  </button>
                  <div className="text-left">
                      <label className="text-[10px] font-black uppercase text-gray-400 block mb-1.5 ml-1">Chọn học viên chưa tham gia lớp</label>
                      <select className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none cursor-pointer" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                          <option value="">-- Chọn học viên --</option>
                          {availableStudents.map(s => (
                              <option key={s.id} value={s.id}>{s.fullName || s.username} ({s.email})</option>
                          ))}
                      </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-4">
                      <button onClick={() => setIsAddStudentOpen(false)} className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Hủy</button>
                      <button onClick={handleAddStudentSubmit} className="px-6 py-3 rounded-2xl font-bold bg-[#2d5a2d] text-white hover:bg-[#1a3d1a] shadow-lg shadow-green-100 transition-colors">Thêm vào lớp</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL CHUYỂN LỚP --- */}
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
                          <p className="font-bold text-xs opacity-75 mt-0.5">Khóa học: {classData.course?.title}</p>
                          <p className="font-bold text-xs opacity-75">Lớp hiện tại: {classData.name}</p>
                      </div>
                  </div>
                  <div className="text-left">
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