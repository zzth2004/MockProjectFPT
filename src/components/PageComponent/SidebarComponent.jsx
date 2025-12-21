import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  GraduationCap,
  User,
  Settings,
  LogOut,
  X,
  HelpCircle,
  PenTool // Thêm icon PenTool cho Topik Practise
} from "lucide-react";
import avatar from "../../assets/text.png"; 

// Giữ nguyên định nghĩa màu của bạn
const COLORS = {
  primary: "#377437",
  bgActive: "#E4FBE1",
  textInactive: "#64748b"
};

export default function Sidebar({ isMobile, onClose }) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/user/dashboard" },
    { icon: BookOpen, label: "Course", to: "/courses" },
    // Đã xóa Message
    { icon: CalendarDays, label: "Schedule", to: "/user/schedule" },
    
    // Thêm Topik Practise
    { icon: PenTool, label: "Topik Practise", to: "/user/topik" },
    
    // Đổi My Course thành Active Course (hoặc thêm mới tùy bạn, ở đây tôi đổi tên cho hợp ngữ cảnh)
    { icon: GraduationCap, label: "Active Course", to: "/user/mycourses" },
  ];

  const bottomItems = [
    { icon: Settings, label: "Settings", to: "/user/settings" },
    { icon: HelpCircle, label: "Support", to: "/user/support" },
    { icon: LogOut, label: "Log out", to: "/user/logout" },
  ];

  // Component render từng Item (Giữ nguyên style của bạn)
  const NavItem = ({ item }) => {
    const isActive = location.pathname.startsWith(item.to);
    const Icon = item.icon;

    return (
      <Link
        to={item.to}
        onClick={isMobile ? onClose : undefined}
        className={`
          group flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200 font-medium mb-1
          ${isActive ? "shadow-sm" : "hover:bg-gray-50"}
        `}
        style={{
          backgroundColor: isActive ? COLORS.bgActive : "transparent",
          color: isActive ? COLORS.primary : COLORS.textInactive,
        }}
      >
        <Icon 
          size={22} 
          strokeWidth={isActive ? 2.5 : 2}
          color={isActive ? COLORS.primary : COLORS.textInactive}
          className="transition-colors group-hover:text-[#377437]"
        />
        <span className="text-sm font-semibold tracking-wide">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-100 ${isMobile ? "w-full" : "w-[260px]"}`}>
      
      {/* --- HEADER: LOGO --- */}
      <div className="h-20 flex items-center px-6 justify-between">
        <Link to="/user/dashboard" className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: COLORS.primary }}
          >
            <span className="font-bold text-lg">KL</span>
          </div>
          <div className="flex flex-col">
             <span className="font-extrabold text-xl tracking-tight text-gray-800">KoreanLab</span>
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">E-Learning</span>
          </div>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        )}
      </div>

      {/* --- BODY: MAIN MENU --- */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <div className="px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-8 px-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">System</div>
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
      </div>

      
    </aside>
  );
}