import React from "react";
import Card from "../ui/Card";

export default function Vocabulary() {
  const words = [
    { word: "안녕하세요", meaning: "Hello", type: "Greeting" },
    { word: "사랑", meaning: "Love", type: "Noun" },
    { word: "먹다", meaning: "Eat", type: "Verb" },
    { word: "학교", meaning: "School", type: "Noun" },
    { word: "공부하다", meaning: "Study", type: "Verb" },
    { word: "행복", meaning: "Happiness", type: "Noun" },
    { word: "예쁘다", meaning: "Pretty", type: "Adjective" },
    { word: "친구", meaning: "Friend", type: "Noun" },
    { word: "달리다", meaning: "Run", type: "Verb" },
    { word: "커피", meaning: "Coffee", type: "Noun" },
    { word: "좋아하다", meaning: "Like", type: "Verb" },
    { word: "감사합니다", meaning: "Thank you", type: "Greeting" },
    { word: "빠르다", meaning: "Fast", type: "Adjective" },
  ];

  const totalWords = words.length;

  const typeColors = {
    Greeting: "bg-green-100 text-green-800",
    Noun: "bg-blue-100 text-blue-800",
    Verb: "bg-purple-100 text-purple-800",
    Adjective: "bg-pink-100 text-pink-800",
    Default: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🔤 Từ vựng</h2>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm từ mới
        </button>
      </div>

      {/* Summary */}
      <div className="text-gray-600 text-sm">
        📚 Tổng số từ vựng:{" "}
        <span className="font-semibold text-gray-900">{totalWords}</span>
      </div>

      {/* Vocabulary Table */}
      <Card className="flex-1 overflow-auto p-4 bg-white shadow-md rounded-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left rounded-lg">
              <th className="p-3">Từ</th>
              <th className="p-3">Nghĩa</th>
              <th className="p-3">Loại từ</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w, idx) => (
              <tr
                key={idx}
                className="border-t hover:bg-indigo-50 transition-all duration-200"
              >
                <td className="p-3 font-semibold text-gray-700">{w.word}</td>
                <td className="p-3 text-gray-600">{w.meaning}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      typeColors[w.type] || typeColors.Default
                    }`}
                  >
                    {w.type}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="text-blue-500 hover:underline mr-3">
                    ✏️ Sửa
                  </button>
                  <button className="text-red-500 hover:underline">
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
