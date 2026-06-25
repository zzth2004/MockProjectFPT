import React from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Users, Brain, Target, Shield } from "lucide-react";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const FEATURES = [
  {
    icon: Brain,
    title: "Spaced Repetition",
    desc: "Thuật toán nhắc lại thông minh giúp bạn nhớ từ vựng lâu hơn gấp 3 lần.",
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    glow: "rgba(124,58,237,0.12)",
  },
  {
    icon: Zap,
    title: "AI Luyện Nói",
    desc: "Đối thoại thực tế với AI 24/7, nhận phản hồi phát âm ngay lập tức.",
    color: "#0e7490",
    bg: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    glow: "rgba(14,116,144,0.12)",
  },
  {
    icon: Trophy,
    title: "Gamification",
    desc: "Nhiệm vụ hàng ngày, điểm kinh nghiệm, huy hiệu và bảng xếp hạng sôi nổi.",
    color: "#b45309",
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    glow: "rgba(180,83,9,0.12)",
  },
  {
    icon: Target,
    title: "Luyện thi TOPIK",
    desc: "Đề thi thử TOPIK I & II theo chuẩn EPS-TOPIK, phân tích điểm yếu và ôn tập có trọng tâm.",
    color: "#1a7a3c",
    bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    glow: "rgba(26,122,60,0.12)",
  },
  {
    icon: Users,
    title: "Cộng đồng học tập",
    desc: "Chat, luyện hội thoại cùng bạn học và giáo viên người Hàn bản ngữ.",
    color: "#be185d",
    bg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
    glow: "rgba(190,24,93,0.12)",
  },
  {
    icon: Shield,
    title: "Học mọi lúc, mọi nơi",
    desc: "Đồng bộ tiến trình học trên tất cả thiết bị, học ngoại tuyến không cần mạng.",
    color: "#0369a1",
    bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    glow: "rgba(3,105,161,0.12)",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function FeaturesSection() {
  return (
    <AnimateOnView>
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {/* ── HEADER ── */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: "rgba(26,122,60,0.08)", color: "#1a7a3c", border: "1px solid rgba(26,122,60,0.15)" }}
            >
              ✨ Tại sao chọn KoreanLab?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Học thông minh —{" "}
              <span className="gradient-text">tiến bộ nhanh</span>
            </h2>
            <p className="mt-3 text-gray-500 text-base md:text-lg">
              Công nghệ hiện đại giúp bạn học ít mà hiệu quả cao, tối ưu cho người bận rộn.
            </p>
          </div>

          {/* ── GRID ── */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="gradient-border rounded-2xl p-6 cursor-default"
                  style={{
                    background: "white",
                    boxShadow: `0 4px 24px ${f.glow}, 0 1px 4px rgba(0,0,0,0.04)`,
                    transition: "box-shadow 0.3s ease, transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 16px 48px ${f.glow}, 0 4px 12px rgba(0,0,0,0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 24px ${f.glow}, 0 1px 4px rgba(0,0,0,0.04)`;
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.bg }}
                  >
                    <Icon size={22} style={{ color: f.color }} strokeWidth={2} />
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimateOnView>
  );
}
