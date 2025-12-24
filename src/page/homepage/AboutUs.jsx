// src/pages/AboutUs.jsx
import React from "react";
import MainLayout from "../../layout/MainLayout";
import AnimateOnView from "../../components/Wrapper/WrapperMotion";
import aboutImg from "../../assets/about.png";
import goalImg from "../../assets/goal.jpg";
import achievementImg from "../../assets/achievement.jpg";
import rewardImg from "../../assets/reward.jpeg";
import faqImg from "../../assets/faq.jpg";
import { Target, Users, Award, Star, HelpCircle, Gift, CheckCircle } from "lucide-react";

const PRIMARY = "#008236";
const ACCENT = "#00BFA6";

const statsData = [
  { icon: <Users size={28} color={PRIMARY} />, label: "Học sinh", value: "2,345+" },
  { icon: <Award size={28} color={PRIMARY} />, label: "Thành tích", value: "50+ giải thưởng" },
  { icon: <Star size={28} color={PRIMARY} />, label: "Rating", value: "4.8/5" },
];

const achievements = [
  "Ứng dụng được hơn 5,000 lượt tải về trong 6 tháng đầu",
  "Nhận giải thưởng EduTech Innovation 2024",
  "Được giới thiệu trên các kênh học trực tuyến uy tín",
];

const whatTheyGet = [
  "Lộ trình học cá nhân hóa AI",
  "Flashcards và quiz minh họa",
  "Phản hồi phát âm chi tiết",
  "Hội thoại mô phỏng thực tế",
];

const faqData = [
  { question: "Ứng dụng phù hợp với ai?", answer: "Dành cho người mới bắt đầu học tiếng Hàn, muốn học hiệu quả và tiện lợi." },
  { question: "Có cần kiến thức nền tảng không?", answer: "Không, ứng dụng thiết kế lộ trình từ cơ bản, từng bước, dễ theo dõi." },
  { question: "AI có hỗ trợ phát âm không?", answer: "Có, AI nhận diện giọng nói, đánh giá phát âm và đưa ra phản hồi chi tiết." },
];

const AboutUs = () => {
  return (
    <main>
            {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-32 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-200 rounded-full opacity-30 animate-pulse blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <AnimateOnView>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                AI Assistant For Korean Beginner
              </h1>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                Ứng dụng trợ lý học tiếng Hàn với AI dành cho người mới bắt đầu. 
                Lộ trình chuẩn, flashcards, quiz, luyện nói và mô phỏng hội thoại thực tế.
              </p>
            </div>
          </AnimateOnView>
          <AnimateOnView>
            <div className="relative group">
              <img
                src={aboutImg}
                alt="About illustration"
                className="w-full h-auto rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-300 to-teal-300 opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* Goal Section */}
      <section className="py-28 bg-white relative">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <AnimateOnView>
            <img 
              src={goalImg} 
              alt="Goal illustration" 
              className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500 ring-4 ring-green-200"
            />
          </AnimateOnView>
          <AnimateOnView>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                <Target size={28} color={PRIMARY} /> Goal của chúng tôi
              </h2>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                Giúp học sinh nắm vững kiến thức cơ bản, luyện phản xạ ngôn ngữ và phát triển kỹ năng giao tiếp tiếng Hàn, 
                đồng thời trải nghiệm AI hỗ trợ học tập thông minh.
              </p>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-28 bg-gradient-to-r from-green-50 to-green-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {statsData.map((stat, idx) => (
            <AnimateOnView key={idx}>
              <div className="bg-white backdrop-blur-md bg-opacity-30 border border-green-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 duration-500 flex flex-col items-center text-center">
                <div className="mb-4 flex justify-center">{stat.icon}</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </AnimateOnView>
          ))}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <AnimateOnView>
            <img 
              src={achievementImg} 
              alt="Achievement illustration" 
              className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500 ring-4 ring-green-100"
            />
          </AnimateOnView>
          <AnimateOnView>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                <Award size={28} color={PRIMARY} /> Thành tích nổi bật
              </h2>
              <ul className="space-y-4 text-gray-700">
                {achievements.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-lg md:text-xl">
                    <CheckCircle size={28} color={ACCENT} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* What They Get Section */}
      <section className="py-28 bg-gradient-to-r from-green-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <AnimateOnView>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                <Gift size={28} color={PRIMARY} /> Bạn sẽ nhận được
              </h2>
              <ul className="space-y-4 text-gray-700 text-lg md:text-xl">
                {whatTheyGet.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Star size={28} color={ACCENT} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnView>
          <AnimateOnView>
            <img 
              src={rewardImg} 
              alt="Reward illustration" 
              className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500 ring-4 ring-teal-200"
            />
          </AnimateOnView>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <AnimateOnView>
            <img 
              src={faqImg} 
              alt="FAQ illustration" 
              className="w-full h-auto rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500 ring-4 ring-green-200"
            />
          </AnimateOnView>
          <AnimateOnView>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-10 flex items-center gap-3">
                <HelpCircle size={28} color={PRIMARY} /> Câu hỏi thường gặp
              </h2>
              <div className="space-y-6">
                {faqData.map((faq, idx) => (
                  <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 hover:bg-green-100">
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">{faq.question}</h3>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnView>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-r from-green-100 to-teal-100 text-center">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <AnimateOnView>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Tham gia ngay hôm nay!
            </h2>
            <p className="text-gray-700 text-lg md:text-xl mb-6">
              Tạo tài khoản để trải nghiệm lộ trình học tiếng Hàn cá nhân hóa với AI thông minh.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold shadow-2xl transition transform hover:-translate-y-1 hover:shadow-3xl"
              style={{ backgroundColor: PRIMARY, color: "#fff" }}
            >
              Bắt đầu học
            </a>
          </AnimateOnView>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
