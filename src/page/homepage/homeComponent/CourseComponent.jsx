import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, BookOpen, Mic, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const COURSES = [
  {
    level: "Beginner",
    label: "TOPIK I",
    desc: "Bảng chữ cái Hangul, phát âm chuẩn, câu giao tiếp cơ bản hàng ngày.",
    features: ["40+ bài học hệ thống", "Quiz & Flashcard từ vựng", "Luyện nói với AI"],
    color: "#1a7a3c",
    gradient: "linear-gradient(135deg, #1a7a3c 0%, #2da05a 100%)",
    badge: "Phổ biến nhất",
    icon: BookOpen,
    featured: false,
  },
  {
    level: "Intermediate",
    label: "Giao tiếp",
    desc: "Ngữ pháp trung cấp, hội thoại đời sống, đọc hiểu văn bản đơn giản.",
    features: ["60+ bài học nâng cao", "Luyện hội thoại thực tế", "Bài kiểm tra định kỳ"],
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    badge: "Được yêu thích",
    icon: Mic,
    featured: true,
  },
  {
    level: "Advanced",
    label: "TOPIK II",
    desc: "Từ vựng học thuật, luyện nghe tin tức, kỹ năng viết và đọc chuyên sâu.",
    features: ["80+ bài học chuyên sâu", "Luyện đề TOPIK I & II", "Mentor hỗ trợ trực tiếp"],
    color: "#0e7490",
    gradient: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)",
    badge: "Chuyên sâu",
    icon: Layers,
    featured: false,
  },
];

export default function CoursesSection() {
  return (
    <AnimateOnView>
      <section className="py-24" style={{ background: "linear-gradient(180deg, #f8faf8 0%, #f0fdf4 100%)" }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8">

          {/* ── HEADER ── */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 mb-12">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(26,122,60,0.08)", color: "#1a7a3c", border: "1px solid rgba(26,122,60,0.15)" }}
              >
                📚 Khoá học nổi bật
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Lộ trình{" "}
                <span className="gradient-text">4 cấp độ</span>
              </h2>
              <p className="text-gray-500 mt-2">Từ Beginner đến Expert — học đúng lộ trình, tiến bộ thấy rõ</p>
            </div>
            <Link
              to="/register"
              className="btn-primary whitespace-nowrap"
              style={{ padding: "0.7rem 1.5rem" }}
            >
              Đăng ký học ngay <ArrowRight size={14} />
            </Link>
          </div>

          {/* ── COURSE CARDS ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ y: -8 }}
                  className="relative rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: "white",
                    boxShadow: c.featured
                      ? `0 20px 60px rgba(124,58,237,0.18), 0 4px 16px rgba(0,0,0,0.08)`
                      : "0 4px 24px rgba(0,0,0,0.06)",
                    border: c.featured ? "2px solid rgba(124,58,237,0.3)" : "1px solid rgba(0,0,0,0.06)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {/* Featured band */}
                  {c.featured && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-extrabold text-white"
                      style={{ background: c.gradient }}
                    >
                      ⭐ {c.badge}
                    </div>
                  )}

                  {/* Card top gradient band */}
                  <div className="h-2 w-full" style={{ background: c.gradient }} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon + pill */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${c.color}15`,
                        }}
                      >
                        <Icon size={20} style={{ color: c.color }} strokeWidth={2} />
                      </div>
                      <span
                        className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                        style={{ background: `${c.color}15`, color: c.color }}
                      >
                        {c.label}
                      </span>
                    </div>

                    {/* Level title */}
                    <h3 className="text-xl font-extrabold mb-2" style={{ color: c.color }}>
                      {c.level}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{c.desc}</p>

                    {/* Features */}
                    <ul className="space-y-2.5 flex-1">
                      {c.features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <CheckCircle2
                            size={15}
                            className="flex-shrink-0 mt-0.5"
                            style={{ color: c.color }}
                          />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      to="/register"
                      className="mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: c.featured ? c.gradient : `${c.color}12`,
                        color: c.featured ? "white" : c.color,
                        border: c.featured ? "none" : `1px solid ${c.color}30`,
                      }}
                      onMouseEnter={(e) => {
                        if (!c.featured) {
                          e.currentTarget.style.background = c.gradient;
                          e.currentTarget.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!c.featured) {
                          e.currentTarget.style.background = `${c.color}12`;
                          e.currentTarget.style.color = c.color;
                        }
                      }}
                    >
                      Xem chi tiết <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}
