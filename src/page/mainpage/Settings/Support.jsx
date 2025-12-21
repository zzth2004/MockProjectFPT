import React from "react";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SupportPage = () => {
  const navigate = useNavigate();

  const faqCategories = [
    { id: 1, title: "Tài khoản & Bảo mật", icon: <HelpCircle className="text-blue-500" />, count: 12 },
    { id: 2, title: "Thanh toán & Học phí", icon: <FileText className="text-green-500" />, count: 8 },
    { id: 3, title: "Lộ trình học TOPIK", icon: <Search className="text-orange-500" />, count: 15 },
  ];

  const contactMethods = [
    { 
      id: "chat", 
      title: "Chat trực tuyến", 
      desc: "Hỗ trợ 24/7 với AI Ninja", 
      icon: <MessageCircle size={28} />,
      color: "bg-green-500"
    },
    { 
      id: "email", 
      title: "Gửi Email", 
      desc: "support@aihantopik.com", 
      icon: <Mail size={28} />,
      color: "bg-blue-500"
    },
    { 
      id: "phone", 
      title: "Hotline", 
      desc: "1900 123 456", 
      icon: <Phone size={28} />,
      color: "bg-orange-500"
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* --- HEADER SEARCH --- */}
        <div className="text-center space-y-6 py-10">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Chúng tôi có thể giúp gì cho bạn?
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Nhập vấn đề bạn đang gặp phải..."
              className="w-full py-5 pl-14 pr-6 rounded-[2rem] border-none shadow-xl shadow-gray-200/50 text-lg font-medium focus:ring-2 focus:ring-[#377437] transition-all outline-none"
            />
          </div>
        </div>

        {/* --- CONTACT METHODS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method) => (
            <div 
              key={method.id}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-all cursor-pointer"
            >
              <div className={`w-16 h-16 ${method.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-500 font-bold text-sm">{method.desc}</p>
            </div>
          ))}
        </div>

        {/* --- FAQ CATEGORIES --- */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 ml-2">Câu hỏi thường gặp</h2>
          <div className="grid grid-cols-1 gap-4">
            {faqCategories.map((cat) => (
              <div 
                key={cat.id}
                className="bg-white p-6 rounded-[1.5rem] border border-gray-100 flex items-center justify-between hover:border-[#377437]/30 hover:bg-[#F0F7F0] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                    {cat.icon}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{cat.title}</p>
                    <p className="text-xs font-bold text-gray-400">{cat.count} bài viết</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#377437] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* --- FOOTER NINJA MASCOT --- */}
        <div className="bg-[#E9F5EB] rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 border border-green-100">
          <div className="w-32 h-32 shrink-0">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" 
              alt="Ninja Support" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-2xl font-black text-[#377437]">Vẫn chưa tìm thấy câu trả lời?</h3>
            <p className="text-gray-600 font-medium">Đội ngũ Ninja của chúng tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào bạn cần.</p>
            <button className="mt-4 px-8 py-3 bg-[#377437] text-white font-black rounded-2xl hover:bg-green-800 transition-all shadow-lg shadow-green-900/20">
              Gửi yêu cầu hỗ trợ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;