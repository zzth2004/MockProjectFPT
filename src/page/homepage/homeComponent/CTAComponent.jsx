import React from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const CHAT_MESSAGES = [
  { name: "Minji 🇰🇷", text: "주말에 어디 갈 거예요?", isTeacher: true, delay: 0 },
  { name: "Bạn", text: "저는 바다에 가고 싶어요! 🏖️", isTeacher: false, delay: 0.2 },
  { name: "Hoon 🎓", text: "같이 가요! 차로 2시간밖에 안 걸려요.", isTeacher: true, delay: 0.4 },
  { name: "Bạn", text: "정말요? 너무 좋아요! ✨", isTeacher: false, delay: 0.6 },
];

export default function CTASection() {
  return (
    <AnimateOnView>
      <section
        id="community"
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a2e1a 0%, #0f5a2a 50%, #1a7a3c 100%)" }}
      >
        {/* ── DECORATIVE BLOBS ── */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(45,163,111,0.5) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)" }}
          />
          {/* Grid dots overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* ── LEFT: TEXT ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <Users size={13} /> Cộng đồng học tiếng Hàn
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Tham gia cộng đồng
                <span className="block mt-1" style={{ color: "#86efac" }}>
                  năng động & nhiệt huyết
                </span>
              </h2>

              <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Vào phòng chat tổng, tạo phòng riêng, luyện hội thoại theo chủ đề và nhận phản hồi ngay lập tức từ giáo viên và cộng đồng.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: "white",
                    color: "#1a7a3c",
                    boxShadow: "0 8px 32px rgba(255,255,255,0.2)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,255,255,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.2)"; }}
                >
                  Vào học ngay <ArrowRight size={14} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                >
                  Tôi đã có tài khoản
                </Link>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex gap-8">
                {[
                  { n: "12k+", l: "Học viên" },
                  { n: "200+", l: "Phòng chat" },
                  { n: "4.9★", l: "Đánh giá" },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <div className="text-2xl font-extrabold text-white">{n}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── RIGHT: CHAT PREVIEW ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {/* Chat header */}
                <div
                  className="p-4 flex items-center gap-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Phòng chat: Du lịch ✈️</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 align-middle" />
                      3 người đang hoạt động
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-3">
                  {CHAT_MESSAGES.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: msg.delay + 0.3, duration: 0.4 }}
                      className={`flex gap-2.5 ${!msg.isTeacher ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{
                          background: msg.isTeacher ? "rgba(134,239,172,0.2)" : "rgba(255,255,255,0.15)",
                          color: msg.isTeacher ? "#86efac" : "white",
                        }}
                      >
                        {msg.name[0]}
                      </div>
                      <div>
                        <div className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                          {msg.name}
                        </div>
                        <div
                          className="px-3.5 py-2.5 rounded-2xl text-sm max-w-[200px]"
                          style={{
                            background: msg.isTeacher ? "rgba(255,255,255,0.1)" : "rgba(26,122,60,0.6)",
                            color: "white",
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input preview */}
                <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Nhắn tin...
                    </span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1a7a3c" }}>
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimateOnView>
  );
}
