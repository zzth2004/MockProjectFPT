import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Menu, Bell, MessageSquareMore, User, LogOut,
  ShieldCheck, ChevronRight, ChevronDown, CheckCircle2,
  AlertCircle, BookOpen, Loader2, GraduationCap, X
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Logic - Đảm bảo các đường dẫn này chính xác với project của bạn
import { useAuth } from "../../context/authContext"; 
import { authLogout } from '../../services/authService';

export default function MainHeader({ onMenuClick }) {
  const navigate = useNavigate();
  
  // 1. Lấy thông tin user từ AuthContext (đã được lưu trong LocalStorage/Session)
  const { user } = useAuth(); 

  // 2. States quản lý giao diện
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 3. Refs để xử lý click outside (đóng dropdown khi bấm ra ngoài)
  const dropdownRef = useRef(null);
  const chatRef = useRef(null);

  // 4. Logic Phân quyền
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const hasConsoleAccess = isAdmin || isTeacher;

  // 5. Dữ liệu giả lập cho tin nhắn
  const activeTeachers = [
    { id: 1, name: "Ms. Lee Ha-neul", subject: "TOPIK II Training", avatar: "https://i.pravatar.cc/150?u=1", online: true },
    { id: 2, name: "Support Team", subject: "Hỗ trợ hệ thống", avatar: "https://i.pravatar.cc/150?u=4", online: true },
  ];

  // 6. Effect: Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
      if (chatRef.current && !chatRef.current.contains(event.target)) setIsChatOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 7. Hàm xử lý Đăng xuất
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authLogout(); // Gọi service xóa token
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center transition-all">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* --- LEFT: Brand & Search --- */}
          <div className="flex items-center gap-4">
            {/* Nút mở Sidebar (Mobile) */}
            <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl active:scale-90 transition-all">
              <Menu size={22} />
            </button>

            {/* Logo (Mobile) */}
            <Link to="/" className="flex items-center gap-2 md:hidden">
               <div className="w-9 h-9 rounded-xl bg-[#2d5a2d] flex items-center justify-center text-white shadow-lg shadow-green-100">
                  <BookOpen size={20} />
               </div>
            </Link>

            {/* Thanh tìm kiếm (Desktop) */}
            <div className="hidden md:block relative w-[300px] lg:w-[480px]"> 
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search size={16} className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, bài viết, tài liệu..."
                className="w-full py-2.5 pl-11 pr-4 text-sm text-gray-800 font-bold bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#2d5a2d] focus:ring-4 focus:ring-green-500/5 transition-all outline-none"
              />
            </div>
          </div>

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* TIN NHẮN DROPDOWN */}
            <div className="relative" ref={chatRef}>
              <button 
                onClick={() => { setIsChatOpen(!isChatOpen); setIsProfileOpen(false); }}
                className={`p-2.5 rounded-full transition-all relative ${isChatOpen ? "bg-green-50 text-[#2d5a2d]" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <MessageSquareMore size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {isChatOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl py-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hỗ trợ & Tin nhắn</h3>
                    <X size={14} className="text-gray-300 cursor-pointer hover:text-red-500" onClick={() => setIsChatOpen(false)} />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {activeTeachers.map((t) => (
                      <button key={t.id} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                        <img src={t.avatar} className="w-10 h-10 rounded-xl object-cover border" alt="" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black text-gray-900 group-hover:text-[#2d5a2d] transition-colors">{t.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{t.subject}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </button>
                    ))}
                  </div>
                  <button className="w-full py-4 text-[11px] font-black text-[#2d5a2d] uppercase hover:bg-green-50 transition-all border-t">Xem tất cả</button>
                </div>
              )}
            </div>
            
            {/* THÔNG BÁO */}
            <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-[#2d5a2d] transition-all">
              <Bell size={20} />
            </button>

            <div className="h-6 w-px bg-gray-100 mx-1"></div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsChatOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#2d5a2d]/10 shadow-sm">
                  <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=2d5a2d&color=fff&bold=true`} 
                    alt="Avatar" className="w-full h-full object-cover" 
                  />
                </div>
                <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-[2rem] shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right">
                  {/* User Info Section */}
                  <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-black text-gray-900 leading-none truncate">{user?.fullName || "Học viên"}</p>
                      <CheckCircle2 size={14} className="text-[#2d5a2d] flex-shrink-0" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 truncate uppercase tracking-tighter">{user?.email}</p>
                    <div className="mt-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        isAdmin ? 'bg-red-50 text-red-600 border border-red-100' : 
                        isTeacher ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                        'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                        {user?.role || "Student"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="p-2 space-y-1">
                    <button onClick={() => {navigate('/user/profile'); setIsProfileOpen(false);}} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all group">
                      <User size={18} className="text-gray-400 group-hover:text-[#2d5a2d]" /> Hồ sơ cá nhân
                    </button>

                    {/* DYNAMIC CONSOLE BUTTON (ADMIN/TEACHER) */}
                    {hasConsoleAccess && (
                      <button 
                        onClick={() => {isAdmin ? navigate('/admin') : navigate("/teacher/dashboard"); setIsProfileOpen(false);}} 
                        className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between group transition-all shadow-lg mt-2 ${
                            isAdmin ? 'bg-gray-950 hover:bg-black shadow-gray-200 text-white' : 
                            'bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isAdmin ? <ShieldCheck size={18} className="text-green-400" /> : <GraduationCap size={18} className="text-blue-100" />}
                          <span className="text-[11px] font-black uppercase tracking-tight">
                            {isAdmin ? 'Admin Console' : 'Teacher Console'}
                          </span>
                        </div>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    <div className="pt-2 mt-1 border-t border-gray-100">
                      <button onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MODAL XÁC NHẬN ĐĂNG XUẤT --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
               <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Đăng xuất?</h3>
            <p className="text-sm text-gray-400 font-bold mb-10 leading-relaxed px-2">
               Bạn có chắc chắn muốn thoát khỏi hệ thống không? Các tiến độ học tập hiện tại sẽ được lưu lại.
            </p>

            <div className="flex flex-col gap-3 w-full">
               <button 
                 disabled={isLoggingOut}
                 onClick={handleLogout}
                 className="py-4 rounded-2xl font-black text-xs uppercase bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
               >
                 {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                 {isLoggingOut ? "Đang xử lý..." : "Có, Đăng xuất ngay"}
               </button>
               <button 
                 disabled={isLoggingOut}
                 onClick={() => setShowLogoutConfirm(false)}
                 className="py-4 rounded-2xl font-black text-xs uppercase text-gray-400 hover:bg-gray-100 transition-all"
               >
                 Để tôi ở lại
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}