import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, LayoutDashboard, Image as ImageIcon,
  UploadCloud, DollarSign, AlertCircle, Loader2, 
  BookOpen, ChevronRight, List
} from "lucide-react";

import courseService from "../../Service/API/courseServiceAPI/course.service";
import { useAuth } from "../../../context/authContext"; // Import Auth

const CourseLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
};

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- 1. LẤY ROLE ĐỂ XÁC ĐỊNH BASE PATH ---
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const basePath = isTeacher ? "/teacher" : "/admin";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // State dữ liệu khóa học
  const [courseData, setCourseData] = useState({
    title: "", slug: "", description: "", thumbnail: "",
    price: 0, salePrice: 0, level: CourseLevel.BEGINNER, isPublished: false,
  });
  
  const [isFreeCourse, setIsFreeCourse] = useState(false);
  const [stats, setStats] = useState({ lessonsCount: 0 });

  // --- 2. FETCH DỮ LIỆU CŨ ---
  useEffect(() => {
    const fetchOldData = async () => {
      try {
        const data = await courseService.getCourseDetail(id);
        if (data) {
          setCourseData({
            title: data.title || "",
            slug: data.slug || "",
            description: data.description || "",
            thumbnail: data.thumbnail || "",
            price: Number(data.price) || 0,
            salePrice: Number(data.salePrice) || 0,
            level: data.level || CourseLevel.BEGINNER,
            isPublished: data.isPublished || false,
          });
          
          if (Number(data.price) === 0) setIsFreeCourse(true);
          
          if(data.lessons) setStats({ lessonsCount: data.lessons.length });
        }
      } catch (error) {
        console.error("Lỗi tải khóa học:", error);
        // Điều hướng về đúng danh sách nếu lỗi
        navigate(`${basePath}/courses`);
      } finally {
        setIsFetching(false);
      }
    };
    fetchOldData();
  }, [id, navigate, basePath]); // Thêm basePath vào dependency

  // --- 3. HANDLERS ---
  const handleChange = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (value) => {
    setCourseData((prev) => ({ ...prev, price: value }));
  };

  const toggleFreeCourse = () => {
    const nextState = !isFreeCourse;
    setIsFreeCourse(nextState);
    if (nextState) setCourseData((prev) => ({ ...prev, price: 0, salePrice: 0 }));
  };

  const handleUpdate = async (publishStatus) => {
      setIsLoading(true);
      try {
          const payload = {
              ...courseData,
              price: parseFloat(courseData.price),
              salePrice: parseFloat(courseData.salePrice),
              isPublished: publishStatus,
              // Update không cần gửi createdById hay teacherId
          };
          await courseService.updateCourse(id, payload);
          alert("✅ Cập nhật thông tin khóa học thành công!");
      } catch (error) {
          console.error(error);
          alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || "Lỗi Server"));
      } finally {
          setIsLoading(false);
      }
  };

  // 👇 HÀM CHUYỂN HƯỚNG ĐỘNG (Dùng basePath)
  const goToLessonManager = () => {
      navigate(`${basePath}/courses/${id}/lessons`);
  };

  if (isFetching) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
          <Loader2 className="w-10 h-10 text-[#2d5a2d] animate-spin mb-4" />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Đang tải dữ liệu...</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 p-4 md:p-6 animate-in fade-in duration-500 text-left">
      
      {/* HEADER */}
      <div className="flex justify-between gap-4 mb-8 sticky top-0 z-30 bg-[#F8F9FC]/90 backdrop-blur-sm py-2">
         <div className="flex items-center gap-4">
            {/* 👇 Nút Back quay về đúng danh sách */}
            <button 
                onClick={() => navigate(`${basePath}/courses`)} 
                className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-sm transition-all text-gray-500"
            >
               <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                   Sửa <span className="text-[#2d5a2d]">Khóa học</span>
               </h1>
               <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                   {isTeacher ? "TEACHER EDITOR" : "ADMIN EDITOR"} - ID: {id}
               </p>
            </div>
         </div>
         <div className="flex gap-3">
            <button disabled={isLoading} onClick={() => handleUpdate(courseData.isPublished)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#2d5a2d] hover:bg-[#1a3d1a] shadow-lg flex items-center gap-2 transition-colors active:scale-95 disabled:opacity-70">
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lưu thông tin
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. THÔNG TIN CHUNG */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100/50">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-50 rounded-2xl text-[#2d5a2d]"><LayoutDashboard size={24} /></div>
                <h2 className="text-lg font-black text-gray-900 uppercase">Thông tin chung</h2>
             </div>
             <div className="space-y-6">
                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên khóa học</label>
                    <input type="text" value={courseData.title} onChange={(e) => handleChange("title", e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none text-gray-800" />
                </div>
                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Slug (Đường dẫn)</label>
                    <input type="text" value={courseData.slug} onChange={(e) => handleChange("slug", e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none text-gray-600" />
                </div>
                <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả</label>
                    <textarea rows={4} value={courseData.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-medium border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none text-gray-700 resize-none" />
                </div>
             </div>
          </div>

          {/* 2. MEDIA */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100/50">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><ImageIcon size={24} /></div>
                <h2 className="text-lg font-black text-gray-900 uppercase">Hình ảnh</h2>
             </div>
             <div className="h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden">
                 {courseData.thumbnail ? (
                    <img src={courseData.thumbnail} className="w-full h-full object-cover" alt="thumb"/>
                 ) : (
                    <>
                        <UploadCloud size={32} className="mb-2 group-hover:scale-110 transition-transform"/>
                        <span className="text-xs font-bold uppercase">Tải ảnh lên</span>
                    </>
                 )}
                 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setCourseData({...courseData, thumbnail: "https://picsum.photos/800/400"})} />
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

          {/* 3. QUẢN LÝ BÀI HỌC (NÚT CHUYỂN TRANG) */}
          <div 
            onClick={goToLessonManager}
            className="group relative overflow-hidden bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#2d5a2d]/30 transition-all cursor-pointer"
          >
             <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#2d5a2d]/5 rounded-2xl flex items-center justify-center text-[#2d5a2d] group-hover:bg-[#2d5a2d] group-hover:text-white transition-colors">
                        <List size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase group-hover:text-[#2d5a2d] transition-colors">Danh sách bài học</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Khóa học này đang có <span className="text-[#2d5a2d] font-bold text-lg">{stats.lessonsCount}</span> bài học.
                        </p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <BookOpen size={12}/> Nhấn để xem, thêm hoặc sửa bài học
                        </p>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#2d5a2d] group-hover:text-white transition-all transform group-hover:translate-x-2">
                    <ChevronRight size={24} strokeWidth={3} />
                </div>
             </div>
          </div>

        </div>

        {/* CỘT PHẢI (SETTINGS & PRICE) */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100/50 space-y-6">
               <h3 className="font-black text-gray-900 uppercase italic text-lg">Thiết lập</h3>
               
               {/* Cấp độ */}
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Cấp độ</label>
                  <select className="w-full p-3.5 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-none cursor-pointer" value={courseData.level} onChange={(e) => handleChange("level", e.target.value)}>
                    {Object.values(CourseLevel).map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
               </div>

               {/* Giá */}
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Học phí (VND)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400"><DollarSign size={16} /></span>
                    <input type="number" value={courseData.price} onChange={(e) => handlePriceChange(parseFloat(e.target.value))} disabled={isFreeCourse} className={`w-full py-3.5 pl-10 pr-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border-none outline-none ${isFreeCourse ? "opacity-50 cursor-not-allowed" : ""}`} />
                  </div>
               </div>

               {/* Giá KM */}
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block ml-1">Giá khuyến mãi</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-red-400"><DollarSign size={16} /></span>
                    <input type="number" value={courseData.salePrice} onChange={(e) => handleChange("salePrice", parseFloat(e.target.value))} disabled={isFreeCourse} className={`w-full py-3.5 pl-10 pr-4 bg-red-50 rounded-2xl font-bold text-red-600 border-none outline-none ${isFreeCourse ? "opacity-50 cursor-not-allowed" : ""}`} />
                  </div>
                  {courseData.salePrice > courseData.price && !isFreeCourse && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-[10px] font-bold"><AlertCircle size={12} /> Giá KM không hợp lệ!</div>
                  )}
               </div>

               {/* Toggle Free */}
               <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl cursor-pointer select-none" onClick={toggleFreeCourse}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isFreeCourse ? "bg-[#2d5a2d] border-[#2d5a2d]" : "border-gray-300 bg-white"}`}>
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