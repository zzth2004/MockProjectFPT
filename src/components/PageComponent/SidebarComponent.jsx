import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Settings,
  LogOut,
  X,
  HelpCircle,
  PenTool,
  Lock,
  Sparkles,
  CheckCircle2,
  Bot,
  Layers // <-- 1. Import Icon mới cho Flashcard
} from "lucide-react";

const COLORS = {
  primary: "#377437",
  bgActive: "#E4FBE1",
  textInactive: "#64748b",
};

export default function Sidebar({ isMobile, onClose, isVip = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/user/dashboard", requireVip: false },
    { icon: BookOpen, label: "Course", to: "/courses", requireVip: false },
    
    // 2. Thêm mục Flashcards vào đây
    { icon: Layers, label: "Flashcards", to: "/user/flashcards", requireVip: false }, 

    { icon: Bot, label: "AI Support", to: "/user/ai-support", requireVip: true },
    { icon: CalendarDays, label: "Schedule", to: "/user/schedule", requireVip: false },
    { icon: GraduationCap, label: "Active Course", to: "/user/mycourses", requireVip: false },
   
  ];

  const bottomItems = [
    { icon: Settings, label: "Settings", to: "/user/settings" },
    { icon: HelpCircle, label: "Support", to: "/user/support" },
    { icon: LogOut, label: "Log out", to: "/user/logout" },
  ];

  const NavItem = ({ item }) => {
    // Logic giữ nguyên như cũ, chỉ kiểm tra xem đường dẫn có khớp không
    // Lưu ý: Flashcard có thể có nhiều trang con (create, list...), nên dùng startsWith là chuẩn
    const isActive = location.pathname.startsWith(item.to) || 
                     (item.label === "Flashcards" && location.pathname.includes("/user/flashcard")); 

    const isLocked = item.requireVip && !isVip;
    const Icon = item.icon;

    const handleClick = (e) => {
      if (isLocked) {
        e.preventDefault();
        navigate('/user/upgrade');
        return;
      }
      if (isMobile) onClose();
    };

    return (
      <Link
        to={isLocked ? "#" : item.to}
        onClick={handleClick}
        className={`
          group flex items-center justify-between px-4 py-3 mx-3 rounded-xl transition-all duration-200 font-medium mb-1
          ${isActive ? "shadow-sm" : "hover:bg-gray-50"}
          ${isLocked ? "opacity-60" : "cursor-pointer"}
        `}
        style={{
          backgroundColor: isActive ? COLORS.bgActive : "transparent",
          color: isActive ? COLORS.primary : COLORS.textInactive,
        }}
      >
        <div className="flex items-center gap-3">
          <Icon 
            size={20} 
            strokeWidth={isActive ? 2.5 : 2}
            className={`transition-colors ${isActive ? "" : "group-hover:text-[#377437]"}`}
          />
          <span className="text-sm font-semibold tracking-wide">{item.label}</span>
          
          {/* Badge Mới cho Flashcard nếu muốn nổi bật */}
          {item.label === "Flashcards" && (
             <span className="bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded font-black uppercase ml-1">New</span>
          )}
          
          {item.label === "AI Support" && !isLocked && (
            <span className="bg-[#377437] text-white text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ml-1 animate-pulse">Beta</span>
          )}
        </div>
        {isLocked && <Lock size={14} className="text-gray-400" />}
      </Link>
    );
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-100 transition-all ${isMobile ? "w-full" : "w-[260px]"}`}>
      
      {/* HEADER - Giữ nguyên */}
      <div className="h-20 flex items-center px-6 justify-between flex-shrink-0">
        <Link to="/user/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: COLORS.primary }}>
            <span className="font-bold text-lg">KL</span>
          </div>
          <div className="flex flex-col">
             <span className="font-extrabold text-xl tracking-tight text-gray-800 leading-tight">KoreanLab</span>
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">E-Learning</span>
          </div>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <div className="px-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Overview</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-8 px-6 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">System</div>
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
      </div>

      {/* FOOTER - Giữ nguyên phần VIP */}
      <div className="p-4 mt-auto border-t border-gray-50">
        <div className={`relative overflow-hidden rounded-2xl p-5 shadow-xl transition-all duration-300 ${isVip ? 'bg-gradient-to-br from-green-600 to-green-800' : 'bg-slate-900'}`}>
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isVip ? 'bg-white text-green-700' : 'bg-green-500 text-white'}`}>
                {isVip ? <CheckCircle2 size={16} /> : <Sparkles size={16} fill="white" />}
              </div>
              <span className="text-sm font-bold text-white">
                {isVip ? 'VIP Member' : 'Go Premium'}
              </span>
            </div>
            
            <p className="mb-4 text-[11px] leading-relaxed text-slate-100/80">
              {isVip 
                ? "You are enjoying all premium features!" 
                : "Unlock AI Support & Unlimited Flashcards."
              }
            </p>
            
            <button 
              onClick={() => navigate('/user/upgrade')}
              className={`w-full rounded-xl py-2 text-[12px] font-bold transition-all duration-200 active:scale-95 shadow-md ${
                isVip 
                ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm' 
                : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              {isVip ? 'View Plan Details' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}