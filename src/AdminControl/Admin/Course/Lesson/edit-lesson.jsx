import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

// Lùi 4 cấp về src
import LessonForm from "./components/LessonForm";
import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";

export default function EditLesson() {
  const { lessonId } = useParams(); // Lấy ID bài học từ URL
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lessonData, setLessonData] = useState(null);

  // 1. Tải dữ liệu bài học cũ để điền vào form
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await lessonService.getDetail(lessonId);
        if (data) setLessonData(data);
      } catch (error) {
        alert("Không tìm thấy bài học!");
        navigate(-1);
      }
    };
    fetchData();
  }, [lessonId, navigate]);

  // 2. Xử lý cập nhật
  const handleUpdate = async (formData) => {
    setIsLoading(true);
    try {
      await lessonService.update(lessonId, formData);
      alert("✅ Cập nhật bài học thành công!");
      
      // Quay lại danh sách bài học của khóa đó
      if (formData.courseId) {
        navigate(`/admin/courses/${formData.courseId}/lessons`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi server"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!lessonData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-[#2d5a2d]" size={40} />
            <p className="text-gray-400 font-bold text-sm">Đang tải dữ liệu bài học...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm text-gray-500 hover:text-[#2d5a2d] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Chỉnh sửa bài học</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LESSON ID: {lessonId}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <LessonForm 
          initialData={lessonData} // Điền dữ liệu cũ vào
          onSubmit={handleUpdate} 
          isLoading={isLoading} 
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}