import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Video, BookOpen, ClipboardList, 
  Send, MessageCircle, Bell, Loader2, ExternalLink 
} from "lucide-react";
import ChatWidget from "../../../../components/ChatWidget.jsx"; 

import courseService from "../../../../AdminControl/Service/API/courseServiceAPI/course.service.jsx"; 

const LessonDetail = () => {
  const { courseId } = useParams(); 
  const navigate = useNavigate();

  // --- STATES ---
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

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
         <button 
           onClick={() => navigate('/courses/mycourses')} 
           className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 transition-all shadow-sm"
         >
           <ChevronLeft size={20} />
         </button>
         
         <div className="flex gap-3 ml-auto">
            <button className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 text-gray-600">
                <MessageCircle size={20} />
            </button>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
           <div className="bg-[#E9F5EB] rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                 <ClipboardList size={20} className="text-gray-900"/>
                 <h3 className="font-bold text-lg text-gray-900">Tài nguyên khóa học</h3>
              </div>
              <div className="space-y-3 mb-6">
                 <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-100 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Từ vựng:</span>
                    <span className="text-sm font-bold text-[#377437]">{courseData.stats?.totalVocab} từ</span>
                 </div>
                 <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-100 shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Ngữ pháp:</span>
                    <span className="text-sm font-bold text-[#377437]">{courseData.stats?.totalGrammar} mẫu</span>
                 </div>
                 <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-green-100 shadow-sm">
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

           {/* Instructor Card */}
           <div className="bg-[#377437] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              
              <h3 className="text-[10px] font-bold opacity-70 uppercase tracking-[2px] mb-4">GIẢNG VIÊN</h3>
              <div className="flex items-center gap-4 mb-6">
                <img 
                    src={courseData.createdBy?.avatar || "https://ui-avatars.com/api/?name=Teacher"} 
                    className="w-14 h-14 rounded-full border-2 border-white/30 object-cover"
                    alt="avatar"
                />
                <div>
                    <div className="text-lg font-bold leading-tight">{courseData.createdBy?.fullName}</div>
                    <div className="text-xs opacity-70">{courseData.createdBy?.email}</div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowChat(!showChat)}
                className="w-full bg-white text-[#377437] hover:bg-green-50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                 <Send size={18} />
                 Liên hệ ngay
              </button>
           </div>
        </div>

      </div>

      {/* --- CHAT WIDGET POPUP --- */}
      {showChat && (
        <ChatWidget 
            onClose={() => setShowChat(false)} 
            teacherId={courseData.createdBy?.id}
            courseName={courseData.title}
        />
      )}

    </div>
  );
};

export default LessonDetail;