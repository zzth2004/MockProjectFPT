import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Phone, Video, Search, CheckCheck, Image as ImageIcon, Smile, MoreVertical } from "lucide-react";

export default function ChatPage() {
  // 1. Quản lý danh sách tin nhắn bằng State
  const [messages, setMessages] = useState([
    { id: 1, sender: "teacher", text: "Hello! How can I help you today?", time: "09:00 AM" },
    { id: 2, sender: "user", text: "Hi teacher, I have a question about TOPIK grammar.", time: "09:05 AM" },
  ]);

  // 2. Quản lý nội dung đang nhập trong Input
  const [inputText, setInputText] = useState("");
  
  // 3. Ref để tự động cuộn xuống cuối danh sách tin nhắn
  const scrollRef = useRef(null);

  // Hiệu ứng tự động cuộn mỗi khi danh sách tin nhắn thay đổi
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Hàm xử lý gửi tin nhắn
  const handleSendMessage = (e) => {
    if (e) e.preventDefault(); // Chống load lại trang nếu dùng form

    if (inputText.trim() === "") return; // Không gửi nếu chỉ toàn khoảng trắng

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputText,
      time: timeString,
    };

    setMessages([...messages, newMessage]);
    setInputText(""); // Xóa sạch ô nhập sau khi gửi

    // Giả lập phản hồi tự động từ giáo viên sau 1 giây
    setTimeout(() => {
      sendAutoReply();
    }, 1500);
  };

  // Giả lập trả lời tự động
  const sendAutoReply = () => {
    const replies = [
      "I'm checking it for you, wait a moment.",
      "That's a very good question!",
      "You should review Chapter 3 in your textbook for more details."
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const now = new Date();
    const replyMsg = {
      id: Date.now(), // Dùng timestamp để làm ID duy nhất
      sender: "teacher",
      text: randomReply,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, replyMsg]);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* ... Cột bên trái (Giữ nguyên như code cũ) ... */}

      {/* CỘT PHẢI: KHUNG CHAT */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header (Giữ nguyên) */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=1" alt="" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none">Ms. Lee Ha-neul</h3>
              <p className="text-[11px] text-green-500 font-medium mt-1 uppercase tracking-wider">Online</p>
            </div>
          </div>
          {/* Icons Phone, Video... */}
        </div>

        {/* 5. Vùng hiển thị tin nhắn (Thêm scrollRef) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFB] custom-scrollbar scroll-smooth"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300 ${
                msg.sender === "user" 
                ? "bg-[#377437] text-white rounded-tr-none" 
                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
              }`}>
                <p>{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 justify-end ${msg.sender === "user" ? "text-green-100" : "text-gray-400"}`}>
                  <span className="text-[10px]">{msg.time}</span>
                  {msg.sender === "user" && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Vùng nhập liệu (Gắn sự kiện) */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2"
          >
            <button type="button" className="text-gray-400 hover:text-[#377437]"><Smile size={22} /></button>
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 outline-none"
            />
            <button type="button" className="text-gray-400 hover:text-[#377437]"><ImageIcon size={22} /></button>
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl transition-all ${
                inputText.trim() ? "bg-[#377437] text-white shadow-md scale-100" : "text-gray-300 scale-90"
              }`}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}