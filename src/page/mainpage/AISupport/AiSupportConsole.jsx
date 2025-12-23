import React, { useState, useEffect } from "react";
import {
  MessageSquare, BookOpen, Search, Mic, Volume2,
  Square, Play, Sparkles, ChevronRight, Languages, Info, X, BotMessageSquare
} from "lucide-react";

// Import Hooks
import { useSpeechRecognition } from "../../../hooks/SpeechConvert/useSpeechConvert";
import { useTextToSpeech } from "../../../hooks/SpeechConvert/useTextConvert";
import AiService from "../../../AdminControl/Service/API/aiAPI/ai.service";

import { useAuth } from "../../../context/authContext";

export default function AiSupportConsole() {
  const [activeMode, setActiveMode] = useState("CHAT_TUTOR");
  const [inputText, setInputText] = useState("");
  const [selectedLang, setSelectedLang] = useState("한국어");
  const [lastAiResponse, setLastAiResponse] = useState(""); // Lưu câu trả lời mới nhất để auto-TTS
  const [isLoading, setIsLoading] = useState(false);

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { user } = useAuth(); // Lấy user và jwt từ Context

  // Lấy userID (tùy thuộc vào cấu trúc object user của bạn)
  const userId = user?.id || user?.userID || user?._id;

  let lessonsentence = "";

  // 1. Cấu hình Hook STT (Nghe)
  const {
    isListening,
    transcript,
    interim,
    setLang,
    error,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition("ko-KR");

  // 2. Cấu hình Hook TTS (Nói)
  const { isSpeaking, speak, stop: stopTTS, setTtsLang } = useTextToSpeech("ko-KR");

  const langMap = {
    "Tiếng Việt": "vi-VN",
    "English": "en-US",
    "한국어": "ko-KR",
  };

  const languages = ["Tiếng Việt", "English", "한국어"];

  useEffect(() => {
    const code = langMap[selectedLang];
    setLang(code);
    setTtsLang(code);
  }, [selectedLang]);

  useEffect(() => {
    if (lastAiResponse) {
      const textToSpeak = typeof lastAiResponse === 'string' ? lastAiResponse : lastAiResponse.reply || lastAiResponse.correctedText;
      if (textToSpeak) speak(textToSpeak);
    }
  }, [lastAiResponse]);



  useEffect(() => {

    if (!userId) return;
    let cancelled = false;
    const initSession = async () => {
      setIsLoading(true);
      setLastAiResponse(null);
      try {

        const sessions = await AiService.getSessions(userId, activeMode);
        if (cancelled) return;
        if (sessions.length > 1) {

          console.warn(

            `[Session] Backend violation: multiple sessions for type ${activeMode}`,

            sessions

          );

        }



        const session = sessions[0];



        if (session) {

          setCurrentSessionId(session.id);

          console.log(`[Session] Reused: ${session.id} (${activeMode})`);

        } else {

          const newSession = await AiService.createSession(

            userId,

            activeMode,

            `Học tập ${activeMode} - ${new Date().toLocaleDateString()}`

          );



          if (cancelled) return;



          setCurrentSessionId(newSession.id);

          console.log(`[Session] Created: ${newSession.id} (${activeMode})`);

        }

      } catch (err) {

        if (!cancelled) {

          console.error("Lỗi khởi tạo session:", err);

        }

      } finally {

        if (!cancelled) setIsLoading(false);

      }

    };



    initSession();



    return () => {

      cancelled = true;

    };

  }, [userId, activeMode]);

  const menuModes = [
    { id: "PRONUNCIATION", label: "Nói chuyện với AI", icon: <MessageSquare size={20} />, desc: "Luyện nói 100% âm thanh" },
    { id: "EXPLAIN", label: "Giải thích bài học", icon: <BookOpen size={20} />, desc: "Phân tích vocab,  cấu trúc câu" },
    { id: "WRITING_CHECK", label: "Hướng dẫn viết", icon: <Search size={20} />, desc: "Tra từ & Ví dụ song ngữ" },
    { id: "CHAT_TUTOR", label: "Chat with turtor", icon: <BotMessageSquare size={20} />, desc: "AI support" },
  ];

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    // ✅ Sửa: Logic lấy nội dung rõ ràng hơn
    const finalContent = (activeMode === "PRONUNCIATION")
      ? (transcript || interim || "").trim()
      : inputText.trim();

    // ✅ Sửa: Kiểm tra điều kiện chặt chẽ hơn
    if (!finalContent || isLoading || !currentSessionId) {
      console.warn("Không thể gửi: thiếu nội dung hoặc session");
      return;
    }

    setIsLoading(true);
    try {
      let result;

      switch (activeMode) {
        case "PRONUNCIATION":
          const effectiveTarget = lessonsentence || finalContent;

          result = await AiService.evaluatePronunciation({
            userTranscript: finalContent,
            targetSentence: effectiveTarget,
            userId: userId,
          });

          // ✅ Sửa: Cấu trúc response nhất quán
          setLastAiResponse({
            reply: `Độ chính xác: ${result.score}% - ${result.feedback}`,
            detail: result
          });
          break;

        case "CHAT_TUTOR":
          result = await AiService.chat(currentSessionId, userId, finalContent);
          // ✅ Sửa: Đảm bảo có reply
          setLastAiResponse({ reply: result.reply || result.message || "Không có phản hồi" });
          break;

        case "EXPLAIN":
          result = await AiService.explainWord(finalContent, "Context học tập");
          setLastAiResponse({ reply: result.explanation || result.meaning || "Không có giải thích" });
          break;

        case "WRITING_CHECK":
          result = await AiService.evaluateWriting(finalContent);
          // ✅ Sửa: Giữ nguyên object cho WRITING_CHECK
          setLastAiResponse(result);
          break;

        default:
          console.warn("Mode không hợp lệ");
          break;
      }
    } catch (err) {
      console.error("AI Service Error:", err);
      // ✅ Thêm: Hiển thị lỗi cho user
      setLastAiResponse({ reply: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
      setInputText("");
      clearTranscript();
    }
  };

  // 4. ĐIỀU KHIỂN MIC
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      // ✅ Sửa: Chỉ auto-send nếu có nội dung
      if (activeMode === "PRONUNCIATION" && (transcript || interim)) {
        setTimeout(handleSend, 500);
      }
    } else {
      stopTTS();
      startListening();
    }
  };

  // ✅ Thêm: Hàm speak wrapper để xử lý cả string và object
  const handleSpeak = (content) => {
    if (!content) return;

    let textToSpeak = "";
    if (typeof content === 'string') {
      textToSpeak = content;
    } else if (content.reply) {
      textToSpeak = content.reply;
    } else if (content.correctedText) {
      textToSpeak = content.correctedText;
    }

    if (textToSpeak) {
      speakTTS(textToSpeak);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#F8F9FC] p-4 gap-4 font-sans overflow-hidden">
      <style>{`
      @keyframes subtle-wave {
        0%, 100% { height: 8px; }
        50% { height: 40px; }
      }
      @keyframes typing {
        0%, 100% { transform: translateY(0); opacity: 0.3; }
        50% { transform: translateY(-5px); opacity: 1; }
      }
      .animate-wave { animation: subtle-wave 1s ease-in-out infinite; }
      .typing-dot { animation: typing 1s infinite; }
      @keyframes ai-glowing {
        0%, 100% { color: #377437; filter: drop-shadow(0 0 2px rgba(55, 116, 55, 0.2)); }
        50% { color: #5da15d; filter: drop-shadow(0 0 8px rgba(93, 161, 93, 0.6)); }
      }

      @keyframes ai-ring-pulse {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      .animate-ai-glow {
        animation: ai-glowing 3s ease-in-out infinite;
      }

      .animate-ai-ring {
        animation: ai-ring-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `}</style>

      {/* --- CỘT 1: SIDEBAR --- */}
      <aside className="w-72 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col p-6 flex-shrink-0">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">AICHAT</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Support System {error && " - Error!"}</p>
        </div>

        <nav className="flex-1 space-y-3">
          {menuModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                stopListening();
                stopTTS();
                setLastAiResponse(null); // ✅ Sửa: Reset về null
                setInputText(""); // ✅ Thêm: Clear input
                clearTranscript(); // ✅ Thêm: Clear transcript
              }}
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
      </aside>

      {/* --- CỘT 2: KHUNG CHÍNH --- */}
      <main className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 space-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-[#377437]" size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{menuModes.find(m => m.id === activeMode)?.label}</h3>
              <p className="text-xs font-bold text-green-600 tracking-widest uppercase italic">Language: {selectedLang}</p>
            </div>

          </div>
          {isLoading && (
            <div className="flex items-center gap-2 bg-green-50/50 px-4 py-2 rounded-full border border-green-100 animate-in fade-in zoom-in">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-[#377437] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-[#377437] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-[#377437] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-[10px] font-black text-[#377437] uppercase">AI Thinking</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* HIỂN THỊ CÂU TRẢ LỜI CỦA AI NẾU CÓ (Để người dùng nhấn loa nghe lại) */}
          {lastAiResponse && activeMode === "PRONUNCIATION" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-top-4">
              <button
                onClick={() => handleSpeak(lastAiResponse)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg transition-all ${isSpeaking ? 'bg-[#377437] text-white scale-105' : 'bg-white text-gray-700'}`}
              >
                <Volume2 size={18} className={isSpeaking ? "animate-pulse" : ""} />
                <span className="text-sm font-bold">Nghe lại phản hồi</span>
              </button>
            </div>
          )}

          {activeMode === "PRONUNCIATION" ? (
            <div className="h-full flex flex-col items-center justify-between p-10 animate-in fade-in duration-500">
              <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8">

                <div className="w-full max-w-2xl text-center min-h-[100px] flex flex-col justify-center px-4">
                  {transcript || interim ? (
                    <div className="space-y-2">
                      <p className="text-xl font-black text-gray-800 leading-tight">{transcript}</p>
                      {interim && <p className="text-xl font-bold text-red-400 italic animate-pulse">{interim}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessonsentence && (
                        <div className="bg-green-50 p-4 rounded-2xl mb-4 border border-green-100">
                          <p className="text-[10px] uppercase font-black text-[#377437]">Mẫu câu cần đọc:</p>
                          <p className="text-lg font-bold text-[#377437]">{lessonsentence}</p>
                        </div>
                      )}
                      <p className="text-gray-300 font-bold italic uppercase tracking-widest">
                        {isSpeaking ? "AI đang trả lời..." : "Sẵn sàng lắng nghe..."}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 
                  ${isListening ? 'bg-red-50 text-red-500 scale-110 shadow-red-100' :
                    isSpeaking ? 'bg-blue-50 text-blue-600 scale-105 shadow-blue-100' : 'bg-green-50 text-[#377437]'}`}>
                  <Volume2 size={56} className={isListening || isSpeaking ? 'animate-pulse' : 'animate-bounce'} />
                </div>

                <div className="flex items-end gap-2 h-16">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 
                        ${isListening ? 'bg-red-500 animate-wave' :
                          isSpeaking ? 'bg-blue-500 animate-wave' : 'bg-gray-100 h-2'}`}
                      style={{
                        animationDelay: `${i * 0.08}s`,
                        height: (isListening || isSpeaking) ? 'auto' : '8px'
                      }}
                    />
                  ))}
                </div>
                {lastAiResponse && (
                  <div className="w-full max-w-2xl bg-green-50 p-6 rounded-2xl border border-green-100">
                    <p className="text-sm font-black text-[#377437] uppercase mb-2">Kết quả:</p>
                    <p className="text-gray-800 font-bold">{lastAiResponse.reply}</p>
                    <button
                      onClick={() => handleSpeak(lastAiResponse)}
                      className="mt-3 flex items-center gap-2 text-xs font-black text-[#377437] uppercase hover:underline"
                    >
                      <Volume2 size={14} /> Nghe lại
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-6 mb-6 w-full max-w-sm">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-5 py-3 rounded-3xl shadow-inner w-full">
                  <div className="flex-1 flex items-center gap-2">
                    <Info size={16} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">Engine: <span className="text-[#377437]">Voice Sync Active</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages size={18} className="text-[#377437]" />
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-black text-gray-700 uppercase cursor-pointer"
                    >
                      {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={toggleListening}
                  className={`z-10 w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-90
                    ${isListening ? "bg-red-500 text-white" : "bg-[#377437] text-white hover:shadow-green-200"}`}
                >
                  {isListening ? <Square size={36} fill="white" /> : <Mic size={40} strokeWidth={2.5} />}
                </button>
                <p className={`text-sm font-black uppercase tracking-widest ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                  {isListening ? "Đang lắng nghe..." : "Nhấn để bắt đầu"}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-10 pb-32 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-[85%] bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] rounded-tl-none space-y-6">
                <div className="flex items-center gap-3 text-[#377437]">
                  {activeMode === "WRITING_CHECK" ? <Search size={20} /> : <BookOpen size={20} />}
                  <span className="font-black uppercase tracking-widest text-sm">AI Response</span>
                </div>
                {lastAiResponse ? (
                  <div className="space-y-4">
                    {activeMode === "WRITING_CHECK" && typeof lastAiResponse === 'object' && lastAiResponse.correctedText ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white rounded-2xl border border-green-100">
                          <p className="text-xs font-black text-[#377437] uppercase mb-2">Câu đã sửa:</p>
                          <p className="text-gray-800 font-bold text-lg">{lastAiResponse.correctedText}</p>
                        </div>
                        {lastAiResponse.feedback && (
                          <p className="text-gray-600 italic text-sm">{lastAiResponse.feedback}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-800 font-bold text-lg">
                        {/* ✅ Sửa: Xử lý an toàn hơn */}
                        {typeof lastAiResponse === 'string'
                          ? lastAiResponse
                          : (lastAiResponse.reply || lastAiResponse.message || "Không có phản hồi")}
                      </p>
                    )}

                    <button
                      onClick={() => handleSpeak(lastAiResponse)}
                      className="flex items-center gap-2 text-xs font-black text-[#377437] uppercase hover:underline"
                    >
                      <Volume2 size={14} /> Nghe lại
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 font-bold italic">Nhập nội dung hoặc sử dụng giọng nói để AI xử lý...</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- INPUT BAR CHO CÁC MODE CÒN LẠI --- */}
        {activeMode !== "PRONUNCIATION" && (
          <div className="absolute bottom-10 left-10 right-10 z-20">
            <div className={`bg-gray-100/90 backdrop-blur-md rounded-[2.5rem] p-3 flex items-center gap-3 border transition-all duration-300 shadow-2xl
                    ${isListening ? 'border-red-500 shadow-red-100 bg-white' : 'border-gray-200 focus-within:bg-white focus-within:border-[#377437]'}`}>

              <button
                onClick={toggleListening}
                disabled={isLoading} // ✅ Thêm: Disable khi loading
                className={`p-4 rounded-full transition-all disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#377437]'}`}
              >
                {isListening ? <Square size={24} fill="white" /> : <Mic size={24} />}
              </button>

              <div className="flex-1 flex flex-col relative px-2">
                <input
                  type="text"
                  value={isListening ? (interim || transcript) : inputText}
                  onChange={(e) => !isListening && setInputText(e.target.value)} // ✅ Sửa: Không cho edit khi đang nghe
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()} // ✅ Sửa: Thêm check loading
                  placeholder={isListening ? "Hệ thống đang thu âm..." : `Nhập nội dung cần AI xử lý...`}
                  disabled={isListening} // ✅ Thêm: Disable input khi đang nghe
                  className="bg-transparent border-none outline-none font-bold text-gray-700 py-3 w-full disabled:opacity-70"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!inputText.trim() && !transcript && !interim)} // ✅ Sửa: Disable khi không có nội dung
                  className="p-4 bg-[#377437] text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}