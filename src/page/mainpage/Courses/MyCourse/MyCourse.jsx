import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock, User, Calendar, Loader2, BookOpen } from "lucide-react";
import courseService from "../../../../AdminControl/Service/API/courseServiceAPI/course.service"

const MyCourse = () => {
  const navigate = useNavigate();
  
  // --- 1. STATES ---
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const response = await courseService.getCoursebyStudent();
        setCourses(Array.isArray(response) ? response : (response?.data || []));
      } catch (err) {
        console.error("Error fetching student courses:", err);
        setError("Không thể tải danh sách khóa học. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  // --- 3. HELPER: ĐỊNH DẠNG NGÀY ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // --- UI: LOADING STATE ---
  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#377437] animate-spin mb-4" />
        <p className="text-gray-500 font-medium italic">Đang tải danh sách khóa học của bạn...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans py-6 pb-8">

      {/* --- HEADER --- */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all duration-150"
          aria-label="Quay lại"
        >
          <ArrowLeft size={17} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
          <span
            className="hover:text-gray-700 cursor-pointer transition-colors"
            onClick={() => navigate('/courses')}
          >
            Khóa học
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">Khóa học của tôi</span>
        </nav>
      </div>

      {/* --- EMPTY STATE --- */}
      {!loading && courses.length === 0 && (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
           <BookOpen className="mx-auto w-16 h-16 text-gray-200 mb-4" />
           <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng ký khóa học nào</h3>
           <p className="text-gray-500 mb-6">Hãy khám phá các khóa học tiếng Hàn thú vị ngay nhé!</p>
           <button 
             onClick={() => navigate('/user/active-courses')}
             className="px-8 py-3 bg-[#377437] text-white rounded-xl font-bold hover:bg-[#2d5e2d] transition"
           >
             Xem danh sách khóa học
           </button>
        </div>
      )}

      {/* --- COURSE LIST (GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((item) => {
          const { course, class: classInfo, progress, isExpired } = item;
          
          return (
            <div 
              key={item.enrollmentId}
              onClick={() => !item.class?.isExpired && navigate(`/courses/mycourses/${course.id}`)}
              className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-350 flex flex-col
                ${classInfo?.isExpired ? 'opacity-75 grayscale-[0.5]' : 'hover:border-green-600/40'}`}
            >
              {/* 1. Image & Badge Section */}
              <div className="h-44 w-full bg-gray-50 overflow-hidden relative">
                 <img 
                   src={course.thumbnail || "https://byvn.net/xKdp"} 
                   alt={course.title} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                 />
                 
                 {/* Badge trạng thái */}
                 <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-black uppercase tracking-wider text-[#377437]">
                        {course.level}
                    </span>
                    {classInfo?.isExpired && (
                      <span className="px-3 py-1 bg-rose-500 text-white shadow-sm rounded-full text-[10px] font-black uppercase tracking-wider">
                        Đã kết thúc
                      </span>
                    )}
                 </div>
              </div>

              {/* 2. Content Section */}
              <div className="p-6 flex flex-col flex-1">
                 <div className="mb-4">
                    <h3 className="font-black text-gray-800 text-xl leading-snug group-hover:text-[#377437] transition-colors line-clamp-2 min-h-[3.5rem]">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-[#377437] font-bold uppercase tracking-widest mt-1 opacity-70">
                      Lớp: {classInfo?.name}
                    </p>
                 </div>

                 <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5 text-gray-500">
                       <User size={16} className="text-gray-400" />
                       <span className="text-sm font-semibold">{classInfo?.teacherName || "Giáo viên ẩn danh"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-500">
                       <Calendar size={16} className="text-gray-400" />
                       <span className="text-xs font-medium">Kết thúc: {formatDate(classInfo?.endDate)}</span>
                    </div>
                 </div>

                 {/* 3. Progress Section */}
                 <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tiến độ học tập</span>
                      <span className="text-sm font-black text-[#377437]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out
                          ${classInfo?.isExpired ? 'bg-gray-400' : 'bg-[#377437]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourse;