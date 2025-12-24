import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, School, BookOpen, Clock, Loader2, Video, Users 
} from "lucide-react";

import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";

export default function EditClass() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [courses, setCourses] = useState([]);
  
  // Lưu thông tin giáo viên hiện tại của lớp để hiển thị
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    teacherId: "", // Lưu ID để gửi lại backend
    startDate: "",
    schedule: "", // Map với scheduleDescription
    googleMeetLink: "",
    maxStudents: 30,
    status: "UPCOMING"
  });

  // --- HÀM HELPER: HIỂN THỊ CHỨC VỤ ---
  const getRoleDisplayName = (role) => {
      if (!role) return "Giáo viên";
      const r = role.toUpperCase();
      if (r === 'ADMIN' || r === 'QUAN_TRI') return "Quản trị viên";
      if (r === 'TEACHER' || r === 'GIANG_VIEN') return "Giảng viên";
      return role; 
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Lấy danh sách khóa học (để đổ vào dropdown)
        const coursesRes = await courseService.getAllCourses(1, 100); 
        setCourses(coursesRes?.data || []);

        // B. Lấy chi tiết lớp học cần sửa
        const classData = await courseClassService.getClassDetail(id);
        
        if (classData) {
            // Xử lý ngày tháng: Cắt lấy phần YYYY-MM-DD
            const formattedDate = classData.startDate 
                ? new Date(classData.startDate).toISOString().split('T')[0] 
                : "";

            setFormData({
                name: classData.name || "",
                courseId: classData.course?.id || classData.courseId,
                teacherId: classData.teacher?.id || classData.teacherId, // Giữ nguyên ID giáo viên cũ
                startDate: formattedDate,
                schedule: classData.scheduleDescription || "", // Map ngược từ DB về form
                googleMeetLink: classData.googleMeetLink || "",
                maxStudents: classData.maxStudents || 30,
                status: classData.status || "UPCOMING"
            });

            // Lưu object giáo viên để hiển thị UI
            setCurrentTeacher(classData.teacher);
        }

      } catch (error) {
        console.error("Lỗi:", error);
        alert("Không tìm thấy thông tin lớp học!");
        navigate("/admin/classes");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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

    setIsLoading(true);
    try {
      // 2. TẠO PAYLOAD "SẠCH" (Không dùng ...formData để tránh gửi dữ liệu thừa)
      const payload = {
          id: Number(id), // Gửi kèm ID cho chắc chắn
          
          // Các trường cơ bản
          name: formData.name,
          courseId: Number(formData.courseId),      // Ép kiểu Số
          maxStudents: Number(formData.maxStudents), // Ép kiểu Số
          
          // 👇 QUAN TRỌNG: Ép status thành CHỮ HOA (Backend Enum thường là UPCOMING)
          status: formData.status.toUpperCase(), 

          // 👇 QUAN TRỌNG: Map đúng tên trường trong Entity
          scheduleDescription: formData.schedule, 
          
          // Convert ngày sang ISO String
          startDate: new Date(formData.startDate).toISOString(), 
          
          googleMeetLink: formData.googleMeetLink,
          
          // Ép kiểu TeacherId thành Số
          teacherId: Number(formData.teacherId)
      };
      
      console.log("📡 Payload CHUẨN gửi đi:", payload); 
      
      // Gọi API
      await courseClassService.updateClass(id, payload);
      
      alert("✅ Cập nhật thành công!");
      navigate("/admin/classes");
      
    } catch (error) {
      console.error("Lỗi Update:", error);
      const msg = error.response?.data?.message || "Lỗi cập nhật. Vui lòng kiểm tra lại.";
      alert(`❌ Thất bại: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang tải dữ liệu lớp...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between gap-4 mb-8 sticky top-0 z-30 bg-[#F8F9FC]/90 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm text-gray-500"><ArrowLeft size={20} /></button>
           <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic">Sửa <span className="text-[#2d5a2d]">Lớp học</span></h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">ID: {id}</p>
           </div>
        </div>
        <button disabled={isLoading} onClick={handleUpdate} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2d5a2d] hover:bg-[#1a3d1a] shadow-lg flex items-center gap-2">
           {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
              <h2 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2"><School size={24} className="text-[#2d5a2d]"/> Thông tin lớp học</h2>
              
              <div>
                 <label className="text-[11px] font-black uppercase text-gray-400">Tên lớp học</label>
                 <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#2d5a2d]/20" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-[11px] font-black uppercase text-gray-400">Lịch học</label>
                    <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-2">
                        <Clock size={18} className="text-gray-400"/>
                        <input className="bg-transparent font-medium outline-none w-full" value={formData.schedule} onChange={(e) => handleChange("schedule", e.target.value)} placeholder="VD: Tối 2-4-6..." />
                    </div>
                 </div>
                 <div>
                    <label className="text-[11px] font-black uppercase text-gray-400">Sĩ số</label>
                    <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-2">
                        <Users size={18} className="text-gray-400"/>
                        <input type="number" className="bg-transparent font-bold outline-none w-full" value={formData.maxStudents} onChange={(e) => handleChange("maxStudents", e.target.value)} />
                    </div>
                 </div>
              </div>

              <div>
                 <label className="text-[11px] font-black uppercase text-gray-400">Link Meet/Zoom</label>
                 <div className="flex items-center bg-blue-50 p-4 rounded-2xl gap-2 text-blue-700">
                    <Video size={18}/>
                    <input className="bg-transparent font-medium outline-none w-full placeholder-blue-300" value={formData.googleMeetLink} onChange={(e) => handleChange("googleMeetLink", e.target.value)} />
                 </div>
              </div>
           </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
              <h3 className="font-black text-gray-900 uppercase">Thiết lập</h3>

              {/* 1. KHÓA HỌC */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Thuộc khóa học</label>
                 <div className="relative">
                     <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d5a2d]" size={18}/>
                     <select className="w-full pl-12 pr-4 py-4 bg-[#2d5a2d]/5 rounded-2xl font-bold text-[#2d5a2d] outline-none cursor-pointer appearance-none" value={formData.courseId} onChange={(e) => handleChange("courseId", e.target.value)}>
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                 </div>
              </div>

              {/* 2. GIÁO VIÊN (READ-ONLY) */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Người phụ trách (Hiện tại)</label>
                 
                 {currentTeacher ? (
                     <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm opacity-80">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl border-2 border-white shadow-sm flex-shrink-0">
                            {currentTeacher.fullName ? currentTeacher.fullName.charAt(0).toUpperCase() : "T"}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[15px] font-black text-[#1e293b] truncate">
                                {currentTeacher.fullName || "Unknown Teacher"}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 italic uppercase tracking-wider">
                                {getRoleDisplayName(currentTeacher.role)}
                            </span>
                        </div>
                     </div>
                 ) : (
                     <div className="p-4 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold text-center border border-gray-200">
                        Chưa gán giáo viên
                     </div>
                 )}
                 <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">
                    * Không thể thay đổi người phụ trách khi sửa lớp.
                 </p>
              </div>

              {/* 3. NGÀY KHAI GIẢNG */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Ngày khai giảng</label>
                 <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none" value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
              </div>

              {/* 4. TRẠNG THÁI */}
              <div>
                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Trạng thái</label>
                 <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none" value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                    <option value="UPCOMING">Sắp mở</option>
                    <option value="ONGOING">Đang học</option>
                    <option value="FINISHED">Kết thúc</option>
                    <option value="CANCELLED">Đã hủy</option>
                 </select>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}