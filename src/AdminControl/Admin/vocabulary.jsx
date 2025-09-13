import React from "react";
import Card from "../ui/Card";

export default function Vocabulary() {
  const words = [
    { word: "안녕하세요", meaning: "Hello", type: "Greeting" },
    { word: "사랑", meaning: "Love", type: "Noun" },
    { word: "먹다", meaning: "Eat", type: "Verb" },
  ];

  // Map type → màu badge
  const typeColors = {
    Greeting: "bg-green-100 text-green-800",
    Noun: "bg-blue-100 text-blue-800",
    Verb: "bg-purple-100 text-purple-800",
    Default: "bg-gray-200 text-gray-700",
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🔤 Từ vựng</h2>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm từ mới
        </button>
      </div>

      {/* Vocabulary Table */}
      <Card className="flex-1 overflow-auto p-4 bg-gray-50 shadow-md rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Từ</th>
              <th className="p-2">Nghĩa</th>
              <th className="p-2">Loại từ</th>
              <th className="p-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {words.map((w, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition">
                <td className="p-2 font-semibold">{w.word}</td>
                <td className="p-2">{w.meaning}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      typeColors[w.type] || typeColors.Default
                    }`}
                  >
                    {w.type}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <button className="text-blue-500 hover:underline mr-2">
                    Sửa
                  </button>
                  <button className="text-red-500 hover:underline">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
