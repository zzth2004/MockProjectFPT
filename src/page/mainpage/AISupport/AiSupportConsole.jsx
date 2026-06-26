import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, BookOpen, Search, Mic, Volume2,
  Square, Play, Sparkles, ChevronRight, Languages, Info, X, BotMessageSquare, ChevronDown
} from "lucide-react";

// Import Hooks
import { useSpeechRecognition } from "../../../hooks/SpeechConvert/useSpeechConvert";
import { useTextToSpeech } from "../../../hooks/SpeechConvert/useTextConvert";
import AiService from "../../../AdminControl/Service/API/aiAPI/ai.service";

import { useAuth } from "../../../context/authContext";
import WritingEvaluationView from "./components/WritingEvaluationView";

export default function AiSupportConsole() {
  const [activeMode, setActiveMode] = useState("CHAT_TUTOR");
  const [inputText, setInputText] = useState("");
  const [sttLang, setSttLang] = useState("ko-KR"); // Ngôn ngữ nói vào
  const [ttsLang, setTtsLangState] = useState("ko-KR");
  const [lastAiResponse, setLastAiResponse] = useState(""); // Lưu câu trả lời mới nhất để auto-TTS
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([]); // Lưu danh sách tin nhắn
  const messagesEndRef = useRef(null);
  const [lastUserText, setLastUserText] = useState("");

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { user } = useAuth(); // Lấy user và jwt từ Context
  const [requestType, setRequestType] = useState("pronunciation"); // hoặc "chat"


  const REQUEST_OPTIONS = [
    { id: "pronunciation", label: "Luyện đọc", icon: <Mic size={14} /> },
    { id: "chat", label: "Trò chuyện", icon: <MessageSquare size={14} /> },
  ];
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
  const { isSpeaking, speak, stop: stopTTS,
    setTtsLang: updateTtsEngine
  } = useTextToSpeech("ko-KR");

  const SUPPORTED_LANGS = [
    { label: "한국어", code: "ko-KR" },
    { label: "Tiếng Việt", code: "vi-VN" },
    { label: "English", code: "en-US" },
  ];
  useEffect(() => {
    setLang(sttLang); // Hook STT
    setTtsLangState(ttsLang); // Cập nhật state TTS
    console.log("Updated languages:", { sttLang, ttsLang });
  }, [sttLang, setLang, ttsLang, setTtsLangState]);


  useEffect(() => {
    updateTtsEngine(ttsLang); // Gọi hàm của Hook bằng tên mới
  }, [ttsLang, updateTtsEngine]);

  useEffect(() => {
    if (lastAiResponse) {
      const textToSpeak = typeof lastAiResponse === 'string' ? lastAiResponse : lastAiResponse.reply || lastAiResponse.correctedText;
      if (textToSpeak) speak(textToSpeak);
    }
  }, [lastAiResponse]);


  // useEffect(() => {

  //   if (!userId) return;
  //   let cancelled = false;
  //   const initSession = async () => {
  //     setIsLoading(true);
  //     setLastAiResponse(null);
  //     try {

  //       const sessions = await AiService.getSessions(userId, activeMode);
  //       if (cancelled) return;
  //       if (sessions.length > 1) {

  //         console.warn(

  //           `[Session] Backend violation: multiple sessions for type ${activeMode}`,

  //           sessions

  //         );

  //       }
  //       const session = sessions[0];
  //       if (session) {

  //         setCurrentSessionId(session.id);

  //         console.log(`[Session] Reused: ${session.id} (${activeMode})`);
  //         fetchHistory();

  //       } else {

  //         const newSession = await AiService.createSession(

  //           userId,

  //           activeMode,

  //           `Học tập ${activeMode} - ${new Date().toLocaleDateString()}`

  //         );
  //         if (cancelled) return;
  //         setCurrentSessionId(newSession.id);

  //         console.log(`[Session] Created: ${newSession.id} (${activeMode})`);

  //       }

  //     } catch (err) {

  //       if (!cancelled) {

  //         console.error("Lỗi khởi tạo session:", err);

  //       }

  //     } finally {

  //       if (!cancelled) setIsLoading(false);

  //     }

  //   };
  //   initSession();
  //   return () => {

  //     cancelled = true;

  //   };

  // }, [userId, activeMode]);


  useEffect(() => {
    if (!userId) return;

    // 1. DỌN DẸP NGAY LẬP TỨC: 
    // Khi đổi mode, ta xóa messages ngay để tránh UI hiện tin nhắn cũ của mode trước.
    setMessages([]);
    setLastAiResponse(null);

    let isMounted = true; // Flag để tránh memory leak/update state khi component unmount

    const initSession = async () => {
      setIsLoading(true);
      try {
        // Lấy hoặc tạo session
        const sessions = await AiService.getSessions(userId, activeMode);
        if (!isMounted) return;

        let session = sessions[0];
        if (!session) {
          session = await AiService.createSession(userId, activeMode, `Session ${activeMode}`);
        }

        if (!isMounted) return;
        setCurrentSessionId(session.id);

        // 2. CHẶN FETCH HISTORY NẾU LÀ PRONUNCIATION
        // Chúng ta lồng điều kiện ở đây để vẫn lấy được Session ID (cần cho việc gửi AI) 
        // nhưng không tốn tài nguyên lấy tin nhắn cũ.
        if (activeMode !== "PRONUNCIATION") {
          const history = await AiService.getSessionMessages(session.id, userId);
          if (isMounted) {
            setMessages(history || []);
          }
        }

      } catch (err) {
        console.error("Session Init Error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    return () => { isMounted = false; }; // Cleanup function
  }, [userId, activeMode]);
  const menuModes = [
    { id: "PRONUNCIATION", label: "Nói chuyện với AI", icon: <MessageSquare size={20} />, desc: "Luyện nói 100% âm thanh" },
    { id: "EXPLAIN", label: "Giải thích bài học", icon: <BookOpen size={20} />, desc: "Phân tích vocab,  cấu trúc câu" },
    { id: "WRITING_CHECK", label: "Hướng dẫn viết", icon: <Search size={20} />, desc: "Tra từ & Ví dụ song ngữ" },
    { id: "CHAT_TUTOR", label: "Chat with turtor", icon: <BotMessageSquare size={20} />, desc: "AI support" },
  ];
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    const content = (isListening ? (transcript || interim) : inputText).trim();
    if (!content || isLoading || !currentSessionId) return;

    const currentRequestMode = requestType === "pronunciation" ? "pronunciation" : "chat";

    const pronouceContent = `${currentRequestMode}:${content} by ${ttsLang}`;

    // 1. Thêm tin nhắn User vào danh sách
    const userMsg = { role: "user", content, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    clearTranscript();
    if (isListening) stopListening();

    setIsLoading(true);
    try {
      let aiReplyText = "";
      let result;
      setLastUserText(content);

      // 2. Gọi API tùy theo Mode
      switch (activeMode) {
        case "PRONUNCIATION":

          console.log("Sending Pronunciation Request:", pronouceContent);
          // Gọi Service với Prompt toàn năng đã thiết lập ở Backend
          result = await AiService.evaluatePronunciation({
            userTranscript: pronouceContent,
            sessionId: currentSessionId,
            userId,
            targetSentence: lessonsentence // Mẫu câu cần đọc (nếu có)
          });
          const formattedResult = {
            ...result,
            displayReply: result.intent === 'EVALUATION' ? result.feedback : (result.reply || result.message)
          };

          console.log("Pronunciation Result:", formattedResult);

          setLastAiResponse(formattedResult);

          // LOGIC XỬ LÝ ĐA NĂNG (Dựa trên Intent từ AI)
          if (result.intent === 'EVALUATION') {
            // Trường hợp: Người dùng đang luyện đọc
            aiReplyText = `🎯 [Đánh giá] Độ chính xác: ${result.score}% \n ${result.feedback}`;

            // Cập nhật lastAiResponse để hiện bảng điểm chuyên sâu (nếu cần)
            // setLastAiResponse(result);

            // Chỉ cho AI đọc phần góp ý hoặc câu mẫu
            speak(result.feedback);
          }
          else if (result.intent === 'CHAT') {
            // Trường hợp: Người dùng đang muốn nói chuyện/hỏi đáp
            aiReplyText = `${result.reply} \n (${result.vietnameseTranslation})`;

            // Ưu tiên đọc tiếng Hàn (nếu reply là tiếng Hàn)
            speak(result.reply);
          }
          else {
            // Trường hợp: CLARIFICATION - AI chưa hiểu ý hoặc yêu cầu người dùng xác nhận
            aiReplyText = result.reply || "Tôi chưa rõ bạn muốn luyện phát âm hay trò chuyện. Bạn có thể nói rõ hơn không?";
            speak(aiReplyText);
          }
          break;
        case "CHAT_TUTOR":
          result = await AiService.chat(currentSessionId, userId, content);
          aiReplyText = result.reply || result.message;
          break;
        case "EXPLAIN":
          result = await AiService.explainWord(content);
          aiReplyText = result.explanation || result.meaning;
          break;
        case "WRITING_CHECK":
          result = await AiService.evaluateWriting(content);

          // Tạo chuỗi văn bản chi tiết (String) để đưa vào bong bóng chat
          const suggestions = result.suggestions && result.suggestions.length > 0
            ? `\n\n📚 GỢI Ý HỌC TẬP:\n${result.suggestions.map(s => `• ${s.suggestion || s}`).join('\n')}`
            : "";

          const strengths = result.strengths && result.strengths.length > 0
            ? `\n\n✨ ĐIỂM MẠNH:\n${result.strengths.map(s => `• ${s}`).join('\n')}`
            : "";

          // Chuỗi tổng hợp cuối cùng
          aiReplyText = `📝 BẢN SỬA LỖI:\n"${result.correctedText}"\n\n💡 NHẬN XÉT: ${result.feedback}${strengths}${suggestions}\n\n🏆 ĐIỂM TỔNG: ${result.overallScore} (${result.grade})`;

          // QUAN TRỌNG: Chỉ lưu chuỗi String vào lastAiResponse để auto-TTS đọc, không lưu Object
          setLastAiResponse(aiReplyText);

          console.log("Writing Evaluation Result:", result);
          break;
        default: aiReplyText = "Chế độ không hợp lệ";
      }

      const aiMsg = { role: "assistant", content: aiReplyText, createdAt: new Date() };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Xin lỗi, AI đang gặp sự cố kết nối.", isError: true }]);
    } finally {
      setIsLoading(false);
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
      speak(textToSpeak);
    }
  };

  const renderMessage = (msg, index) => {
    const isAi = msg.role === "assistant";

    return (
      <div
        key={index}
        className={`flex ${isAi ? "justify-start" : "justify-end"} mb-6 animate-in slide-in-from-bottom-2 duration-300`}
      >
        <div className={`flex max-w-[80%] ${isAi ? "flex-row" : "flex-row-reverse"} gap-3`}>
          {/* Avatar Icon */}
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm 
            ${isAi ? "bg-green-100 text-[#377437]" : "bg-gray-800 text-white"}`}>
            {isAi ? <Sparkles size={16} /> : <span className="text-[10px] font-bold">ME</span>}
          </div>

          {/* Nội dung tin nhắn */}
          <div className="flex flex-col gap-2">
            <div className={`p-4 rounded-2xl border ${isAi
              ? "bg-white border-gray-200 rounded-tl-none text-gray-800"
              : "bg-[#377437] border-[#377437] rounded-tr-none text-white"
              }`}>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {typeof msg.content === 'string' ? msg.content : (msg.content?.reply || msg.content?.message)}
              </p>
              
            </div>

            {/* Thời gian (Tùy chọn) */}
            <span className={`text-[9px] font-bold text-gray-400 uppercase tracking-tighter ${isAi ? "text-left" : "text-right"}`}>
              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-full pt-20 p-4 gap-4 font-sans overflow-hidden" style={{ minHeight: 0 }}>
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
      <aside className="w-72 bg-white rounded-2xl border border-gray-200 flex flex-col p-6 flex-shrink-0">
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
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group border ${
                activeMode === mode.id ? "bg-green-50/50 text-[#377437] border-green-200" : "text-gray-500 hover:bg-gray-50 border-transparent hover:border-gray-200"}`}
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
      <main className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden relative">
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 space-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-[#377437]" size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{menuModes.find(m => m.id === activeMode)?.label}</h3>
              <p className="text-xs font-bold text-green-600 tracking-widest uppercase italic">Language: {sttLang}</p>
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
          {activeMode === "PRONUNCIATION" ? (
            <div className="h-full flex flex-col items-center justify-between p-10 animate-in fade-in duration-500">
              <div className="flex-1 w-full flex flex-col items-center justify-center space-y-8">

                <div className="w-full max-w-2xl text-center min-h-[100px] flex flex-col justify-center px-4">
                  <div className="w-full max-w-2xl text-center min-h-[150px] flex flex-col justify-center px-4">
                    {isListening || transcript || interim ? (
                      /* Đang nói */
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-gray-800 leading-tight">{transcript || interim}</p>
                        {interim && <div className="h-1 w-20 bg-[#377437] mx-auto animate-pulse rounded-full" />}
                      </div>
                    ) : lastUserText ? (
                      /* Đã nói xong và có kết quả */
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                        <div className="opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">Bạn đã nói:</p>
                          <p className="text-lg font-bold italic">"{lastUserText}"</p>
                        </div>
                      </div>
                    ) : (
                      /* Trạng thái chờ */
                      <div className="space-y-4">
                        {lessonsentence && (
                          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-200/50">
                            <p className="text-[10px] uppercase font-black text-[#377437] mb-2 tracking-widest opacity-60">Mẫu câu cần đọc:</p>
                            <p className="text-2xl font-black text-[#377437] leading-tight">{lessonsentence}</p>
                          </div>
                        )}
                        <p className="text-gray-300 font-bold italic uppercase tracking-[0.2em] text-xs">
                          {isSpeaking ? "AI đang trả lời..." : "Sẵn sàng lắng nghe..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 transition-all duration-500 
                  ${isListening ? 'bg-red-50 border-red-200 text-red-500 scale-105' :
                    isSpeaking ? 'bg-blue-50 border-blue-200 text-blue-600 scale-102' : 'bg-green-50 border-green-200 text-[#377437]'}`}>
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
                    {lastAiResponse && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 animate-in zoom-in duration-500">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Sparkles size={16} className="text-[#377437]" />
                          <span className="text-[10px] font-black text-[#377437] uppercase tracking-widest">AI Analysis</span>
                        </div>
                        <p className="text-xl font-black text-gray-900 leading-relaxed">
                          {lastAiResponse.displayReply}
                        </p>
                        <p className="text-xl font-black text-gray-900 leading-relaxed">
                          {
                            `VN translate: ${lastAiResponse.vietnameseTranslation}`

                          }
                        </p>

                        {/* Nếu là chấm điểm, hiện thêm điểm số nhỏ */}
                        {lastAiResponse.score && (
                          <div className="mt-4 flex justify-center gap-4">
                            <div className="px-4 py-1 bg-green-50 rounded-full text-[10px] font-black text-[#377437]">ACCURACY: {lastAiResponse.accuracy}%</div>
                            <div className="px-4 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600">FLUENCY: {lastAiResponse.fluency}%</div>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => handleSpeak(lastAiResponse)}
                      className="mt-3 flex items-center gap-2 text-xs font-black text-[#377437] uppercase hover:underline"
                    >
                      <Volume2 size={14} /> Nghe lại
                    </button>
                  </div>
                )}
              </div>

              {/* Container chính: Mở rộng max-w để thanh điều khiển thanh thoát hơn */}
              <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">

                {/* TẦNG 1: ENGINE STATUS & REQUEST TYPE */}
                <div className="relative w-full">
                  {/* Glow hiệu ứng nền mờ ảo cho tầng 1 */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-100/10 to-emerald-100/10 rounded-[2rem] blur-lg opacity-50"></div>

                  <div className="relative flex flex-wrap items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-gray-200 px-6 py-3 rounded-2xl">

                    {/* Badge Trạng thái */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/90 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="relative flex">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                        <div className="relative w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">System</span>
                        <span className="text-[11px] font-black text-[#377437] uppercase">Voice Active</span>
                      </div>
                    </div>

                    {/* Chọn Request Type (Luyện đọc / Chat) */}
                    <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-100 shadow-inner">
                      {REQUEST_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setRequestType(option.id)}
                          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-500 ${requestType === option.id
                            ? "bg-white text-[#377437] shadow-md scale-[1.02]"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
                            }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TẦNG 2: LANGUAGE SELECTORS */}
                <div className="relative w-full max-w-[90%]"> {/* Tầng 2 hơi hẹp hơn tầng 1 để tạo hình khối đẹp */}
                  <div className="relative flex items-center justify-center gap-8 bg-white/40 backdrop-blur-2xl border border-gray-200 px-10 py-3 rounded-2xl">

                    {/* Lựa chọn: Tôi nói */}
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl group-hover/item:bg-red-500 group-hover/item:text-white transition-all duration-500 shadow-sm">
                        <Mic size={16} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1.5">Ngôn ngữ tôi nói</label>
                        <div className="relative flex items-center">
                          <select
                            value={sttLang}
                            onChange={(e) => setSttLang(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] font-black uppercase text-gray-700 cursor-pointer hover:text-[#377437] transition-colors appearance-none pr-4 z-10"
                          >
                            {SUPPORTED_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                          </select>
                          <ChevronDown size={12} className="text-gray-400 absolute right-0 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Đường chia cách nghệ thuật */}
                    <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

                    {/* Lựa chọn: AI trả lời */}
                    <div className="flex items-center gap-4 group/item">
                      <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-500 rounded-2xl group-hover/item:bg-blue-500 group-hover/item:text-white transition-all duration-500 shadow-sm">
                        <Volume2 size={16} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1.5">AI trả lời bằng</label>
                        <div className="relative flex items-center">
                          <select
                            value={ttsLang}
                            onChange={(e) => setTtsLangState(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] font-black uppercase text-gray-700 cursor-pointer hover:text-[#377437] transition-colors appearance-none pr-4 z-10"
                          >
                            {SUPPORTED_LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                          </select>
                          <ChevronDown size={12} className="text-gray-400 absolute right-0 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* NÚT MIC CHÍNH: Thiết kế dạng vật lý (Tactile UI) */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    {/* Vòng tròn sóng lan tỏa khi đang nghe */}
                    {isListening && (
                      <div className="absolute inset-0 bg-red-500 rounded-[2.5rem] animate-ping opacity-20 scale-125"></div>
                    )}

                    <button
                      onClick={toggleListening}
                      className={`relative z-10 w-28 h-28 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 
          ${isListening
                          ? "bg-red-500 border-red-600 text-white scale-105"
                          : "bg-white text-[#377437] hover:bg-gray-50 active:scale-95 border-gray-200"
                        }`}
                    >
                      {isListening
                        ? <Square size={36} fill="white" className="animate-in zoom-in duration-300" />
                        : <Mic size={44} strokeWidth={2.5} className="animate-in zoom-in duration-300" />
                      }
                    </button>
                  </div>

                  <div className="text-center">
                    <p className={`text-sm font-black uppercase tracking-[0.2em] transition-colors duration-300
        ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                      {isListening ? "Đang lắng nghe..." : "Chạm để nói"}
                    </p>
                    {/* Hiển thị gợi ý nhỏ dưới nút */}
                    {!isListening && (
                      <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 block">
                        AI Tutor sẵn sàng hỗ trợ bạn
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col">
              {messages.length === 0 && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <BotMessageSquare size={80} className="text-gray-400 mb-4" />
                  <p className="font-black uppercase tracking-[0.2em] text-gray-500">Start a conversation</p>
                </div>
              ) : (
                <>
                  {/* Map qua danh sách tin nhắn */}
                  {messages.map((msg, index) => renderMessage(msg, index))}

                  {/* Loading indicator (Typing...) */}
                  {isLoading && (
                    <div className="flex justify-start mb-6 animate-pulse">
                      <div className="flex gap-3 items-center bg-gray-50 px-5 py-3 rounded-full border border-gray-100">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#377437] rounded-full typing-dot" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#377437] rounded-full typing-dot" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#377437] rounded-full typing-dot" style={{ animationDelay: '400ms' }}></div>
                        </div>
                        <span className="text-[10px] font-black text-[#377437] uppercase tracking-widest">AI is thinking</span>
                      </div>
                    </div>
                  )}

                  {/* Phần tử mốc để tự động cuộn xuống */}
                  <div ref={messagesEndRef} className="h-20" />
                </>
              )}
            </div>
          )}
        </div>

        {/* --- INPUT BAR CHO CÁC MODE CÒN LẠI --- */}
        {activeMode !== "PRONUNCIATION" && (
          <div className="absolute bottom-10 left-10 right-10 z-20">
            <div className={`bg-gray-100/90 hover:backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border transition-all duration-300
                    ${isListening ? 'border-red-500 bg-white' : 'border-gray-200 focus-within:bg-white focus-within:border-[#377437]'}`}>

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