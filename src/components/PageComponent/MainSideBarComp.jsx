import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, User, Settings, LogOut, X,
  ChevronDown, ChevronRight, ShoppingCart, FileText,
  Layers, Bot, Trophy, Rss, Book as BookIcon,
  MessageSquare, ShieldCheck, ListChecks, CreditCard, Tag, Hammer,
  Calendar
} from "lucide-react";
import { useAuth } from '../../context/authContext';

export default function Sidebar({ isMobile, onClose, onLogoutClick }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "guest";
  const isTeacher = role === "teacher";
  const basePath = isTeacher ? "/teacher" : "/admin";

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuConfig = [
    {
      group: "Hệ thống & Người dùng",
      items: [
        { icon: LayoutDashboard, label: "Tổng quan", to: isTeacher ? "/teacher/dashboard" : "/admin" },
        {
          icon: User,
          label: isTeacher ? "Học sinh" : "Người dùng",
          children: [
            { label: isTeacher ? "Danh sách học sinh" : "Danh sách User", to: `${basePath}/users` },
          ]
        },
        { icon: Calendar, label: "Lịch dạy", to: "/teacher/scheduleteacher", isHidden: !isTeacher },
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
            { label: "Kết quả làm bài", to: `${basePath}/exercise-attempts` },
          ]
        },
        { icon: Layers, label: "Flashcards", to: `${basePath}/flashcards`, isLateDev: true },
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
          icon: Tag, label: "Khuyến mãi", isLateDev: true,
          children: [
            { label: "Mã giảm giá (Coupon)", to: `${basePath}/coupons` },
            { label: "Lịch sử sử dụng", to: `${basePath}/coupon-usage` },
          ]
        },
      ]
    },
    {
      group: "Tính năng mở rộng",
      items: [
        { icon: Bot, label: "AI Learning", to: `${basePath}/ai`, isLateDev: true },
        { icon: Trophy, label: "Gamification", isHidden: isTeacher, isLateDev: true, children: [{ label: "Điểm thưởng", to: `${basePath}/points` }, { label: "Huy hiệu", to: `${basePath}/badges` }] },
        { icon: Rss, label: "Blog & Tin tức", to: `${basePath}/blog`, isLateDev: true },
        { icon: BookIcon, label: "Thư viện sách", to: `${basePath}/books`, isHidden: isTeacher },
      ]
    },
    {
      group: "Cài đặt & Hỗ trợ",
      items: [
        { icon: ShieldCheck, label: "Classroom Sync", to: `${basePath}/google-sync`, isLateDev: true },
        { icon: MessageSquare, label: "Support Tickets", to: `${basePath}/tickets`, isHidden: isTeacher, isLateDev: true },
        { icon: Settings, label: "Cài đặt hệ thống", to: `${basePath}/settings` },
        { icon: LogOut, label: "Đăng xuất", isLogout: true },
      ]
    }
  ];

  const NavItem = ({ item, depth = 0 }) => {
    if (item.isHidden) return null;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    const finalTo = item.isLateDev ? `${basePath}/late-dev` : item.to;
    const isActive =
      location.pathname === finalTo ||
      (hasChildren && item.children.some((c) => location.pathname === (c.isLateDev ? `${basePath}/late-dev` : c.to)));
    const Icon = item.icon;
    const isSubItem = depth > 0;

    if (item.isLogout) {
      return (
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mb-0.5"
          style={{
            width: "calc(100% - 16px)",
            marginLeft: "8px",
            color: "#f87171",
            background: "transparent",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <div
            className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: "rgba(248,113,113,0.1)" }}
          >
            {Icon && <Icon size={15} strokeWidth={2} />}
          </div>
          <span className="text-sm font-semibold">{item.label}</span>
        </button>
      );
    }

    if (hasChildren) {
      return (
        <div className="w-full">
          <button
            onClick={() => toggleMenu(item.label)}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 mb-0.5"
            style={{
              width: "calc(100% - 16px)",
              marginLeft: "8px",
              background: isActive ? "rgba(74,222,128,0.1)" : "transparent",
              color: isActive ? "#4ade80" : "var(--sidebar-text)",
            }}
            onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--sidebar-text-hover)"; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; } }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ background: isActive ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.05)" }}
              >
                {Icon && <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />}
              </div>
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
            {isOpen
              ? <ChevronDown size={13} className="opacity-40" />
              : <ChevronRight size={13} className="opacity-40" />}
          </button>
          {isOpen && (
            <div className="flex flex-col pl-1">
              {item.children.map((child) => (
                <NavItem key={child.label} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={finalTo}
        onClick={isMobile ? onClose : undefined}
        className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 mb-0.5 group relative overflow-hidden"
        style={{
          width: isSubItem ? "calc(100% - 40px)" : "calc(100% - 16px)",
          marginLeft: isSubItem ? "40px" : "8px",
          background: isActive ? "rgba(74,222,128,0.1)" : "transparent",
          color: isActive ? "#4ade80" : isSubItem ? "var(--sidebar-text)" : "var(--sidebar-text)",
          border: isActive ? "1px solid rgba(74,222,128,0.18)" : "1px solid transparent",
        }}
        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--sidebar-text-hover)"; } }}
        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; } }}
      >
        {isActive && (
          <div
            className="sidebar-active-bar absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
            style={{ background: "linear-gradient(180deg, #4ade80, #22c55e)", height: "18px" }}
          />
        )}
        <div className="flex items-center gap-2.5 pl-0.5">
          {!isSubItem && Icon && (
            <div
              className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ background: isActive ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.05)" }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
            </div>
          )}
          {isSubItem && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 ml-1"
              style={{ background: isActive ? "#4ade80" : "rgba(255,255,255,0.2)" }}
            />
          )}
          <span className={`${isSubItem ? "text-[12px]" : "text-sm"} font-${isActive ? "bold" : "medium"}`}>
            {item.label}
          </span>
          {item.isLateDev && (
            <Hammer size={10} className="text-orange-400 animate-pulse ml-0.5" />
          )}
        </div>
        {isActive && <ChevronRight size={12} className="opacity-40" />}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col h-full ${isMobile ? "w-full" : "w-[280px]"}`}
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        boxShadow: "var(--shadow-sidebar)",
      }}
    >
      {/* ── HEADER ── */}
      <div
        className="h-[68px] flex items-center px-5 justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link
          to={isTeacher ? "/teacher/dashboard" : "/admin"}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 overflow-hidden"
            style={{
              background: isTeacher
                ? "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
                : "linear-gradient(135deg, #0f5a2a 0%, #1a7a3c 100%)",
              boxShadow: isTeacher
                ? "0 4px 14px rgba(59,130,246,0.35)"
                : "0 4px 14px rgba(34,197,94,0.35)",
            }}
          >
            <span className="font-extrabold text-sm italic tracking-tight">KL</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base tracking-tight text-white">KoreanLab</span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: isTeacher ? "#93c5fd" : "#4ade80" }}
            >
              {isTeacher ? "Teacher" : "Admin"} Portal
            </span>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--sidebar-text)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-y-auto py-3 dark-scrollbar">
        {menuConfig.map((group, idx) =>
          !group.isHidden ? (
            <div key={idx} className="mb-5">
              <div
                className="px-5 mb-2 text-[9px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: "var(--sidebar-group-label)" }}
              >
                {group.group}
              </div>
              <nav className="flex flex-col">
                {group.items.map((item) => (
                  <NavItem key={item.label} item={item} />
                ))}
              </nav>
            </div>
          ) : null
        )}
      </div>

      {/* ── USER FOOTER ── */}
      <div
        className="p-4 flex-shrink-0"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=1a7a3c&color=fff&bold=true`}
            className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
            alt="Profile"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate leading-none mb-1" style={{ color: "var(--sidebar-text-hover)" }}>
              {user?.fullName || (isTeacher ? "Giáo viên" : "Quản trị viên")}
            </span>
            <span
              className="text-[9px] font-extrabold uppercase tracking-wide"
              style={{ color: isTeacher ? "#93c5fd" : "#4ade80" }}
            >
              {role} portal
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}