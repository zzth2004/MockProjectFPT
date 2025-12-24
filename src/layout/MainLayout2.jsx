import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import MainHeader from "../components/PageComponent/MainHeader";
import Footer from "../components/PageComponent/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import Sidebar from "../components/PageComponent/SidebarComponent";
import { LoadingComponent } from "../components/LoadingComponent";
import DraggableAIButton from "../components/Chatbot/DraggableAIButton";

export default function MainLayout2() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Thêm hook này

  // Logic bật loading mỗi khi đổi trang con
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-[#F7F9F8] overflow-hidden font-sans">
      
      {/* 1. SIDEBAR DESKTOP - Luôn hiện, không bị đè */}
      <div className="hidden lg:block h-full shadow-sm z-30">
        <Sidebar isMobile={false} />
      </div>

      {/* --- SIDEBAR MOBILE --- */}
      {/* ... giữ nguyên code Sidebar Mobile của bạn ... */}

      {/* --- CỘT NỘI DUNG CHÍNH --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* 2. HEADER - Luôn hiện, z-index cao hơn loader trang con */}
        <MainHeader onMenuClick={() => setOpen(true)} className="z-40" />

        {/* 3. VÙNG NỘI DUNG BIẾN ĐỔI (MAIN) */}
        {/* PHẢI CÓ 'relative' Ở ĐÂY để "giam" absolute loader */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth bg-white">
          
          {/* LOADER: Chỉ nằm trong vùng main này */}
          <AnimatePresence>
            {loading && (
              <div className="absolute inset-0 z-20">
                <LoadingComponent isVisible={loading} />
              </div>
            )}
          </AnimatePresence>

          <div className={`
            mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 min-h-full
            transition-all duration-500
            ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}
          `}>
             <Outlet /> 
             <Footer />
          </div>
        </main>
      </div>

      <ScrollToTopButton />
      <DraggableAIButton />
    </div>
  );
}