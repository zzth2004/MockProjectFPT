import React, { useState, useRef, useEffect } from "react";
import {
  Search, Menu, Bell, User, LogOut,
  ShieldCheck, ChevronDown, CheckCircle2, AlertCircle,
  BookOpen, Loader2, GraduationCap, X, ChevronRight,
  LayoutDashboard, CalendarDays, Bot, Layers, Trophy,
  Gamepad2, ClipboardList, Settings, MessageSquare, Sparkles,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { authLogout } from '../../services/authService';

const PRIMARY = "#1a7a3c";

// Map route → page info
const PAGE_MAP = {
  "/user/dashboard":     { label: "Dashboard",    icon: LayoutDashboard, emoji: "🏠" },
  "/courses":            { label: "Courses",       icon: BookOpen,        emoji: "📚" },
  "/topik-learn":        { label: "TOPIK Prep",    icon: BookOpen,        emoji: "🎯" },
  "/user/flashcards":    { label: "Flashcards",    icon: Layers,          emoji: "🃏" },
  "/user/ai-support":    { label: "AI Support",    icon: Bot,             emoji: "🤖" },
  "/user/leaderboard":   { label: "Leaderboard",   icon: Trophy,          emoji: "🏆" },
  "/user/games":         { label: "Games",         icon: Gamepad2,        emoji: "🎮" },
  "/user/quiz":          { label: "Quiz Room",     icon: ClipboardList,   emoji: "✏️" },
  "/user/schedule":      { label: "Schedule",      icon: CalendarDays,    emoji: "📅" },
  "/user/active-courses":{ label: "My Courses",    icon: GraduationCap,   emoji: "🎓" },
  "/user/settings":      { label: "Settings",      icon: Settings,        emoji: "⚙️" },
  "/user/profile":       { label: "Profile",       icon: User,            emoji: "👤" },
  "/user/support":       { label: "Support",       icon: MessageSquare,   emoji: "💬" },
  "/user/upgrade":       { label: "Upgrade",       icon: Sparkles,        emoji: "✨" },
  "/admin":              { label: "Admin Dashboard", icon: ShieldCheck,   emoji: "🛡️" },
};

function getPageInfo(pathname) {
  // Exact match first
  if (PAGE_MAP[pathname]) return PAGE_MAP[pathname];
  // Prefix match
  for (const [route, info] of Object.entries(PAGE_MAP)) {
    if (route !== "/" && pathname.startsWith(route)) return info;
  }
  return { label: "KoreanLab", icon: BookOpen, emoji: "📖" };
}

export default function MainHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const hasConsoleAccess = isAdmin || isTeacher;

  const pageInfo = getPageInfo(location.pathname);
  const PageIcon = pageInfo.icon;

  // Mock notifications
  const notifications = [
    { id: 1, type: "streak", title: "🔥 Streak 7 ngày!", body: "Bạn đã học liên tiếp 7 ngày. Xuất sắc!", time: "2 phút trước", read: false },
    { id: 2, type: "lesson", title: "📚 Bài mới đã có", body: "Bài 12: Đặt hàng & Mua sắm vừa được thêm", time: "1 giờ trước", read: false },
    { id: 3, type: "reminder", title: "⏰ Đến giờ ôn tập", body: "Bộ flashcard 'Từ vựng bài 3' cần ôn lại hôm nay", time: "3 giờ trước", read: true },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const iconBtnStyle = {
    padding: "8px",
    borderRadius: "10px",
    transition: "all 0.15s ease",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "#6b7280",
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        {/* Gradient top line */}
        <div
          className="h-[2px] w-full header-gradient-line"
          style={{
            background: `linear-gradient(90deg, transparent, ${PRIMARY}, #4ade80, ${PRIMARY}, transparent)`,
          }}
        />

        <div className="h-[60px] w-full px-4 sm:px-6 flex items-center justify-between">

          {/* ── LEFT: Hamburger + Page Title ── */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-500 transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Menu size={20} />
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-2.5">
              <div
                className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(26,122,60,0.08)",
                }}
              >
                <PageIcon size={16} style={{ color: PRIMARY }} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-extrabold text-gray-900 leading-none text-[15px] hidden sm:block">
                  {pageInfo.label}
                </h1>
                {/* Breadcrumb hint */}
                <p className="text-[10px] text-gray-400 font-medium hidden md:block mt-0.5">
                  KoreanLab · {pageInfo.label}
                </p>
              </div>
            </div>
          </div>

          {/* ── CENTER: Search (desktop) ── */}
          <div className="hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search
                  size={14}
                  style={{ color: searchFocused ? PRIMARY : "#9ca3af" }}
                  className="transition-colors"
                />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khoá học, từ vựng..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-[260px] lg:w-[360px] py-2 pl-9 pr-4 text-sm font-medium rounded-xl outline-none transition-all duration-200"
                style={{
                  background: searchFocused ? "white" : "rgba(0,0,0,0.04)",
                  border: searchFocused
                    ? `1.5px solid rgba(26,122,60,0.35)`
                    : "1.5px solid transparent",
                  boxShadow: searchFocused
                    ? "0 0 0 4px rgba(26,122,60,0.06)"
                    : "none",
                  color: "#111827",
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: Notifications + Profile ── */}
          <div className="flex items-center gap-1">

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                style={{
                  ...iconBtnStyle,
                  background: isNotifOpen ? "rgba(26,122,60,0.08)" : "transparent",
                  color: isNotifOpen ? PRIMARY : "#6b7280",
                }}
                onMouseEnter={(e) => {
                  if (!isNotifOpen) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.05)";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNotifOpen) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6b7280";
                  }
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-extrabold"
                    style={{ background: "#ef4444", fontSize: "9px" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
                    zIndex: 50,
                  }}
                >
                  <div
                    className="px-5 py-3.5 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={14} style={{ color: PRIMARY }} />
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-700">
                        Thông báo
                      </h3>
                      {unreadCount > 0 && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold text-white"
                          style={{ background: "#ef4444" }}
                        >
                          {unreadCount} mới
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3.5 flex gap-3 transition-colors cursor-pointer"
                        style={{
                          borderBottom: "1px solid rgba(0,0,0,0.04)",
                          background: notif.read ? "transparent" : "rgba(26,122,60,0.03)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = notif.read ? "transparent" : "rgba(26,122,60,0.03)"; }}
                      >
                        <div className="mt-0.5">
                          {!notif.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5"
                              style={{ background: PRIMARY }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 leading-snug mb-0.5">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-gray-300 font-semibold mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-3 text-xs font-extrabold uppercase tracking-wider transition-colors"
                    style={{ color: PRIMARY, borderTop: "1px solid rgba(0,0,0,0.05)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,122,60,0.04)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    Xem tất cả thông báo
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl transition-all duration-200"
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    border: `2px solid rgba(26,122,60,0.2)`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.fullName || "User"
                      )}&background=1a7a3c&color=fff&bold=true`
                    }
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-800 leading-none">
                    {(user?.fullName || "Học viên").split(" ").slice(-1)[0]}
                  </span>
                </div>
                <ChevronDown
                  size={13}
                  className={`text-gray-400 hidden sm:block transition-transform duration-300 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 20px 56px rgba(0,0,0,0.14)",
                    zIndex: 50,
                  }}
                >
                  {/* User info */}
                  <div
                    className="p-4"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ border: `2px solid rgba(26,122,60,0.2)` }}
                      >
                        <img
                          src={
                            user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user?.fullName || "User"
                            )}&background=1a7a3c&color=fff&bold=true`
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-extrabold text-gray-900 truncate">
                            {user?.fullName || "Học viên"}
                          </p>
                          <CheckCircle2 size={12} style={{ color: PRIMARY }} className="flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide"
                      style={{
                        background: isAdmin
                          ? "rgba(239,68,68,0.08)"
                          : isTeacher
                          ? "rgba(59,130,246,0.08)"
                          : "rgba(26,122,60,0.08)",
                        color: isAdmin ? "#dc2626" : isTeacher ? "#2563eb" : PRIMARY,
                      }}
                    >
                      {user?.role || "Student"}
                    </span>
                  </div>

                  {/* Menu */}
                  <div className="p-2 space-y-0.5">
                    <button
                      onClick={() => { navigate("/user/profile"); setIsProfileOpen(false); }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-600 rounded-xl transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#111827"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}
                    >
                      <User size={15} className="text-gray-400" />
                      Hồ sơ cá nhân
                    </button>

                    <button
                      onClick={() => { navigate("/user/settings"); setIsProfileOpen(false); }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-sm font-semibold text-gray-600 rounded-xl transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#111827"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}
                    >
                      <Settings size={15} className="text-gray-400" />
                      Cài đặt
                    </button>

                    {hasConsoleAccess && (
                      <button
                        onClick={() => {
                          isAdmin
                            ? navigate("/admin")
                            : navigate("/teacher/dashboard");
                          setIsProfileOpen(false);
                        }}
                        className="w-full mt-1 px-3 py-2.5 rounded-xl flex items-center justify-between transition-all"
                        style={{
                          background: isAdmin ? "#0f172a" : "#1d4ed8",
                          color: "white",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                      >
                        <div className="flex items-center gap-2.5">
                          {isAdmin ? (
                            <ShieldCheck size={15} style={{ color: "#4ade80" }} />
                          ) : (
                            <GraduationCap size={15} style={{ color: "#93c5fd" }} />
                          )}
                          <span className="text-xs font-extrabold uppercase tracking-wide">
                            {isAdmin ? "Admin Console" : "Teacher Console"}
                          </span>
                        </div>
                        <ChevronRight size={13} className="opacity-60" />
                      </button>
                    )}

                    <div
                      className="pt-1 mt-1"
                      style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                    >
                      <button
                        onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-sm font-semibold text-red-500 rounded-xl transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <LogOut size={15} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden"
            style={{
              background: "white",
              boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <AlertCircle size={32} style={{ color: "#ef4444" }} />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Đăng xuất?</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Bạn có chắc muốn thoát khỏi hệ thống? Tiến trình học sẽ được lưu lại.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="py-3.5 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                  boxShadow: "0 8px 24px rgba(220,38,38,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
              >
                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                {isLoggingOut ? "Đang xử lý..." : "Có, đăng xuất ngay"}
              </button>
              <button
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3.5 rounded-xl font-bold text-sm text-gray-400 transition-colors hover:bg-gray-100"
              >
                Ở lại trang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}