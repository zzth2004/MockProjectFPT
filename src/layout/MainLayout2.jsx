import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import MainHeader from "../components/PageComponent/MainHeader";
import Footer from "../components/PageComponent/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import Sidebar from "../components/PageComponent/SidebarComponent";
import { LoadingComponent } from "../components/LoadingComponent";
import DraggableAIButton from "../components/Chatbot/DraggableAIButton";

export default function MainLayout2() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Loading animation on route change
  useEffect(() => {
    setLoading(true);
    setIsMobileSidebarOpen(false); // close on route change
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isAiPage = location.pathname.includes("/ai");
  const isMyCoursePage = location.pathname.startsWith("/courses/mycourses") || location.pathname.startsWith("/courses/mycourses");

  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans"
      style={{ background: "var(--surface-app)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:flex h-full flex-shrink-0" style={{ zIndex: 30 }}>
        <Sidebar isMobile={false} />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 lg:hidden z-40"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar drawer */}
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] lg:hidden z-50"
            >
              <Sidebar
                isMobile={true}
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT COLUMN ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Header */}
        <MainHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Scrollable main area */}
        <main
          className={`flex-1 relative custom-scrollbar ${isAiPage ? "overflow-hidden flex flex-col" : "overflow-x-hidden overflow-y-auto"}`}
          style={{ background: "var(--surface-app)" }}
        >

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: loading ? 0 : 1, y: loading ? 8 : 0 }}
            transition={{ duration: 0.3 }}
            className={isAiPage ? "h-full flex flex-col" : "mx-auto max-w-7xl  min-h-full"}
          >
            <Outlet />

          </motion.div>
        </main>
      </div>

      {/* Floating utilities */}
      <ScrollToTopButton />
      {!isAiPage && !isMyCoursePage && <DraggableAIButton />}
    </div>
  );
}