import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ChevronRight, Video, BookOpen, ClipboardList, 
  Bell, Loader2, ExternalLink, X, Mail, User, GraduationCap, ChevronLeft
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import courseService from "../../../../AdminControl/Service/API/courseServiceAPI/course.service.jsx"; 

// ─── TEACHER MODAL ───────────────────────────────────────────────────────────
const TeacherModal = ({ teacher, courseName, onClose }) => {
  const safeTeacher = teacher || {};
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl border border-gray-205 w-full max-w-sm overflow-hidden"
        >
          {/* Header xanh */}
          <div className="bg-[#377437] p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 bottom-0 w-20 h-20 bg-white/5 rounded-full blur-xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X size={15} />
            </button>

            <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/60 mb-4">Thông tin giảng viên</p>

            {/* Avatar + tên */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <img
                  src={safeTeacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeTeacher.fullName || "GV")}&background=ffffff&color=377437&bold=true`}
                  alt={safeTeacher.fullName}
                  className="w-20 h-20 rounded-xl border-2 border-white/30 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white leading-tight">{safeTeacher.fullName || "Giảng viên"}</h2>
                <p className="text-white/60 text-xs mt-0.5 font-medium">Giảng viên khóa học</p>
              </div>
            </div>
          </div>

          {/* Body thông tin */}
          <div className="p-6 space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-[#377437]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Email</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{safeTeacher.email || "Chưa cập nhật"}</p>
              </div>
            </div>

            {/* Khóa học đang dạy */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={16} className="text-[#377437]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Khóa học</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{courseName || "—"}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-[#377437]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Vai trò</p>
                <p className="text-sm font-semibold text-gray-800">Giảng viên</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-xl bg-[#377437] hover:bg-green-800 text-white font-bold text-sm transition-all active:scale-95"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const LessonDetail = () => {
  const { courseId } = useParams(); 
  const navigate = useNavigate();

  // --- STATES ---
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Gọi hàm API bạn cung cấp
        const data = await courseService.getCourseDetailforEnrollment(courseId);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  // --- HELPERS ---
  const getEnrolledClass = () => courseData?.classes?.[0] || null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F7FA]">
        <Loader2 className="animate-spin text-[#377437]" size={40} />
      </div>
    );
  }

  if (!courseData) return <div className="p-10 text-center">Không tìm thấy thông tin khóa học.</div>;

  const currentClass = getEnrolledClass();

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8 bg-[#F5F7FA] px-4 md:px-0 relative">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/courses/mycourses')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all duration-150"
            aria-label="Quay lại"
          >
            <ArrowLeft size={17} />
          </button>
          <nav className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
            <span
              className="hover:text-gray-700 cursor-pointer transition-colors"
              onClick={() => navigate('/courses/mycourses')}
            >
              Khóa học của tôi
            </span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-gray-800 font-semibold line-clamp-1 max-w-xs">{courseData?.title}</span>
          </nav>
        </div>

        <div className="flex gap-3">
           <button className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600 relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
           </button>
        </div>
      </div>

      {/* --- COURSE TITLE --- */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
        {courseData.title}
      </h1>
      <p className="text-gray-500 mb-6 text-sm italic">{courseData.description}</p>

      {/* --- MAIN LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === CỘT TRÁI (2/3) === */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Online Class Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-green-100 bg-green-50/30 rounded-xl p-4">
                 <div className="flex items-center gap-3 w-full">
                    <div className="p-3 bg-[#377437] rounded-lg text-white shadow-md">
                        <Video size={24}/>
                    </div>
                    <div>
                       <h3 className="font-bold text-gray-900 text-lg">Google Meet Online Class</h3>
                       <p className="text-sm text-gray-600 font-medium">
                          {currentClass?.scheduleDescription || "Chưa cập nhật lịch học"}
                       </p>
                    </div>
                 </div>
                 <button 
                    disabled={!currentClass?.googleMeetLink}
                    onClick={() => window.open(currentClass?.googleMeetLink, '_blank')}
                    className="bg-[#377437] hover:bg-green-800 text-white text-sm font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-900/20 whitespace-nowrap disabled:bg-gray-300"
                 >
                    {currentClass?.googleMeetLink ? "Vào học ngay" : "Chờ Link từ GV"}
                 </button>
             </div>
          </div>

          {/* Lesson List (Map từ lessons API) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
             <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-[#377437]"/>
                <h3 className="font-bold text-lg text-gray-900">Nội dung bài học ({courseData.lessons?.length})</h3>
             </div>
             <div className="flex flex-col gap-3">
                {courseData.lessons?.map((lesson, index) => (
                   <div 
                    key={lesson.id} 
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-100 transition-all cursor-pointer"
                    onClick={() => navigate(`/learning/${courseId}/lesson/${lesson.id}`)}
                   >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-xs font-bold text-[#377437] border border-green-100">
                            {index + 1}
                        </span>
                        <span className="font-semibold text-gray-700">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.isPreview && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Xem trước</span>}
                        <ChevronLeft size={16} className="rotate-180 text-gray-400 group-hover:text-[#377437]" />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* === CỘT PHẢI (1/3) === */}
        <div className="flex flex-col gap-6">
           
           {/* Class Materials & Stats */}
           <div className="bg-[#E9F5EB]/60 rounded-2xl p-6 border border-green-200/80">
              <div className="flex items-center gap-2 mb-4">
                 <ClipboardList size={20} className="text-gray-900"/>
                 <h3 className="font-bold text-lg text-gray-900">Tài nguyên khóa học</h3>
              </div>
              <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-200/60">
                    <span className="text-sm text-gray-600 font-medium">Từ vựng:</span>
                    <span className="text-sm font-bold text-[#377437]">{courseData.stats?.totalVocab} từ</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-200/60">
                    <span className="text-sm text-gray-600 font-medium">Ngữ pháp:</span>
                    <span className="text-sm font-bold text-[#377437]">{courseData.stats?.totalGrammar} mẫu</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-200/60">
                    <span className="text-sm text-gray-600 font-medium">Bài tập:</span>
                    <span className="text-sm font-bold text-[#377437]">{courseData.stats?.totalExercises} bài</span>
                  </div>
              </div>

              <div className="border-t border-green-200 pt-4">
                 <h4 className="font-bold text-gray-900 text-sm mb-1">Google Classroom</h4>
                 <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Sử dụng Classroom để nộp bài tập và thảo luận cùng lớp học.
                 </p>
                 <button 
                    onClick={() => window.open(currentClass?.googleClassroomLink, '_blank')}
                    className="w-full bg-[#377437] hover:bg-green-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                 >
                    Mở Google Classroom <ExternalLink size={14} />
                 </button>
              </div>
           </div>

           {/* Instructor Card — click to open modal */}
            <div
              onClick={() => setShowTeacherModal(true)}
              className="bg-[#377437] rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:bg-[#2d5e2d] active:scale-[0.99] transition-all duration-200 group border border-[#2b592b]"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-6 bottom-0 w-16 h-16 bg-white/5 rounded-full blur-xl" />

              <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-[2px] mb-4 relative z-10">GIẢNG VIÊN</h3>
              <div className="flex items-center gap-4 relative z-10">
                <img
                    src={courseData.createdBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(courseData.createdBy?.fullName || 'GV')}&background=ffffff&color=377437&bold=true`}
                    className="w-14 h-14 rounded-full border-2 border-white/30 object-cover group-hover:border-white/60 transition-all"
                    alt="avatar"
                />
                <div>
                    <div className="text-lg font-bold leading-tight">{courseData.createdBy?.fullName}</div>
                    <div className="text-xs opacity-70">{courseData.createdBy?.email}</div>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-white/50 font-semibold uppercase tracking-widest relative z-10 group-hover:text-white/70 transition-colors">
                Nhấn để xem thông tin chi tiết →
              </p>
           </div>
        </div>

      </div>

      {/* --- TEACHER MODAL --- */}
      {showTeacherModal && (
        <TeacherModal
          teacher={courseData.createdBy}
          courseName={courseData.title}
          onClose={() => setShowTeacherModal(false)}
        />
      )}

    </div>
  );
};

export default LessonDetail;