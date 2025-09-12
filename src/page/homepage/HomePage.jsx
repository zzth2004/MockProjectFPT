// KoreanHomepage.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Headphones,
  MessageCircle,
  BookOpen,
  Crown,
  PlayCircle,
  Rocket,
  Users,
  Trophy,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import listeningImg from "../../assets/study.png";
import speakingImg from "../../assets/talk.png";
import vocabImg from "../../assets/text.png";
import roadmapImg from "../../assets/goal.png";
import ScrollToTopButton from "../../components/ScrollToTop";

const PRIMARY = "#008236";

const FEATURES = [
  { icon: Headphones, title: "Nghe", desc: "Podcast + Sub", img: listeningImg },
  { icon: MessageCircle, title: "Nói", desc: "Luyện AI", img: speakingImg },
  { icon: BookOpen, title: "Từ vựng", desc: "Flashcard", img: vocabImg },
  { icon: Crown, title: "Lộ trình", desc: "4 cấp độ", img: roadmapImg },
];

// Reusable Button
const Button = ({ to, onClick, children, variant = "primary", className = "" }) => {
  const base =
    "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (variant === "primary") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} text-white ${className}`}
        style={{ backgroundColor: PRIMARY, boxShadow: "0 6px 18px rgba(0,130,54,0.25)" }}
      >
        {children}
      </Link>
    );
  }

  if (variant === "ghost") {
    return (
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`${base} border text-gray-800 hover:bg-gray-50 ${className}`}
        style={{ borderColor: PRIMARY }}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className={`${base} bg-gray-200 text-gray-800 hover:bg-gray-300 ${className}`}
    >
      {children}
    </Link>
  );
};

// Hero Section
const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: "#e6f5ee", color: PRIMARY }}>
          <Sparkles size={14} /> Học tiếng Hàn theo lộ trình cá nhân hóa
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight text-gray-900">
          Tự tin giao tiếp tiếng Hàn
          <span className="block" style={{ color: PRIMARY }}>nhanh hơn mỗi ngày</span>
        </h1>
        <p className="mt-4 text-gray-600 text-base">
          Từ vựng theo chủ đề, ngữ pháp dễ hiểu, luyện nghe nói với AI và quiz tương tác. Tất cả trong một nền tảng duy nhất.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button to="/register">Bắt đầu ngay <Rocket size={16} /></Button>
          <Button variant="ghost" to="#demo"><PlayCircle size={16} /> Xem demo</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <div className="rounded-3xl p-5 shadow-xl bg-white border">
          <div className="grid grid-cols-2 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="border rounded-2xl p-6 hover:shadow-md transition bg-white flex">
                <div className="flex flex-col justify-center items-start text-left w-1/2 pr-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#e6f5ee" }}>
                    <f.icon size={26} style={{ color: PRIMARY }} />
                  </div>
                  <div className="font-semibold text-gray-800 text-lg mb-2">{f.title}</div>
                  <div className="text-gray-500 text-base">{f.desc}</div>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <img src={f.img} alt={f.title} className="w-36 h-36 object-contain" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Features Section
