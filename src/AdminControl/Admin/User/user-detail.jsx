import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  BookOpen,
  ShoppingBag,
  Award,
  Zap,
  Layers,
  Users, // Thêm icon Layers
} from "lucide-react";

// Services
import userService from "../../Service/API/userServiceAPI/user.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";

// Helper Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <div className="text-gray-400">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
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

// --- FETCH DATA ---
useEffect(() => {
  // Biến cờ để kiểm soát việc cập nhật state khi component unmount hoặc ID thay đổi
  let isMounted = true;

  const fetchDetail = async () => {
    // 1. Khởi động trạng thái tải và XÓA DỮ LIỆU CŨ
    setLoading(true); 
    setUser(null); // Việc này giúp giao diện không bị "kẹt" hình ảnh của User trước đó

    try {
      // 2. Lấy thông tin User cơ bản
      const userRes = await userService.getUserById(id);
      const userData = userRes.data || userRes;
      
      // Nếu ID trong URL không tồn tại hoặc API lỗi không trả về dữ liệu
      if (!userData) {
        throw new Error("User not found");
      }

      // 3. Lấy danh sách khóa học nếu là Admin/Teacher
      let courses = [];
      const userRole = userData.role?.toLowerCase();
      
      if (['admin', 'teacher', 'quản trị viên', 'giáo viên'].includes(userRole)) {
        try {
          // Truyền đúng ID của User đang fetch để lấy khóa học tương ứng
          const courseRes = await courseService.getMyCourseAandT(userData.id);
          // Kiểm tra cấu hình trả về của API (thường là {data: []} hoặc [])
          courses = courseRes?.data || courseRes || [];
        } catch (err) {
          console.warn("Không lấy được danh sách khóa học của User này:", err);
        }
      }

      // 4. CẬP NHẬT STATE (Chỉ thực hiện nếu Component vẫn đang mount với ID hiện tại)
      if (isMounted) {
        setUser({
          ...userData,
          createdCourses: courses
        });
      }

    } catch (error) {
      console.error("Lỗi fetch user detail:", error);
      if (isMounted) {
        // Có thể thêm thông báo lỗi trước khi chuyển hướng
        navigate('/admin/users');
      }
    } finally {
      // 5. Kết thúc trạng thái tải
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchDetail();

  // CLEANUP FUNCTION: Chạy khi component unmount hoặc id thay đổi
  return () => {
    isMounted = false;
  };
}, [id, navigate]); // useEffect sẽ chạy lại mỗi khi ID trên URL thay đổi

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Đang tải hồ sơ...
      </div>
    );
  if (!user) return null;

  // 🚩 LOGIC PHÂN QUYỀN (FRONTEND ONLY)
  // Kiểm tra role có phải là Admin hoặc Teacher không
  const isManager = ["admin", "teacher", "quản trị viên", "giáo viên"].includes(
    user.role?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-[#F8F9FC]/90 backdrop-blur-sm z-30 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white text-gray-500 hover:bg-gray-100 hover:text-[#2d5a2d] flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            {/* Đổi tiêu đề dựa trên Role */}
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">
              Hồ sơ{" "}
              <span className="text-[#2d5a2d]">
                {isManager ? "Quản lý" : "Học viên"}
              </span>
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              UID: {user.firebaseUid || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center gap-2"
          >
            <Edit3 size={18} /> Sửa hồ sơ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN (Ai cũng hiện giống nhau) --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="w-32 h-32 mx-auto bg-green-50 rounded-full flex items-center justify-center text-[#2d5a2d] font-black text-5xl border-4 border-white shadow-xl mb-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avt"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user.fullName || "U")[0]?.toUpperCase()
              )}
            </div>
            <h2 className="text-xl font-black text-gray-900">
              {user.fullName}
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-4">
              @{user.username}
            </p>

            <div className="flex justify-center gap-2">
              {/* Màu badge thay đổi theo Role */}
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  isManager
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  user.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {user.isActive ? "Active" : "Locked"}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Thông tin liên hệ
            </h3>
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={Phone} label="Điện thoại" value={user.phone} />
            <InfoItem icon={MapPin} label="Địa chỉ" value={user.address} />
            <InfoItem icon={Calendar} label="Timezone" value={user.timezone} />
          </div>

          {/* Chỉ hiện Mục tiêu học tập nếu là Học sinh */}
          {!isManager && (
            <div className="bg-[#2d5a2d] p-6 rounded-[2rem] shadow-lg shadow-green-900/20 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Star size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-70 uppercase">
                    Trình độ
                  </p>
                  <p className="text-lg font-black">{user.level}</p>
                </div>
              </div>
              {/* ... các thông tin mục tiêu khác ... */}
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: THAY ĐỔI THEO ROLE --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🛑 LOGIC IF/ELSE Ở ĐÂY */}
          {isManager ? (
            // ===============================================
            // GIAO DIỆN CHO QUẢN LÝ (ADMIN / TEACHER)
            // ===============================================
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Layers className="text-purple-600" /> Khóa học đang quản lý
                </h3>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                  {/* Dùng toán tử ?. để tránh lỗi nếu không có dữ liệu */}
                  {user.createdCourses?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {user.createdCourses && user.createdCourses.length > 0 ? (
                  user.createdCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                          <BookOpen size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ID: {course.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          Học viên
                        </p>
                        <p className="font-black flex items-center justify-end gap-1">
                          <Users size={12} /> {course.enrollments?.length || 0}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400 font-bold">
                      Chưa có khóa học nào được tạo.
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      (Hoặc Backend chưa gửi dữ liệu này)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ===============================================
            // GIAO DIỆN CHO HỌC VIÊN (STUDENT)
            // ===============================================
            <>
              {/* 1. KHÓA HỌC ĐÃ MUA */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <BookOpen className="text-[#2d5a2d]" /> Khóa học đã tham gia
                  </h3>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {user.enrollments?.length || 0}
                  </span>
                </div>
                {/* List khóa học của học viên */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.enrollments && user.enrollments.length > 0 ? (
                    user.enrollments.map((enroll, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl">
                        <h4 className="font-bold text-gray-800 line-clamp-1">
                          {enroll.course?.title || "Unknown"}
                        </h4>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-[#2d5a2d]"
                            style={{ width: `${enroll.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                      Chưa đăng ký khóa học nào.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. ĐƠN HÀNG */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="text-blue-600" /> Lịch sử đơn hàng
                  </h3>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {user.orders?.length || 0}
                  </span>
                </div>
                {/* Table đơn hàng */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                          Mã đơn
                        </th>
                        <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                          Tổng tiền
                        </th>
                        <th className="p-4 text-[10px] font-black text-gray-400 uppercase">
                          TT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {user.orders?.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td className="p-4 text-xs font-bold">#{order.id}</td>
                          <td className="p-4 text-xs font-black">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.finalPrice || 0)}
                          </td>
                          <td className="p-4 text-xs font-bold">
                            {order.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. GAMIFICATION */}
              <div className="grid grid-cols-2 gap-6">
                {/* Điểm số & Huy hiệu (Chỉ hiện cho học viên) */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Điểm
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {user.pointStats?.currentPoints || 0}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Huy hiệu
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {user.badges?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
