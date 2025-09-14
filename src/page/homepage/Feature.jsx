// src/pages/Feature.jsx
import React from "react";
import MainLayout from "../../layout/MainLayout";
import { User, Settings, Book, Headphones, Mic, MessageSquareMore, Award } from "lucide-react";

const personas = [
  {
    role: "Người học tiếng Hàn (Beginner Learner)",
    icon: <User size={32} className="text-green-600" />,
    features: [
      "Học theo từng bài (unit) có cấu trúc rõ ràng",
      "Luyện từ vựng bằng flashcard + bài kiểm tra trắc nghiệm",
      "Học ngữ pháp có ví dụ minh hoạ",
      "Kiểm tra hàng tuần hoặc sau mỗi unit",
      "Giao tiếp với AI bằng văn bản hoặc giọng nói",
      "Nhận phản hồi tức thời về lỗi phát âm/ngữ pháp",
      "Nhận điểm, thành tích, chứng nhận",
    ],
    interaction: "Rất Cao",
  },
  {
    role: "Giáo viên / Người dạy",
    icon: <Book size={32} className="text-blue-600" />,
    features: [
      "Tạo lớp học riêng (công khai hoặc riêng tư)",
      "Tạo quiz, bài kiểm tra, nội dung bổ trợ",
      "Theo dõi tiến độ, điểm số học viên",
      "Chấm bài thủ công hoặc AI hỗ trợ chấm",
      "Xây dựng cộng đồng học riêng",
    ],
    interaction: "Cao",
  },
  {
    role: "AI trợ lý học tập",
    icon: <MessageSquareMore size={32} className="text-purple-600" />,
    features: [
      "Nhận diện giọng nói (Whisper)",
      "Đánh giá phát âm, chấm điểm",
      "Giả lập hội thoại, phản hồi tự nhiên theo ngữ cảnh",
      "Gợi ý cá nhân hóa lộ trình học",
    ],
    interaction: "Cao",
  },
];

const Feature = () => {
  return (
    <MainLayout>
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
            Tính năng và vai trò người dùng
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personas.map((p, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition">
                <div className="flex items-center gap-4 mb-4">
                  {p.icon}
                  <h2 className="text-xl font-bold text-gray-900">{p.role}</h2>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  {p.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <div className="text-sm font-semibold text-gray-500">Mức độ tương tác: {p.interaction}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Optional: Thêm Functional Requirements */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
            Các tính năng chính của hệ thống
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Headphones size={28} className="text-green-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Học tập & Ngôn ngữ</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Truy cập bài học theo unit/cấp độ</li>
                <li>Flashcard, quiz, học ngữ pháp minh hoạ</li>
                <li>Luyện nghe, nói, đọc, viết với AI hỗ trợ</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Mic size={28} className="text-blue-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Chat & AI</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Chatbot hỗ trợ từ vựng, ngữ pháp</li>
                <li>Voice to Text: luyện nói, chấm phát âm</li>
                <li>Giả lập hội thoại theo tình huống thực tế</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Award size={28} className="text-yellow-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">Quản lý & Phân tích</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Quản lý người dùng, lớp học, phân quyền</li>
                <li>Theo dõi tiến độ học tập, điểm số</li>
                <li>Báo cáo thống kê & đề xuất lộ trình cá nhân hóa</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Feature;
