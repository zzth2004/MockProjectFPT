// src/components/FeaturesSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Users, CheckCircle2 } from "lucide-react";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const PRIMARY = "#008236";

const FEATURES = [
  { icon: Trophy, title: "Gamification", desc: "Nhiệm vụ, điểm thưởng, bảng xếp hạng." },
  { icon: Star, title: "Spaced Repetition", desc: "Nhớ lâu nhờ nhắc lại theo khoảng cách." },
  { icon: Users, title: "Cộng đồng", desc: "Chat, luyện hội thoại với bạn học." },
];

export default function FeaturesSection() {
  return (
    <AnimateOnView>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Học thông minh — tiến bộ nhanh</h2>
            <p className="mt-3 text-gray-600 text-base">
              Công nghệ giúp bạn học ít mà hiệu quả cao, tối ưu cho người bận rộn.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="border rounded-3xl p-6 bg-white shadow-sm">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#e6f5ee" }}
                >
                  <f.icon size={22} style={{ color: PRIMARY }} />
                </div>
                <div className="font-semibold text-lg text-gray-900">{f.title}</div>
                <div className="text-gray-600 mt-1 text-base">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}
