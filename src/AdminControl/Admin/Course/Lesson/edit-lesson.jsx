import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen, Search } from "lucide-react";

import LessonForm from "./components/LessonForm";
import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";
import courseService from "../../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../../context/authContext";

export default function EditLesson() {
  const { lessonId: id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [lessonData, setLessonData] = useState(null);

  // States for course selection
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // 1. Xác định Role
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  // 2. Fetch dữ liệu cũ
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonService.getDetailLesson(id);
        setLessonData(data);
        setSelectedCourseId(data.courseId || "");
      } catch (error) {
        alert("Không tìm thấy bài học!");
        navigate(`${basePath}/lessons`);
      }
    };
    fetchLesson();
  }, [id, navigate, basePath]);

  // 3. Logic lấy danh sách khóa học
  const loadCourses = async (query = "") => {
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

  const handleUpdate = async (formData) => {
    setIsLoading(true);
    try {
      await lessonService.update(id, formData);
      alert("✅ Cập nhật thành công!");
      
      // Nếu có ID khóa học, quay về chi tiết khóa học đó
      if (formData.courseId) {
          navigate(`${basePath}/courses/${formData.courseId}/detail`);
      } else {
          navigate(-1);
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi cập nhật";
      alert(`❌ Thất bại: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lessonData) return (
      <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#2d5a2d]"/>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500 text-left">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Chỉnh sửa bài học</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">LESSON ID: {id}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* PHẦN 1: CHỌN KHÓA HỌC */}
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

        {/* PHẦN 2: FORM CHI TIẾT */}
        <div>
          <div className="flex items-center gap-2 mb-4 ml-2">
            <div className="w-6 h-6 rounded-full bg-[#2d5a2d] text-white flex items-center justify-center text-[10px] font-bold">
              2
            </div>
            <h2 className="font-black uppercase text-sm text-gray-400 italic">Chi tiết nội dung</h2>
          </div>

          <LessonForm 
            initialData={lessonData} 
            onSubmit={handleUpdate} 
            isLoading={isLoading} 
            onCancel={() => navigate(-1)}
            preSelectedCourseId={selectedCourseId}
          />
        </div>
      </div>
    </div>
  );
}