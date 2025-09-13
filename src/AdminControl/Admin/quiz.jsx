import React from "react";
import Card from "../ui/Card";

export default function Quiz() {
  const quizLevels = [
    {
      level: "Beginner",
      description: "Quản lý bài kiểm tra cho học viên cơ bản.",
    },
    {
      level: "Intermediate",
      description: "Quản lý bài kiểm tra cho học viên trung cấp.",
    },
    {
      level: "Advanced",
      description: "Quản lý bài kiểm tra cho học viên nâng cao.",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📝 Bài kiểm tra</h2>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm bài kiểm tra
        </button>
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {quizLevels.map((quiz, idx) => (
          <Card
            key={idx}
            className={`p-4 shadow-md rounded-lg flex flex-col justify-between
              ${
                quiz.level === "Beginner"
                  ? "bg-gradient-to-r from-green-50 to-green-100"
                  : quiz.level === "Intermediate"
                  ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                  : "bg-gradient-to-r from-red-50 to-red-100"
              }`}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                {quiz.level}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
            </div>
            <button className="mt-4 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">
              Quản lý
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
