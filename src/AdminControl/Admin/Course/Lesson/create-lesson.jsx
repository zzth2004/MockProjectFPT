import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Lùi 4 cấp về src để import component và service
import LessonForm from "./components/LessonForm";

import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";

export default function CreateLesson() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Lấy dữ liệu ID khóa học được truyền từ trang trước (LessonManager)
  const { preSelectedCourseId, courseTitle } = location.state || {};

  const handleCreate = async (formData) => {
    setIsLoading(true);
    try {
      // Đảm bảo có courseId trong payload gửi đi
      const payload = {
          ...formData,
          courseId: preSelectedCourseId // Ưu tiên lấy ID từ state truyền sang
      };
      
      await lessonService.create(payload);
      alert("✅ Tạo bài học thành công!");
      
      // Logic quay lại trang cũ thông minh:
      // Nếu biết ID khóa học -> Quay lại danh sách bài của khóa đó
      if (preSelectedCourseId) {
        navigate(`/admin/courses/${preSelectedCourseId}/lessons`);
      } else {
        navigate(-1); // Quay lại trang trước bất kỳ
      }
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi tạo bài học: " + (error.response?.data?.message || "Lỗi không xác định"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm text-gray-500 hover:text-[#2d5a2d] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Thêm bài học mới</h1>
          {courseTitle && (
            <p className="text-xs font-bold text-[#2d5a2d] bg-green-50 px-2 py-1 rounded-md inline-block mt-1">
              Thuộc khóa: {courseTitle}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <LessonForm 
          onSubmit={handleCreate} 
          isLoading={isLoading} 
          onCancel={() => navigate(-1)}
          preSelectedCourseId={preSelectedCourseId} // Truyền ID xuống form
        />
      </div>
    </div>
  );
}