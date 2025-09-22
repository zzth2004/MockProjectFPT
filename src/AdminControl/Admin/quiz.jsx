import React from "react";
import Card from "../ui/Card";
import { BookOpen, Star, Award } from "lucide-react";

export default function Quiz() {
  const quizLevels = [
    {
      level: "Beginner",
      description: "Quản lý bài kiểm tra cho học viên cơ bản.",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      color: "bg-gradient-to-r from-green-50 to-green-100",
    },
    {
      level: "Intermediate",
      description: "Quản lý bài kiểm tra cho học viên trung cấp.",
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      color: "bg-gradient-to-r from-yellow-50 to-yellow-100",
    },
    {
      level: "Advanced",
      description: "Quản lý bài kiểm tra cho học viên nâng cao.",
      icon: <Award className="w-6 h-6 text-red-600" />,
      color: "bg-gradient-to-r from-red-50 to-red-100",
    },
  ];

  const totalQuizzes = quizLevels.length;

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📝 Bài kiểm tra</h2>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm bài kiểm tra
        </button>
      </div>

      {/* Summary */}
      <div className="text-gray-600 text-sm">
        📊 Tổng số bài kiểm tra:{" "}
        <span className="font-semibold text-gray-900">{totalQuizzes}</span>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {quizLevels.map((quiz, idx) => (
          <Card
            key={idx}
            className={`p-6 shadow-md rounded-2xl flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ${quiz.color}`}
          >
            <div className="flex items-center space-x-3">
              {quiz.icon}
              <h3 className="text-xl font-semibold text-gray-700">
                {quiz.level}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mt-3 flex-1">{quiz.description}</p>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Quản lý
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
