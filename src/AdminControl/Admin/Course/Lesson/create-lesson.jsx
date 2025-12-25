import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Search, Loader2 } from "lucide-react";

// Import Services

import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";
import courseService from "../../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../../context/authContext";

// Import Component Form
import LessonForm from "./components/LessonForm"; 

export default function CreateLesson() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Xác định Role & BasePath
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  // 2. Lấy ID khóa học nếu đi từ trang "Khóa học chi tiết"
  const { preSelectedCourseId, courseTitle } = location.state || {};

  // --- STATES ---
  const [selectedCourseId, setSelectedCourseId] = useState(preSelectedCourseId || "");
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 3. LOGIC LẤY DANH SÁCH KHÓA HỌC
  const loadCourses = async (query = "") => {
    if (preSelectedCourseId) return; 
    setIsFetching(true);
    try {
      const response = await courseService.getAllCourses(1, 100, query);
      const cleanList = Array.isArray(response) ? response : response?.data || [];
      setCourses(cleanList);
    } catch (error) {
      console.error("Lỗi nạp khóa học:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // 4. XỬ LÝ KHI NHẤN LƯU
  const handleCreate = async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        courseId: Number(selectedCourseId), 
      };

      // 👇 SỬA Ở ĐÂY: Gọi hàm "create" thay vì "createLesson"
      // (Để khớp với file lesson.service.js cũ của bạn)
      await lessonService.create(payload); 
      
      alert("✅ Tạo bài học thành công!");
      
      // Điều hướng về trang chi tiết khóa học
      navigate(`${basePath}/courses/${selectedCourseId}/detail`); 
      
    } catch (error) {
      const msg = error.response?.data?.message || "Không thể tạo bài học (Lỗi 400/500)";
      alert("❌ Lỗi: " + msg);
      console.error("Chi tiết lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 md:p-6 text-left animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Thêm bài học mới</h1>
          {preSelectedCourseId ? (
            <p className="text-[10px] font-bold text-[#2d5a2d] bg-green-50 px-2 py-1 rounded inline-block mt-1 uppercase">
              Khóa học hiện tại: {courseTitle} (ID: {preSelectedCourseId})
            </p>
          ) : (
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
               {isTeacher ? "Teacher Portal" : "Admin Portal"}
             </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* PHẦN 1: CHỌN KHÓA HỌC */}
        {!preSelectedCourseId && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 text-[#2d5a2d]">
                <BookOpen size={22} className="stroke-[2.5px]" />
                <h2 className="font-black uppercase text-sm italic">1. Chọn khóa học đích</h2>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="text"
                  placeholder="Tìm tên khóa học..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#2d5a2d]/10 font-bold text-xs outline-none"
                  onChange={(e) => loadCourses(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              {isFetching && (
                <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 animate-spin text-[#2d5a2d]" size={18} />
              )}
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className={`w-full p-4 rounded-2xl bg-gray-50 border-2 transition-all font-bold text-sm appearance-none cursor-pointer outline-none
                  ${selectedCourseId ? "border-[#2d5a2d] text-gray-900" : "border-transparent text-gray-400"}
                `}
              >
                <option value="">-- Click để chọn khóa học từ danh sách --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>📚 {c.title} (ID: {c.id})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* PHẦN 2: FORM CHI TIẾT */}
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 ml-2">
            <div className="w-6 h-6 rounded-full bg-[#2d5a2d] text-white flex items-center justify-center text-[10px] font-bold">
                {!preSelectedCourseId ? "2" : "1"}
            </div>
            <h2 className="font-black uppercase text-sm text-gray-400 italic">Chi tiết nội dung</h2>
          </div>

          <LessonForm
            onSubmit={handleCreate}
            isLoading={isLoading}
            onCancel={() => navigate(-1)}
            preSelectedCourseId={selectedCourseId} 
          />
        </div>
      </div>
    </div>
  );
}