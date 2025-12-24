import React from "react";
import { Volume2, Square, Mic, Globe } from "lucide-react";

export const VoiceChatView = ({ 
  isListening, startListening, stopListening, transcript, interim, lang, setLang 
}) => {
  return (
    <div className="h-full flex flex-col items-center justify-between p-10 animate-in fade-in">
      
      {/* Nút đổi ngôn ngữ nhanh */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button 
          onClick={() => setLang("ko-KR")}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === "ko-KR" ? "bg-white text-[#377437] shadow-sm" : "text-gray-400"}`}
        >KOREAN</button>
        <button 
          onClick={() => setLang("vi-VN")}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === "vi-VN" ? "bg-white text-[#377437] shadow-sm" : "text-gray-400"}`}
        >VIETNAMESE</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-10 w-full max-w-2xl">
        {/* Hiển thị văn bản đang nhận diện */}
        <div className="text-center space-y-4">
          <p className="text-2xl font-black text-gray-800 leading-relaxed min-h-[3rem]">
            {transcript}
            <span className="text-gray-400 opacity-60 italic">{interim}</span>
          </p>
          {!transcript && !interim && !isListening && (
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Hãy nói gì đó bằng tiếng {lang === "ko-KR" ? "Hàn" : "Việt"}</p>
          )}
        </div>

        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${isListening ? 'bg-red-50 text-red-500 scale-110' : 'bg-green-50 text-[#377437]'}`}>
          <Volume2 size={56} className={isListening ? 'animate-pulse' : 'animate-bounce'} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-10">
        <button 
          onClick={isListening ? stopListening : startListening}
          className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-95
            ${isListening ? "bg-red-500 text-white" : "bg-[#377437] text-white hover:bg-green-700"}`}
        >
          {isListening ? <Square size={36} fill="white" /> : <Mic size={40} strokeWidth={2.5} />}
        </button>
        <p className={`text-sm font-black uppercase tracking-tighter ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
          {isListening ? "ĐANG LẮNG NGHE..." : "CHẠM ĐỂ BẮT ĐẦU"}
        </p>
      </div>
    </div>
  );
};