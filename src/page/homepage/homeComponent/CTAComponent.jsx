// src/components/CTASection.jsx
import React from "react";
import Button from "./ButtonComponent";
import { Users } from "lucide-react";
import AnimateOnView from "../../../components/Wrapper/WrapperMotion";

const PRIMARY = "#008236";

export default function CTASection() {
  return (
    <AnimateOnView >
      <section id="community" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: Text */}
        <div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Tham gia cộng đồng học tiếng Hàn năng động
          </h3>
          <p className="mt-3 text-gray-600 text-base">
            Vào phòng chat tổng, tạo phòng riêng, luyện hội thoại theo chủ đề và nhận phản hồi ngay lập tức.
          </p>
          <div className="mt-6 flex gap-3">
            <Button to="/register">Vào học ngay</Button>
            <Button variant="ghost" to="/login">Tôi đã có tài khoản</Button>
          </div>
        </div>

        {/* Right: Chat Preview */}
        <div className="rounded-3xl p-6 border bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#e6f5ee" }}
            >
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
    </AnimateOnView>
  );
}
