import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  PlayCircle,
  Clock,
  Globe,
  Award,
  Loader2,
  BookOpen,
  Hash,
  MessageSquare,
  Users
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // --- 1. STATES ---
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetails(courseId);
        setCourseData(data);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Không thể tải thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchDetails();
  }, [courseId]);

  // --- 3. LOADING/ERROR UI ---
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-12 h-12 text-[#377437] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
        <p className="text-rose-500 font-bold mb-4">{error || "Dữ liệu không tồn tại"}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-800 text-white rounded-xl">Quay lại</button>
      </div>
    );
  }

  // --- 4. DATA MAPPING ---
  const { title, description, thumbnail, price, salePrice, createdBy, lessons, stats, level } = courseData;

  // Tổng hợp quyền lợi từ dữ liệu thống kê thật
  const benefits = [
    `${stats?.totalLessons || 0} Bài học chuyên sâu`,
    `${stats?.totalVocab || 0} Từ vựng cần thiết`,
    `${stats?.totalGrammar || 0} Cấu trúc ngữ pháp`,
    `${stats?.totalExercises || 0} Bài tập rèn luyện`,
    `${stats?.totalClasses || 0} Lớp học đang mở`,
    "Hỗ trợ trực tiếp từ Giảng viên",
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] font-sans">
      {/* --- TOP NAVIGATION --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-left">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 font-bold hover:text-[#377437] transition-colors group"
        >
          <ChevronLeft
            size={24}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Courses
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20 text-left">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* === CỘT TRÁI: NỘI DUNG CHI TIẾT === */}
          <div className="flex-1 space-y-10">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white relative group">
                <img
                  src={thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1350&q=80"}
                  alt="Course Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={64} className="text-white shadow-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-4 py-1 bg-[#377437]/10 text-[#377437] rounded-full text-[10px] font-black uppercase tracking-widest">
                        {level || "All Levels"}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight italic">
                  {title}
                </h1>
                <div className="flex items-center gap-4 text-gray-500 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        {createdBy?.avatar && <img src={createdBy.avatar} className="w-full h-full object-cover" />}
                    </div>
                    <span>
                        Instructor: <span className="text-[#377437]">{createdBy?.fullName || "Giảng viên"}</span>
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1 uppercase text-xs tracking-tighter">
                    <Globe size={16} /> Korean Language
                  </div>
                </div>
              </div>
            </div>

            {/* About Course Card */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-6 text-gray-900 uppercase italic tracking-tighter">
                About this Course
              </h2>
              <div 
                className="text-gray-600 leading-relaxed font-medium text-lg prose prose-green max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </section>

            {/* Curriculum Card */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                  Course Curriculum
                </h2>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {lessons?.length || 0} Lessons
                </span>
              </div>

              <div className="space-y-4">
                {lessons && lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-5 p-5 rounded-3xl hover:bg-[#F0F7F0] transition-all cursor-pointer group border border-transparent hover:border-green-100"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#377437] flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-[#377437] group-hover:text-white transition-all shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg transition-colors group-hover:text-[#377437]">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium">
                          {lesson.vocabularies?.length || 0} Vocabs • {lesson.grammars?.length || 0} Grammars
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                         Learn Now
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">Chưa có bài học nào được đăng tải.</p>
                )}
              </div>
            </section>
          </div>

          {/* === CỘT PHẢI: THANH THANH TOÁN & QUYỀN LỢI === */}
          <aside className="lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-50 sticky top-10">
              <div className="text-center mb-8">
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                  Pricing Information
                </p>
                <div className="flex items-center justify-center gap-4">
                    {salePrice < price && salePrice > 0 && (
                        <span className="text-xl text-gray-300 line-through font-bold">
                            ${price}
                        </span>
                    )}
                    <div className="text-5xl font-black text-[#377437] tracking-tighter">
                    ${salePrice > 0 ? salePrice : price}
                    </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/user/active-courses/payment/${courseId}`)}
                className="w-full bg-[#377437] hover:bg-green-800 text-white font-black text-xl py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95 mb-10 uppercase italic tracking-widest"
              >
                Enroll Now
              </button>

              {/* Benefits List */}
              <div className="space-y-5">
                <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-[0.2em] mb-4 opacity-50">
                  What you'll get:
                </h4>
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-gray-700 font-bold"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-[#377437] shrink-0 mt-0.5"
                    />
                    <span className="text-sm leading-tight">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Extra Info */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-300">
                <Award size={32} />
                <p className="text-[10px] font-black leading-tight uppercase tracking-widest text-center">
                  Verified <br /> Course Material
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;