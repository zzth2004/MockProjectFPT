import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/PageComponent/MainSideBarComp";
import MainHeader from "../components/PageComponent/MainHeader";
import Footer from "../components/PageComponent/Footer";

// Import Popup của bạn
import LogoutPopup from "../components/PopupComponent/LogoutPopup"; 

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- QUẢN LÝ TRẠNG THÁI POPUP ĐĂNG XUẤT ---
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* 1. SIDEBAR */}
      <div className={`
        fixed inset-0 z-50 lg:relative lg:z-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-transform duration-300 ease-in-out
      `}>
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className="w-[280px] h-full relative z-10">
          {/* TRUYỀN HÀM MỞ POPUP VÀO SIDEBAR QUA PROP */}
          <Sidebar 
            isMobile={true} 
            onClose={() => setIsSidebarOpen(false)} 
            onLogoutClick={() => setIsLogoutOpen(true)} 
          />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <MainHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/50">
          <div className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-128px)]">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Outlet /> 
            </div>
          </div>
          <Footer />
        </main>
      </div>

      {/* --- RENDER POPUP TẠI ĐÂY (NGOÀI SIDEBAR) --- */}
      <LogoutPopup 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
      />
    </div>
  );
}