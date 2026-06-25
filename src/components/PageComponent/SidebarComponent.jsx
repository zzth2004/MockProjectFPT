import React, { useState } from "react";
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
  Bot,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Trophy,
  Gamepad2,
  ClipboardList,
  User,
  BookMarked,
  Crown,
} from "lucide-react";
import { useAuth } from "../../context/authContext";

const PRIMARY = "#1a7a3c";
const PRIMARY_DARK = "#0f5a2a";

export default function Sidebar({ isMobile, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVip = user?.subscriptionPlan === "vip" || user?.isVip;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard",    to: "/user/dashboard" },
    { icon: BookOpen,        label: "Courses",       to: "/courses" },
    { icon: BookMarked,      label: "TOPIK Prep",    to: "/topik-learn",         badge: "Hot",  badgeColor: "#ef4444" },
    { icon: Layers,          label: "Flashcards",    to: "/user/flashcards",     badge: "New",  badgeColor: "#f97316" },
    { icon: Bot,             label: "AI Support",    to: "/user/ai-support",     badge: "Beta", badgeColor: "#6366f1" },
    { icon: Trophy,          label: "Leaderboard",   to: "/user/leaderboard" },
    { icon: Gamepad2,        label: "Games",         to: "/user/games" },
    { icon: ClipboardList,   label: "Quiz Room",     to: "/user/quiz" },
    { icon: CalendarDays,    label: "Schedule",      to: "/user/schedule" },
    { icon: GraduationCap,   label: "My Courses",    to: "/user/active-courses" },
  ];

  const bottomItems = [
    { icon: User,       label: "Profile",   to: "/user/profile" },
    { icon: Settings,   label: "Settings",  to: "/user/settings" },
    { icon: HelpCircle, label: "Support",   to: "/user/support" },
    { icon: LogOut,     label: "Logout",    to: "/user/logout", danger: true },
  ];

  const NavItem = ({ item }) => {
    const isActive =
      location.pathname === item.to ||
      (item.to !== "/user/dashboard" && location.pathname.startsWith(item.to));
    const Icon = item.icon;

    return (
      <Link
        to={item.to}
        onClick={isMobile && onClose ? onClose : undefined}
        className="group relative flex items-center gap-3 px-3 py-2.5 mx-2 mb-0.5 rounded-xl transition-all duration-200 overflow-hidden"
        style={{
          background: isActive
            ? "linear-gradient(135deg, rgba(26,122,60,0.1) 0%, rgba(34,197,94,0.07) 100%)"
            : "transparent",
          color: item.danger ? "#ef4444" : isActive ? PRIMARY : "#64748b",
          border: isActive ? "1px solid rgba(26,122,60,0.15)" : "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = item.danger
              ? "rgba(239,68,68,0.06)"
              : "rgba(26,122,60,0.05)";
            e.currentTarget.style.color = item.danger ? "#dc2626" : PRIMARY;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = item.danger ? "#ef4444" : "#64748b";
          }
        }}
      >
        {/* Active left indicator */}
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
            style={{
              background: `linear-gradient(180deg, ${PRIMARY}, #22c55e)`,
              height: "20px",
            }}
          />
        )}

        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
          style={{
            background: isActive
              ? "rgba(26,122,60,0.12)"
              : "rgba(0,0,0,0.04)",
          }}
        >
          <Icon
            size={16}
            strokeWidth={isActive ? 2.5 : 2}
            className="flex-shrink-0"
          />
        </div>

        {/* Label */}
        <span className={`flex-1 text-sm ${isActive ? "font-bold" : "font-medium"}`}>
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-md font-extrabold text-white leading-none"
            style={{ background: item.badgeColor }}
          >
            {item.badge}
          </span>
        )}

        {isActive && (
          <ChevronRight size={13} className="opacity-40 flex-shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col h-full transition-all ${isMobile ? "w-full" : "w-[260px]"}`}
      style={{
        background: "white",
        borderRight: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
      }}
    >
      {/* ── HEADER / LOGO ── */}
      <div
        className="h-[68px] flex items-center px-5 justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Link to="/user/dashboard" className="flex items-center gap-3 group">
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 overflow-hidden transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY_DARK} 0%, ${PRIMARY} 50%, #22c55e 100%)`,
              boxShadow: "0 4px 14px rgba(26,122,60,0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)" }}
            />
            <span className="font-extrabold text-sm tracking-tight relative z-10">KL</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base tracking-tight text-gray-900">KoreanLab</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: PRIMARY }}>
              E-Learning
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        {/* Navigation label */}
        <div className="px-5 mb-2 mt-1">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-300">
            Main Menu
          </span>
        </div>

        <nav className="mb-2">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        {/* Divider */}
        <div
          className="mx-5 my-3"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.07), transparent)",
          }}
        />

        {/* System label */}
        <div className="px-5 mb-2">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-300">
            System
          </span>
        </div>

        <nav>
          {bottomItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
      </div>

      {/* ── VIP / UPGRADE CARD ── */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {isVip ? (
          <div
            className="relative overflow-hidden rounded-xl p-3.5 cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1a7a3c 0%, #2da05a 100%)",
              boxShadow: "0 8px 24px rgba(26,122,60,0.25)",
            }}
            onClick={() => navigate("/user/upgrade")}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Crown size={15} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">VIP Member</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>Full access unlocked</p>
              </div>
              <CheckCircle2 size={14} className="text-white/70 flex-shrink-0 ml-auto" />
            </div>
          </div>
        ) : (
          <div
            className="relative overflow-hidden rounded-xl p-3.5 cursor-pointer transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
            onClick={() => navigate("/user/upgrade")}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-20" style={{ background: "#4ade80" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-green-400" />
                <span className="text-xs font-extrabold text-white">Upgrade Premium</span>
              </div>
              <p className="text-[10px] mb-2.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Mở khóa AI không giới hạn & toàn bộ Flashcards
              </p>
              <div
                className="w-full py-1.5 rounded-lg text-[10px] font-bold text-center"
                style={{ background: "rgba(74,222,128,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)" }}
              >
                Upgrade ngay →
              </div>
            </div>
          </div>
        )}

        {/* User info */}
        <div className="mt-2.5 flex items-center gap-2.5 px-1">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=1a7a3c&color=fff&bold=true`
            }
            className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
            style={{ border: "2px solid rgba(26,122,60,0.15)" }}
            alt="Profile"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate leading-none text-gray-800">
              {user?.fullName || "Học viên"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: PRIMARY }}>
              learner
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
