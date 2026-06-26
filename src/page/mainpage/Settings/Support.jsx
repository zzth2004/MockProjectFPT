import React, { useState, useEffect } from "react";
import { Mail, Phone, MessageCircle, FileText, Plus, X, Send, ShieldCheck } from "lucide-react";
import supportService from "../../../AdminControl/Service/API/supportServiceAPI/support.service";
import { useAuth } from "../../../context/authContext";
import { database } from "../../../firebase/firebase";
import { ref, onValue, off } from "firebase/database";

const SupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await supportService.getMyTickets();
      setTickets(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách ticket:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchTicketDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await supportService.getTicketDetail(id);
      setTicketDetail(res.data?.data || res.data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết ticket:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectTicket = (ticket) => {
    setIsCreating(false);
    setSelectedTicket(ticket);
    fetchTicketDetail(ticket.id);
  };

  // Lắng nghe Firebase Realtime DB cho ticket hiện tại
  useEffect(() => {
    if (!selectedTicket?.id) return;

    const messagesRef = ref(database, `support_tickets/${selectedTicket.id}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fbMessages = Object.values(data).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        setTicketDetail(prev => {
          if (!prev) return prev;
          
          const merged = [...(prev.messages || [])];
          
          fbMessages.forEach(fbMsg => {
             const existingIdx = merged.findIndex(m => m.id === fbMsg.id);
             if (existingIdx !== -1) {
                merged[existingIdx] = fbMsg;
             } else {
                merged.push(fbMsg);
             }
          });
          
          merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          return { ...prev, messages: merged };
        });
      }
    });

    return () => off(messagesRef);
  }, [selectedTicket?.id]);

  const handleCreateNew = () => {
    setSelectedTicket(null);
    setIsCreating(true);
  };

  const submitNewTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    try {
      await supportService.createTicket({
        subject: newSubject,
        message: newMessage
      });
      setNewSubject("");
      setNewMessage("");
      setIsCreating(false);
      fetchMyTickets();
    } catch (err) {
      console.error("Lỗi tạo ticket:", err);
      alert("Có lỗi xảy ra khi tạo ticket.");
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      await supportService.replyTicket(selectedTicket.id, {
        messageText: replyMessage
      });
      setReplyMessage("");
      // fetchTicketDetail(selectedTicket.id); // Firebase listener sẽ tự động cập nhật UI
    } catch (err) {
      console.error("Lỗi gửi reply:", err);
    }
  };

  const contactInfo = [
    { icon: <Mail size={20} className="text-blue-600" />, title: "Email Hỗ Trợ", content: "support@koreanlab.com" },
    { icon: <Phone size={20} className="text-green-600" />, title: "Hotline", content: "1900 123 456" },
  ];

  return (
    <div className="w-full h-[calc(100vh-100px)] p-4 md:p-6 font-sans flex flex-col md:flex-row gap-6 bg-slate-50">
      
      {/* CỘT TRÁI: DANH SÁCH TICKET */}
      <div className="w-full md:w-1/3 max-w-sm flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
        <div className="p-5 border-b border-gray-100 bg-white z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Hỗ trợ (Tickets)</h2>
            <button 
              onClick={handleCreateNew}
              className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loadingTickets ? (
            <div className="text-center p-4 text-sm text-gray-400 font-medium animate-pulse">Đang nạp dữ liệu...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FileText size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">Chưa có yêu cầu hỗ trợ nào.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => handleSelectTicket(ticket)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-[#E4FBE1] border-green-200 shadow-sm' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {ticket.status}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{ticket.subject}</h4>
                <p className="text-xs font-medium text-slate-500 line-clamp-1">Ticket #{ticket.id}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: CHI TIẾT TICKET HOẶC TẠO MỚI */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full relative">
        
        {isCreating ? (
          /* FORM TẠO TICKET MỚI */
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 bg-white sticky top-0 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">Tạo yêu cầu mới</h2>
                <p className="text-xs font-medium text-gray-500 mt-1">Chúng tôi sẽ phản hồi qua hệ thống này và email của bạn.</p>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitNewTicket} className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chủ đề (Subject)</label>
                  <input 
                    type="text" 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="VD: Không thể nạp thẻ, Lỗi xem video..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chi tiết vấn đề</label>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={6}
                    placeholder="Mô tả chi tiết lỗi bạn đang gặp phải..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all custom-scrollbar"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="px-6 py-3 bg-[#2d5a2d] hover:bg-[#234523] text-white font-bold text-sm rounded-xl transition-colors w-full md:w-auto">
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        ) : selectedTicket ? (
          /* HIỂN THỊ CHI TIẾT TICKET VÀ CHAT */
          <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Header Ticket */}
            <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10 sticky top-0">
              <div>
                <h2 className="text-lg font-black text-slate-800 line-clamp-1">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-gray-500">Ticket #{selectedTicket.id}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    selectedTicket.status === 'open' ? 'bg-green-100 text-green-700' :
                    selectedTicket.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl">
                <X size={20} />
              </button>
            </div>

            {/* Khung Chat */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {loadingDetail ? (
                <div className="text-center p-4 text-sm text-gray-400 font-medium animate-pulse">Đang nạp hội thoại...</div>
              ) : ticketDetail?.messages ? (
                ticketDetail.messages.map((msg) => {
                  const isMe = msg.sender?.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                      <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                            <ShieldCheck size={14} className="text-blue-600" />
                          </div>
                        )}
                        {isMe && (
                          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.fullName || 'U'}`} alt="avatar" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 flex-shrink-0" />
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] font-medium leading-relaxed shadow-sm ${
                            isMe ? 'bg-[#2d5a2d] text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest px-1">
                            {new Date(msg.createdAt).toLocaleString('vi-VN', {hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-medium text-gray-400 text-center py-4">Không tải được tin nhắn.</p>
              )}
            </div>

            {/* Vùng Nhập Tin Nhắn */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form onSubmit={submitReply} className="flex gap-2 max-w-4xl mx-auto">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập tin nhắn trả lời..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  />
                  <button type="submit" disabled={!replyMessage.trim()} className="w-11 h-11 rounded-full bg-[#2d5a2d] text-white flex items-center justify-center hover:bg-[#234523] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send size={18} className="ml-1" />
                  </button>
                </form>
              </div>
            )}
            
            {selectedTicket.status === 'closed' && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center shrink-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Yêu cầu này đã đóng, không thể trả lời thêm.</p>
              </div>
            )}
          </div>
        ) : (
          /* TRẠNG THÁI MẶC ĐỊNH KHI CHƯA CHỌN TICKET */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#f8fafc]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Trung tâm hỗ trợ</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm mb-8">
              Chọn một ticket bên trái để xem chi tiết hoặc tạo yêu cầu mới nếu bạn cần giúp đỡ.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                  <div className="mb-2">{info.icon}</div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{info.title}</span>
                  <span className="text-sm font-bold text-gray-800 mt-1">{info.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage;