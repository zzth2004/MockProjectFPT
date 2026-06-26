import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit3, Mail, Phone, MapPin, Calendar, Star,
  BookOpen, ShoppingBag, Award, Zap, Layers, Users, 
  Lock, Unlock, KeyRound, MailCheck, AlertCircle, X, Send, CheckCircle2
} from "lucide-react";

// Components
import { KLCard } from "../../Component/Card";
import { KLButton } from "../../Component/Button";
import { KLBadge } from "../../Component/Badge";
import { KLInput } from "../../Component/Input";

// Services
import userService from "../../Service/API/userServiceAPI/user.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";

// Helper Component for Info Item
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm hover:border-emerald-200 transition-all duration-300">
    <div className="w-9 h-9 rounded-xl bg-green-50 text-[#2d5a2d] flex items-center justify-center shrink-0">
      <Icon size={16} />
    </div>
    <div className="text-left overflow-hidden">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-gray-800 break-all leading-normal">
        {value || "---"}
      </p>
    </div>
  </div>
);

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [isResetSuccessOpen, setIsResetSuccessOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const userRes = await userService.getUserById(id);
      const userData = userRes.data || userRes;

      if (!userData) {
        throw new Error("User not found");
      }

      let courses = [];
      const userRole = userData.role?.toLowerCase();

      if (["admin", "teacher", "quản trị viên", "giáo viên"].includes(userRole)) {
        try {
          const courseRes = await courseService.getMyCourseAandT(userData.id, 1, 100);
          courses = courseRes?.data || courseRes || [];
        } catch (err) {
          console.warn("Không lấy được danh sách khóa học của User này:", err);
        }
      }

      setUser({
        ...userData,
        createdCourses: courses,
      });
    } catch (error) {
      console.error("Lỗi fetch user detail:", error);
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Lock / Unlock user account
  const handleToggleStatus = async () => {
    if (!user) return;
    const nextActiveState = !user.isActive;
    const message = nextActiveState 
      ? `Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${user.username || user.email}?` 
      : `Bạn có chắc chắn muốn KHÓA tài khoản ${user.username || user.email}?`;

    if (window.confirm(message)) {
      try {
        await userService.updateProfile(user.id, { isActive: nextActiveState });
        setUser(prev => prev ? { ...prev, isActive: nextActiveState } : null);
        alert(`✅ Đã ${nextActiveState ? "mở khóa" : "khóa"} tài khoản thành công!`);
      } catch (err) {
        console.error("Lỗi đổi trạng thái hoạt động:", err);
        alert("❌ Thao tác thất bại!");
      }
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!user) return;
    if (window.confirm(`⚠️ Bạn có chắc chắn muốn ĐẶT LẠI MẬT KHẨU cho tài khoản ${user.email}?\n\nMật khẩu mới sẽ được tạo ngẫu nhiên trên Firebase Auth và gửi qua email cho người dùng này.`)) {
      setResetLoading(true);
      try {
        await userService.resetPassword(user.id);
        setIsResetSuccessOpen(true);
      } catch (err) {
        console.error("Lỗi đặt lại mật khẩu:", err);
        alert("❌ Đặt lại mật khẩu thất bại!");
      } finally {
        setResetLoading(false);
      }
    }
  };

  // Send email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailContent.trim() || emailSending) return;

    setEmailSending(true);
    try {
      await userService.sendEmail(user.id, emailSubject.trim(), emailContent.trim());
      setEmailSuccess(true);
      setEmailSubject("");
      setEmailContent("");
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Lỗi gửi email:", err);
      alert("❌ Không thể gửi email. Vui lòng kiểm tra lại cấu hình mail server.");
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC] gap-3">
        <div className="w-10 h-10 border-4 border-[#2d5a2d] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Đang tải hồ sơ...</span>
      </div>
    );
  }

  if (!user) return null;

  const isManager = ["admin", "teacher"].includes(user.role?.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20 p-4 md:p-8 animate-in fade-in duration-500 text-left">
      
      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white text-gray-500 hover:text-[#2d5a2d] hover:bg-green-50 flex items-center justify-center shadow-sm border border-gray-100/70 transition-all active:scale-95"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tight">
              Hồ sơ <span className="text-[#2d5a2d]">{isManager ? "Nhân sự" : "Học viên"}</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
              Mã người dùng: #{user.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto items-start">
        
        {/* COLUMN 1: PROFILE SUMMARY (LEFT COLUMN) */}
        <div className="space-y-6">
          
          {/* Main profile card */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users size={120} strokeWidth={1} />
            </div>

            <div className="w-32 h-32 mx-auto bg-green-50 rounded-[2.5rem] flex items-center justify-center text-[#2d5a2d] font-black text-5xl border-4 border-white shadow-xl mb-4 overflow-hidden relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                (user.fullName || "U")[0]?.toUpperCase()
              )}
            </div>

            <h2 className="text-xl font-black text-gray-950 uppercase italic tracking-tight leading-none mb-1.5">
              {user.fullName || "Chưa đặt tên"}
            </h2>
            <p className="text-xs font-bold text-gray-400 mb-4">
              @{user.username || "username"}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              <KLBadge type={user.role === 'admin' ? 'warning' : 'success'}>
                <span className="text-[8px] font-black uppercase tracking-wider">{user.role}</span>
              </KLBadge>
              <KLBadge type={user.isActive ? 'success' : 'danger'}>
                <span className="text-[8px] font-black uppercase tracking-wider">{user.isActive ? "Đang hoạt động" : "Bị khóa"}</span>
              </KLBadge>
            </div>

            {/* Quick Control Panel */}
            <div className="pt-6 border-t border-slate-100/80 flex flex-col gap-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-left px-1">Bảng thao tác nhanh</h4>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider text-[#2d5a2d] bg-emerald-50 hover:bg-[#2d5a2d] hover:text-white border border-emerald-100 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Mail size={14} /> Gửi Email thông báo
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleToggleStatus}
                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                      user.isActive 
                        ? 'text-orange-700 bg-orange-50/50 border-orange-100 hover:bg-orange-600 hover:text-white' 
                        : 'text-green-700 bg-green-50/50 border-green-100 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    {user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                    {user.isActive ? "Khóa Nick" : "Mở Nick"}
                  </button>

                  <button 
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/50 border border-blue-100 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <KeyRound size={14} />
                    {resetLoading ? "Đặt lại..." : "Reset Pass"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
              Thông tin liên hệ
            </h3>
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Phone} label="Điện thoại" value={user.phone} />
            <InfoItem icon={MapPin} label="Địa chỉ" value={user.address} />
            <InfoItem icon={Calendar} label="Múi giờ" value={user.timezone} />
          </div>

          {/* Learning Goal (Only for Student) */}
          {!isManager && (
            <div className="bg-gradient-to-br from-[#2d5a2d] to-[#1e3d1e] p-6 rounded-[2rem] shadow-lg shadow-green-950/15 text-white relative overflow-hidden text-left">
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                  <Star size={18} className="text-yellow-300" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[9px] font-black opacity-60 uppercase tracking-widest leading-none mb-1">
                    Trình độ hiện tại
                  </p>
                  <p className="text-base font-black uppercase tracking-wider leading-none mt-0.5">{user.level || "TOPIK 1"}</p>
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs font-bold">
                <p className="flex justify-between items-center opacity-85">
                  <span className="opacity-70 font-medium">Mục tiêu tuần:</span>
                  <span className="font-black text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">{user.studyHoursPerWeek || 0} giờ học</span>
                </p>
                <p className="flex justify-between items-start opacity-85 gap-2">
                  <span className="opacity-70 font-medium shrink-0">Mục tiêu học:</span>
                  <span className="font-black text-right line-clamp-2">{user.learningGoal || "Học giao tiếp cơ bản"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2: ROLE DETAILS (RIGHT COLUMN) */}
        <div className="lg:col-span-2 space-y-6">
          {isManager ? (
            /* ===============================================
               MANAGER PROFILE (ADMIN / TEACHER COURSES)
               =============================================== */
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 uppercase tracking-tight">
                      <Layers className="text-[#2d5a2d]" /> Khóa học đang quản lý
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Các lớp, bài giảng do nhân sự này biên soạn</p>
                </div>
                <span className="bg-green-50 text-[#2d5a2d] px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-green-100">
                  {user.createdCourses?.length || 0} Khóa
                </span>
              </div>

              <div className="pr-1 custom-scrollbar flex-1 space-y-3">
                {user.createdCourses && user.createdCourses.length > 0 ? (
                  user.createdCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white rounded-3xl transition-all duration-300 border border-slate-100 hover:border-emerald-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0 pr-4">
                        <div className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                          <BookOpen size={18} />
                        </div>
                        <div className="min-w-0 text-left">
                          <h4 className="font-black text-gray-800 text-sm truncate leading-snug">
                            {course.title}
                          </h4>
                          <p className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-wider leading-none">
                            Mã số: #{course.id}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Ghi danh</p>
                        <p className="font-black flex items-center justify-end gap-1 text-gray-800 text-sm mt-1.5 leading-none">
                          <Users size={12} className="text-[#2d5a2d]" /> {course.enrollments?.length || 0}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50/50">
                    <BookOpen size={36} className="text-gray-300 mb-3 animate-pulse" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chưa quản lý khóa học nào</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===============================================
               STUDENT PROFILE (CLASSES & BILLING)
               =============================================== */
            <>
              {/* Courses Enrollments */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 text-left">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                      <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 uppercase tracking-tight">
                        <BookOpen className="text-[#2d5a2d]" /> Khóa học đã tham gia
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Tiến độ hoàn thành bài tập của học viên</p>
                  </div>
                  <span className="bg-green-50 text-[#2d5a2d] px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase border border-green-100 tracking-wider">
                    {user.enrollments?.length || 0} Khóa
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.enrollments && user.enrollments.length > 0 ? (
                    user.enrollments.map((enroll, idx) => (
                      <div key={idx} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between gap-4 hover:border-emerald-300 hover:bg-white hover:shadow-sm transition-all duration-300">
                        <div>
                          <h4 className="font-black text-gray-800 text-sm leading-snug line-clamp-1">
                            {enroll.course?.title || "Khóa học không tên"}
                          </h4>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 block">
                            Tiến trình học tập
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-black text-[#2d5a2d] leading-none mb-1">
                            <span>{enroll.progress || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2d5a2d] to-[#4ade80] rounded-full transition-all duration-500"
                              style={{ width: `${enroll.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-16 text-center text-gray-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl flex flex-col items-center justify-center">
                      <BookOpen size={36} className="text-gray-300 mb-2" />
                      <span className="text-xs font-black uppercase tracking-widest">Chưa ghi danh khóa học nào</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoices List */}
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 text-left">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                      <h3 className="text-lg font-black text-gray-950 flex items-center gap-2 uppercase tracking-tight">
                        <ShoppingBag className="text-blue-600" /> Lịch sử hóa đơn học phí
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Danh sách các giao dịch đăng ký học tập</p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase border border-blue-100 tracking-wider">
                    {user.orders?.length || 0} Bill
                  </span>
                </div>
                
                {user.orders && user.orders.length > 0 ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/60 border-b border-slate-100">
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thanh toán</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {user.orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4 text-xs font-black text-gray-900 font-mono">#{order.orderCode || order.id}</td>
                            <td className="p-4 text-xs font-black text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(order.finalAmount || order.totalAmount || 0)}
                            </td>
                            <td className="p-4 text-xs font-bold text-gray-500 uppercase">{order.paymentMethod || "COD"}</td>
                            <td className="p-4 text-xs font-bold">
                              <KLBadge type={order.status === "paid" || order.status === "PAID" ? "success" : "warning"}>
                                <span className="text-[8px] font-black uppercase tracking-wider">{order.status}</span>
                              </KLBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl flex flex-col items-center justify-center">
                    <ShoppingBag size={36} className="text-gray-300 mb-2" />
                    <span className="text-xs font-black uppercase tracking-widest">Chưa phát sinh giao dịch</span>
                  </div>
                )}
              </div>

              {/* Gamification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/80 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                      Điểm thưởng tích lũy
                    </p>
                    <p className="text-xl font-black text-gray-800 leading-none">
                      {user.pointStats?.currentPoints || 0} <span className="text-xs font-bold text-gray-400">Point</span>
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/80 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                    <Award size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
                      Huy hiệu đạt được
                    </p>
                    <p className="text-xl font-black text-gray-800 leading-none">
                      {user.badges?.length || 0} <span className="text-xs font-bold text-gray-400">Badge</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SEND EMAIL MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Gửi Email thông báo</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Gửi trực tiếp email hệ thống đến học viên</p>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-2 hover:bg-slate-150 rounded-xl text-gray-400 transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {emailSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce">
                  <MailCheck size={36} />
                </div>
                <h4 className="text-xl font-black text-gray-950 uppercase">Gửi thành công!</h4>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">Hệ thống đã chuyển phát email thành công đến {user.email}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                <KLInput 
                  label="Tiêu đề Email" 
                  placeholder="Nhập tiêu đề của thông báo..." 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-2 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Nội dung thư</label>
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-150 rounded-2xl py-4 px-6 font-bold text-gray-800 focus:border-[#2d5a2d] focus:bg-white outline-none transition-all shadow-inner h-32 resize-none text-sm"
                    placeholder="Soạn nội dung chi tiết gửi đến người dùng..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 justify-end border-t border-slate-100">
                  <KLButton variant="outline" type="button" onClick={() => setIsEmailModalOpen(false)}>Hủy</KLButton>
                  <KLButton type="submit" disabled={emailSending} icon={Send}>
                    {emailSending ? "Đang gửi..." : "Gửi thư ngay"}
                  </KLButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RESET PASSWORD SUCCESS MODAL */}
      {isResetSuccessOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center border border-slate-100 space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto shadow-inner shadow-green-100">
              <CheckCircle2 size={36} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Đặt lại thành công!</h3>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">HỆ THỐNG MÃ HÓA BẢO MẬT</p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-800 leading-relaxed font-bold text-left flex gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                Mật khẩu mới đã được đặt ngẫu nhiên bảo mật trên **Firebase Auth** và được chuyển đến email **{user.email}**. 
                Để đảm bảo tính riêng tư, Admin không thể trực tiếp xem mật khẩu này.
              </span>
            </div>

            <KLButton className="w-full" onClick={() => setIsResetSuccessOpen(false)}>
              Hoàn thành
            </KLButton>
          </div>
        </div>
      )}
    </div>
  );
}
