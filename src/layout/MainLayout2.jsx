import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom"; // QUAN TRỌNG: Dùng Outlet
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    // Container chính: Full màn hình, background hơi xám nhẹ để nổi bật Sidebar trắng
    <div className="flex h-screen w-full bg-[#F7F9F8] overflow-hidden font-sans text-gray-900">
      
      {/* Loading */}
      <LoadingComponent isVisible={loading} />

      {/* --- SIDEBAR DESKTOP --- */}
      <div className="hidden lg:block h-full shadow-sm z-30">
        <Sidebar isMobile={false} />
      </div>

      {/* --- SIDEBAR MOBILE --- */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="relative h-full w-[280px] bg-white shadow-2xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Sidebar isMobile={true} onClose={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Header */}
        <MainHeader onMenuClick={() => setOpen(true)} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl flex flex-col min-h-[calc(100vh-8rem)]">
             {/* Outlet: Nơi nội dung các trang con hiển thị. 
                Sidebar và Header sẽ KHÔNG bị render lại.
             */}
             <Outlet />

             {/* Footer nằm ở cuối nội dung cuộn */}
             
          </div>
        </main>
      </div>

      <ScrollToTopButton />
      <DraggableAIButton />
    </div>
  );
}