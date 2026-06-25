import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const FEES = [
  {
    title: "Miễn phí",
    price: "0₫",
    period: "mãi mãi",
    desc: "Bắt đầu học tiếng Hàn không cần trả phí.",
    icon: Zap,
    iconColor: "#374151",
    gradient: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
    featured: false,
    features: [
      "10 bài học nhập môn",
      "Flashcards từ vựng cơ bản",
      "Luyện nói cơ bản với AI",
      "Học mọi lúc, mọi nơi",
      "Theo dõi tiến trình học",
    ],
    included: [true, true, true, true, true],
  },
  {
    title: "Cơ bản",
    price: "99.000₫",
    period: "/ tháng",
    desc: "Nâng trình nhanh với toàn bộ khoá giao tiếp.",
    icon: Sparkles,
    iconColor: "#1a7a3c",
    gradient: "linear-gradient(135deg, #1a7a3c 0%, #2da05a 100%)",
    featured: true,
    features: [
      "20 bài học Beginner → Intermediate",
      "Ngữ pháp & từ vựng nâng cao",
      "Luyện nói và hội thoại AI không giới hạn",
      "Quiz & Flashcards nâng cao",
      "Đánh giá tiến độ theo tuần",
      "Hỗ trợ giải đáp thắc mắc",
    ],
    included: [true, true, true, true, true, true],
  },
  {
    title: "Toàn diện",
    price: "199.000₫",
    period: "/ tháng",
    desc: "Tất cả tính năng cao cấp, học đến thành thạo.",
    icon: Crown,
    iconColor: "#b45309",
    gradient: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    featured: false,
    features: [
      "Full khoá Beginner → Expert",
      "Luyện đề TOPIK I & II",
      "Nghe tin tức và hội thoại thực tế",
      "Luyện đề TOPIK có chấm điểm tự động",
      "Hỗ trợ AI + mentor trực tuyến",
      "Quiz nâng cao & Flashcards toàn bộ",
    ],
    included: [true, true, true, true, true, true],
  },
];

export default function FeesSection() {
  return (
    <AnimateOnView>
      <section id="fees" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {/* ── HEADER ── */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: "rgba(26,122,60,0.08)", color: "#1a7a3c", border: "1px solid rgba(26,122,60,0.15)" }}
            >
              💰 Chi phí khoá học
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Chọn gói{" "}
              <span className="gradient-text">phù hợp với bạn</span>
            </h2>
            <p className="mt-3 text-gray-500 text-base">
              Linh hoạt và hợp lý — bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng.
            </p>
          </div>

          {/* ── PRICING CARDS ── */}
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {FEES.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: plan.featured
                      ? "linear-gradient(160deg, #0f5a2a 0%, #1a7a3c 100%)"
                      : "white",
                    border: plan.featured ? "none" : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: plan.featured
                      ? "0 24px 64px rgba(26,122,60,0.28), 0 8px 24px rgba(0,0,0,0.1)"
                      : "0 4px 20px rgba(0,0,0,0.06)",
                    transform: plan.featured ? "scale(1.03)" : "scale(1)",
                  }}
                >
                  {/* Featured badge */}
                  {plan.featured && (
                    <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-[11px] font-extrabold text-[#1a7a3c] bg-white shadow-sm">
                      ⭐ Phổ biến nhất
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{
                        background: plan.featured ? "rgba(255,255,255,0.15)" : plan.gradient,
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: plan.featured ? "white" : plan.iconColor }}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Plan info */}
                    <h3
                      className="text-lg font-extrabold mb-1"
                      style={{ color: plan.featured ? "white" : "#111827" }}
                    >
                      {plan.title}
                    </h3>
                    <p
                      className="text-sm mb-5 leading-relaxed"
                      style={{ color: plan.featured ? "rgba(255,255,255,0.7)" : "#6b7280" }}
                    >
                      {plan.desc}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <span
                        className="text-3xl font-extrabold"
                        style={{ color: plan.featured ? "white" : "#111827" }}
                      >
                        {plan.price}
                      </span>
                      <span
                        className="text-sm ml-1"
                        style={{ color: plan.featured ? "rgba(255,255,255,0.6)" : "#9ca3af" }}
                      >
                        {plan.period}
                      </span>
                    </div>

                    {/* Divider */}
                    <div
                      className="mb-5 h-px w-full"
                      style={{ background: plan.featured ? "rgba(255,255,255,0.15)" : "#f3f4f6" }}
                    />

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-7">
                      {plan.features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2
                            size={15}
                            className="flex-shrink-0 mt-0.5"
                            style={{ color: plan.featured ? "#86efac" : "#1a7a3c" }}
                          />
                          <span style={{ color: plan.featured ? "rgba(255,255,255,0.85)" : "#374151" }}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      to="/register"
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: plan.featured ? "white" : "linear-gradient(135deg, #1a7a3c, #2da05a)",
                        color: plan.featured ? "#1a7a3c" : "white",
                        boxShadow: plan.featured
                          ? "0 4px 16px rgba(255,255,255,0.25)"
                          : "0 4px 16px rgba(26,122,60,0.25)",
                      }}
                    >
                      {i === 0 ? "Bắt đầu miễn phí" : "Đăng ký gói này"} <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── FOOTNOTE ── */}
          <p className="text-center text-sm text-gray-400 mt-8">
            Tất cả gói đều có thể hủy bất kỳ lúc nào. Không phí ẩn. 🔒 Thanh toán bảo mật.
          </p>
        </div>
      </section>
    </AnimateOnView>
  );
}
