import React from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActiveCourses = () => {
  // ✅ BẮT BUỘC: khai báo navigate
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "TOPIK II Intensive Prep",
      instructor: "Prof. Park",
      price: 49.99,
      image:
        "https://img.freepik.com/free-vector/business-partnership-concept_23-2148222915.jpg",
    },
    {
      id: 2,
      title: "TOPIK II Intensive Prep",
      instructor: "Prof. Park",
      price: 99.99,
      image:
        "https://img.freepik.com/free-vector/business-partnership-concept_23-2148222915.jpg",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-8 relative">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">
        My Active Courses
      </h2>

      {/* Grid danh sách khóa học */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() =>
              navigate(`/user/mycourses/detail/${course.id}`)
            }
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Ảnh minh họa */}
            <div className="h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Thông tin khóa học */}
            <div className="p-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-500 font-bold mb-4">
                Instructor : {course.instructor}
              </p>
              <div className="text-[#377437] font-extrabold text-lg">
                $ {course.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút Chat nổi */}
      <div className="fixed bottom-8 right-8">
        <button className="w-16 h-16 bg-[#242424] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all">
          <div className="relative">
            <MessageCircle size={32} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 mt-1">
              <div className="w-1.5 h-1 bg-green-400 rounded-full"></div>
              <div className="w-1.5 h-1 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ActiveCourses;
