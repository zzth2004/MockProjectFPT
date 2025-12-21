// src/components/Chatbot/DraggableAIButton.jsx
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DraggableAIButton = () => {
  // --- LOGIC KÉO THẢ (GIỮ NGUYÊN) ---
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false); // Dùng ref để check trạng thái kéo chính xác hơn khi click

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
    isDraggingRef.current = true; // Đánh dấu là đang kéo

    let newX = e.clientX - offsetRef.current.x;
    let newY = e.clientY - offsetRef.current.y;

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    newX = Math.min(Math.max(0, newX), maxX);
    newY = Math.min(Math.max(0, newY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // --- LOGIC CHATBOX ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho việc học tiếng Hàn của bạn?", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const toggleChat = () => {
    // Chỉ mở chat nếu không phải là hành động kéo thả
    if (!isDraggingRef.current) {
      setIsOpen(!isOpen);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Thêm tin nhắn người dùng
    const newUserMsg = { id: Date.now(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");

    // Giả lập bot trả lời sau 1s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Cảm ơn câu hỏi của bạn! Tính năng AI đang được phát triển.", sender: "bot" }
      ]);
    }, 1000);
  };

  return (
    <>
      {/* KHUNG CHAT (Hiện ở góc phải dưới cố định hoặc gần nút) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[9998] border border-gray-200 font-sans"
          >
            {/* Header */}
            <div className="bg-[#2C2C2C] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:bg-gray-600 p-1 rounded transition">
                  <Minus size={18} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition disabled:opacity-50"
                disabled={!inputText.trim()}
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NÚT TRÒN (DRAGGABLE) */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        onClick={toggleChat}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 9999,
          cursor: isDragging ? "grabbing" : "pointer", // Đổi thành pointer để biết là click được
          touchAction: "none",
        }}
        className={`p-4 rounded-full shadow-2xl transition-all flex items-center justify-center border-2 border-white/20
          ${isOpen ? "bg-green-600 rotate-90" : "bg-[#2C2C2C] hover:scale-110 active:scale-95"}
        `}
      >
        {isOpen ? (
          <X className="w-8 h-8 text-white pointer-events-none" />
        ) : (
          <MessageCircle className="w-8 h-8 text-white pointer-events-none" />
        )}
      </div>
    </>
  );
};

export default DraggableAIButton;   