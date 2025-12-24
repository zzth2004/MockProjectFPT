import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  LayoutDashboard,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  Layers,
  DollarSign,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Import Service (Đảm bảo đường dẫn đúng với cấu trúc dự án của bạn)
import courseService from "../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext";

// Enum Level khớp Backend
const CourseLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
};

export default function CreateCourse() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  // --- 1. STATE DỮ LIỆU (Khớp Entity Course) ---
  const [courseData, setCourseData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "", // Lưu URL ảnh
    price: 0,
    salePrice: 0,
    level: CourseLevel.BEGINNER,
    isPublished: false,

  });

  // State phụ trợ cho UI
  const [isFreeCourse, setIsFreeCourse] = useState(false);

  // --- 2. HANDLERS (Xử lý Logic) ---

  // Tự động tạo slug từ Title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    setCourseData((prev) => ({ ...prev, title, slug }));
  };

  // Cập nhật giá trị input thường
  const handleChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý Logic Giá & Khóa học miễn phí
  const handlePriceChange = (value) => {
    setCourseData((prev) => ({ ...prev, price: value }));
  };

  const toggleFreeCourse = () => {
    const nextState = !isFreeCourse;
    setIsFreeCourse(nextState);
    if (nextState) {
      setCourseData((prev) => ({ ...prev, price: 0, salePrice: 0 }));
    }
  };

  // --- Logic Curriculum (Thêm/Sửa/Xóa Chương & Bài học) ---
  const addChapter = () => {
    setChapters([
      ...chapters,
      { id: Date.now(), title: "Chương mới", lessons: [] },
    ]);
  };

  const addLesson = (chapterId) => {
    const newChapters = chapters.map((ch) => {
      if (ch.id === chapterId) {
        // Tạo bài học mới (Mặc định type video)
        return {
          ...ch,
          lessons: [
            ...ch.lessons,
            { id: Date.now(), title: "Bài học mới", type: "video" },
          ],
        };
      }
      return ch;
    });
    setChapters(newChapters);
  };

  const removeLesson = (chapterId, lessonId) => {
    const newChapters = chapters.map((ch) => {
      if (ch.id === chapterId) {
        return { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) };
      }
      return ch;
    });
    setChapters(newChapters);
  };

  // --- 3. SUBMIT (Gửi API) ---
  const handleSubmit = async (publishStatusOverride) => {
    if (!courseData.title || !courseData.slug) {
      alert("Vui lòng nhập Tên khóa học và Slug!");
      return;
    }

    setIsLoading(true);

    try {
        const finalPublishStatus = publishStatusOverride !== undefined
            ? publishStatusOverride
            : courseData.isPublished;

        // CHỈ gửi những thông tin thuộc về Khóa học
        const payload = {
            title: courseData.title,
            slug: courseData.slug,
            description: courseData.description,
            thumbnail: courseData.thumbnail,
            price: parseFloat(courseData.price),
            salePrice: parseFloat(courseData.salePrice),
            level: courseData.level,
            isPublished: finalPublishStatus,
            // KHÔNG gửi createdBy hay createdById ở đây
        };

      console.log("📡 Creating Course:", payload);

      const newCourse = await courseService.createCourse(payload);
      const statusText = finalPublishStatus ? "Public" : "Private";

      // Chuyển hướng ngay sang trang Quản lý bài học
      if (newCourse && newCourse.id) {
        // alert(`✅ Đã tạo khóa học (${statusText}). Chuyển sang thêm bài học...`);
        navigate(`/admin/courses/${newCourse.id}/lessons`);
      } else {
        navigate("/admin/courses");
      }
    } catch (error) {
      console.error("Lỗi tạo khóa học:", error);
      const message = error.response?.data?.message || "Có lỗi xảy ra.";
      alert(`❌ Thất bại: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sticky top-0 z-30 bg-[#F8F9FC]/90 backdrop-blur-sm py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white text-gray-500 hover:bg-gray-100 hover:text-[#2d5a2d] flex items-center justify-center shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
              Tạo <span className="text-[#2d5a2d]">Khóa học</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              Create New Course
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isLoading}
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            Lưu nháp
          </button>

          <button
            disabled={isLoading}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#2d5a2d] hover:bg-[#1a3d1a] transition-colors shadow-lg shadow-green-900/10 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? "Đang xử lý..." : "Xuất bản"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        {/* --- CỘT TRÁI: NỘI DUNG CHÍNH --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. THÔNG TIN CHUNG */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 rounded-2xl text-[#2d5a2d]">
                <LayoutDashboard size={24} />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase">
                Thông tin chung
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Tên khóa học
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={handleTitleChange}
                  placeholder="VD: Luyện thi TOPIK II cấp tốc..."
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Slug (URL)
                </label>
                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl text-gray-500 font-medium text-sm">
                  <span className="text-gray-400 select-none">/courses/</span>
                  <input
                    value={courseData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Mô tả
                </label>
                <textarea
                  rows={5}
                  value={courseData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Mô tả nội dung khóa học..."
                  className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-700 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* 2. MEDIA (Thumbnail) */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <ImageIcon size={24} />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase">
                Hình ảnh
              </h2>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden">
              {courseData.thumbnail ? (
                <img
                  src={courseData.thumbnail}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2d5a2d] mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">
                    Tải ảnh bìa
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Click để upload (Giả lập)
                  </p>
                </div>
              )}
              {/* Input File Giả lập */}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  setCourseData({
                    ...courseData,
                    thumbnail: "https://via.placeholder.com/800x400",
                  })
                }
              />
            </div>
          </div>

          {/* 3. LỘ TRÌNH (Curriculum Builder) */}
          <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex items-center gap-4 text-orange-800 shadow-sm">
            <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500 flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase">Quản lý bài học</h3>
              <p className="text-xs mt-1 font-medium opacity-80 leading-relaxed">
                Để đảm bảo toàn vẹn dữ liệu, bạn cần <b>Tạo khóa học</b> trước.{" "}
                <br />
                Hệ thống sẽ tự động chuyển bạn đến trang <b>
                  Thêm bài học
                </b>{" "}
                ngay sau khi lưu thành công.
              </p>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: SETTINGS --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 text-lg uppercase italic">
              Thiết lập
            </h3>

            {/* Level */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">
                Cấp độ
              </label>
              <select
                className="w-full p-3.5 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-none focus:ring-2 focus:ring-[#2d5a2d]/20 cursor-pointer"
                value={courseData.level}
                onChange={(e) => handleChange("level", e.target.value)}
              >
                {Object.values(CourseLevel).map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">
                Học phí (VND)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) =>
                    handlePriceChange(parseFloat(e.target.value))
                  }
                  disabled={isFreeCourse}
                  className={`w-full py-3.5 pl-10 pr-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none ${
                    isFreeCourse ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Sale Price */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">
                Giá khuyến mãi
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-red-400">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  value={courseData.salePrice}
                  onChange={(e) =>
                    handleChange("salePrice", parseFloat(e.target.value))
                  }
                  disabled={isFreeCourse}
                  className={`w-full py-3.5 pl-10 pr-4 bg-red-50 rounded-2xl font-bold text-red-600 border-none focus:ring-2 focus:ring-red-200 outline-none ${
                    isFreeCourse ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
              {courseData.salePrice > courseData.price && !isFreeCourse && (
                <div className="flex items-center gap-2 mt-2 text-red-500 text-[10px] font-bold">
                  <AlertCircle size={12} /> Giá KM không thể cao hơn giá gốc!
                </div>
              )}
            </div>

            {/* Free Toggle */}
            <div
              className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl cursor-pointer select-none"
              onClick={toggleFreeCourse}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isFreeCourse
                    ? "bg-[#2d5a2d] border-[#2d5a2d]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isFreeCourse && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <label className="text-xs font-bold text-gray-600 cursor-pointer">
                Khóa học miễn phí
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
