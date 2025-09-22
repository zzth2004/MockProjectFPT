// src/components/BookCard.jsx
import React from "react";
import { PlayCircle } from "lucide-react";

const BookCard = ({ image, title, subtitle, btnText ,onClick }) => {
  return (
    <div className="flex items-center bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden p-3 mb-4">
      {/* Hình ảnh bên trái */}
      <img
        src={image}
        alt={title}
        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0"
      />

      {/* Nội dung bên phải */}
      <div className="flex-1 ml-4 flex flex-col justify-between h-full">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-700 text-sm sm:text-base mt-1">{subtitle}</p>
        </div>
        <button
          onClick={onClick}
          className="mt-3 px-3 py-1 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <PlayCircle size={16} /> {btnText}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
