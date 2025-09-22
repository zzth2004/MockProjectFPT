// src/components/HeroSection.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Rocket, PlayCircle, X } from "lucide-react";
import Button from "./ButtonComponent";
import listeningImg from "../../../assets/study.png";
import speakingImg from "../../../assets/talk.png";
import vocabImg from "../../../assets/text.png";
import roadmapImg from "../../../assets/goal.png";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";
import DemoVideoPlayer from "../../../page/mainpage/Courses/DemoPlan"; // import video player

const PRIMARY = "#008236";

const FEATURES = [
  { icon: listeningImg, title: "Nghe", desc: "Podcast + Sub", img: listeningImg },
  { icon: speakingImg, title: "Nói", desc: "Luyện AI", img: speakingImg },
  { icon: vocabImg, title: "Từ vựng", desc: "Flashcard", img: vocabImg },
  { icon: roadmapImg, title: "Lộ trình", desc: "4 cấp độ", img: roadmapImg },
];

export default function HeroSection() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <AnimateOnView>
      <section className="relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-10 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 bg-green-50 text-green-700">
              <Sparkles size={14} /> Học tiếng Hàn theo lộ trình cá nhân hóa
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-gray-900">
              Tự tin giao tiếp tiếng Hàn
              <span className="block" style={{ color: PRIMARY }}>
                nhanh hơn mỗi ngày
              </span>
            </h1>
            <p className="mt-4 text-gray-600 text-base">
              Từ vựng theo chủ đề, ngữ pháp dễ hiểu, luyện nghe nói với AI và quiz tương tác. Tất cả trong một nền tảng duy nhất.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button to="/register">
                Bắt đầu ngay <Rocket size={16} />
              </Button>
              {/* Nút Xem demo mở modal overlay */}
              <Button
                variant="ghost"
                onClick={() => setShowDemo(true)}
                className="flex items-center gap-2"
              >
                <PlayCircle size={16} /> Xem demo
              </Button>
            </div>
          </motion.div>

          {/* Right Features */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-3xl p-6 shadow-lg bg-white border border-gray-100">
              <div className="grid grid-cols-2 gap-8">
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:scale-105 transition transform bg-white flex"
                  >
                    <div className="flex flex-col justify-center items-start text-left w-1/2 pr-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-green-100 to-green-200">
                        <img src={f.icon} alt={f.title} className="w-6 h-6 object-contain" />
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

        {/* Overlay Video Demo */}
        {showDemo && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-5xl">
              {/* Nút đóng */}
              <button
                onClick={() => setShowDemo(false)}
                className="absolute -top-12 right-0 text-white p-2 hover:text-red-400"
              >
                <X size={32} />
              </button>
              <DemoVideoPlayer />
            </div>
          </div>
        )}
      </section>
    </AnimateOnView>
  );
}
