import React, { useState, useEffect, useRef } from "react";
import { Send, X, Minimize2 } from "lucide-react";

const ChatWidget = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Mr.Kim", text: "Xin chào, tôi có thể giúp gì cho bạn?", time: "10:00 AM", isMe: false },
    { id: 2, sender: "You", text: "Em muốn hỏi về bài tập Unit 3 ạ.", time: "10:01 AM", isMe: true },
  ]);
  
  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    // Container cố định góc phải dưới
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-300 flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-[#1F2937] p-4 flex items-center justify-between text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=MrKim" alt="Mr.Kim" className="w-full h-full object-cover"/>
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1F2937]"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm">Mr.Kim</h3>
            <span className="text-xs text-gray-300">Instructor • Online</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
                <Minimize2 size={18} />
            </button>
            <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* --- MESSAGE LIST --- */}
      <div className="h-80 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3">
         {messages.map((msg) => (
           <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.isMe ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  msg.isMe 
                  ? 'bg-[#377437] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
              }`}>
                 {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
           </div>
         ))}
         <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-3 bg-white border-t border-gray-100">
         <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message..." 
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
            <button 
              onClick={handleSendMessage}
              className="text-[#377437] hover:text-green-700 transition-colors"
            >
               <Send size={20} className="fill-current"/> 
            </button>
         </div>
      </div>
    </div>
  );
};

export default ChatWidget;