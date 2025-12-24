import React from "react";
import { Mic, ChevronRight, Square } from "lucide-react";

export const AiInputBar = ({ 
  mode, 
  value, 
  onChange, 
  onSend, 
  isListening, 
  startListening, 
  stopListening 
}) => {
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSend();
  };

  // Xác định text gợi ý dựa trên mode
  const placeholderText = mode === "GRAMMAR" ? "ngữ pháp" : "từ vựng";

  return (
    <div className="fixed bottom-10 left-[calc(260px+20rem)] right-14 z-20 animate-in slide-in-from-bottom-10">
      <div className={`
        bg-gray-100/80 backdrop-blur-md rounded-[2.5rem] p-2 pl-4 flex items-center gap-3 border transition-all duration-300 shadow-xl
        ${isListening 
          ? 'border-red-400 ring-4 ring-red-50 bg-white' 
          : 'border-gray-200 focus-within:bg-white focus-within:border-[#377437] focus-within:shadow-2xl'}
      `}>
        
        {/* NÚT MIC: Đổi màu và icon khi đang nghe */}
        <button 
          onClick={handleMicClick}
          className={`p-3 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
              : 'text-gray-400 hover:text-[#377437] hover:bg-green-50'
          }`}
        >
          {isListening ? <Square size={22} fill="white" /> : <Mic size={24} />}
        </button>

        {/* Ô INPUT: Hiển thị trạng thái "Đang nghe..." */}
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "AI đang lắng nghe bạn nói..." : `Nhập hoặc nói ${placeholderText} cần giải thích...`}
          className={`flex-1 bg-transparent border-none outline-none font-bold py-3 text-lg transition-colors
            ${isListening ? 'text-red-500 placeholder:text-red-300' : 'text-gray-700 placeholder:text-gray-400/80'}
          `}
        />

        {/* NÚT GỬI: Chỉ hiện hiệu ứng khi có chữ trong ô input */}
        <button 
          onClick={onSend}
          disabled={!value.trim()}
          className={`p-4 rounded-[2rem] shadow-lg transition-all duration-300 
            ${value.trim() 
              ? 'bg-[#377437] text-white hover:scale-105 active:scale-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          <ChevronRight size={28} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};