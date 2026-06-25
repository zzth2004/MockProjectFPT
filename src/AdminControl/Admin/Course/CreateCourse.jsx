import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  LayoutDashboard,
  Image as ImageIcon,
  UploadCloud,
  DollarSign,
  AlertCircle,
  Loader2,
  Tag
} from "lucide-react";

// Services & Context
import courseService from "../../Service/API/courseServiceAPI/course.service";
import lessonService from "../../Service/API/lessonServiceAPI/lesson.service";
import { useAuth } from "../../../context/authContext";

const CourseLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
};

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin người đang đăng nhập
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. XÁC ĐỊNH ROLE ĐỂ ĐIỀU HƯỚNG ---
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  // --- 2. STATE DỮ LIỆU ---
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
    salePrice: 0,
    level: CourseLevel.BEGINNER,
    isPublic: false,
  });

  const [lessonsList, setLessonsList] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [searchLessonTerm, setSearchLessonTerm] = useState("");

  const [isFreeCourse, setIsFreeCourse] = useState(false);

  // --- Load all lessons for selection ---
  useEffect(() => {
    lessonService.getAllLesson(1, 1000)
      .then(res => {
        const cleanList = Array.isArray(res) ? res : res?.data || [];
        setLessonsList(cleanList);
      })
      .catch(err => console.error("Lỗi khi tải danh sách bài học:", err));
  }, []);

  const filteredLessons = useMemo(() => {
    let list = lessonsList;
    if (isTeacher && user?.id) {
      list = lessonsList.filter(l => {
        const creatorId = l.course?.createdById;
        return !l.courseId || Number(creatorId) === Number(user.id);
      });
    }
    if (!searchLessonTerm) return list;
    return list.filter(l =>
      l.title?.toLowerCase().includes(searchLessonTerm.toLowerCase())
    );
  }, [lessonsList, searchLessonTerm, isTeacher, user]);

  const handleToggleLesson = (id) => {
    setSelectedLessons(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // --- 3. CÁC HÀM XỬ LÝ (HANDLERS) ---

  const handleTitleChange = (e) => {
    const title = e.target.value;
    // Tạo slug tự động từ tên
    const slug = title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setCourseData((prev) => ({ ...prev, title, slug }));
  };

  const handleChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFreeCourse = () => {
    const nextState = !isFreeCourse;
    setIsFreeCourse(nextState);
    if (nextState) {
      setCourseData((prev) => ({ ...prev, price: 0, salePrice: 0 }));
    }
  };

  // --- 4. HÀM SUBMIT (DÙNG CHUNG CHO CẢ ADMIN VÀ TEACHER) ---
  const handleSubmit = async (publishStatusOverride) => {
    // A. Validate dữ liệu
    if (!courseData.title || !courseData.slug) {
      alert("Vui lòng nhập Tên khóa học và Slug!");
      return;
    }

    if (Number(courseData.salePrice) > Number(courseData.price)) {
      alert("Giá khuyến mãi không thể cao hơn giá gốc!");
      return;
    }

    // B. Validate User (Quan trọng để không bị lỗi 400)
    if (!user || !user.id) {
      alert("Lỗi phiên đăng nhập: Không tìm thấy ID người dùng.");
      return;
    }

    setIsLoading(true);

    try {
      const finalPublishStatus = publishStatusOverride !== undefined
        ? publishStatusOverride
        : courseData.isPublished;

      // C. Chuẩn bị Payload (Dữ liệu gửi lên Server)
      const payload = {
        title: courseData.title,
        description: courseData.description || "",

        // Xử lý ảnh: Nếu rỗng thì gửi null
        thumbnail: courseData.thumbnail && courseData.thumbnail.trim() !== "" ? courseData.thumbnail : null,

        // Ép kiểu số
        price: Number(courseData.price) || 0,
        salePrice: Number(courseData.salePrice) || 0,

        level: courseData.level,
        isPublic: finalPublishStatus,

        // 👇 QUAN TRỌNG: Gán người tạo là người đang đăng nhập
        // Backend sẽ nhận ID này để biết ai là chủ sở hữu khóa học
        createdById: Number(user.id)
      };

      console.log("📡 Creating Course Payload:", payload);

      // D. Gọi API
      const createdCourse = await courseService.createCourse(payload);
      const newCourseId = createdCourse?.id;

      if (newCourseId && selectedLessons.length > 0) {
        // Gán các bài học đã chọn vào khóa học mới
        await Promise.all(selectedLessons.map(lId =>
          lessonService.update(lId, { courseId: newCourseId })
        ));
      }

      alert(`✅ Tạo khóa học thành công!`);

      // E. Điều hướng về đúng trang quản lý của Role đó
      navigate(`${basePath}/courses`);

    } catch (error) {
      console.error("Lỗi tạo khóa học:", error);
      const message = error.response?.data?.message || "Có lỗi xảy ra (400 Bad Request).";
      alert(`❌ Thất bại: ${JSON.stringify(message)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500 text-left">

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
            {/* Hiển thị Text linh động theo Role */}
            <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              {isTeacher ? "Teacher Portal" : "Admin Management"}
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
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isLoading ? "Đang xử lý..." : "Xuất bản"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">

        {/* --- CỘT TRÁI: THÔNG TIN CHÍNH --- */}
        <div className="lg:col-span-2 space-y-8">

          {/* Form Thông tin chung */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 rounded-2xl text-[#2d5a2d]">
                <LayoutDashboard size={24} />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase">Thông tin chung</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên khóa học</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={handleTitleChange}
                  placeholder="VD: Luyện thi TOPIK II cấp tốc..."
                  className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Slug (URL)</label>
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
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả</label>
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

          {/* Form Hình ảnh */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <ImageIcon size={24} />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase">Hình ảnh</h2>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden">
              {courseData.thumbnail ? (
                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-[#2d5a2d] mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">Tải ảnh bìa</h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Click để upload (Giả lập)</p>
                </div>
              )}
              {/* Input File Giả lập */}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setCourseData({ ...courseData, thumbnail: "https://picsum.photos/800/400" })}
              />
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1">Hoặc nhập URL Hình ảnh</label>
              <input
                className="w-full p-3 bg-gray-50 rounded-xl font-medium text-xs border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                value={courseData.thumbnail}
                onChange={(e) => handleChange("thumbnail", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Form Chọn bài học có sẵn */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase">Thêm bài học có sẵn</h2>
                <p className="text-gray-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                  Chọn các bài học hiện có để chuyển vào khóa học mới này
                </p>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài học..."
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-xs border-none outline-none focus:ring-1 focus:ring-[#2d5a2d]"
                  value={searchLessonTerm}
                  onChange={(e) => setSearchLessonTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {filteredLessons.length === 0 ? (
                <p className="text-gray-400 text-xs font-bold text-center py-4">Không tìm thấy bài học nào</p>
              ) : (
                filteredLessons.map((lesson) => {
                  const isChecked = selectedLessons.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleToggleLesson(lesson.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${isChecked
                          ? "bg-green-50 border-[#2d5a2d] text-green-900"
                          : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 text-gray-700"
                        }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? "bg-[#2d5a2d] border-[#2d5a2d]" : "border-gray-300 bg-white"
                          }`}
                      >
                        {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-black truncate">{lesson.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">
                          ID: {lesson.id} {lesson.course ? `• Khóa cũ: ${lesson.course.title}` : `• Chưa gán khóa`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Thông báo lộ trình */}
          <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex items-center gap-4 text-orange-800 shadow-sm">
            <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500 flex-shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase">Quản lý bài học</h3>
              <p className="text-xs mt-1 font-medium opacity-80 leading-relaxed">
                Để đảm bảo toàn vẹn dữ liệu, bạn cần <b>Tạo khóa học</b> trước. <br />
                Sau đó bạn có thể thêm chương và bài học tại trang chi tiết.
              </p>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: SETTINGS --- */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-none shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 text-lg uppercase italic flex items-center gap-2">
              <Tag size={18} className="text-purple-500" /> Thiết lập
            </h3>

            {/* Level */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Cấp độ</label>
              <select
                className="w-full p-3.5 bg-purple-50 text-purple-700 rounded-2xl font-bold outline-none border-none focus:ring-2 focus:ring-[#2d5a2d]/20 cursor-pointer"
                value={courseData.level}
                onChange={(e) => handleChange("level", e.target.value)}
              >
                {Object.values(CourseLevel).map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Học phí (VND)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  disabled={isFreeCourse}
                  className={`w-full py-3.5 pl-10 pr-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none ${isFreeCourse ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                />
              </div>
            </div>

            {/* Sale Price */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Giá khuyến mãi</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-red-400">
                  <DollarSign size={16} />
                </span>
                <input
                  type="number"
                  value={courseData.salePrice}
                  onChange={(e) => handleChange("salePrice", parseFloat(e.target.value))}
                  disabled={isFreeCourse}
                  className={`w-full py-3.5 pl-10 pr-4 bg-red-50 rounded-2xl font-bold text-red-600 border-none focus:ring-2 focus:ring-red-200 outline-none ${isFreeCourse ? "opacity-50 cursor-not-allowed" : ""
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
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isFreeCourse ? "bg-[#2d5a2d] border-[#2d5a2d]" : "border-gray-300 bg-white"
                  }`}
              >
                {isFreeCourse && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <label className="text-xs font-bold text-gray-600 cursor-pointer">Khóa học miễn phí</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}