import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import LessonForm from "./components/LessonForm";
import lessonService from "../../../Service/API/lessonServiceAPI/lesson.service";
import { useAuth } from "../../../../context/authContext";

export default function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [lessonData, setLessonData] = useState(null);

  // 1. Xác định Role
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  // 2. Fetch dữ liệu cũ
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await lessonService.getLessonDetail(id);
        setLessonData(data);
      } catch (error) {
        alert("Không tìm thấy bài học!");
        navigate(`${basePath}/lessons`);
      }
    };
    fetchLesson();
  }, [id, navigate, basePath]);

  const handleUpdate = async (formData) => {
    setIsLoading(true);
    try {
      await lessonService.updateLesson(id, formData);
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
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic">Chỉnh sửa bài học</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">LESSON ID: {id}</p>
        </div>
      </div>

      <LessonForm 
        initialData={lessonData} 
        onSubmit={handleUpdate} 
        isLoading={isLoading} 
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}