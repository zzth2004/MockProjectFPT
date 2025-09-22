import React, { useState, useEffect } from "react";
import MainHeader from "../components/PageComponent/MainHeader";
import Footer from "../components/PageComponent/Footer";
import ScrollToTopButton from "../components/ScrollToTop";
import Sidebar from "../components/PageComponent/SidebarComponent";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LoadingComponent } from "../components/LoadingComponent";

export default function MainLayout2({ children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Khi component mount, bật loading → tắt sau 1.2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Loading overlay */}
      <LoadingComponent isVisible={loading} />

      <div className={`flex flex-1 ${loading ? "pointer-events-none" : ""}`}>
        {/* Sidebar desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Sidebar mobile */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.aside
                className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-end p-3 border-b">
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar mobile={true} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          <MainHeader onMenuClick={() => setOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-white p-4">{children}</main>
        </div>
      </div>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
