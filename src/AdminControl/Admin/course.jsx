import Card from "../ui/Card";

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
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          📚 Khóa học Hàn ngữ
        </h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm khóa học
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md rounded-lg"
          >
            <div className="text-gray-700 font-semibold text-lg">
              {course.name}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Level: {course.level}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Lessons: {course.lessons}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Học viên: {course.students}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
