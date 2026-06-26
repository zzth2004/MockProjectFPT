import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  CheckCircle2, 
  Download, 
  ArrowRight,
  PartyPopper,
  ShieldCheck
} from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);

  // Nhận thông tin từ state khi redirect sang (tên khóa học, giá tiền...)
  const orderDetails = location.state || {
    itemTitle: "Khóa học (Mua trực tiếp)",
    totalAmount: 0,
    orderCode: `ORD-${orderId}`,
    date: new Date().toLocaleString()
  };

  useEffect(() => {
    // Hiệu ứng "bung lụa"
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Nền trang trí */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]"></div>

      {/* Confetti (giả lập bằng thẻ div động) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 flex justify-center">
           <div className="animate-bounce mt-10">
               <PartyPopper size={80} className="text-emerald-500 opacity-80" />
           </div>
        </div>
      )}

      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header (Phần màu xanh) */}
        <div className="bg-emerald-500 pt-12 pb-16 px-8 text-center relative">
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 relative block fill-white">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
          
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} className="text-emerald-500" />
             </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Thanh toán thành công!</h1>
          <p className="text-emerald-100 font-medium">Cảm ơn bạn đã tin tưởng hệ thống của chúng tôi.</p>
        </div>

        {/* Thân (Biên lai) */}
        <div className="px-8 pt-4 pb-10">
          <div className="text-center mb-8">
             <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Số tiền thanh toán</p>
             <h2 className="text-4xl font-black text-gray-900">{Number(orderDetails.totalAmount).toLocaleString('vi-VN')} đ</h2>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 mb-8 relative">
            {/* Lỗ hổng trang trí biên lai */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-gray-100"></div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-gray-100"></div>

            <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
              <span className="text-gray-500 font-medium">Mã đơn hàng</span>
              <span className="font-bold text-gray-900">{orderDetails.orderCode}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
              <span className="text-gray-500 font-medium">Sản phẩm</span>
              <span className="font-bold text-gray-900 max-w-[60%] text-right line-clamp-1">{orderDetails.itemTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Ngày giao dịch</span>
              <span className="font-bold text-gray-900">{orderDetails.date}</span>
            </div>
          </div>

          <div className="space-y-4">
             <button
                onClick={() => navigate('/courses/mycourses')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-5 rounded-xl shadow-lg shadow-emerald-600/30 transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
             >
                Bắt đầu học ngay <ArrowRight size={20} />
             </button>

             <button
                onClick={() => window.print()}
                className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-xl border-2 border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                <Download size={18} /> Lưu Biên Lai
             </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
             <ShieldCheck size={16} />
             <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                Bảo mật bởi hệ thống thanh toán tự động
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
