import React from "react";
import { Mail, Phone, MapPin, MessageCircle, HelpCircle, FileText } from "lucide-react";

const SupportPage = () => {
  // Dữ liệu cứng (Static Data) - Sửa trực tiếp tại đây
  const contactInfo = [
    {
      icon: <Mail size={24} className="text-blue-600" />,
      title: "Email Hỗ Trợ",
      content: "support@koreanlab.com",
      action: "mailto:support@koreanlab.com",
      actionText: "Gửi Email ngay"
    },
    {
      icon: <Phone size={24} className="text-green-600" />,
      title: "Hotline",
      content: "1900 123 456",
      action: "tel:1900123456",
      actionText: "Gọi ngay"
    },
    {
      icon: <MapPin size={24} className="text-orange-600" />,
      title: "Văn phòng",
      content: "Đà Nẵng, Việt Nam",
      action: "#",
      actionText: "Xem bản đồ"
    }
  ];

  const faqs = [
    { q: "Làm sao để lấy lại mật khẩu?", a: "Bạn có thể nhấn vào nút 'Quên mật khẩu' tại màn hình Đăng nhập và làm theo hướng dẫn gửi về email." },
    { q: "Tôi có thể học trên điện thoại không?", a: "Có, KoreanLab hỗ trợ tốt trên cả trình duyệt máy tính và điện thoại di động." },
    { q: "Nâng cấp tài khoản VIP như thế nào?", a: "Vui lòng truy cập trang 'Upgrade' trong menu để xem các gói dịch vụ và thanh toán qua QR Code." },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">Trung tâm trợ giúp</h1>
          <p className="text-gray-500 font-medium">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.</p>
        </div>

        {/* --- CONTACT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm font-medium mb-4">{item.content}</p>
              <a 
                href={item.action} 
                className="text-sm font-bold text-[#377437] hover:underline"
              >
                {item.actionText}
              </a>
            </div>
          ))}
        </div>

        {/* --- SIMPLE FAQ LIST (Tĩnh hoàn toàn) --- */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="text-[#377437]" size={28} />
            <h2 className="text-xl font-black text-gray-900">Câu hỏi thường gặp</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-[#377437]">•</span> {faq.q}
                </h3>
                <p className="text-sm text-gray-500 pl-4 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- FOOTER BANNER --- */}
        <div className="bg-[#377437] rounded-3xl p-8 text-white text-center shadow-xl shadow-green-900/20">
          <h3 className="text-xl font-black mb-2">Cần hỗ trợ trực tiếp?</h3>
          <p className="text-green-100 text-sm mb-6">Đội ngũ kỹ thuật sẽ phản hồi trong vòng 24 giờ làm việc.</p>
          <a 
            href="mailto:support@koreanlab.com" 
            className="inline-flex items-center gap-2 bg-white text-[#377437] px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors"
          >
            <MessageCircle size={18} /> Chat với Admin
          </a>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;