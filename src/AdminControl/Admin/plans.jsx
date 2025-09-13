import React from "react";
import Card from "../ui/Card";

export default function Plans() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      features: ["Bài học cơ bản", "Quiz giới hạn"],
    },
    {
      name: "Pro",
      price: "$9/tháng",
      features: ["Toàn bộ bài học", "Quiz không giới hạn", "Hỗ trợ ưu tiên"],
    },
    {
      name: "Premium",
      price: "$19/tháng",
      features: ["Tất cả Pro", "Gia sư 1-1"],
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">💳 Gói học</h2>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          <span className="mr-2 text-lg">➕</span>
          Thêm gói học
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className={`p-6 flex flex-col items-center text-center shadow-md rounded-lg transition
              ${
                plan.name === "Free"
                  ? "bg-gradient-to-r from-gray-50 to-gray-100"
                  : ""
              }
              ${
                plan.name === "Pro"
                  ? "bg-gradient-to-r from-indigo-50 to-indigo-100"
                  : ""
              }
              ${
                plan.name === "Premium"
                  ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                  : ""
              }
            `}
          >
            <h3 className="text-xl font-semibold text-gray-700">{plan.name}</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {plan.price}
            </p>
            <ul className="mt-3 space-y-1 text-gray-600">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center justify-center">
                  <span className="mr-2 text-green-600">✅</span> {f}
                </li>
              ))}
            </ul>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              Chọn gói
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
