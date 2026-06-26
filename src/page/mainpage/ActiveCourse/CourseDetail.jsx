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
  Users,
  Star,
  ShieldCheck,
  Zap
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  // --- 1. STATES ---
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetails(courseId);
        setCourseData(data);

        // Check enrollment if not VIP
        if (user && !user.VIP) {
          try {
             const myCoursesRes = await courseService.getCoursebyStudent(user.id, 1, 100, "");
             const courses = Array.isArray(myCoursesRes) ? myCoursesRes : (myCoursesRes?.data || []);
             if (courses.some(e => e.course?.id === Number(courseId))) {
                setIsEnrolled(true);
             }
          } catch(e) { console.error("Could not check enrollment", e); }
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Không thể tải thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchDetails();
  }, [courseId, user]);

  // --- 3. LOADING/ERROR UI ---
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8F9FC] to-[#Eef2f3]">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-emerald-400 opacity-20"></div>
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading amazing content...</p>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8F9FC] to-[#Eef2f3]">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <p className="text-gray-800 font-bold text-xl mb-6">{error || "Course not found"}</p>
          <button onClick={() => navigate(-1)} className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  // --- 4. DATA MAPPING ---
  const { title, description, thumbnail, price, salePrice, createdBy, lessons, stats, level } = courseData;

  const benefits = [
    { icon: <BookOpen size={18} />, text: `${stats?.totalLessons || 0} In-depth Lessons` },
    { icon: <Hash size={18} />, text: `${stats?.totalVocab || 0} Essential Vocabularies` },
    { icon: <MessageSquare size={18} />, text: `${stats?.totalGrammar || 0} Grammar Structures` },
    { icon: <CheckCircle2 size={18} />, text: `${stats?.totalExercises || 0} Practice Exercises` },
    { icon: <Users size={18} />, text: `${stats?.totalClasses || 0} Active Classes` },
    { icon: <Zap size={18} />, text: "Direct Instructor Support" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F4F7F6] font-sans pb-24">
      {/* --- HERO BANNER SECTION --- */}
      <div className="relative w-full bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] pt-8 pb-32 px-4 md:px-8 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors group mb-12"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-all">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">{level || "All Levels"}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-lg text-emerald-100 max-w-2xl font-medium leading-relaxed opacity-90 line-clamp-2" dangerouslySetInnerHTML={{ __html: description?.replace(/<[^>]+>/g, '') }}></p>
              
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-400/50 p-0.5">
                    <div className="w-full h-full rounded-full bg-white/20 overflow-hidden">
                      {createdBy?.avatar ? <img src={createdBy.avatar} className="w-full h-full object-cover" alt="Instructor" /> : <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold">{createdBy?.fullName?.[0] || "I"}</div>}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Instructor</p>
                    <p className="text-white font-semibold">{createdBy?.fullName || "Giảng viên"}</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-white/20 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                  <Globe size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Language</p>
                    <p className="text-white font-semibold">Korean</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[480px] shrink-0 relative group perspective-1000">
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 transform transition-transform duration-500 group-hover:scale-[1.02] bg-gray-900">
                <img
                  src={thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1350&q=80"}
                  alt="Course Banner"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    <PlayCircle size={40} className="text-white ml-2" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500 rounded-2xl rotate-12 -z-10 opacity-50 blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500 rounded-full -z-10 opacity-30 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-20 text-left">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* === CỘT TRÁI: NỘI DUNG CHI TIẾT === */}
          <div className="flex-1 space-y-8">
            {/* About Course Card */}
            <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-500"></div>
              <h2 className="text-2xl font-extrabold mb-6 text-gray-900 tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={28} />
                About this Course
              </h2>
              <div 
                className="text-gray-600 leading-relaxed font-medium text-lg prose prose-emerald max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </section>

            {/* Curriculum Card */}
            <section className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                  <BookOpen className="text-emerald-500" size={28} />
                  Curriculum
                </h2>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  {lessons?.length || 0} Lessons
                </div>
              </div>

              <div className="space-y-4">
                {lessons && lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-5 p-5 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group border border-gray-100 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg transition-colors group-hover:text-emerald-600">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Hash size={14} /> {lesson.vocabularies?.length || 0} Vocabs</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="flex items-center gap-1"><MessageSquare size={14} /> {lesson.grammars?.length || 0} Grammars</span>
                        </p>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                         <PlayCircle size={20} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No lessons published yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* === CỘT PHẢI: THANH THANH TOÁN & QUYỀN LỢI === */}
          <aside className="lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-24">
              
              <div className="mb-8">
                <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Award size={16} /> Premium Access
                </p>
                <div className="flex flex-wrap items-baseline gap-3">
                    <div className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight break-all">
                    {Number(salePrice > 0 ? salePrice : price).toLocaleString('vi-VN')} đ
                    </div>
                    {salePrice < price && salePrice > 0 && (
                        <span className="text-xl text-gray-400 line-through font-semibold whitespace-nowrap">
                            {Number(price).toLocaleString('vi-VN')} đ
                        </span>
                    )}
                </div>
              </div>

              {/* Pricing & Call to Actions */}
              {user?.VIP || isEnrolled ? (
                <button
                  onClick={() => navigate(`/courses/mycourses/${courseId}`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-600/30 transform transition-all hover:-translate-y-1 active:scale-95 mb-8 flex items-center justify-center gap-2"
                >
                  <PlayCircle size={22} />
                  {user?.VIP ? "Start Learning (VIP)" : "Start Learning"}
                </button>
              ) : (
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => navigate(`/user/active-courses/payment/${courseId}`)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-gray-900/20 transform transition-all hover:-translate-y-1 active:scale-95"
                  >
                    Buy This Course
                  </button>
                  <button
                    onClick={() => navigate(`/user/upgrade`)}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-md py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Star size={18} className="fill-white" /> Upgrade to VIP
                  </button>
                </div>
              )}

              {/* Benefits List */}
              <div className="space-y-5 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="font-bold text-gray-900 text-sm">
                  This course includes:
                </h4>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-gray-600 font-medium"
                    >
                      <div className="text-emerald-500 shrink-0 mt-0.5">
                        {benefit.icon}
                      </div>
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-gray-400">
                <ShieldCheck size={24} />
                <p className="text-xs font-semibold uppercase tracking-wider text-center">
                  30-Day Money-Back <br /> Guarantee
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