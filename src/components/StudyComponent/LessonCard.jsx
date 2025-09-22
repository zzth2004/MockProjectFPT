// src/components/Cards/LessonCard.jsx
import React from "react";
import { PlayCircle } from "lucide-react";

export default function LessonCard({ image, title, subtitle, onClick }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition flex items-center gap-4 p-4 w-full">
      {/* Ảnh */}
      <img
        src={image}
        alt={title}
        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
      />

      {/* Nội dung */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-gray-700 text-sm mt-1">{subtitle}</p>
      </div>

      {/* Nút bắt đầu */}
      <button
        onClick={onClick}
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition flex items-center gap-2 text-sm flex-shrink-0"
      >
        <PlayCircle size={16} /> Bắt đầu
      </button>
    </div>
  );
}