const Features = () => (
  <section id="features" className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Học thông minh — tiến bộ nhanh</h2>
        <p className="mt-3 text-gray-600 text-base">
          Công nghệ giúp bạn học ít mà hiệu quả cao, tối ưu cho người bận rộn.
        </p>
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        {[
          { icon: Trophy, title: "Gamification", desc: "Nhiệm vụ, điểm thưởng, bảng xếp hạng." },
          { icon: Star, title: "Spaced Repetition", desc: "Nhớ lâu nhờ nhắc lại theo khoảng cách." },
          { icon: Users, title: "Cộng đồng", desc: "Chat, luyện hội thoại với bạn học." },
        ].map((item, idx) => (
          <motion.div key={idx} whileHover={{ y: -3 }} className="border rounded-3xl p-6 bg-white shadow-sm">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#e6f5ee" }}>
              <item.icon size={22} style={{ color: PRIMARY }} />
            </div>
            <div className="font-semibold text-lg text-gray-900">{item.title}</div>
            <div className="text-gray-600 mt-1 text-base">{item.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Courses Section
const Courses = () => (
  <section id="courses" className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Khoá học nổi bật</h3>
          <p className="text-gray-600 mt-1 text-base">Lộ trình 4 cấp độ: Beginner → Expert</p>
        </div>
        <Button to="/register">Đăng ký học <ArrowRight size={16} /></Button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { level: "Beginner", desc: "Bảng chữ cái, phát âm, câu chào hỏi cơ bản.", pill: "TOPIK I" },
          { level: "Intermediate", desc: "Ngữ pháp trung cấp, giao tiếp đời sống.", pill: "Giao tiếp" },
          { level: "Advanced", desc: "Từ vựng học thuật, luyện nghe tin tức.", pill: "TOPIK II" },
        ].map((c, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="rounded-3xl overflow-hidden border bg-white shadow-sm">
            <div className="p-6">
              <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#e6f5ee", color: PRIMARY }}>
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
);

// Fees Section
const Fees = () => (
  <section id="fees" className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">Chi phí khoá học</h3>
          <p className="text-gray-600 mt-1 text-base">Chọn gói phù hợp với nhu cầu học tập, linh hoạt và chi phí hợp lý.</p>
        </div>
        <Button to="/register" className="mt-3 md:mt-0">Đăng ký học <ArrowRight size={16} /></Button>
      </div>

      <div className="mt-8 grid sm:grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Miễn phí", price: "0₫", desc: "Khoá nhập môn cơ bản, lý tưởng cho người mới bắt đầu.", features: ["10 bài học nhập môn", "Flashcards từ vựng cơ bản", "Luyện nói cơ bản với AI", "Học mọi lúc, mọi nơi", "Theo dõi tiến trình học"] },
                    { title: "Cơ bản", price: "99,000₫ / tháng", desc: "Khoá giao tiếp cơ bản, phù hợp muốn nâng trình nhanh.", features: [
            "20 bài học từ Beginner → Intermediate",
            "Ngữ pháp và từ vựng nâng cao",
            "Luyện nói và hội thoại AI",
            "Quiz & Flashcards nâng cao",
            "Đánh giá tiến độ học theo tuần",
            "Hỗ trợ giải đáp thắc mắc"
          ]},
          { title: "Toàn diện", price: "199,000₫ / tháng", desc: "Tất cả khoá học, luyện đề TOPIK, từ vựng học thuật.", features: [
            "Full khoá Beginner → Expert",
            "Luyện đề TOPIK I & II",
            "Luyện nghe tin tức và hội thoại thực tế",
            "Học theo lộ trình cá nhân hóa",
            "Hỗ trợ AI + mentor trực tuyến",
            "Quiz nâng cao & Flashcards toàn bộ"
          ]}
        ].map((f, i) => (
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
);

// CTA Section
const CTA = () => (
  <section id="community" className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Tham gia cộng đồng học tiếng Hàn năng động
        </h3>
        <p className="mt-3 text-gray-600 text-base">
          Vào phòng chat tổng, tạo phòng riêng, luyện hội thoại theo chủ đề và nhận phản hồi ngay lập tức.
        </p>
        <div className="mt-6 flex gap-3">
          <Button to="/register">Vào học ngay <ArrowRight size={16} /></Button>
          <Button variant="ghost" to="/login">Tôi đã có tài khoản</Button>
        </div>
      </div>
      <div className="rounded-3xl p-6 border bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e6f5ee" }}>
            <Users size={20} style={{ color: PRIMARY }} />
          </div>
          <div className="font-semibold">Phòng chat chủ đề: Du lịch ✈️</div>
        </div>
        <div className="mt-4 space-y-3 text-gray-700 text-base">
          <div><span className="font-semibold" style={{ color: PRIMARY }}>Minji:</span> 주말에 어디 갈 거예요?</div>
          <div><span className="font-semibold text-gray-900">Bạn:</span> 저는 바다에 가고 싶어요! 🏖️</div>
          <div><span className="font-semibold" style={{ color: PRIMARY }}>Hoon:</span> 같이 가요! 차로 2시간밖에 안 걸려요.</div>
        </div>
      </div>
    </div>
  </section>
);

export default function KoreanHomepage() {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <Courses />
      <Fees />
      <CTA />
      <ScrollToTopButton />
    </MainLayout>
  );
}

