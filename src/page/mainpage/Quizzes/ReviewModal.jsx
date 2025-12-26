import React from 'react';
import { X, CheckCircle2, XCircle, Info } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, resultData, originalQuestions }) => {
  if (!isOpen || !resultData) return null;

  // Hàm helper để tìm text của option dựa vào ID
  const getOptionText = (questionId, optionId) => {
    const question = originalQuestions.find(q => q.id === questionId);
    if (!question) return "N/A";
    const option = question.options.find(opt => opt.id === optionId);
    return option ? option.optionText : "Không trả lời";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết bài làm</h2>
            <p className="text-slate-500 text-sm font-medium">Xem lại các câu hỏi và giải thích từ hệ thống</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-3">Câu hỏi</th>
                <th className="px-6 py-3">Đáp án đúng</th>
                <th className="px-6 py-3">Bạn đã chọn</th>
                <th className="px-6 py-3">Giải thích</th>
              </tr>
            </thead>
            <tbody>
              {resultData.details.map((item, index) => {
                const correctText = getOptionText(item.questionId, item.correctOptionId);
                const selectedText = getOptionText(item.questionId, item.selectedOptionId);

                return (
                  <tr key={index} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 bg-white rounded-l-2xl border-y border-l border-slate-100 shadow-sm min-w-[200px]">
                      <div className="flex items-start gap-3">
                        <span className="font-black text-slate-300">{(index + 1).toString().padStart(2, '0')}</span>
                        <p className="font-bold text-slate-700 leading-snug">{item.questionText}</p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 bg-white border-y border-slate-100 shadow-sm">
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold">
                        {correctText}
                      </span>
                    </td>

                    <td className="px-6 py-5 bg-white border-y border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        {item.isCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-rose-500" />
                        )}
                        <span className={`text-sm font-bold ${item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedText}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 bg-white rounded-r-2xl border-y border-r border-slate-100 shadow-sm max-w-sm">
                      <div className="flex items-start gap-2 text-slate-500 italic text-xs leading-relaxed">
                        <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
                        {/* Lưu ý: Backend cần trả về trường explanation này */}
                        <span>{item.explanation || "Chưa có giải thích cho câu hỏi này."}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <button 
            onClick={onClose}
            className="px-10 py-3 bg-slate-800 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition shadow-lg shadow-slate-200"
          >
            Đóng bảng kết quả
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;