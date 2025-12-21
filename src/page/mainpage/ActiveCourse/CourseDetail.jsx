import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  PlayCircle,
  Clock,
  Globe,
  Award,
} from "lucide-react";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  console.log("Course ID:", courseId);

  // Dữ liệu mẫu khớp với thiết kế trong ảnh
  const courseData = {
    title: "TOPIK II Intensive Preparation",
    instructor: "Dr. Lee",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    about:
      "This course is designed for students who want to master practical Korean skills in a short time. Through our AI-integrated platform, you will practice speaking, listening, and grammar with real-time feedback.",
    benefits: [
      "Lifetime access to all lessons",
      "150+ Vocabulary Flashcards",
      "Grammar practice with AI Chat",
      "Direct support from Instructor",
      "Certificate of Completion",
    ],
    curriculum: [
      {
        id: 1,
        title: "Introduction to Hangeul",
        subtitle: "Vowels, Consonants, and Pronunciation rules.",
        duration: "45 mins",
      },
      {
        id: 2,
        title: "Essential Grammar for TOPIK II",
        subtitle: "Connecting particles and ending suffixes.",
        duration: "120 mins",
      },
      {
        id: 3,
        title: "Listening Strategies",
        subtitle: "How to identify key information in fast speech.",
        duration: "90 mins",
      },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] font-sans">
      {/* --- TOP NAVIGATION --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* === CỘT TRÁI: NỘI DUNG CHI TIẾT === */}
          <div className="flex-1 space-y-10">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white relative group">
                <img
                  src={courseData.image}
                  alt="Course Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={64} className="text-white shadow-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                  {courseData.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-500 font-bold">
                  <span>
                    Lead Instructor:{" "}
                    <span className="text-[#377437]">
                      {courseData.instructor}
                    </span>
                  </span>
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <Globe size={16} /> English / Korean
                  </div>
                </div>
              </div>
            </div>

            {/* About Course Card */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-6 text-gray-900">
                About this Course
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium text-lg">
                {courseData.about}
              </p>
            </section>

            {/* Curriculum Card */}
            <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-black text-gray-900">
                  Course Curriculum
                </h2>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  {courseData.curriculum.length} Lessons
                </span>
              </div>

              <div className="space-y-4">
                {courseData.curriculum.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-5 p-5 rounded-3xl hover:bg-[#F0F7F0] transition-all cursor-pointer group border border-transparent hover:border-green-100"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-[#377437] flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-[#377437] group-hover:text-white transition-all">
                      {item.id}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-sm">
                      <Clock size={16} /> {item.duration}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* === CỘT PHẢI: THANH THANH TOÁN & QUYỀN LỢI === */}
          <aside className="lg:w-[400px] shrink-0">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-50 sticky top-10">
              <div className="text-center mb-8">
                <p className="text-gray-400 font-black text-sm uppercase tracking-[0.2em] mb-2">
                  Course Price
                </p>
                <div className="text-5xl font-black text-[#377437] tracking-tight">
                  ${courseData.price}
                </div>
              </div>

              <button
                onClick={() => navigate(`/user/mycourses/payment/${courseId}`)}
                className="w-full bg-[#377437] hover:bg-green-800 text-white font-black text-xl py-5 rounded-[1.5rem] shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95 mb-10"
              >
                Enroll Now
              </button>

              {/* Benefits List */}
              <div className="space-y-5">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-2">
                  What you'll get:
                </h4>
                {courseData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-gray-600 font-bold"
                  >
                    <CheckCircle2
                      size={20}
                      className="text-[#377437] shrink-0 mt-0.5"
                    />
                    <span className="text-sm leading-tight">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Extra Info */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-400">
                <Award size={32} />
                <p className="text-xs font-bold leading-tight uppercase">
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
