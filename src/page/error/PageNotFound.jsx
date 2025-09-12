import React from 'react';



export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops! Trang không tồn tại.</h2>
      <p className="text-gray-600 mb-6 text-center">
        Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.<br />Hãy quay lại trang chủ để tiếp tục khám phá.
      </p>
      <button
        to="/"
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-200"
      >
        Về trang chủ
      </button>
      <div className="mt-10 flex justify-center">
        <img
          src="public/page-not-found.jpg"
          alt="Page not found"
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}
