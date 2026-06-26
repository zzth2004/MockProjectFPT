import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Trash2, BookOpen, Users, Layers, DollarSign, 
  Video, FileText, PlayCircle, School, Calendar, ChevronRight, Plus, ExternalLink 
} from "lucide-react";

// Components
import { KLBadge } from "../../Component/Badge";

// Services & Context
import courseService from "../../Service/API/courseServiceAPI/course.service";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import { useAuth } from "../../../context/authContext";

export default function CourseDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]); 
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseDetail(id);
        setCourse(courseData);

        let listClasses = [];
        if (courseData.classes && Array.isArray(courseData.classes)) {
            listClasses = courseData.classes;
        } else {
            const response = await courseClassService.getClassesByCourse(id);
            if (Array.isArray(response)) {
                listClasses = response;
            } else if (response && Array.isArray(response.data)) {
                listClasses = response.data;
            }
        }
        setClasses(listClasses);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchDetail();
  }, [id]);

  const handleDelete = async () => {
      if(window.confirm("⚠️ Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.")){
          try {
              await courseService.deleteCourse(id);
              alert("✅ Đã xóa khóa học thành công!");
              navigate(`${basePath}/courses`);
          } catch (error) {
              alert("❌ Lỗi khi xóa: " + (error.response?.data?.message || "Không thể xóa"));
          }
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-3">
        <div className="w-10 h-10 border-4 border-[#2d5a2d] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải dữ liệu khóa học...</span>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20 p-4 md:p-8 animate-in fade-in duration-500 text-left">
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate(-1)} 
             className="w-12 h-12 rounded-2xl bg-white text-gray-500 hover:text-[#2d5a2d] hover:bg-green-50 flex items-center justify-center shadow-sm border border-gray-100/70 transition-all active:scale-95"
           >
              <ArrowLeft size={20} strokeWidth={2.5} />
           </button>
           <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tight">
                Chi tiết <span className="text-[#2d5a2d]">Khóa học</span>
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  {isTeacher ? "TEACHER PANEL" : "ADMIN PANEL"} • ID: {course.id}
              </p>
           </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
           <button 
             onClick={() => navigate(`${basePath}/courses/edit/${course.id}`)}
             className="flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
           >
              <Edit3 size={16} /> Chỉnh sửa
           </button>
           
           <button 
             onClick={handleDelete}
             className="flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 transition-all active:scale-95"
           >
              <Trash2 size={16} /> Xóa khóa học
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto items-start">
        
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* COURSE GENERAL INFO CARD */}
           <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-56 h-40 rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100/70 shadow-inner relative group">
                 {course.thumbnail ? (
                     <img src={course.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="thumbnail" />
                 ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><BookOpen size={40}/></div>
                 )}
                 <div className="absolute top-3 left-3">
                    <KLBadge type={course.isPublished ? "success" : "warning"}>
                        <span className="text-[8px] font-black uppercase tracking-widest">{course.isPublished ? "PUBLIC" : "DRAFT"}</span>
                    </KLBadge>
                 </div>
              </div>
              
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-3 py-1 rounded-xl uppercase tracking-wider">
                       Cấp độ: {course.level || "Mọi cấp độ"}
                     </span>
                 </div>
                 
                 <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight uppercase italic">{course.title}</h2>
                 
                 <p className="text-sm font-medium text-gray-500 leading-relaxed">
                   {course.description || "Không có mô tả nào dành cho khóa học này."}
                 </p>
                 
                 <div className="flex flex-wrap gap-4 pt-2">
                     <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-100">
                         <School size={16} className="text-[#2d5a2d]" /> 
                         <span className="text-xs font-black text-gray-700">{classes.length} Lớp học</span>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-100">
                         <Layers size={16} className="text-[#2d5a2d]" /> 
                         <span className="text-xs font-black text-gray-700">{course.lessons?.length || 0} Bài học</span>
                     </div>
                 </div>
              </div>
           </div>

           {/* CLASSES LIST SECTION */}
           <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80">
              <div className="flex items-center justify-between mb-6">
                  <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                         <School className="text-[#2d5a2d]" /> Lớp học đang mở
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Danh sách các lớp đang thuộc khóa học</p>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`${basePath}/classes/create`)} 
                    className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#2d5a2d] hover:bg-[#2d5a2d] hover:text-white border border-emerald-100 px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 active:scale-95"
                  >
                      <Plus size={14} strokeWidth={2.5} /> Mở lớp mới
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.length > 0 ? (
                      classes.map((cls) => (
                          <div 
                            key={cls.id} 
                            onClick={() => navigate(`${basePath}/classes/edit/${cls.id}`)}
                            className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-emerald-300 hover:bg-white transition-all duration-300 group cursor-pointer hover:shadow-md" 
                          >
                              <div className="flex justify-between items-center mb-3">
                                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border ${
                                    cls.status === 'ONGOING' 
                                      ? 'bg-green-50 text-green-700 border-green-100' 
                                      : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>
                                      {cls.status}
                                  </span>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2d5a2d] group-hover:translate-x-0.5 transition-all" />
                              </div>
                              
                              <h4 className="font-black text-gray-800 text-sm group-hover:text-[#2d5a2d] mb-2 truncate transition-colors">
                                {cls.name}
                              </h4>
                              
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                  <Calendar size={12} className="text-gray-400" /> 
                                  Khai giảng: {new Date(cls.startDate).toLocaleDateString('vi-VN')}
                              </div>
                              
                              <div className="mt-4 pt-3 border-t border-slate-100/70 flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-2xl bg-[#2d5a2d] text-white flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 uppercase">
                                      {cls.teacher?.fullName?.charAt(0) || "U"}
                                  </div>
                                  <div className="flex flex-col text-left">
                                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Giảng viên</span>
                                      <span className="text-[11px] font-bold text-gray-600 truncate mt-0.5">{cls.teacher?.fullName || "Chưa gán GV"}</span>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-span-2 text-center py-12 text-gray-400 font-bold uppercase text-xs tracking-widest bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                          Chưa có lớp học nào được mở cho khóa này.
                      </div>
                  )}
              </div>
           </div>

           {/* LESSONS LIST SECTION */}
           <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80">
              <div className="flex items-center justify-between mb-6">
                  <div>
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                         <BookOpen className="text-[#2d5a2d]" /> Nội dung khóa học
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Các bài giảng chi tiết trong khóa học</p>
                  </div>
                  
                  <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`${basePath}/courses/${id}/lessons`)}
                        className="text-[10px] font-black uppercase tracking-wider bg-gray-950 text-white hover:bg-gray-800 px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 active:scale-95"
                      >
                          <Edit3 size={12}/> Quản lý bài học
                      </button>
                  </div>
              </div>
              
              <div className="space-y-3">
                  {course.lessons && course.lessons.length > 0 ? (
                      course.lessons.map((lesson, idx) => (
                          <div 
                            key={lesson.id || idx} 
                            className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 hover:bg-white transition-all duration-300 border border-transparent hover:border-slate-200 group hover:shadow-sm"
                          >
                             {/* Index */}
                             <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#2d5a2d] shadow-inner font-black text-xs shrink-0">
                                #{idx + 1}
                             </div>
                             
                             {/* Icon container */}
                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                               lesson.type === 'video' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                             }`}>
                                {lesson.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                             </div>
                             
                             {/* Text info */}
                             <div className="flex-1 min-w-0">
                                <h4 className="font-black text-gray-800 text-sm group-hover:text-[#2d5a2d] transition-colors truncate">
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {lesson.groupName && (
                                        <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-gray-400 uppercase tracking-widest">
                                            {lesson.groupName}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold text-gray-400">
                                        ⏱️ {lesson.duration || "Video bài giảng"}
                                    </span>
                                </div>
                             </div>

                             {/* Play action */}
                             <button className="p-2.5 bg-white border border-slate-100 rounded-2xl text-gray-300 group-hover:text-[#2d5a2d] group-hover:border-emerald-200 shadow-sm hover:shadow-md transition-all active:scale-90 shrink-0">
                                <PlayCircle size={20} strokeWidth={2.5} />
                             </button>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-16 flex flex-col items-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                          <Layers size={36} className="text-gray-300 mb-3" />
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chưa có bài học nào được đăng tải</p>
                      </div>
                  )}
              </div>
           </div>

        </div>

        {/* SIDEBAR COLUMN */}
        <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 space-y-6 text-left">
                <div>
                   <h3 className="font-black text-gray-950 uppercase text-xs tracking-widest border-b border-slate-100 pb-3">
                     Thông tin kinh doanh
                   </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Giá bán gốc</span>
                      <div className="flex items-center gap-1.5 text-base font-black text-gray-700 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100/50">
                          <DollarSign size={16} className="text-gray-400" />
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                      </div>
                  </div>
                  
                  <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Giá khuyến mãi</span>
                      <div className="flex items-center gap-1.5 text-base font-black text-red-600 bg-red-50/40 px-4 py-2.5 rounded-2xl border border-red-100/50 shadow-sm">
                          <DollarSign size={16} className="text-red-400" />
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice || 0)}
                      </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100/80">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Đường dẫn tĩnh (Slug)</span>
                      <div className="flex items-center justify-between text-xs font-bold text-blue-600 bg-blue-50/40 px-4 py-3 rounded-2xl border border-blue-100/50">
                          <span className="truncate pr-2">/courses/{course.slug}</span>
                          <ExternalLink size={12} className="text-blue-400 shrink-0" />
                      </div>
                  </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}