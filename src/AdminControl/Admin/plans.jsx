import React from "react";
import { CheckCircle2, PlusCircle, Crown, Star, Zap } from "lucide-react";
import Card from "../ui/Card";

export default function Plans() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      icon: <Star className="w-7 h-7 text-gray-500" />,
      features: ["Bài học cơ bản", "Quiz giới hạn"],
      color: "from-gray-50 to-gray-100",
    },
    {
      name: "Pro",
      price: "$9/tháng",
      icon: <Zap className="w-7 h-7 text-indigo-500" />,
      features: ["Toàn bộ bài học", "Quiz không giới hạn", "Hỗ trợ ưu tiên"],
      color: "from-indigo-50 to-indigo-100",
    },
    {
      name: "Premium",
      price: "$19/tháng",
      icon: <Crown className="w-7 h-7 text-yellow-500" />,
      features: ["Tất cả Pro", "Gia sư 1-1", "Cập nhật nội dung mới sớm"],
      color: "from-yellow-50 to-yellow-100",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          💳 Gói học
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105">
          <PlusCircle className="w-5 h-5" /> Thêm gói học
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {plans.map((plan, idx) => (
          <Card
            key={idx}
            className={`p-8 flex flex-col items-center text-center shadow-lg rounded-2xl bg-gradient-to-r ${plan.color} hover:shadow-xl transition transform hover:-translate-y-1 min-h-[350px]`}
          >
            {plan.icon}
            <h3 className="text-2xl font-bold text-gray-700 mt-3">{plan.name}</h3>
            <p className="text-4xl font-extrabold text-indigo-600 mt-2">
              {plan.price}
            </p>
            <ul className="mt-4 space-y-2 text-gray-600 text-base flex-1 flex flex-col justify-center">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> {f}
                </li>
              ))}
            </ul>
            <button className="mt-6 bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition w-full">
              Chọn gói
            </button>
          </Card>
        ))}
      </div>

      {/* Additional Section: Benefits */}
      <Card className="p-6 rounded-2xl shadow flex flex-col space-y-4 flex-1 min-h-[200px]">
        <h3 className="text-xl font-semibold text-gray-800">🎯 Lợi ích khi nâng cấp</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base text-gray-700">
          <li>🚀 Học nhanh hơn với nội dung mở khóa toàn bộ</li>
          <li>💬 Hỗ trợ 24/7 với đội ngũ chuyên gia</li>
          <li>🎓 Chứng chỉ hoàn thành khóa học</li>
          <li>📚 Nội dung mới cập nhật liên tục</li>
        </ul>
      </Card>
    </div>
  );
}