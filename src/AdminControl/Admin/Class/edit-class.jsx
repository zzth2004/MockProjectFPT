import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, School, BookOpen, Clock, Loader2, Video, Users,
  CalendarCheck, ShieldCheck, GraduationCap, AlertCircle, User
} from "lucide-react";

import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext";
import userService from "../../Service/API/userServiceAPI/user.service";

export default function EditClass() {
  const { id } = useParams(); // Lấy ID lớp từ URL
  const { user } = useAuth(); // Lấy thông tin user đang login để check role
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  // Lưu thông tin giáo viên hiện tại của lớp (để hiển thị UI)
  const [currentTeacher, setCurrentTeacher] = useState(null);

  // --- 0. XÁC ĐỊNH ROLE & ĐƯỜNG DẪN ---
  const userRole = user?.role?.toLowerCase() || "";
  const isTeacher = userRole === "teacher";
  const redirectPath = isTeacher ? "/teacher/classes" : "/admin/classes";
  const roleLabel = isTeacher ? "Giảng viên" : "Quản trị viên";

  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    teacherId: "", // Quan trọng: ID này lấy từ DB về, không lấy từ User đang login
    startDate: "",
    schedule: "", 
    googleMeetLink: "",
    maxStudents: 30,
    status: "UPCOMING"
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Lấy danh sách khóa học (cho dropdown)
        const coursesRes = await courseService.getAllCourses(1, 100); 
        setCourses(coursesRes?.data || []);

        // Tải danh sách giáo viên nếu là Admin
        if (userRole === "admin") {
          const teachersRes = await userService.getTeachers(1, 100);
          setTeachers(teachersRes?.data || teachersRes || []);
        }

        // B. Lấy chi tiết lớp học cần sửa
        const classData = await courseClassService.getClassDetail(id);
        
        if (classData) {
            // Xử lý ngày tháng: Cắt lấy phần YYYY-MM-DD cho input type="date"
            const formattedDate = classData.startDate 
                ? new Date(classData.startDate).toISOString().split('T')[0] 
                : "";

            setFormData({
                name: classData.name || "",
                courseId: classData.course?.id || classData.courseId,
                teacherId: classData.teacher?.id || classData.teacherId, // Giữ ID giáo viên cũ
                startDate: formattedDate,
                schedule: classData.scheduleDescription || "", 
                googleMeetLink: classData.googleMeetLink || "",
                maxStudents: classData.maxStudents || 30,
                status: classData.status || "UPCOMING"
            });

            // Lưu object giáo viên để hiển thị avatar/tên
            setCurrentTeacher(classData.teacher);
        }

      } catch (error) {
        console.error("Lỗi:", error);
        alert("Không tìm thấy thông tin lớp học hoặc bạn không có quyền truy cập!");
        navigate(redirectPath);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id, navigate, redirectPath, userRole]);

  // --- 2. HANDLERS ---
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    // 1. Validate
    if (!formData.name || !formData.courseId || !formData.startDate) {
      alert("Vui lòng điền đủ: Tên lớp, Khóa học gốc và Ngày khai giảng!");
      return;
    }

    if (userRole === "admin" && !formData.teacherId) {
      alert("Vui lòng chọn giáo viên phụ trách!");
      return;
    }

    setIsLoading(true);
    try {
      // 2. Prepare Payload
      const payload = {
          id: Number(id),
          name: formData.name,
          courseId: Number(formData.courseId),
          maxStudents: Number(formData.maxStudents),
          status: formData.status.toUpperCase(), // Enum thường là uppercase
          scheduleDescription: formData.schedule, 
          startDate: new Date(formData.startDate).toISOString(), 
          googleMeetLink: formData.googleMeetLink,
          teacherId: Number(formData.teacherId) // Cập nhật giáo viên được chọn
      };
      
      console.log("📡 Updating Class Payload:", payload); 
      
      await courseClassService.updateClass(id, payload);
      
      alert("✅ Cập nhật thông tin lớp học thành công!");
      
      // Navigate về đúng trang danh sách theo Role
      navigate(redirectPath);
      
    } catch (error) {
      console.error("Lỗi Update:", error);
      const msg = error.response?.data?.message || "Lỗi cập nhật. Vui lòng kiểm tra lại.";
      alert(`❌ Thất bại: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper hiển thị Role giáo viên
  const getRoleDisplayName = (role) => {
      if (!role) return "Giáo viên";
      const r = role.toUpperCase();
      if (r === 'ADMIN' || r === 'QUAN_TRI') return "Quản trị viên";
      return "Giảng viên"; 
  };

  if (isFetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={30} className="animate-spin text-[#2d5a2d]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between gap-4 mb-8 sticky top-0 z-30 bg-[#F8F9FC]/90 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
           {/* Back Button điều hướng thông minh */}
           <button onClick={() => navigate(redirectPath)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm text-gray-500 transition-all">
               <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic">
                  Chỉnh sửa <span className="text-[#2d5a2d]">Lớp học</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                  <span>ID: {id}</span>
                  <span>•</span>
                  <span>{roleLabel} Portal</span>
              </div>
           </div>
        </div>
        <button 
            disabled={isLoading} 
            onClick={handleUpdate} 
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2d5a2d] hover:bg-[#1a3d1a] shadow-lg hover:shadow-xl flex items-center gap-2 transition-all disabled:opacity-70"
        >
           {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
           Lưu Thay Đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2d5a2d]/5 rounded-bl-[100px] -z-0 pointer-events-none"></div>

              <h2 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2 z-10 relative">
                  <School size={24} className="text-[#2d5a2d]"/> Thông tin chung
              </h2>
              
              <div className="z-10 relative">
                 <label className="text-[11px] font-black uppercase text-gray-400 ml-1 mb-1 block">Tên lớp hiển thị</label>
                 <input 
                    className="w-full p-4 bg-gray-50 hover:bg-white transition-colors rounded-2xl font-bold border border-transparent focus:border-[#2d5a2d] outline-none text-gray-800" 
                    value={formData.name} 
                    onChange={(e) => handleChange("name", e.target.value)} 
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10 relative">
                 <div>
                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1 mb-1 block">Lịch học</label>
                    <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-3 border border-transparent focus-within:border-[#2d5a2d]/50">
                        <Clock size={20} className="text-gray-400"/>
                        <input 
                            className="bg-transparent font-medium outline-none w-full" 
                            value={formData.schedule} 
                            onChange={(e) => handleChange("schedule", e.target.value)} 
                            placeholder="VD: Tối 2-4-6..." 
                        />
                    </div>
                 </div>
                 <div>
                    <label className="text-[11px] font-black uppercase text-gray-400 ml-1 mb-1 block">Sĩ số tối đa</label>
                    <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-3 border border-transparent focus-within:border-[#2d5a2d]/50">
                        <Users size={20} className="text-gray-400"/>
                        <input 
                            type="number" 
                            className="bg-transparent font-bold outline-none w-full" 
                            value={formData.maxStudents} 
                            onChange={(e) => handleChange("maxStudents", e.target.value)} 
                        />
                    </div>
                 </div>
              </div>

              <div className="z-10 relative">
                 <label className="text-[11px] font-black uppercase text-gray-400 ml-1 mb-1 block">Link Meet/Zoom</label>
                 <div className="flex items-center bg-blue-50/50 p-4 rounded-2xl gap-3 text-blue-700 border border-blue-100 focus-within:border-blue-300">
                    <Video size={20}/>
                    <input 
                        className="bg-transparent font-medium outline-none w-full placeholder-blue-300" 
                        value={formData.googleMeetLink} 
                        onChange={(e) => handleChange("googleMeetLink", e.target.value)} 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* CỘT PHẢI: CẤU HÌNH */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
              <h3 className="font-black text-gray-900 uppercase flex items-center gap-2">
                  <CalendarCheck size={20} className="text-orange-500"/> Thiết lập
              </h3>

              {/* 1. KHÓA HỌC */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Thuộc khóa học</label>
                 <div className="relative group">
                     <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d5a2d]" size={18}/>
                     <select 
                        className="w-full pl-12 pr-4 py-4 bg-[#2d5a2d]/5 hover:bg-[#2d5a2d]/10 rounded-2xl font-bold text-[#2d5a2d] outline-none cursor-pointer appearance-none transition-colors border border-transparent focus:border-[#2d5a2d]" 
                        value={formData.courseId} 
                        onChange={(e) => handleChange("courseId", e.target.value)}
                     >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                 </div>
              </div>

              {/* 2. GIÁO VIÊN */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                    {userRole === "admin" ? "Giáo viên phụ trách" : "Người phụ trách (Cố định)"}
                 </label>
                 
                 {userRole === "admin" ? (
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d5a2d]" size={18}/>
                      <select 
                         className="w-full pl-12 pr-4 py-4 bg-[#2d5a2d]/5 hover:bg-[#2d5a2d]/10 rounded-2xl font-bold text-[#2d5a2d] outline-none cursor-pointer appearance-none transition-colors border border-transparent focus:border-[#2d5a2d]" 
                         value={formData.teacherId} 
                         onChange={(e) => handleChange("teacherId", e.target.value)}
                      >
                         <option value="">-- Chọn giáo viên --</option>
                         {teachers.map(t => (
                           <option key={t.id} value={t.id}>
                             {t.fullName} (ID: {t.id})
                           </option>
                         ))}
                      </select>
                   </div>
                 ) : (
                   <>
                     {currentTeacher ? (
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 opacity-70">
                             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-black text-sm border-2 border-white shadow-sm flex-shrink-0">
                                 {currentTeacher.fullName ? currentTeacher.fullName.charAt(0).toUpperCase() : "T"}
                             </div>
                             <div className="flex flex-col overflow-hidden">
                                 <span className="text-sm font-black text-[#1e293b] truncate">
                                     {currentTeacher.fullName || "Unknown Teacher"}
                                 </span>
                                 <span className="text-[10px] font-bold text-gray-400 italic">
                                     ID: {currentTeacher.id} • {getRoleDisplayName(currentTeacher.role)}
                                 </span>
                             </div>
                          </div>
                     ) : (
                          <div className="p-3 bg-red-50 text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                             <AlertCircle size={14} /> Chưa gán giáo viên
                          </div>
                     )}
                   </>
                 )}
              </div>

              {/* 3. NGÀY KHAI GIẢNG */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Ngày khai giảng</label>
                 <input 
                    type="date" 
                    className="w-full p-4 bg-gray-50 hover:bg-white rounded-2xl font-bold cursor-pointer outline-none border border-transparent focus:border-[#2d5a2d]" 
                    value={formData.startDate} 
                    onChange={(e) => handleChange("startDate", e.target.value)} 
                 />
              </div>

              {/* 4. TRẠNG THÁI */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Trạng thái lớp</label>
                 <select 
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none" 
                    value={formData.status} 
                    onChange={(e) => handleChange("status", e.target.value)}
                 >
                    <option value="UPCOMING">Sắp mở (Upcoming)</option>
                    <option value="ONGOING">Đang học (Ongoing)</option>
                    <option value="FINISHED">Kết thúc (Finished)</option>
                    <option value="CANCELLED">Đã hủy (Cancelled)</option>
                 </select>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}