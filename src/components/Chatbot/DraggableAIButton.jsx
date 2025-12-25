import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/authContext";
import AiService from "../../AdminControl/Service/API/aiAPI/ai.service";

const DraggableAIButton = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // --- LOGIC KÉO THẢ (DRAG & DROP) ---
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // --- LOGIC CHATBOX ---
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);
  const activeMode = "CHAT_TUTOR";

  // 1. Khởi tạo Session và Lấy lịch sử tin nhắn
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ DraggableAIButton: userId is missing!");
      return;
    }

    let isMounted = true;

    const initSession = async () => {
      setIsLoading(true);
      try {
        // Lấy danh sách sessions hiện có của mode CHAT_TUTOR
        const sessions = await AiService.getSessions(userId, activeMode);
        if (!isMounted) return;

        let session = sessions[0];
        // Nếu chưa có session nào thì tạo mới
        if (!session) {
          session = await AiService.createSession(userId, activeMode, `Trợ lý học tập`);

        }
        
        // Lấy lịch sử tin nhắn của session này
        const history = await AiService.getSessionMessages(session.id, userId);

        if (!isMounted) return;

        // Chuyển đổi format từ Backend (role/content) sang Frontend (sender/text)
        if (history && history.length > 0) {
          const formattedHistory = history.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.role === "assistant" ? "bot" : "user"
          }));
          setMessages(formattedHistory);
        } else {
          // Lời chào mặc định nếu chưa có tin nhắn nào
          setMessages([{
            id: "welcome",
            text: "Xin chào! Tôi là trợ lý AI MyKorean. Tôi có thể giúp gì cho việc học tiếng Hàn của bạn?",
            sender: "bot"
          }]);
        }
        setCurrentSessionId(session.id);
        console.log("✅ Active Session:", currentSessionId);

      } catch (err) {
        console.error("Session Init Error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    return () => { isMounted = false; };
  }, [userId, activeMode]);

  // 2. Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- XỬ LÝ SỰ KIỆN CHUỘT (KÉO THẢ) ---
  const handleMouseDown = (e) => {
    isDraggingRef.current = false;
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    isDraggingRef.current = true;
    let newX = e.clientX - offsetRef.current.x;
    let newY = e.clientY - offsetRef.current.y;

    // Giới hạn trong màn hình
    setPosition({
      x: Math.min(Math.max(0, newX), window.innerWidth - 60),
      y: Math.min(Math.max(0, newY), window.innerHeight - 60)
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleChat = () => {
    // Chỉ mở/đóng nếu không phải đang kéo
    if (!isDraggingRef.current) setIsOpen(!isOpen);
  };

  // --- HÀM GỬI TIN NHẮN CHÍNH ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = inputText.trim();

    // KIỂM TRA CHẶT CHẼ TRƯỚC KHI GỬI
    if (!content || isLoading) return;
    if (!userId) {
      alert("Vui lòng đăng nhập để sử dụng AI");
      return;
    }
    console.log("Sending message to AI:", currentSessionId);
    if (!currentSessionId) {
      console.error("❌ No Session ID found");
      return;
    }

    const userMsg = { id: Date.now(), text: content, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      // Gửi đúng một Object
      
      const result = await AiService.chat(currentSessionId, userId, content);

      const aiReplyText = result.reply || result.message;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: aiReplyText, sender: "bot" }
      ]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Hệ thống AI đang bảo trì, vui lòng thử lại sau.", sender: "bot", isError: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[9998] border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-green-400" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A1A1A] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">MYKOREAN AI</h3>
                  <p className="text-[10px] text-green-400 font-medium uppercase tracking-widest">Online Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition">
                <Minus size={20} />
              </button>
            </div>

            {/* Messages Area (Custom Scrollbar) */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F8F9FA] space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === "user"
                    ? "bg-green-600 text-white rounded-tr-none shadow-green-200"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    } ${msg.isError ? "bg-red-50 text-red-600 border-red-100" : ""}`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing Animation */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                type="text"
                disabled={isLoading}
                placeholder={isLoading ? "AI đang suy nghĩ..." : "Hỏi tôi về tiếng Hàn..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-30 shadow-lg shadow-green-200"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút tròn nổi (Floating Button) */}
      <motion.div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onClick={toggleChat}
        animate={{ scale: isDragging ? 0.9 : 1 }}
        style={{ left: position.x, top: position.y }}
        className={`fixed z-[9999] p-5 rounded-full shadow-2xl cursor-pointer border-4 border-white transition-colors
          ${isOpen ? "bg-red-500" : "bg-[#1A1A1A] hover:bg-green-600"}
        `}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
      </motion.div>
    </>
  );
};

export default DraggableAIButton;