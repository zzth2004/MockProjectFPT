import { CheckCircle2, AlertCircle } from "lucide-react";

export default function WritingCorrection({ originalText, correctedText }) {
  return (
    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      {/* Cột bài viết của bạn */}
      <div className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-4 text-gray-400">
          <AlertCircle size={18} />
          <span className="font-black text-xs uppercase">Bản gốc của bạn</span>
        </div>
        <p className="text-gray-600 leading-relaxed italic">{originalText || "Chưa có nội dung..."}</p>
      </div>

      {/* Cột AI sửa */}
      <div className="bg-green-50 border-2 border-green-100 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-[#377437]">
          <CheckCircle2 size={18} />
          <span className="font-black text-xs uppercase">AI đã tối ưu</span>
        </div>
        <p className="text-gray-800 leading-relaxed font-bold">{correctedText || "Đang đợi bài viết..."}</p>
      </div>
    </div>
  );
}