// src/components/FeesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Button from "./ButtonComponent";
import AnimateOnView from "../../Wrapper/WrapperMotion"; 

const PRIMARY = "#008236";

const FEES = [
  {
    title: "Miễn phí",
    price: "0₫",
    desc: "Khoá nhập môn cơ bản, lý tưởng cho người mới bắt đầu.",
    features: [
      "10 bài học nhập môn",
      "Flashcards từ vựng cơ bản",
      "Luyện nói cơ bản với AI",
      "Học mọi lúc, mọi nơi",
      "Theo dõi tiến trình học"
    ]
  },
  {
    title: "Cơ bản",
    price: "99,000₫ / tháng",
    desc: "Khoá giao tiếp cơ bản, phù hợp muốn nâng trình nhanh.",
    features: [
      "20 bài học từ Beginner → Intermediate",
      "Ngữ pháp và từ vựng nâng cao",
      "Luyện nói và hội thoại AI",
      "Quiz & Flashcards nâng cao",
      "Đánh giá tiến độ học theo tuần",
      "Hỗ trợ giải đáp thắc mắc"
    ]
  },
  {
    title: "Toàn diện",
    price: "199,000₫ / tháng",
    desc: "Tất cả khoá học, luyện đề TOPIK, từ vựng học thuật.",
    features: [
      "Full khoá Beginner → Expert",
      "Luyện đề TOPIK I & II",
      "Luyện nghe tin tức và hội thoại thực tế",
      "Học theo lộ trình cá nhân hóa",
      "Hỗ trợ AI + mentor trực tuyến",
      "Quiz nâng cao & Flashcards toàn bộ"
    ]
  }
];

export default function FeesSection() {
  return (
    <AnimateOnView>
      <section id="fees" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Chi phí khoá học</h3>
              <p className="text-gray-600 mt-1 text-base">
                Chọn gói phù hợp với nhu cầu học tập, linh hoạt và chi phí hợp lý.
              </p>
            </div>
            <Button to="/register" className="mt-3 md:mt-0">Đăng ký học</Button>
          </div>

          <div className="mt-8 grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {FEES.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="rounded-3xl overflow-hidden border bg-white shadow-sm flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="mt-1 text-xl font-bold" style={{ color: PRIMARY }}>{f.title}</h4>
                  <p className="mt-2 text-gray-600 text-base">{f.desc}</p>
                  <div className="mt-4 text-2xl font-extrabold" style={{ color: PRIMARY }}>{f.price}</div>

                  <ul className="mt-4 space-y-2 text-gray-600 text-base flex-1">
                    {f.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} style={{ color: PRIMARY, marginTop: 4 }} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button to="/register" className="w-full">Đăng ký gói này</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}
