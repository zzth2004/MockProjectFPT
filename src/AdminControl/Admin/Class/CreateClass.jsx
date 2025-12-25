import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  School,
  User,
  Calendar,
  Video,
  Users,
  BookOpen,
  Clock,
  Loader2,
} from "lucide-react";

import courseClassService from "../../Service/API/courseServiceAPI/course-class.service";
import courseService from "../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext";

export default function CreateClass() {
  const { user } = useAuth(); // Lấy thông tin user (admin/teacher) đang login
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [courses, setCourses] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    startDate: "",
    schedule: "", // Cái này sẽ map vào 'scheduleDescription' trong Entity
    endDate: "",
    googleMeetLink: "",
    maxStudents: 30,
    status: "UPCOMING",
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
      console.log("user role: ", user.role)
      if (user.role == "admin") {
        try {
          const coursesRes = await courseService.getAllCourses(1, 100);
          console.log(coursesRes);
          setCourses(coursesRes?.data || []);
        } catch (error) {
          console.error("Lỗi:", error);
        } finally {
          setIsFetching(false);
        }
      }else{
         try {
          const coursesRes = await courseService.getMyCoursebySelf(1, 100);
          setCourses(coursesRes?.data || []);
        } catch (error) {
          console.error("Lỗi:", error);
        } finally {
          setIsFetching(false);
        }
      }
      
    };
    initData();
  }, []);

  // --- 2. HANDLERS ---
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name || !formData.courseId || !formData.startDate) {
      alert("Vui lòng điền đủ: Tên lớp, Khóa học gốc và Ngày khai giảng!");
      return;
    }

    // Kiểm tra User Auth
    if (!user || !user.id) {
      alert(
        "Lỗi phiên đăng nhập: Không tìm thấy ID người dùng. Vui lòng F5 hoặc đăng nhập lại."
      );
      return;
    }

    setIsLoading(true);
    try {
      // 👇 CHUẨN BỊ PAYLOAD KHỚP VỚI ENTITY
      const payload = {
        // 1. Map teacherId = ID người đang tạo (Bắt buộc vì Entity yêu cầu)
        teacherId: user.id,

        // 2. Map các trường cơ bản
        courseId: Number(formData.courseId),
        name: formData.name,
        maxStudents: Number(formData.maxStudents),

        // 3. Map startDate sang ISO String (Tránh lỗi 500 DB)
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),

        // 4. Map schedule sang scheduleDescription (Theo tên trong Entity)
        scheduleDescription: formData.schedule,

        // 5. Các trường Google
        googleMeetLink: formData.googleMeetLink,
        status: formData.status,
      };

      console.log("📡 Sending Final Payload:", payload);

      await courseClassService.createClass(payload);

      alert("✅ Tạo lớp học thành công!");
      navigate("/admin/classes");
    } catch (error) {
      console.error("Lỗi API:", error);
      const msg =
        error.response?.data?.message ||
        "Lỗi Server (500). Kiểm tra lại TeacherID hoặc Date.";
      alert(`❌ Tạo thất bại: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between gap-4 mb-8 sticky top-0 z-30 bg-[#F8F9FC]/90 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic">
              Tạo <span className="text-[#2d5a2d]">Lớp học</span>
            </h1>
          </div>
        </div>
        <button
          disabled={isLoading}
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2d5a2d] hover:bg-[#1a3d1a] shadow-lg flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}{" "}
          Lưu lớp học
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
            <h2 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
              <School size={24} className="text-[#2d5a2d]" /> Thông tin lớp học
            </h2>

            <div>
              <label className="text-[11px] font-black uppercase text-gray-400">
                Tên lớp học
              </label>
              <input
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#2d5a2d]/20"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="VD: Lớp Tiếng Hàn K15"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black uppercase text-gray-400">
                  Lịch học (Schedule Description)
                </label>
                <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <input
                    className="bg-transparent font-medium outline-none w-full"
                    value={formData.schedule}
                    onChange={(e) => handleChange("schedule", e.target.value)}
                    placeholder="VD: 19:30 - 21:00 (Thứ 2-4-6)"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase text-gray-400">
                  Sĩ số
                </label>
                <div className="flex items-center bg-gray-50 p-4 rounded-2xl gap-2">
                  <Users size={18} className="text-gray-400" />
                  <input
                    type="number"
                    className="bg-transparent font-bold outline-none w-full"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      handleChange("maxStudents", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-gray-400">
                Link Meet/Zoom
              </label>
              <div className="flex items-center bg-blue-50 p-4 rounded-2xl gap-2 text-blue-700">
                <Video size={18} />
                <input
                  className="bg-transparent font-medium outline-none w-full placeholder-blue-300"
                  value={formData.googleMeetLink}
                  onChange={(e) =>
                    handleChange("googleMeetLink", e.target.value)
                  }
                  placeholder="Nhập link meet của bạn hoặc hệ thống tự tạo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 uppercase">Thiết lập</h3>

            {/* 1. KHÓA HỌC */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                Thuộc khóa học
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2d5a2d]"
                  size={18}
                />
                <select
                  className="w-full pl-12 pr-4 py-4 bg-[#2d5a2d]/5 rounded-2xl font-bold text-[#2d5a2d] outline-none cursor-pointer appearance-none"
                  value={formData.courseId}
                  onChange={(e) => handleChange("courseId", e.target.value)}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. NGƯỜI PHỤ TRÁCH (Hiển thị Admin/User đang đăng nhập) */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                Giáo viên (Auto-Assign)
              </label>

              {user ? (
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-sm border shadow-sm">
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#1e293b]">
                      {user.fullName || "User"}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 italic">
                      ID: {user.id}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-red-50 text-red-500 rounded text-xs">
                  ⚠ Không tìm thấy User
                </div>
              )}
              <p className="text-[9px] text-gray-400 mt-1 italic ml-1">
                * Hệ thống sẽ tự gán User ID này làm Teacher ID
              </p>
            </div>

            {/* 3. NGÀY KHAI GIẢNG */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                Ngày khai giảng
              </label>
              <input
                type="date"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>

            {/* 4. TRẠNG THÁI */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">
                Trạng thái
              </label>
              <select
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold cursor-pointer outline-none"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="UPCOMING">Sắp mở</option>
                <option value="ONGOING">Đang học</option>
                <option value="FINISHED">Kết thúc</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
