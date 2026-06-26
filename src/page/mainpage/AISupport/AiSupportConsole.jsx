import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, BookOpen, Search, Mic, Volume2,
  Square, Play, Sparkles, ChevronRight, Languages, Info, X, BotMessageSquare, ChevronDown
} from "lucide-react";

import { useSpeechRecognition } from "../../../hooks/SpeechConvert/useSpeechConvert";
import { useTextToSpeech } from "../../../hooks/SpeechConvert/useTextConvert";
import { useAudioRecorder } from "../../../hooks/SpeechConvert/useAudioRecorder";
import AiService from "../../../AdminControl/Service/API/aiAPI/ai.service";

import { useAuth } from "../../../context/authContext";
import WritingEvaluationView from "./components/WritingEvaluationView";

export default function AiSupportConsole() {
  const [activeMode, setActiveMode] = useState("CHAT_TUTOR");
  const [inputText, setInputText] = useState("");
  const [sttLang, setSttLang] = useState("ko-KR");
  const [ttsLang, setTtsLangState] = useState("ko-KR");
  const [lastAiResponse, setLastAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [lastUserText, setLastUserText] = useState("");

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { user } = useAuth();
  const [requestType, setRequestType] = useState("pronunciation");

  // Câu đích cho Pronunciation mode
  const SAMPLE_SENTENCES = [
    { text: "안녕하세요", romanization: "An-nyeong-ha-se-yo (Xin chào)" },
    { text: "감사합니다", romanization: "Gam-sa-ham-ni-da (Cảm ơn)" },
    { text: "저는 학생이에요", romanization: "Jeo-neun hak-saeng-i-e-yo (Tôi là học sinh)" },
    { text: "오늘 날씨가 좋네요", romanization: "O-neul nal-ssi-ga jo-ne-yo (Hôm nay thời tiết đẹp nhỉ)" },
    { text: "한국어를 배우고 싶어요", romanization: "Han-gug-eo-reul bae-u-go si-peo-yo (Tôi muốn học tiếng Hàn)" },
  ];
  const [sampleIdx, setSampleIdx] = useState(0);
  const targetSentence = SAMPLE_SENTENCES[sampleIdx].text;
  const targetRomanization = SAMPLE_SENTENCES[sampleIdx].romanization;


  const REQUEST_OPTIONS = [
    { id: "pronunciation", label: "Luyện đọc", icon: <Mic size={14} /> },
    { id: "chat", label: "Trò chuyện", icon: <MessageSquare size={14} /> },
  ];
  // Lấy userID (tùy thuộc vào cấu trúc object user của bạn)
  const userId = user?.id || user?.userID || user?._id;

  // lessonsentence: dùng targetSentence làm câu mẫu cần đọc
  const lessonsentence = targetSentence;

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

  // Hook ghi âm file audio thực tế cho Pronunciation
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    toggleRecording,
    clearAudio
  } = useAudioRecorder();

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
  useEffect(() => {
    if (audioBlob && activeMode === "PRONUNCIATION") {
      handleAudioSend(audioBlob);
    }
  }, [audioBlob, activeMode]);

  const handleAudioSend = async (blob) => {
    if (isLoading || !currentSessionId) return;
    setIsLoading(true);
    setLastUserText("Đang xử lý âm thanh...");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      formData.append("referenceText", lessonsentence || "안녕하세요");
      
      const result = await AiService.evaluatePronunciation(formData);
      
      const formattedResult = {
        ...result,
        displayReply: result.intent === 'EVALUATION' ? result.feedback : (result.reply || result.message)
      };
      
      console.log("Pronunciation Audio Result:", formattedResult);
      
      setLastUserText(result.transcribedText || "Audio...");
      setLastAiResponse(formattedResult);
      
      // Auto Play TTS for feedback or next sentence
      if (result.intent === 'EVALUATION' && result.feedback) {
        handleSpeak(result.feedback);
      } else if (result.intent === 'CHAT' && result.reply) {
        handleSpeak(result.reply);
      }
      
    } catch(err) {
       console.error(err);
       setLastUserText("Lỗi xử lý âm thanh.");
    } finally {
       setIsLoading(false);
       clearAudio();
    }
  };

  // Xử lý gửi tin nhắn (Dùng cho các mode khác ngoài PRONUNCIATION)
  const handleSend = async () => {
    if (activeMode === "PRONUNCIATION") return; // Đã xử lý bằng handleAudioSend

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

  // ✅ Hàm speak wrapper để xử lý cả string và object
  const handleSpeak = async (content) => {
    if (!content) return;

    let textToSpeak = "";
    if (typeof content === 'string') {
      textToSpeak = content;
    } else if (content.reply) {
      textToSpeak = content.reply;
    } else if (content.correctedText) {
      textToSpeak = content.correctedText;
    } else if (content.displayReply) {
      textToSpeak = content.displayReply;
    } else if (content.feedback) {
      textToSpeak = content.feedback;
    }

    if (textToSpeak) {
      if (activeMode === "PRONUNCIATION") {
        try {
          const res = await AiService.generateTTS(textToSpeak);
          if (res && res.audioBase64) {
             const audioSrc = `data:audio/mp3;base64,${res.audioBase64}`;
             const audio = new Audio(audioSrc);
             audio.play();
          }
        } catch(e) {
          console.error("Backend TTS error", e);
          speak(textToSpeak); // fallback
        }
      } else {
        speak(textToSpeak);
      }
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
          {activeMode === "PRONUNCIATION" ? (
            <div className="h-full flex flex-col gap-6 p-8 animate-in fade-in duration-500">
              <style>{`
                @keyframes score-fill { from { width: 0%; } to { width: var(--target-w); } }
                .score-bar { animation: score-fill 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                @keyframes score-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                .score-pop { animation: score-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
              `}</style>

              {/* ===== PHẦN 1: CÂU ĐÍCH ===== */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Câu mẫu {sampleIdx + 1}/{SAMPLE_SENTENCES.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSampleIdx(i => (i - 1 + SAMPLE_SENTENCES.length) % SAMPLE_SENTENCES.length); setLastAiResponse(null); setLastUserText(""); }}
                      className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center text-lg font-black"
                    >‹</button>
                    <button
                      onClick={() => { setSampleIdx(i => (i + 1) % SAMPLE_SENTENCES.length); setLastAiResponse(null); setLastUserText(""); }}
                      className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center text-lg font-black"
                    >›</button>
                    <button
                      onClick={() => handleSpeak(targetSentence)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                      <Volume2 size={13} />
                      Nghe mẫu
                    </button>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-4xl font-black text-white leading-tight tracking-wide">{targetSentence}</p>
                  <p className="text-sm text-slate-400 font-medium mt-3 italic">{targetRomanization}</p>
                </div>
              </div>

              {/* ===== PHẦN 2: KHU VỰC NÓI + SÓNG ÂM ===== */}
              <div className={`rounded-3xl border-2 p-8 flex flex-col items-center gap-6 transition-all duration-500 ${isRecording ? 'border-red-400 bg-red-50/50' : 'border-dashed border-gray-200 bg-gray-50/30'}`}>
                {/* Waveform */}
                <div className="flex items-end gap-1.5 h-14 w-full max-w-xs">
                  {[...Array(28)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-red-500' : isSpeaking ? 'bg-[#377437]' : 'bg-gray-200'}`}
                      style={{
                        height: (isRecording || isSpeaking)
                          ? `${20 + Math.sin(i * 0.7 + Date.now() * 0.005) * 15 + Math.random() * 30}px`
                          : '6px',
                        animationDelay: `${i * 0.06}s`,
                        animation: (isRecording || isSpeaking) ? `subtle-wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate` : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Khu vực chuyển văn bản */}
                <div className="text-center min-h-[48px]">
                  {isRecording ? (
                    <p className="text-red-500 font-black text-lg animate-pulse uppercase tracking-widest">● Đang ghi âm...</p>
                  ) : lastUserText && lastUserText !== "Đang xử lý âm thanh..." ? (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bạn đã nói</p>
                      <p className="text-xl font-black text-gray-800">{lastUserText}</p>
                    </div>
                  ) : isLoading ? (
                    <p className="text-[#377437] font-black text-sm uppercase tracking-widest animate-pulse">AI đang phân tích...</p>
                  ) : (
                    <p className="text-gray-300 font-bold italic text-sm">Nhấn nút mic và đọc câu mẫu bên trên</p>
                  )}
                </div>

                {/* Nút Mic */}
                <div className="relative">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30 scale-150"></div>
                  )}
                  <button
                    onClick={toggleRecording}
                    disabled={isLoading}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 ${isRecording ? 'bg-red-500 scale-110' : 'bg-[#377437] hover:bg-[#2d5e2d]'}`}
                  >
                    {isRecording ? <Square size={28} fill="white" className="text-white" /> : <Mic size={28} className="text-white" />}
                  </button>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isRecording ? 'text-red-500' : 'text-gray-400'}`}>
                  {isRecording ? 'Nhấn để kết thúc' : 'Nhấn để bắt đầu'}
                </p>
              </div>

              {/* ===== PHẦN 3: KẾT QUẢ CHẤM ĐIỂM ===== */}
              {lastAiResponse && !isLoading && (
                <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#377437]" />
                      <span className="text-[11px] font-black text-[#377437] uppercase tracking-widest">Kết quả phân tích</span>
                    </div>
                    <button
                      onClick={() => handleSpeak(lastAiResponse)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-[#377437] transition-all text-[11px] font-black uppercase"
                    >
                      <Volume2 size={13} /> Nghe nhận xét
                    </button>
                  </div>

                  {/* Điểm tổng */}
                  {lastAiResponse.score != null && (
                    <div className="flex items-center gap-6">
                      <div className="score-pop flex-shrink-0 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-[#377437] bg-green-50">
                        <span className="text-3xl font-black text-[#377437] leading-none">{lastAiResponse.score}</span>
                        <span className="text-[9px] font-black text-[#377437] opacity-60 uppercase">/100</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* Accuracy bar */}
                        {lastAiResponse.accuracy != null && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                              <span className="text-gray-500">Độ chính xác</span>
                              <span className="text-[#377437]">{lastAiResponse.accuracy}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#377437] rounded-full score-bar" style={{ '--target-w': `${lastAiResponse.accuracy}%` }}></div>
                            </div>
                          </div>
                        )}
                        {/* Fluency bar */}
                        {lastAiResponse.fluency != null && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                              <span className="text-gray-500">Độ lưu loát</span>
                              <span className="text-blue-600">{lastAiResponse.fluency}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full score-bar" style={{ '--target-w': `${lastAiResponse.fluency}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {lastAiResponse.feedback && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">Nhận xét</p>
                      <p className="text-sm font-semibold text-gray-700 leading-relaxed">{lastAiResponse.feedback}</p>
                    </div>
                  )}

                  {/* Từ đọc sai */}
                  {lastAiResponse.issues && lastAiResponse.issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Cần cải thiện</p>
                      <div className="flex flex-wrap gap-2">
                        {lastAiResponse.issues.map((issue, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black border border-red-100">{issue}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nút thử lại */}
                  <button
                    onClick={() => { setLastAiResponse(null); setLastUserText(""); }}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#377437] hover:text-[#377437] transition-all font-black text-xs uppercase tracking-widest"
                  >
                    ↺ Thử lại
                  </button>
                </div>
              )}
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