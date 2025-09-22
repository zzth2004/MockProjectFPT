import Card from "../ui/Card";
import { BookOpen, Star, Award } from "lucide-react";

export default function Courses() {
  const courses = [
    {
      id: 1,
      name: "Tiếng Hàn Cơ Bản",
      level: "Beginner",
      lessons: 12,
      students: 120,
    },
    {
      id: 2,
      name: "Ngữ Pháp Nâng Cao",
      level: "Advanced",
      lessons: 20,
      students: 45,
    },
    {
      id: 3,
      name: "Hán Tự Cơ Bản",
      level: "Beginner",
      lessons: 15,
      students: 80,
    },
    {
      id: 4,
      name: "Giao Tiếp Hàn Quốc",
      level: "Intermediate",
      lessons: 18,
      students: 60,
    },
    {
      id: 5,
      name: "Luyện Nghe Hàn Ngữ",
      level: "Intermediate",
      lessons: 10,
      students: 95,
    },
    {
      id: 6,
      name: "Từ Vựng Chủ Đề Du Lịch",
      level: "Beginner",
      lessons: 8,
      students: 50,
    },
  ];

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);

  const getIcon = (level) => {
    switch (level) {
      case "Beginner":
        return <BookOpen className="w-6 h-6 text-green-600" />;
      case "Intermediate":
        return <Star className="w-6 h-6 text-yellow-600" />;
      case "Advanced":
        return <Award className="w-6 h-6 text-red-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          📚 Khóa học Hàn ngữ
        </h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm khóa học
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 text-gray-600 text-sm">
        <span>
          📊 Tổng số khóa học: <b>{totalCourses}</b>
        </span>
        <span>
          👥 Tổng số học viên: <b>{totalStudents}</b>
        </span>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md rounded-2xl flex flex-col hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              {getIcon(course.level)}
              <h3 className="text-lg font-semibold text-gray-700">
                {course.name}
              </h3>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                📖 Bài học: <b>{course.lessons}</b>
              </p>
              <p>
                👥 Học viên: <b>{course.students}</b>
              </p>
              <p>
                🎯 Trình độ: <b>{course.level}</b>
              </p>
            </div>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Xem chi tiết
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
