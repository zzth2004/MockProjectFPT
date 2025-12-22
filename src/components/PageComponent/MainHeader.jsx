import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Menu, 
  Bell,
  MessageSquareMore,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle // Import icon cảnh báo cho Modal
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MainHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // State quản lý Modal Logout

  const dropdownRef = useRef(null);
  const chatRef = useRef(null);

  // Giả lập dữ liệu User
  const currentUser = {
    name: "Minh Quân",
    email: "quanminh@example.com",
    avatar: "https://i.pravatar.cc/150?u=12",
    role: "admin",
    isVip: false 
  };

  const activeTeachers = [
    { id: 1, name: "Ms. Lee Ha-neul", subject: "TOPIK II Intermediate", avatar: "https://i.pravatar.cc/150?u=1", online: true },
    { id: 2, name: "Mr. Park Ji-sung", subject: "Basic Korean 1A", avatar: "https://i.pravatar.cc/150?u=2", online: true },
    { id: 3, name: "Ms. Kim So-won", subject: "Intensive Speaking", avatar: "https://i.pravatar.cc/150?u=3", online: false },
    { id: 4, name: "Support Team", subject: "System Help", avatar: "https://i.pravatar.cc/150?u=4", online: true },
  ];

  // Xử lý đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý Đăng xuất thực tế
  const handleLogout = () => {
    // 1. Xóa token (nếu có)
    // localStorage.removeItem('token');
    
    // 2. Chuyển hướng
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  return (
    <>
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

            <div className="hidden md:block relative w-[400px] lg:w-[480px] ml-2"> 
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search size={16} className="text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search courses, teachers, articles..."
                className="w-full py-2 pl-9 pr-4 text-sm text-gray-800 font-medium bg-gray-100 border border-gray-200 rounded-full focus:bg-white focus:border-[#377437] focus:ring-1 focus:ring-[#377437] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* --- CHAT DROPDOWN --- */}
            <div className="relative" ref={chatRef}>
              <button 
                onClick={() => {
                  setIsChatOpen(!isChatOpen);
                  setIsProfileOpen(false);
                }}
                className={`p-2 rounded-full transition-all relative ${
                  isChatOpen ? "bg-[#E4FBE1] text-[#377437]" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <MessageSquareMore size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#377437] rounded-full border border-white"></span>
              </button>

              {isChatOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl py-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-30">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">Teacher Messages</h3>
                    <span className="text-[10px] bg-[#377437] text-white px-2 py-0.5 rounded-full font-bold">
                      {activeTeachers.filter(t => t.online).length} Online
                    </span>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                    {activeTeachers.map((teacher) => (
                      <button
                        key={teacher.id}
                        onClick={() => {
                          navigate(`/user/chats/${teacher.id}`);
                          setIsChatOpen(false);
                        }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                      >
                        <div className="relative flex-shrink-0">
                          <img src={teacher.avatar} alt="" className="w-11 h-11 rounded-full object-cover border border-gray-100" />
                          {teacher.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-[#377437] transition-colors truncate">
                            {teacher.name}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium truncate">
                            {teacher.subject}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-[#377437] group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => {navigate('/user/chats'); setIsChatOpen(false);}}
                    className="w-full p-3 text-center text-xs font-bold text-[#377437] hover:bg-gray-50 bg-gray-50/30 transition-colors border-t border-gray-100"
                  >
                    View All Chats
                  </button>
                </div>
              )}
            </div>
            
            {/* NOTIFICATION */}
            <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#377437] transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {/* --- PROFILE DROPDOWN --- */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsChatOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-30">
                  <div className="px-4 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900 leading-none">{currentUser.name}</p>
                      {currentUser.isVip && <CheckCircle2 size={14} className="text-[#377437]" />}
                    </div>
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

                  <div className="py-2 px-2">
                    <button 
                      onClick={() => {navigate('/user/profile'); setIsProfileOpen(false);}}
                      className="w-full px-3 py-2 flex items-center gap-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User size={18} className="text-gray-400" /> Personal Info
                    </button>
                  </div>

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
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 px-2 pb-1">
                    <button 
                      onClick={() => {
                         setIsProfileOpen(false);
                         setShowLogoutConfirm(true); // Mở Modal xác nhận
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertCircle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-2">Logout Account?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                 Are you sure you want to log out? You will need to login again to access your courses.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                 <button 
                   onClick={() => setShowLogoutConfirm(false)}
                   className="py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleLogout}
                   className="py-3 px-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                 >
                   Yes, Logout
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}