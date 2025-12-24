import React, { useState, useEffect } from "react";
import { 
  Save, X, Video, FileText, Layout, Eye, Globe, AlignLeft, Youtube 
} from "lucide-react";
// Lùi 5 cấp để về src (AdminControl -> Admin -> Course -> Lesson -> components -> src)

import { KLButton } from "../../../../Component/Button";

export default function LessonForm({ 
  initialData = {}, 
  onSubmit, 
  isLoading, 
  onCancel,
  preSelectedCourseId 
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
    courseId: preSelectedCourseId || "",
    ...initialData // Ghi đè nếu là Edit
  });

  // Cập nhật form khi có dữ liệu cũ (chế độ Edit)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return alert("Vui lòng nhập tên bài học!");
    // Nếu chưa có courseId (trường hợp tạo mới mà không qua khóa học), cần cảnh báo
    // Nhưng với logic hiện tại ta luôn truyền preSelectedCourseId nên an toàn.
    
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 animate-in fade-in duration-500">
      
      {/* 1. THÔNG TIN CƠ BẢN */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
          <Layout size={20} className="text-[#2d5a2d]" /> Thông tin bài học
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tên bài học */}
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

          {/* Thứ tự */}
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Thứ tự (Index)</label>
            <input 
              type="number" 
              value={formData.orderIndex} 
              onChange={(e) => handleChange("orderIndex", parseInt(e.target.value))}
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none text-center"
            />
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Video URL (Youtube/Vimeo)</label>
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
        </div>

        {/* Mô tả ngắn */}
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
          <AlignLeft size={20} className="text-orange-500" /> Nội dung chi tiết (Text/Docs)
        </h3>
        <textarea 
            rows={10}
            value={formData.contentText || ""} 
            onChange={(e) => handleChange("contentText", e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl font-medium text-gray-800 border-none focus:ring-2 focus:ring-[#2d5a2d]/20 outline-none"
            placeholder="Nội dung bài học dạng văn bản..."
        />
      </div>

      <hr className="my-8 border-gray-100 border-dashed" />

      {/* 3. CẤU HÌNH & ACTIONS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Toggles */}
        <div className="flex gap-6">
          <div 
            onClick={() => handleChange("isPreview", !formData.isPreview)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer select-none transition-colors ${formData.isPreview ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}
          >
            <Eye size={20} />
            <span className="text-xs font-black uppercase">Cho phép Học thử</span>
            <div className={`w-3 h-3 rounded-full ${formData.isPreview ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>

          <div 
            onClick={() => handleChange("isPublic", !formData.isPublic)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer select-none transition-colors ${formData.isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}
          >
            <Globe size={20} />
            <span className="text-xs font-black uppercase">Công khai</span>
            <div className={`w-3 h-3 rounded-full ${formData.isPublic ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full md:w-auto">
          <KLButton variant="outline" icon={X} onClick={onCancel} className="flex-1 md:flex-none justify-center">Hủy bỏ</KLButton>
          <KLButton 
            className="bg-[#2d5a2d] text-white flex-1 md:flex-none justify-center" 
            icon={Save} 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu bài học"}
          </KLButton>
        </div>
      </div>

    </div>
  );
}