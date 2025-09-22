// src/components/CoursesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Button from "./ButtonComponent";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const PRIMARY = "#008236";

const COURSES = [
  { level: "Beginner", desc: "Bảng chữ cái, phát âm, câu chào hỏi cơ bản.", pill: "TOPIK I" },
  { level: "Intermediate", desc: "Ngữ pháp trung cấp, giao tiếp đời sống.", pill: "Giao tiếp" },
  { level: "Advanced", desc: "Từ vựng học thuật, luyện nghe tin tức.", pill: "TOPIK II" },
];

export default function CoursesSection() {
  return (
    <AnimateOnView>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Khoá học nổi bật</h3>
              <p className="text-gray-600 mt-1 text-base">Lộ trình 4 cấp độ: Beginner → Expert</p>
            </div>
            <Button to="/register">Đăng ký học</Button>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((c, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="rounded-3xl overflow-hidden border bg-white shadow-sm">
                <div className="p-6">
                  <div
                    className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: "#e6f5ee", color: PRIMARY }}
                  >
                    {c.pill}
                  </div>
                  <h4 className="mt-3 text-xl font-bold" style={{ color: PRIMARY }}>{c.level}</h4>
                  <p className="mt-1 text-gray-600 text-base">{c.desc}</p>

                  <ul className="mt-4 space-y-2 text-gray-600 text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} style={{ color: PRIMARY }} /> 40+ bài học
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} style={{ color: PRIMARY }} /> Quiz & flashcard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} style={{ color: PRIMARY }} /> Luyện nói với AI
                    </li>
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}
