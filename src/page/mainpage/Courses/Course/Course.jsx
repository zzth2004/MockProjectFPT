import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, ArrowLeft, ChevronRight, Sparkles, Users } from "lucide-react";

const CARDS = [
  {
    id: "general",
    path: "/courses/general-course",
    icon: BookOpen,
    label: "General Learning",
    desc: "Khám phá toàn bộ kho bài học miễn phí, luyện tập theo từng chủ đề ngữ pháp và từ vựng tiếng Hàn.",
    accent: "from-sky-500 to-blue-600",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    tag: "Miễn phí",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "mycourse",
    path: "/courses/mycourses",
    icon: GraduationCap,
    label: "My Courses",
    desc: "Tiếp tục lộ trình học theo lớp học đã đăng ký, theo dõi tiến độ và hoàn thành bài tập.",
    accent: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tag: "Lớp học",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
];

const Course = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-sans py-6 px-1">

      {/* ── BACK BUTTON + BREADCRUMB ── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all duration-150"
          aria-label="Quay lại"
        >
          <ArrowLeft size={17} />
        </button>
        <nav className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
          <span
            className="hover:text-gray-700 cursor-pointer transition-colors"
            onClick={() => navigate("/user/dashboard")}
          >
            Trang chủ
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">Khóa học</span>
        </nav>
      </div>

      {/* ── HERO ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Korean Learning</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 leading-tight">
          Chọn phương thức <span className="text-green-700">học tập</span>
        </h1>
        <p className="mt-2 text-gray-500 text-sm max-w-lg">
          Học theo chương trình cố định hoặc tự do khám phá — mọi lộ trình đều dẫn đến thành thạo tiếng Hàn.
        </p>
      </div>

      {/* ── CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        {CARDS.map(({ id, path, icon: Icon, label, desc, accent, iconBg, iconColor, tag, tagColor }) => (
          <div
            key={id}
            onClick={() => navigate(path)}
            className="group relative bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer
              hover:border-green-600/40 active:scale-[0.99] transition-all duration-200 overflow-hidden"
          >
            {/* Simple accent bg */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-green-50/10 pointer-events-none transition-all duration-300" />

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={24} className={iconColor} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-black text-gray-900">{label}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor} uppercase tracking-wider`}>{tag}</span>
                </div>
                <p className="text-xs font-medium text-gray-500 mb-4 leading-relaxed">{desc}</p>

                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-green-700 transition-colors">
                  <span>Bắt đầu ngay</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM HINT ── */}
      <div className="mt-10 flex items-center gap-2 text-xs text-gray-400">
        <Users size={13} />
        <span>Hàng ngàn học viên đang học mỗi ngày — hãy bắt đầu hành trình của bạn!</span>
      </div>
    </div>
  );
};

export default Course;
