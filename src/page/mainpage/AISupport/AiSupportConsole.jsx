import React, { useState } from "react";
import { 
  MessageSquare, 
  BookOpen, 
  Search, 
  Mic, 
  Volume2, 
  Square, 
  Play,
  Sparkles,
  ChevronRight,
  Languages
} from "lucide-react";

export default function AiSupportConsole() {
  // Quản lý chế độ (Type): CHAT, GRAMMAR, VOCAB
  const [activeMode, setActiveMode] = useState("CHAT");
  const [isRecording, setIsRecording] = useState(false);

  const menuModes = [
    { id: "CHAT", label: "Nói chuyện với AI", icon: <MessageSquare size={20} />, desc: "Luyện nói 100% âm thanh" },
    { id: "GRAMMAR", label: "Giải thích ngữ pháp", icon: <BookOpen size={20} />, desc: "Phân tích cấu trúc câu" },
    { id: "VOCAB", label: "Giải thích từ vựng", icon: <Search size={20} />, desc: "Tra từ & Ví dụ song ngữ" },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F8F9FC] p-4 gap-4 font-sans overflow-hidden">
      
      {/* --- CỘT 1: SIDEBAR CHẾ ĐỘ (BÊN TRÁI) --- */}
      <aside className="w-72 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-6 flex-shrink-0">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">AICHAT</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Support System</p>
        </div>

        <nav className="flex-1 space-y-3">
          {menuModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group
                ${activeMode === mode.id ? "bg-green-50 text-[#377437] shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${activeMode === mode.id ? "bg-[#377437] text-white" : "bg-gray-50 text-gray-400 group-hover:text-[#377437]"}`}>
                  {mode.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black leading-tight">{mode.label}</p>
                </div>
              </div>
              <ChevronRight size={16} className={activeMode === mode.id ? "opacity-100" : "opacity-0"} />
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-50 flex items-center gap-3 px-4">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Engine Active</span>
        </div>
      </aside>

      {/* --- CỘT 2: KHUNG HIỂN THỊ CHÍNH (BÊN PHẢI) --- */}
      <main className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        
        {/* Header Chế độ */}
        <div className="px-10 py-6 border-b border-gray-50 flex items-center gap-4 bg-white/50 backdrop-blur-sm z-10">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
             <Sparkles className="text-[#377437]" size={24} />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
              {menuModes.find(m => m.id === activeMode)?.label}
            </h3>
            <p className="text-xs font-bold text-green-600">AI Mode: {activeMode}</p>
          </div>
        </div>

        {/* NỘI DUNG THAY ĐỔI THEO CHẾ ĐỘ */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          
          {/* TRƯỜNG HỢP 1: CHỈ ÂM THANH (Nói chuyện với AI) */}
          {activeMode === "CHAT" && (
            <div className="h-full flex flex-col items-center justify-between p-10 animate-in fade-in duration-500">
              <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${isRecording ? 'bg-red-50 text-red-500 scale-110' : 'bg-green-50 text-[#377437]'}`}>
                    <Volume2 size={56} className={isRecording ? 'opacity-20' : 'animate-bounce'} />
                  </div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">AI đang lắng nghe...</p>
                </div>

                {/* Sóng âm visualizer */}
                <div className="flex items-end gap-2 h-20">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 bg-[#377437] rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse' : 'h-2 opacity-20'}`}
                      style={{ 
                        height: isRecording ? `${Math.random() * 80 + 20}%` : '8px',
                        animationDelay: `${i * 0.05}s` 
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Nút điều khiển ghi âm lớn */}
              <div className="flex flex-col items-center gap-6 mb-10">
                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 bg-red-500/20 rounded-[2.5rem] animate-ping"></div>
                  )}
                  <button 
                    onClick={() => setIsRecording(!isRecording)}
                    className={`relative z-10 w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-90
                      ${isRecording ? "bg-red-500 text-white" : "bg-[#377437] text-white hover:bg-green-700"}`}
                  >
                    {isRecording ? <Square size={36} fill="white" /> : <Mic size={40} strokeWidth={2.5} />}
                  </button>
                </div>
                <p className={`text-sm font-black ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                  {isRecording ? "ĐANG GHI ÂM..." : "CHẠM ĐỂ BẮT ĐẦU NÓI"}
                </p>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: GIẢI THÍCH KÈM PHIÊN DỊCH (Ngữ pháp/Từ vựng) */}
          {activeMode !== "CHAT" && (
            <div className="p-10 space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-32">
               {/* Tin nhắn mẫu của AI giải thích có tích hợp dịch */}
               <div className="flex justify-start">
                  <div className="max-w-[90%] bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] rounded-tl-none space-y-6 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-gray-200/50 pb-4">
                       <div className="p-3 bg-[#377437] text-white rounded-xl shadow-lg">
                          {activeMode === "GRAMMAR" ? <BookOpen size={24} /> : <Search size={24} />}
                       </div>
                       <h4 className="text-xl font-black text-gray-900 tracking-tight">
                          {activeMode === "GRAMMAR" ? "Cấu trúc -(으)니까" : "Giải nghĩa từ: 사과 (Apple)"}
                       </h4>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-gray-700 font-bold leading-relaxed text-lg italic">
                        {activeMode === "GRAMMAR" 
                          ? "Dùng để diễn tả lý do hoặc căn cứ của một sự việc. Vế sau thường là câu mệnh lệnh hoặc đề nghị."
                          : "사과 (Danh từ): Trái táo, hoặc có nghĩa là sự xin lỗi tùy vào ngữ cảnh."}
                      </p>

                      {/* Khối ví dụ song ngữ */}
                      <div className="bg-white p-6 rounded-3xl border border-green-100 space-y-4 shadow-sm group">
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-black text-[#377437] tracking-wide">비가 오니까 우산을 가져가세요.</p>
                          <button className="p-2 bg-green-50 text-[#377437] rounded-xl hover:bg-[#377437] hover:text-white transition-all">
                            <Volume2 size={20} />
                          </button>
                        </div>
                        {/* Phần phiên dịch tiếng Việt bên dưới */}
                        <div className="pt-4 border-t border-gray-50 flex items-start gap-2">
                          <Languages size={16} className="text-gray-400 mt-1" />
                          <p className="text-gray-500 font-bold text-sm italic italic leading-relaxed">
                            Vì trời đang mưa nên bạn hãy mang theo ô nhé.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Thanh nhập liệu cố định cho chế độ giải thích */}
               <div className="fixed bottom-10 left-[calc(260px+20rem)] right-14 z-20">
                  <div className="bg-gray-100/80 backdrop-blur-md rounded-[2.5rem] p-3 flex items-center gap-3 border border-gray-200 shadow-xl focus-within:bg-white focus-within:border-[#377437] transition-all">
                    <button className="p-4 text-gray-400 hover:text-[#377437] transition-colors"><Mic size={24} /></button>
                    <input 
                      type="text" 
                      placeholder={`Nhập ${activeMode === "GRAMMAR" ? "ngữ pháp" : "từ vựng"} cần AI giải thích...`}
                      className="flex-1 bg-transparent border-none outline-none font-bold text-gray-700 py-3"
                    />
                    <button className="p-4 bg-[#377437] text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all">
                      <ChevronRight size={24} strokeWidth={3} />
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}