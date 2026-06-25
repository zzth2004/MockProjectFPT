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

// Helper Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100/50 hover:bg-gray-100/50 transition-colors">
    <div className="text-gray-400">
      <Icon size={18} />
    </div>
    <div className="text-left">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-800 break-all">
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-8 border-gray-100 border-t-[#2d5a2d] rounded-full animate-spin"></div>
        <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] animate-pulse">Đang tải hồ sơ...</p>
      </div>
    );

  if (!user) return null;

  const isManager = ["admin", "teacher"].includes(user.role?.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#F8F9FC]/90 backdrop-blur-sm z-30 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white text-gray-500 hover:bg-gray-100 hover:text-[#2d5a2d] flex items-center justify-center shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-left">
            <h1 className="text-2xl font-black text-gray-900 uppercase italic leading-none">
              Hồ sơ <span className="text-[#2d5a2d]">{isManager ? "Nhân sự" : "Học viên"}</span>
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              ID người dùng: #{user.id}
            </p>
          </div>
        </div>
        {/* No edit button */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto text-left">
        {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users size={150} strokeWidth={1} />
            </div>

            <div className="w-32 h-32 mx-auto bg-green-50 rounded-[2.5rem] flex items-center justify-center text-[#2d5a2d] font-black text-5xl border-4 border-white shadow-xl mb-4 overflow-hidden relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avt"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                (user.fullName || "U")[0]?.toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-black text-gray-950">
              {user.fullName || "Chưa thiết lập"}
            </h2>
            <p className="text-sm font-medium text-gray-400 mb-4">
              @{user.username || "username"}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              <KLBadge type={user.role === 'admin' ? 'warning' : 'success'}>
                {user.role}
              </KLBadge>
              <KLBadge type={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? "Đang hoạt động" : "Bị khóa"}
              </KLBadge>
            </div>

            {/* QUICK CONTROL PANEL */}
            <div className="pt-6 border-t border-dashed border-gray-100 flex flex-col gap-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-left px-2">Bảng thao tác nhanh</h4>
              <div className="grid grid-cols-1 gap-2">
                <KLButton 
                  variant="outline" 
                  icon={Mail} 
                  className="text-xs py-2.5 h-auto text-[#2d5a2d] border-[#2d5a2d]/20 hover:border-[#2d5a2d]"
                  onClick={() => setIsEmailModalOpen(true)}
                >
                  Gửi Email thông báo
                </KLButton>

                <div className="grid grid-cols-2 gap-2">
                  <KLButton 
                    variant="outline" 
                    icon={user.isActive ? Lock : Unlock} 
                    className={`text-xs py-2.5 h-auto ${user.isActive ? 'text-orange-600 hover:bg-orange-50/50 border-orange-200' : 'text-green-600 hover:bg-green-50/50 border-green-200'}`}
                    onClick={handleToggleStatus}
                  >
                    {user.isActive ? "Khóa Nick" : "Mở Nick"}
                  </KLButton>

                  <KLButton 
                    variant="outline" 
                    icon={KeyRound} 
                    className="text-xs py-2.5 h-auto text-blue-600 hover:bg-blue-50/50 border-blue-200"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Đang đặt..." : "Reset Pass"}
                  </KLButton>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
              Thông tin liên hệ
            </h3>
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Phone} label="Điện thoại" value={user.phone} />
            <InfoItem icon={MapPin} label="Địa chỉ" value={user.address} />
            <InfoItem icon={Calendar} label="Múi giờ" value={user.timezone} />
          </div>

          {/* Chỉ hiện Mục tiêu học tập nếu là Học sinh */}
          {!isManager && (
            <div className="bg-gradient-to-br from-[#2d5a2d] to-[#1e3d1e] p-6 rounded-[2rem] shadow-lg shadow-green-900/10 text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Star size={20} className="text-yellow-300" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                    Trình độ hiện tại
                  </p>
                  <p className="text-lg font-black">{user.level?.toUpperCase() || "TOPIK 1"}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <p className="flex justify-between opacity-80">
                  <span>Mục tiêu tuần:</span>
                  <span className="font-bold">{user.studyHoursPerWeek || 0} giờ học</span>
                </p>
                <p className="flex justify-between opacity-80">
                  <span>Mục tiêu học:</span>
                  <span className="font-bold line-clamp-1">{user.learningGoal || "Tự học Tiếng Hàn giao tiếp"}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT THEO VAI TRÒ --- */}
        <div className="lg:col-span-2 space-y-6">
          {isManager ? (
            /* ===============================================
               GIAO DIỆN CHO QUẢN LÝ (ADMIN / TEACHER)
               =============================================== */
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                  <Layers className="text-[#2d5a2d]" /> Khóa học đang quản lý
                </h3>
                <span className="bg-green-50 text-[#2d5a2d] px-3 py-1 rounded-xl text-xs font-black">
                  {user.createdCourses?.length || 0} Khóa
                </span>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-4">
                {user.createdCourses && user.createdCourses.length > 0 ? (
                  user.createdCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border rounded-xl flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-sm md:text-base line-clamp-1">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">
                            Mã khóa: #{course.id}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Học viên</p>
                        <p className="font-black flex items-center justify-end gap-1 text-gray-800 text-sm mt-0.5">
                          <Users size={14} className="text-[#2d5a2d]" /> {course.enrollments?.length || 0}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-150 rounded-3xl p-8 bg-gray-50/30">
                    <BookOpen size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-400 font-black uppercase text-xs tracking-wider">Chưa tạo khóa học nào</p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase mt-1">Hệ thống chưa ghi nhận tài nguyên</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===============================================
               GIAO DIỆN CHO HỌC VIÊN (STUDENT)
               =============================================== */
            <>
              {/* 1. KHÓA HỌC ĐÃ MUA */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                    <BookOpen className="text-[#2d5a2d]" /> Khóa học đã tham gia
                  </h3>
                  <span className="bg-green-50 text-[#2d5a2d] px-3 py-1 rounded-xl text-xs font-black">
                    {user.enrollments?.length || 0}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.enrollments && user.enrollments.length > 0 ? (
                    user.enrollments.map((enroll, idx) => (
                      <div key={idx} className="p-5 bg-gray-50 rounded-2xl border flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="font-black text-gray-900 text-[15px] line-clamp-1">
                            {enroll.course?.title || "Khóa học không tên"}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                            Tiến trình học tập
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-black text-gray-700">
                            <span>{enroll.progress || 0}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2d5a2d] to-[#4ade80] rounded-full"
                              style={{ width: `${enroll.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-16 text-center text-gray-400 border-2 border-dashed border-gray-150 bg-gray-50/20 rounded-3xl flex flex-col items-center justify-center">
                      <BookOpen size={36} className="text-gray-300 mb-2" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-400">Chưa ghi danh khóa học</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. ĐƠN HÀNG */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-950 flex items-center gap-2">
                    <ShoppingBag className="text-blue-600" /> Lịch sử hóa đơn học phí
                  </h3>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs font-black">
                    {user.orders?.length || 0}
                  </span>
                </div>
                
                {user.orders && user.orders.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Mã đơn</th>
                          <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                          <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Phương thức</th>
                          <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {user.orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
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
                                {order.status}
                              </KLBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-150 bg-gray-50/20 rounded-3xl flex flex-col items-center justify-center">
                    <ShoppingBag size={36} className="text-gray-300 mb-2" />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400">Chưa phát sinh giao dịch</span>
                  </div>
                )}
              </div>

              {/* 3. GAMIFICATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Điểm thưởng tích lũy
                    </p>
                    <p className="text-2xl font-black text-gray-900 mt-1">
                      {user.pointStats?.currentPoints || 0} <span className="text-xs font-bold text-gray-400">Điểm</span>
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                    <Award size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Huy hiệu đạt được
                    </p>
                    <p className="text-2xl font-black text-gray-900 mt-1">
                      {user.badges?.length || 0} <span className="text-xs font-bold text-gray-400">Huy hiệu</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAL 1: SEND EMAIL --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Gửi Email thông báo</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Gửi trực tiếp email hệ thống đến học viên</p>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {emailSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-bounce">
                  <MailCheck size={36} />
                </div>
                <h4 className="text-xl font-black text-gray-950 uppercase">Gửi thành công!</h4>
                <p className="text-sm text-gray-400 font-medium">Hệ thống đã chuyển phát email thành công đến {user.email}.</p>
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
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-2">Nội dung thư</label>
                  <textarea 
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-800 focus:border-[#2d5a2d] focus:bg-white outline-none transition-all shadow-inner h-32 resize-none"
                    placeholder="Soạn nội dung chi tiết gửi đến người dùng..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 justify-end">
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

      {/* --- MODAL 2: RESET PASSWORD SUCCESS --- */}
      {isResetSuccessOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-8 text-center border space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto shadow-inner shadow-green-100">
              <CheckCircle2 size={36} strokeWidth={3} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tight italic">Đặt lại thành công!</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HỆ THỐNG MÃ HÓA BẢO MẬT</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border text-xs text-blue-800 leading-relaxed font-bold text-left flex gap-3">
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
