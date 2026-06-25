import React, { useState, useRef, useEffect } from "react";
import { 
  Search, Menu, Bell, User, LogOut,
  ShieldCheck, ChevronRight, ChevronDown, CheckCircle2,
  AlertCircle, BookOpen, Loader2, GraduationCap, X,
  Video, ClipboardList, CreditCard, Clock, Trophy, Inbox, Check
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Logic - Đảm bảo các đường dẫn này chính xác với project của bạn
import { useAuth } from "../../context/authContext"; 
import { authLogout } from '../../services/authService';
import notificationService from "../../services/notificationService";

export default function MainHeader({ onMenuClick }) {
  const navigate = useNavigate();
  
  // 1. Lấy thông tin user từ AuthContext (đã được lưu trong LocalStorage/Session)
  const { user } = useAuth(); 

  // 2. States quản lý giao diện
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 3. Refs để xử lý click outside (đóng dropdown khi bấm ra ngoài)
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // 4. Logic Phân quyền
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const hasConsoleAccess = isAdmin || isTeacher;

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

  // 6. Effect: Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

            <div className="h-6 w-px bg-gray-100 mx-1"></div>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
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