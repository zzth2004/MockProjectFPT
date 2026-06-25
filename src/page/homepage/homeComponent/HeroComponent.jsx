import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Rocket, PlayCircle, X, Headphones, MessageCircle, BookOpen, Map } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";
import DemoVideoPlayer from "../../../page/mainpage/Courses/DemoPlan";

const FEATURES = [
  {
    icon: Headphones,
    title: "Nghe",
    desc: "Podcast + Subtitles",
    color: "#1a7a3c",
    bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
  },
  {
    icon: MessageCircle,
    title: "Nói",
    desc: "Luyện tập với AI",
    color: "#0e7490",
    bg: "linear-gradient(135deg, #cffafe, #a5f3fc)",
  },
  {
    icon: BookOpen,
    title: "Từ vựng",
    desc: "Smart Flashcard",
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
  },
  {
    icon: Map,
    title: "TOPIK",
    desc: "Luyện thi chuẩn",
    color: "#b45309",
    bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
  },
];

const STATS = [
  { value: "12,000+", label: "Học viên" },
  { value: "4", label: "Cấp độ" },
  { value: "500+", label: "Bài học" },
];

export default function HeroSection() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #fafaf7 50%, #f0f9ff 100%)" }}
    >
      {/* ── MESH BACKGROUND ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="mesh-blob absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(26,122,60,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="mesh-blob-2 absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(45,163,111,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="mesh-blob absolute bottom-0 left-1/2 w-80 h-80 rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
        />
        {/* Decorative dots */}
        <svg className="absolute top-10 right-10 opacity-10" width="160" height="160" fill="none">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 6 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 28 + 14} cy={r * 28 + 14} r="3" fill="#1a7a3c" />
            ))
          )}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* ── LEFT CONTENT ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{
                background: "rgba(26,122,60,0.1)",
                color: "#1a7a3c",
                border: "1px solid rgba(26,122,60,0.2)",
              }}
            >
              <Sparkles size={13} fill="#1a7a3c" /> Học tiếng Hàn — Flashcard, Quiz & AI hỗ trợ
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
              Tự tin giao tiếp
              <span className="block gradient-text mt-1">tiếng Hàn nhanh hơn</span>
            </h1>

            <p className="mt-5 text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
              Từ vựng theo chủ đề, ngữ pháp dễ hiểu, luyện nghe nói với AI và quiz tương tác — tất cả trong một nền tảng duy nhất.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary text-sm" style={{ padding: "0.8rem 1.75rem", fontSize: "0.9rem" }}>
                Bắt đầu miễn phí <Rocket size={16} />
              </Link>
              <button
                onClick={() => setShowDemo(true)}
                className="btn-ghost text-sm flex items-center gap-2"
                style={{ padding: "0.8rem 1.75rem", fontSize: "0.9rem" }}
              >
                <PlayCircle size={17} /> Xem demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-10 flex items-center gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-extrabold" style={{ color: "#1a7a3c" }}>{value}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: FEATURE CARDS ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="gradient-border rounded-2xl p-5 shadow-md"
                    style={{
                      background: "white",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: f.bg }}
                    >
                      <Icon size={22} style={{ color: f.color }} strokeWidth={2} />
                    </div>
                    <div className="font-bold text-gray-900 text-base">{f.title}</div>
                    <div className="text-gray-500 text-sm mt-1">{f.desc}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Floating trust badge */}
            <div
              className="float-badge mt-5 mx-auto w-fit flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg"
              style={{
                background: "white",
                border: "1px solid rgba(26,122,60,0.15)",
                color: "#374151",
              }}
            >
              <div className="flex -space-x-2">
                {["u=1","u=2","u=3"].map((u, i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/32?${u}`}
                    className="w-7 h-7 rounded-full border-2 border-white"
                    alt=""
                  />
                ))}
              </div>
              <span>
                <span className="text-green-700 font-extrabold">+12,000</span> học viên đang học
              </span>
              <span className="text-lg">🇰🇷</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── VIDEO DEMO OVERLAY ── */}
      {showDemo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        >
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setShowDemo(false)}
              className="absolute -top-14 right-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
            <DemoVideoPlayer />
          </div>
        </div>
      )}
    </section>
  );
}
