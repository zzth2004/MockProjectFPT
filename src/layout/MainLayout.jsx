import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Components
import Header from "../components/PageComponent/Header";
import Footer from "../components/PageComponent/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import { LoadingComponent } from "../components/LoadingComponent";

// Popups & Overlays
import LogoutPopup from "../components/PopupComponent/LogoutPopup";

export default function MainLayout() {
  const location = useLocation();

  // --- 1. STATES ---
  const [loading, setLoading] = useState(true);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // --- 2. LOGIC LOADING ---
  // Giả lập nạp dữ liệu khi chuyển trang hoặc lần đầu vào web
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // 1.2s để tạo cảm giác mượt mà
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 selection:bg-[#2d5a2d]/10 selection:text-[#2d5a2d]">

      {/* 1. LOADING OVERLAY */}
      <LoadingComponent
        isVisible={loading}
        onComplete={() => console.log("KoreanLab - Content Ready")}
      />


      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Header onLogoutClick={() => setIsLogoutOpen(true)} />
      </header>
      <main className={`
        flex-1 flex flex-col transition-all duration-500
        ${loading ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"}
      `}>
        {/* Container cho nội dung chính */}
        <div className="flex-1 w-full max-w-[1440px]">
          {/* Hiệu ứng animate-in khi nội dung xuất hiện */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
            <Outlet />
          </div>
        </div>
      </main>

      {/* 4. FOOTER SECTION */}
      <footer className="bg-[#f8fafc] border-t border-gray-100">
        <Footer />
      </footer>

      {/* 5. FLOATING ELEMENTS */}
      <ScrollToTopButton />

      {/* 6. SYSTEM POPUPS */}
      <LogoutPopup
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />

    </div>
  );
}