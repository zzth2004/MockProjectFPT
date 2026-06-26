import React, { useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, PlayCircle, Loader2, BookOpen } from "lucide-react";

// Logic & Services
import useCallApiHandler from "../../../../hooks/HookHander/useCallApiHandler";
import lessonService from "../../../../AdminControl/Service/API/lessonServiceAPI/lesson.service";

const GeneralLearning = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  // --- 1. FETCH DATA ---
  const fetchLessonsFn = useCallback(
    () => lessonService.getLessonbyCourseSlug(slug),
    [slug]
  );

  const { data: response, loading, call: refreshLessons } = useCallApiHandler(fetchLessonsFn);

  useEffect(() => {
    if (slug) refreshLessons();
  }, [slug, refreshLessons]);

  // --- 2. XỬ LÝ DỮ LIỆU ---
  const lessons = useMemo(() => {
    // Ưu tiên lấy items từ response nestjs chuẩn
    return response?.items || response?.data || [];
  }, [response]);

  const handleUnitClick = (lessonId) => {
    // Chuyển tới route học bài học chi tiết
    console.log("Navigating to lesson ID:", lessonId);
    navigate(`/courses/learning/${lessonId}`);
  };

  // --- 3. GIAO DIỆN ---
  return (
    <div className="w-full min-h-screen bg-gray-50/30 font-sans pt-6 pb-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER / BREADCRUMB --- */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-green-700 hover:border-green-200 hover:shadow-md active:scale-90 transition-all duration-150"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <span
              className="text-gray-400 hover:text-green-700 cursor-pointer transition"
              onClick={() => navigate("/courses")}
            >
              Course
            </span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-gray-400">General Learning</span>
            <ChevronRight size={16} className="text-gray-300" />
            <span className="text-green-700 italic">{slug?.replace(/-/g, " ")}</span>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4">
             <h2 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter flex items-center gap-2">
                <BookOpen size={20} className="text-green-700" /> 
                Danh sách bài học 
                <span className="text-gray-300 ml-2 font-bold not-italic text-sm">({lessons.length})</span>
             </h2>
          </div>

          {loading ? (
            /* --- LOADING STATE --- */
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-green-700" size={40} />
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Đang tải lộ trình...</p>
            </div>
          ) : lessons.length === 0 ? (
            /* --- EMPTY STATE --- */
            <div className="bg-white border-2 border-dashed border-gray-250 rounded-2xl py-24 text-center">
              <PlayCircle size={56} strokeWidth={1} className="mx-auto text-gray-100 mb-4" />
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Hiện tại chưa có bài học nào</p>
            </div>
          ) : (
            /* --- LIST LESSONS --- */
            <div className="grid grid-cols-1 gap-4">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  onClick={() => handleUnitClick(lesson.id)}
                  className="
                    group bg-white p-5 rounded-2xl cursor-pointer
                    border border-gray-200 hover:border-green-600/40
                    transition-all duration-300 flex items-center justify-between active:scale-[0.99]
                  "
                >
                  <div className="flex items-center gap-5">
                    {/* Số thứ tự bài học */}
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-300 group-hover:bg-green-100 group-hover:text-green-700 transition-all duration-300">
                      <span className="text-[10px] font-black leading-none mb-0.5">UNIT</span>
                      <span className="text-lg font-black leading-none">{index + 1}</span>
                    </div>

                    {/* Tiêu đề bài học */}
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-700/50 transition-colors">
                        Korea General Syllabus
                      </span>
                      <h3 className="font-black text-gray-800 text-lg group-hover:text-green-700 transition-colors leading-tight mt-1">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Nút điều hướng bên phải */}
                  <div className="flex items-center gap-3">
                     <span className="hidden sm:inline text-[10px] font-black text-green-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        Học ngay
                     </span>
                     <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-700 group-hover:text-white transition-all duration-300">
                        <ChevronRight size={20} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralLearning;