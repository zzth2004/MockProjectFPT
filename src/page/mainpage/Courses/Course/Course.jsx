import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const Course = () => {
  const navigate = useNavigate();

  const handleNavigate = (path, options = {}) => {
    if (!path) return;
    console.log("Here")

    const absolutePath = path.startsWith("/") ? path : `/${path}`;
    console.log("Here: ", absolutePath)

    navigate(absolutePath, {
      replace: false,
      ...options,
    });
  };

  return (
    // Đã chỉnh: Xóa px-6, thêm -ml-2 để nút Back lùi sát vào lề trái hơn nữa
    <div className="w-full min-h-screen font-sans pt-2 pb-8">
      {/* --- HEADER --- */}
      <header className="flex items-center gap-2 mb-6 -ml-2">
        {/* Nút Back */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all border border-gray-200"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <span
            className="opacity-50 hover:opacity-100 cursor-pointer transition"
            onClick={() => navigate("/user/dashboard")}
          >
            Home
          </span>
          <ChevronRight size={18} className="text-gray-400" />
          <span>Course</span>
        </div>
      </header>

      {/* --- CONTENT: 2 CARD NHỎ --- */}
      <div className="flex flex-col gap-4 max-w-4xl">
        {/* Card 1: General Learning */}
        <div
          onClick={() => handleNavigate("/courses/general-course")}
          className="group bg-white h-28 px-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-blue-100 flex items-center gap-5"
        >
          {/* Icon Box */}
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen size={24} />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
            General Learning
          </h2>
        </div>

        {/* Card 2: My Course */}
        <div
          onClick={() => handleNavigate("/courses/mycourses")}
          className="group bg-white h-28 px-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border border-transparent hover:border-emerald-100 flex items-center gap-5"
        >
          {/* Icon Box */}
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <GraduationCap size={24} />
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
            My Course
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Course;
