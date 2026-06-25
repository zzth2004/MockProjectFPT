import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Menu, Bell, User, LogOut,
  ShieldCheck, ChevronRight, ChevronDown, CheckCircle2,
  AlertCircle, BookOpen, Loader2, GraduationCap, X,
  Video, ClipboardList, CreditCard, Clock, Trophy, Inbox, Check,
  LayoutDashboard, CalendarDays, Bot, Layers, Gamepad2, Settings, MessageSquare, Sparkles
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { authLogout } from '../../services/authService';
import notificationService from "../../services/notificationService";

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
<<<<<<< HEAD
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState("ALL");
=======
  const [isNotifOpen, setIsNotifOpen] = useState(false);
>>>>>>> origin/master
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
<<<<<<< HEAD
  const notificationsRef = useRef(null);
=======
  const notifRef = useRef(null);
>>>>>>> origin/master

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const hasConsoleAccess = isAdmin || isTeacher;

<<<<<<< HEAD
  // 5. Cấu hình loại thông báo dịch vụ
  const typeConfigs = {
    SYSTEM: { label: "Hệ thống", icon: AlertCircle, colorClass: "bg-red-50 text-red-600 border border-red-100" },
    ACHIEVEMENT: { label: "Thành tích", icon: Trophy, colorClass: "bg-yellow-50 text-yellow-600 border border-yellow-100" },
    REMINDER: { label: "Nhắc nhở", icon: Clock, colorClass: "bg-amber-50 text-amber-600 border border-amber-100" },
    CLASS_LINK: { label: "Lớp học trực tiếp", icon: Video, colorClass: "bg-blue-50 text-blue-600 border border-blue-100" },
    COURSE: { label: "Khóa học", icon: BookOpen, colorClass: "bg-green-50 text-green-600 border border-green-100" },
    HOMEWORK: { label: "Bài tập", icon: ClipboardList, colorClass: "bg-orange-50 text-orange-600 border border-orange-100" },
    PAYMENT: { label: "Thanh toán", icon: CreditCard, colorClass: "bg-purple-50 text-purple-600 border border-purple-100" }
  };

  const getTypeConfig = (type) => {
    return typeConfigs[type] || { label: "Thông báo", icon: Bell, colorClass: "bg-gray-50 text-gray-600 border border-gray-100" };
  };

  // Helper format thời gian tương đối
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24) return `${diffHr} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const pageInfo = getPageInfo(location.pathname);
  const PageIcon = pageInfo.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  // Fetch dữ liệu thông báo
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getMyNotifications(1, 50);
      if (data && data.items) {
        setNotifications(data.items);
      }
      const countData = await notificationService.getUnreadCount();
      if (countData && typeof countData.count === 'number') {
        setUnreadCount(countData.count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling mỗi 30 giây để cập nhật
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    const metadata = notif.metadata || {};
    setIsNotificationsOpen(false);

    if (metadata.url) {
      if (metadata.url.startsWith("http://") || metadata.url.startsWith("https://")) {
        window.open(metadata.url, "_blank");
      } else {
        navigate(metadata.url);
      }
    } else if (metadata.action === 'NAVIGATE_TO_HOMEWORK' && metadata.homeworkId) {
      navigate(`/homework/${metadata.homeworkId}`);
    } else if (metadata.action === 'NAVIGATE_TO_LESSON' && metadata.slug) {
      navigate(`/course/lesson/${metadata.slug}`);
    } else if (metadata.action === 'NAVIGATE_TO_BILLING') {
      navigate("/user/billing");
    }
  };

  const getFilteredNotifications = () => {
    if (selectedTab === 'ALL') return notifications;
    if (selectedTab === 'SYSTEM') {
      return notifications.filter(n => ['SYSTEM', 'ACHIEVEMENT', 'REMINDER'].includes(n.type));
    }
    if (selectedTab === 'CLASS_LINK') {
      return notifications.filter(n => n.type === 'CLASS_LINK');
    }
    if (selectedTab === 'COURSE') {
      return notifications.filter(n => ['COURSE', 'HOMEWORK'].includes(n.type));
    }
    if (selectedTab === 'PAYMENT') {
      return notifications.filter(n => n.type === 'PAYMENT');
    }
    return notifications;
  };

  const getCountForTab = (tab) => {
    if (tab === 'ALL') return notifications.length;
    if (tab === 'SYSTEM') {
      return notifications.filter(n => ['SYSTEM', 'ACHIEVEMENT', 'REMINDER'].includes(n.type)).length;
    }
    if (tab === 'CLASS_LINK') {
      return notifications.filter(n => n.type === 'CLASS_LINK').length;
    }
    if (tab === 'COURSE') {
      return notifications.filter(n => ['COURSE', 'HOMEWORK'].includes(n.type)).length;
    }
    if (tab === 'PAYMENT') {
      return notifications.filter(n => n.type === 'PAYMENT').length;
    }
    return 0;
  };

  // 7. Hàm xử lý Đăng xuất
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

          {/* --- RIGHT: Actions & Profile --- */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* THÔNG BÁO DROPDOWN */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
                className={`p-2.5 rounded-full transition-all relative ${isNotificationsOpen ? "bg-green-50 text-[#2d5a2d]" : "text-gray-500 hover:bg-gray-50 hover:text-[#2d5a2d]"}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 rounded-full text-[9px] font-bold text-white border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-md border border-gray-100 rounded-[2rem] shadow-2xl py-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right z-50">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Thông báo</h3>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">Bạn có {unreadCount} thông báo chưa đọc</p>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-black text-[#2d5a2d] uppercase hover:underline transition-all flex items-center gap-1"
                      >
                        <Check size={12} /> Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Tabs phân nhóm dịch vụ */}
                  <div className="flex border-b border-gray-50 p-2 overflow-x-auto gap-1 bg-white custom-scrollbar">
                    {[
                      { key: 'ALL', label: 'Tất cả' },
                      { key: 'SYSTEM', label: 'Hệ thống' },
                      { key: 'CLASS_LINK', label: 'Lớp học' },
                      { key: 'COURSE', label: 'Khóa học' },
                      { key: 'PAYMENT', label: 'Tài chính' }
                    ].map(tab => {
                      const count = getCountForTab(tab.key);
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSelectedTab(tab.key)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                            selectedTab === tab.key 
                              ? "bg-[#2d5a2d] text-white" 
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {tab.label}
                          {count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${
                              selectedTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Danh sách thông báo */}
                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    {getFilteredNotifications().length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                          <Inbox size={22} />
                        </div>
                        <p className="text-xs font-bold text-gray-500">Không có thông báo nào thuộc mục này</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {getFilteredNotifications().map((notif) => {
                          const config = getTypeConfig(notif.type);
                          const IconComp = config.icon;
                          
                          return (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-all text-left relative ${
                                !notif.isRead ? "bg-green-50/20" : ""
                              }`}
                            >
                              {/* Cột trái: Icon dịch vụ */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.colorClass}`}>
                                <IconComp size={15} />
                              </div>

                              {/* Giữa: Nội dung */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${config.colorClass}`}>
                                    {config.label}
                                  </span>
                                  <span className="text-[9px] font-bold text-gray-400">
                                    {formatRelativeTime(notif.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-xs font-bold text-gray-900 mt-1 truncate ${!notif.isRead ? "font-black" : "text-gray-700"}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.content}
                                </p>
                              </div>

                              {/* Phải: Trạng thái chưa đọc */}
                              {!notif.isRead && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
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