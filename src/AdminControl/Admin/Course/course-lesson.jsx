import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// 👇 SỬA DÒNG NÀY: import từ file lesson-manager
import LessonManager from "./Lesson/lesson-manager";

// Import Service (Lùi 3 cấp)
import courseService from "../../Service/API/courseServiceAPI/course.service";

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await courseService.getCourseDetail(id);
        if (data) setCourseInfo(data);
      } catch (e) {
        console.error("Lỗi lấy thông tin khóa học:", e);
      }
    };
    fetchInfo();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 animate-in fade-in duration-500">
      <div className="bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => navigate(`/admin/courses/edit/${id}`)}
          className="..."
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase italic">
            Quản lý bài học:{" "}
            <span className="text-[#2d5a2d]">{courseInfo?.title || "..."}</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            COURSE ID: {id}
          </p>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto">
        <LessonManager courseId={id} courseTitle={courseInfo?.title} />
      </div>
    </div>
  );
}
