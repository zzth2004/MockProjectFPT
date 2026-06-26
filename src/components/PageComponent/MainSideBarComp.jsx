import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, User, Settings, LogOut, X, 
  ChevronDown, ChevronRight, ShoppingCart, FileText, 
  Layers, Bot, Trophy, Rss, Book as BookIcon, 
  MessageSquare, ShieldCheck, ListChecks, CreditCard, Tag, Hammer,
  Calendar
} from "lucide-react";
import { useAuth } from '../../context/authContext'

const COLORS = {
  primary: "#2d5a2d",
  bgActive: "#E4FBE1",
  textInactive: "#64748b",
  textActive: "#0f172a",
  border: "#e2e8f0",
  groupLabel: "#020617",
};

export default function Sidebar({ isMobile, onClose, onLogoutClick }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  
  // --- LẤY ROLE TỪ AUTH CONTEXT ---
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "guest"; 
  const isTeacher = role === "teacher";

  // XÁC ĐỊNH BASE PATH
  const basePath = isTeacher ? "/teacher" : "/admin";

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // --- MENU CONFIGURATION ---
  const menuConfig = [
    {
      group: "Hệ thống & Người dùng",
      items: [
        { icon: LayoutDashboard, label: "Tổng quan", to: isTeacher ? "/teacher/dashboard" : "/admin", isHidden: false },
        { 
          icon: User, 
          label: isTeacher ? "Học sinh" : "Người dùng", 
          children: [
            { label: isTeacher ? "Danh sách học sinh" : "Danh sách User", to: `${basePath}/users` },
          ]
        },
        // Lịch dạy (Chỉ cho Teacher)
        { 
            icon: Calendar, 
            label: "Lịch dạy", 
            to: "/teacher/schedule", 
            isHidden: !isTeacher 
        },
      ]
    },
    {
      group: "Quản lý Đào tạo (LMS)",
      items: [
        {
          icon: BookOpen, label: "Khóa học & Lớp",
          children: [
            { label: "Tất cả khóa học", to: `${basePath}/courses` },
            { label: "Quản lý lớp học", to: `${basePath}/classes` },
            { label: "Ghi danh (Enrollment)", to: `${basePath}/enrollments`, isHidden: isTeacher },
          ]
        },
        {
          icon: FileText, label: "Nội dung học tập",
          children: [
            { label: "Danh sách bài học", to: `${basePath}/lessons` },
            { label: "Ngữ pháp (Grammar)", to: `${basePath}/grammar` },
            { label: "Từ vựng (Vocab)", to: `${basePath}/vocabulary` },
          ]
        },
        {
          icon: ListChecks, label: "Bài tập & Đánh giá",
          children: [
            { label: "Ngân hàng câu hỏi", to: `${basePath}/exercises` },
            { label: "Quản lý bài thi", to: `${basePath}/exams` },
            { label: "Kết quả làm bài", to: `${basePath}/exercise-attempts` },
            { label: "Phòng Live Quiz", to: `${basePath}/game-room/host`, openNewTab: true },
          ]
        },
        // 🟢 CẬP NHẬT: Flashcards chuyển sang hoạt động chính thức
        { 
            icon: Layers, 
            label: "Flashcards", 
            to: `${basePath}/flashcards`, 
            isHidden: false, 
            isLateDev: false
        },
      ]
    },
    {
      group: "Kinh doanh & Marketing",
      isHidden: isTeacher, 
      items: [
        {
          icon: CreditCard, label: "Gói học & Đăng ký",
          children: [
            { label: "Gói Subscription", to: `${basePath}/plans` },
            { label: "User Subscriptions", to: `${basePath}/user-subs` },
          ]
        },
        { icon: ShoppingCart, label: "Đơn hàng (Orders)", to: `${basePath}/orders` },
        { 
          icon: Tag, label: "Khuyến mãi",
          children: [
            { label: "Mã giảm giá (Coupon)", to: `${basePath}/coupons` },
            { label: "Lịch sử sử dụng", to: `${basePath}/coupon-usage`, isLateDev: false },
          ]
        },
      ]
    },
    {
      group: "Tính năng mở rộng",
      isHidden: isTeacher,
      items: [
        { icon: Bot, label: "AI Learning", to: `${basePath}/ai`, isLateDev: true },
        { 
          icon: Trophy, label: "Gamification", isHidden: isTeacher, isLateDev: false,
          children: [
            { label: "Điểm thưởng", to: `${basePath}/points` },
            { label: "Huy hiệu", to: `${basePath}/badges` },
            { label: "Thiết kế Huy hiệu", to: `${basePath}/badge-studio` },
          ]
        },
        { 
            icon: Rss, 
            label: "Blog & Tin tức", 
            to: `${basePath}/blog`, 
            isHidden: false
        },
        { icon: BookIcon, label: "Thư viện sách", to: `${basePath}/books`, isHidden: isTeacher },
      ]
    },
    {
      group: "Cài đặt & Hỗ trợ",
      items: [
        { icon: ShieldCheck, label: "Classroom Sync", to: `${basePath}/google-sync`, isLateDev: false },
        { icon: MessageSquare, label: "Support Tickets", to: `${basePath}/tickets`, isHidden: isTeacher },
        { icon: Settings, label: "Cài đặt hệ thống", to: `${basePath}/settings`, isHidden: isTeacher },
        { icon: LogOut, label: "Đăng xuất", to: "/logout", isHidden: false },
      ]
    }
  ];

  // Component phụ NavItem
  const NavItem = ({ item, depth = 0 }) => {
    if (item.isHidden) return null;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    
    // Logic: Nếu có isLateDev thì override link thành /late-dev
    const finalTo = item.isLateDev ? `${basePath}/late-dev` : item.to;
    
    const isActive = location.pathname === finalTo || (hasChildren && item.children.some(child => location.pathname === (child.isLateDev ? `${basePath}/late-dev` : child.to)));
    
    const Icon = item.icon;
    const isSubItem = depth > 0;
    const isLogout = item.to === "/logout";

    const commonClasses = `flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200 mb-1 group ${isActive ? "shadow-lg bg-[#E4FBE1]" : "hover:bg-gray-100"}`;
    const commonStyles = {
      color: isActive ? COLORS.primary : (isLogout ? "#ef4444" : COLORS.textInactive),
      marginLeft: isSubItem ? "3rem" : "0.75rem",
      width: isSubItem ? "calc(100% - 3.75rem)" : "calc(100% - 1.5rem)"
    };

    if (hasChildren) {
      return (
        <div className="w-full">
          <button onClick={() => toggleMenu(item.label)} className={`w-[calc(100%-24px)] group flex items-center justify-between px-4 py-3 mx-3 rounded-xl transition-all duration-200 mb-1 ${isActive ? "shadow-md bg-[#E4FBE1]" : "hover:bg-gray-100"}`} style={{ color: isActive ? COLORS.primary : COLORS.textInactive }}>
            <div className="flex items-center gap-3">
              {Icon && <Icon size={22} strokeWidth={isActive ? 3 : 2.5} />}
              <span className="text-[15px] font-black tracking-tight">{item.label}</span>
            </div>
            {isOpen ? <ChevronDown size={18} strokeWidth={3} /> : <ChevronRight size={18} strokeWidth={3} />}
          </button>
          {isOpen && <div className="flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">{item.children.map((child) => <NavItem key={child.label} item={child} depth={depth + 1} />)}</div>}
        </div>
      );
    }

    if (isLogout) {
      return (
        <button onClick={onLogoutClick} className={commonClasses} style={commonStyles}>
          {Icon && <Icon size={22} strokeWidth={2.5} />}
          <span className="text-[15px] font-black tracking-tight">{item.label}</span>
        </button>
      );
    }

    if (item.openNewTab) {
      return (
        <a
          href={finalTo}
          target="_blank"
          rel="noopener noreferrer"
          className={commonClasses}
          style={commonStyles}
          onClick={isMobile ? onClose : undefined}
        >
          {Icon && <Icon size={22} strokeWidth={2.5} />}
          <div className="flex items-center justify-between flex-1">
            <span className={`tracking-tight ${isSubItem ? "text-sm font-bold" : "text-[15px] font-black"}`}>
              {item.label}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </a>
      );
    }

    return (
      <Link to={finalTo} onClick={isMobile ? onClose : undefined} className={commonClasses} style={commonStyles}>
        {Icon && <Icon size={22} strokeWidth={location.pathname === finalTo ? 3 : 2.5} />}
        <div className="flex items-center justify-between flex-1">
          <span className={`tracking-tight ${isSubItem ? "text-sm font-bold" : "text-[15px] font-black"}`}>{item.label}</span>
          {item.isLateDev && <Hammer size={12} className="text-orange-400 animate-pulse" />}
        </div>
      </Link>
    );
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-200 ${isMobile ? "w-full" : "w-[280px] shadow-2xl"}`}>
      <div className="h-20 flex items-center px-6 justify-between border-b border-gray-100">
        <Link to={isTeacher ? "/teacher/dashboard" : "/admin"} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: COLORS.primary }}>
            <span className="font-black text-xl italic">KL</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-xl tracking-tighter text-gray-950 leading-none">KoreanLab</span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Management</span>
          </div>
        </Link>
        {isMobile && <button onClick={onClose} className="p-2 text-gray-500"><X size={24} strokeWidth={3} /></button>}
      </div>

      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        {menuConfig.map((group, idx) => (
          !group.isHidden && (
            <div key={idx} className="mb-8">
              <div className="px-8 mb-4 text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: COLORS.groupLabel }}>{group.group}</div>
              <nav className="flex flex-col">
                {group.items.map((item) => <NavItem key={item.label} item={item} />)}
              </nav>
            </div>
          )
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-md border border-gray-100">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=2d5a2d&color=fff&bold=true`} 
            className="w-10 h-10 rounded-xl object-cover" 
            alt="Profile" 
          />
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm font-black text-gray-900 truncate leading-none mb-1">
                {user?.fullName || (isTeacher ? "Giáo viên" : "Quản trị")}
            </span>
            <span className="text-[10px] font-black text-[#2d5a2d] truncate uppercase tracking-tighter">
                {role} portal
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}