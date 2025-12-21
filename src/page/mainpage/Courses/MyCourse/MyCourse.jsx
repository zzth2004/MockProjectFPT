import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MyCourse = () => {
  const navigate = useNavigate();

  // Mock Data
  // 👇 ĐÃ SỬA: Đổi tên biến từ 'uymyCourses' thành 'myCourses' để khớp với lệnh .map bên dưới
  const myCourses = [
    {
      id: "course-1",
      title: "Elementary Conversational Korean",
      instructor: "Prof. Park",
      progress: 10,
      image: "https://img.freepik.com/free-vector/learning-concept-illustration_114360-6186.jpg" 
    },
    {
      id: "course-2",
      title: "TOPIK II Intensive Prep",
      instructor: "Prof. Park",
      progress: 45,
      image: "https://img.freepik.com/free-vector/language-center-concept-illustration_114360-12902.jpg"
    },
    {
      id: "course-3",
      title: "Business Korean Level 1",
      instructor: "Ms. Kim",
      progress: 0,
      image: "https://img.freepik.com/free-vector/online-learning-isometric-concept_1284-17947.jpg"
    }
  ];

  return (
    <div className="w-full min-h-screen font-sans pt-2 pb-8">
      
      {/* --- HEADER --- */}
      <header className="flex items-center gap-2 mb-8 -ml-2">
        <button 
          onClick={() => navigate('/courses')} 
          className="p-2 rounded-full bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition-all border border-gray-200"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2 text-lg font-bold text-gray-800 ml-1">
            <span 
              className="opacity-50 hover:opacity-100 cursor-pointer transition" 
              onClick={() => navigate('/courses')}
            >
                Course
            </span>
            <ChevronRight size={18} className="text-gray-400" />
            <span>My Course</span>
        </div>
      </header>

      {/* --- COURSE LIST (GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map((course) => (
          <div 
            key={course.id}
            // Logic đường dẫn đã chuẩn: /courses/mycourses/course-1
            onClick={() => navigate(`/courses/mycourses/${course.id}`)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            {/* 1. Image Section */}
            <div className="h-48 w-full bg-gray-50 overflow-hidden relative">
               <img 
                 src={course.image} 
                 alt={course.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            {/* 2. Content Section */}
            <div className="p-5 flex flex-col gap-3">
               <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-[#377437] transition-colors">
                 {course.title}
               </h3>
               <p className="text-sm text-gray-500 font-medium">
                 Instructor : <span className="text-gray-700">{course.instructor}</span>
               </p>
               <div className="w-full h-[1px] bg-gray-100 my-1"></div>
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400 font-semibold">Process: {course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#377437] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default MyCourse;