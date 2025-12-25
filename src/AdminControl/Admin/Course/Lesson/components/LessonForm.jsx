import React, { useState, useEffect } from "react";
import { 
  Save, X, Video, FileText, Layout, Eye, Globe, AlignLeft, Youtube 
} from "lucide-react";
import { KLButton } from "../../../../Component/Button"; 

export default function LessonForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  onCancel,
  preSelectedCourseId // ID khóa học được truyền từ cha xuống
}) {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    title: "",
    orderIndex: 1,
    description: "",
    videoUrl: "",
    contentText: "",
    isPreview: false,
    isPublic: true,
    courseId: "",
  });

  // Đồng bộ dữ liệu khi initialData hoặc preSelectedCourseId thay đổi
  useEffect(() => {
    const data = initialData || {}; 
    
    setFormData(prev => ({
      ...prev,
      title: data.title || "",
      orderIndex: data.orderIndex || 1,
      description: data.description || "",
      videoUrl: data.videoUrl || "",
      contentText: data.contentText || "",
      isPreview: data.isPreview || false,
      isPublic: data.isPublic ?? true,
      // Nếu đang sửa (data.courseId) thì lấy nó, 
      // Nếu đang tạo mới mà cha truyền xuống (preSelectedCourseId) thì lấy cái đó
      courseId: data.courseId || preSelectedCourseId || "",
    }));
  }, [initialData, preSelectedCourseId]); 

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return alert("⚠️ Vui lòng nhập tên bài học!");
    
    // Validate quan trọng: Phải có ID khóa học
    if (!formData.courseId) return alert("⚠️ Vui lòng chọn khóa học ở mục 1 trước!");
    
    const finalData = {
        ...formData,
        orderIndex: Number(formData.orderIndex),
        courseId: Number(formData.courseId) // Đảm bảo là số
    };
    
    onSubmit(finalData);
  };

  // Hàm lấy ID youtube
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(formData.videoUrl);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 animate-in fade-in duration-500 text-left">
      
      {/* 1. THÔNG TIN CƠ BẢN */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
            <Layout size={20} className="text-[#2d5a2d]" /> Thông tin bài học
            </h3>
            {formData.courseId && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold">
                    LINKED COURSE ID: {formData.courseId}
                </span>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tên bài giảng</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none"
              placeholder="Ví dụ: Bài 1 - Nhập môn..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Thứ tự</label>
            <input 
              type="number" 
              value={formData.orderIndex} 
              onChange={(e) => handleChange("orderIndex", e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none text-center"
            />
          </div>
        </div>

        {/* Video URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Video URL (Youtube)</label>
                <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                    <input 
                    type="text" 
                    value={formData.videoUrl || ""} 
                    onChange={(e) => handleChange("videoUrl", e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-medium text-blue-600 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">* Để trống nếu bài học này chỉ có văn bản/tài liệu.</p>
            </div>

            {/* Preview Frame */}
            <div className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
                {videoId ? (
                    <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="flex flex-col items-center text-gray-300">
                        <Video size={40} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase mt-2">No Video Preview</span>
                    </div>
                )}
            </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mô tả ngắn</label>
          <textarea 
            rows={2}
            value={formData.description || ""} 
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-600 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none resize-none"
          />
        </div>
      </div>

      <hr className="my-8 border-gray-100 border-dashed" />

      {/* 2. NỘI DUNG CHI TIẾT */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
          <AlignLeft size={20} className="text-orange-500" /> Nội dung văn bản
        </h3>
        <textarea 
            rows={8}
            value={formData.contentText || ""} 
            onChange={(e) => handleChange("contentText", e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none"
            placeholder="Nội dung bài học dạng văn bản hoặc HTML..."
        />
      </div>

      <hr className="my-8 border-gray-100 border-dashed" />

      {/* 3. BUTTONS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-4">
          <button type="button" onClick={() => handleChange("isPreview", !formData.isPreview)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${formData.isPreview ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-gray-50 text-gray-400'}`}>
            <Eye size={18} /> <span className="text-[10px] font-black uppercase">Học thử</span>
            <div className={`w-2 h-2 rounded-full ${formData.isPreview ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
          </button>
          <button type="button" onClick={() => handleChange("isPublic", !formData.isPublic)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${formData.isPublic ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-gray-50 text-gray-400'}`}>
            <Globe size={18} /> <span className="text-[10px] font-black uppercase">Công khai</span>
            <div className={`w-2 h-2 rounded-full ${formData.isPublic ? 'bg-green-500' : 'bg-gray-300'}`} />
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <KLButton variant="outline" icon={X} onClick={onCancel} className="flex-1 md:flex-none justify-center rounded-2xl px-8 py-4">Hủy</KLButton>
          <KLButton className="bg-[#2d5a2d] text-white flex-1 md:flex-none justify-center rounded-2xl px-10 py-4 shadow-lg shadow-green-100" icon={Save} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu bài học"}
          </KLButton>
        </div>
      </div>
    </div>
  );
}