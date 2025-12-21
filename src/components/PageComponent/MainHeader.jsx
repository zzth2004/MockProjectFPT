import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Menu, 
  Bell,
  MessageSquareMore,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MainHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Giả lập dữ liệu User (Thực tế sẽ lấy từ useAuth() hoặc Context)
  const currentUser = {
    name: "Minh Quân",
    email: "quanminh@example.com",
    avatar: "https://i.pravatar.cc/150?u=12",
    role: "admin" // Giá trị: 'student', 'teacher', 'admin'
  };

  // Đóng dropdown khi nhấn ra ngoài vùng menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* --- LEFT: Navigation & Search --- */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:block relative w-[480px] ml-2"> 
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search size={16} className="text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, bài viết..."
              className="w-full py-2 pl-9 pr-4 text-sm text-gray-800 font-medium bg-gray-100 border border-gray-200 rounded-full focus:bg-white focus:border-[#377437] focus:ring-1 focus:ring-[#377437] transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* --- RIGHT: Actions & Profile --- */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="hidden sm:flex p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#377437] transition-all">
            <MessageSquareMore size={20} />
          </button>
          
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#377437] transition-all">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          {/* --- PROFILE DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* User Profile Header */}
                <div className="px-4 py-4 border-b border-gray-50">
                  <p className="text-sm font-black text-gray-900 leading-none">{currentUser.name}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 truncate">{currentUser.email}</p>
                  <div className="mt-3">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      currentUser.role === 'admin' ? 'bg-red-50 text-red-600' : 
                      currentUser.role === 'teacher' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Personal Links */}
                <div className="py-2 px-2">
                  <button 
                    onClick={() => {navigate('/user/profile'); setIsProfileOpen(false);}}
                    className="w-full px-3 py-2 flex items-center gap-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <User size={18} className="text-gray-400" /> Thông tin cá nhân
                  </button>
                  
                </div>

                {/* --- CONSOLE REDIRECTION (Phân quyền nút chuyển trang) --- */}
                <div className="px-2 py-1">
                  {currentUser.role === "admin" && (
                    <button 
                      onClick={() => {navigate('/admin/dashboard'); setIsProfileOpen(false);}}
                      className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-black uppercase tracking-tight">Admin Console</span>
                      </div>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {currentUser.role === "teacher" && (
                    <button 
                      onClick={() => {navigate('/teacher/dashboard'); setIsProfileOpen(false);}}
                      className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard size={20} />
                        <span className="text-xs font-black uppercase tracking-tight">Teacher Console</span>
                      </div>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>

                {/* Logout Section */}
                <div className="mt-2 pt-2 border-t border-gray-100 px-2 pb-1">
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}