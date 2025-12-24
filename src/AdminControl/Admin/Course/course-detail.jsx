import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit3, Trash2, BookOpen, Users, Layers, DollarSign, 
  Video, FileText, PlayCircle, School, Calendar, ChevronRight 
} from "lucide-react";

// Components
import { KLBadge } from "../../Component/Badge";

// Services
import courseService from "../../Service/API/courseServiceAPI/course.service";
import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";

export default function CourseDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]); // State lưu danh sách lớp học
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy chi tiết khóa học
        const courseData = await courseService.getCourseDetail(id);
        setCourse(courseData);

        // 2. Lấy danh sách lớp học
        let listClasses = [];
        
        // Ưu tiên 1: Nếu API getDetail đã trả về sẵn mảng classes
        if (courseData.classes && Array.isArray(courseData.classes)) {
            listClasses = courseData.classes;
        } 
        // Ưu tiên 2: Gọi API riêng để lấy lớp theo khóa học
        else {
            console.log("🔄 Đang gọi API lấy danh sách lớp...");
            const response = await courseClassService.getClassesByCourse(id);
            console.log("🔍 Kết quả API lớp học:", response);

            // 👇 LOGIC FIX: Kiểm tra kỹ xem response là mảng hay object
            if (Array.isArray(response)) {
                listClasses = response; // Nếu service trả về mảng luôn
            } else if (response && Array.isArray(response.data)) {
                listClasses = response.data; // Nếu service trả về object bọc data
            }
        }

        setClasses(listClasses);

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        // alert("Có lỗi khi tải dữ liệu!"); // Có thể bỏ alert để đỡ phiền
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchDetail();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang tải dữ liệu...</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#F8F9FC]/90 backdrop-blur-sm z-30 py-2">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white text-gray-500 hover:bg-gray-100 hover:text-[#2d5a2d] flex items-center justify-center shadow-sm">
              <ArrowLeft size={20} />
           </button>
           <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic">Chi tiết khóa học</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {course.id} • Created by {course.createdBy?.fullName || "Admin"}</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
             className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center gap-2"
           >
              <Edit3 size={18} /> Chỉnh sửa
           </button>
           <button className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 flex items-center gap-2">
              <Trash2 size={18} /> Xóa
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* 1. INFO CARD */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex gap-6">
                 <div className="w-48 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                    {course.thumbnail ? (
                        <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen size={32}/></div>
                    )}
                 </div>
                 
                 <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <KLBadge type={course.isPublished ? "success" : "warning"}>
                            {course.isPublished ? "PUBLIC" : "DRAFT"}
                        </KLBadge>
                        <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-1 rounded uppercase">{course.level}</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{course.title}</h2>
                    <p className="text-sm font-medium text-gray-500 line-clamp-2">{course.description}</p>
                    
                    <div className="flex gap-6 pt-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Users size={16} /> {classes.length} Lớp học
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Layers size={16} /> {course.lessons?.length || 0} Bài học
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* 👇 2. DANH SÁCH LỚP HỌC (MỚI THÊM) */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                     <School className="text-[#2d5a2d]" /> Lớp học đang mở
                  </h3>
                
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.length > 0 ? (
                      classes.map((cls) => (
                          <div key={cls.id} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group cursor-pointer" onClick={() => navigate(`/admin/classes/edit/${cls.id}`)}>
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase ${cls.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {cls.status}
                                  </span>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2d5a2d]" />
                              </div>
                              <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{cls.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                  <Calendar size={12} /> 
                                  Khai giảng: {new Date(cls.startDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                      {cls.teacher?.fullName?.charAt(0) || "U"}
                                  </div>
                                  <span className="text-xs font-bold text-gray-600 truncate">{cls.teacher?.fullName || "Chưa gán GV"}</span>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-span-2 text-center py-8 text-gray-400 font-medium text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          Chưa có lớp học nào được mở cho khóa này.
                      </div>
                  )}
              </div>
           </div>

           {/* 3. DANH SÁCH BÀI HỌC (GIỮ NGUYÊN) */}
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                     <BookOpen className="text-[#2d5a2d]" /> Nội dung khóa học
                  </h3>
                  <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                      {course.lessons?.length || 0} bài
                  </span>
              </div>
              
              <div className="space-y-3">
                  {course.lessons && course.lessons.length > 0 ? (
                      course.lessons.map((lesson, idx) => (
                         <div key={lesson.id || idx} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 group">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2d5a2d] shadow-sm font-black text-sm border border-gray-100">
                               {idx + 1}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                               {lesson.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="flex-1">
                               <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#2d5a2d] transition-colors">{lesson.title}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                   {lesson.groupName && (
                                       <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-400 uppercase tracking-wide">
                                           {lesson.groupName}
                                       </span>
                                   )}
                                   <span className="text-[10px] font-medium text-gray-400">
                                       {lesson.duration || "Video bài giảng"}
                                   </span>
                               </div>
                            </div>
                            <button className="p-2 bg-white rounded-full text-gray-300 hover:text-[#2d5a2d] shadow-sm hover:shadow-md transition-all">
                               <PlayCircle size={20} />
                            </button>
                         </div>
                      ))
                  ) : (
                      <div className="text-center py-12 flex flex-col items-center border-2 border-dashed border-gray-100 rounded-3xl">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Layers size={24} className="text-gray-300" />
                         </div>
                         <p className="text-sm font-bold text-gray-400">Chưa có bài học nào.</p>
                      </div>
                  )}
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Thông tin bán hàng</h3>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Giá gốc</label>
                    <div className="flex items-center gap-2 text-lg font-black text-gray-800">
                        <DollarSign size={18} className="text-gray-400" />
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Giá khuyến mãi</label>
                    <div className="flex items-center gap-2 text-lg font-black text-red-500">
                        <DollarSign size={18} className="text-red-300" />
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice || 0)}
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Slug</label>
                    <p className="text-xs font-medium text-blue-600 truncate mt-1 bg-blue-50 p-2 rounded-lg">
                        /courses/{course.slug}
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}