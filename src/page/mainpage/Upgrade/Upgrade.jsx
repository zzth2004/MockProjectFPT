import React, { useState, useEffect } from 'react';
import { Check, X, Star, Sparkles, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import axiosClient from '../../../api/axiosAPI';
import orderService from '../../../AdminControl/Service/API/orderAPI/order.service';
import { useAuth } from '../../../context/authContext';

const COLORS = {
  primary: "#377437",
  secondary: "#E4FBE1",
};

export default function UpgradePage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const { user } = useAuth();

  // Thông tin ngân hàng của bạn (Sửa lại cho đúng)
  const BANK_ID = "MB"; // Mã ngân hàng (Vietcombank, MB, Techcombank...)
  const ACCOUNT_NO = "0123456789"; // Số tài khoản của bạn
  const ACCOUNT_NAME = "NGUYEN VAN A"; // Tên chủ tài khoản

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/subscriptions/plans");
      // res.data thường là array các gói cước từ DB
      if (res.data) {
        // Map màu sắc ngẫu nhiên hoặc theo index cho các gói thật
        const colors = [
          "from-emerald-400 to-cyan-500",
          "from-orange-400 to-yellow-500",
          "from-cyan-400 to-blue-500"
        ];
        
        // Backend trả về mảng trực tiếp hoặc nằm trong res.data.data
        const plansData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        if (plansData.length > 0) {
          const mappedPlans = plansData.map((plan, idx) => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            oldPrice: plan.price * 1.5, // Giả lập giá cũ nếu backend không có
            durationDays: plan.durationDays,
            voucher: `Save ${(plan.price * 0.1 / 1000).toFixed(0)}k`,
            color: colors[idx % colors.length],
            popular: idx === 1, // Giả lập gói giữa là popular
            description: plan.description || "Gói học cao cấp",
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
          }));
          setPlans(mappedPlans);
        } else {
          // Fallback to mock data if DB is empty
          setMockPlans();
        }
      } else {
        setMockPlans();
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách gói VIP:", error);
      setMockPlans();
    } finally {
      setLoading(false);
    }
  };

  const setMockPlans = () => {
    setPlans([
      { 
        id: 1, name: "6 Months", price: "569000", oldPrice: "1198000", 
        voucher: "Save 30k", color: "from-emerald-400 to-cyan-500", 
        description: "Perfect for short-term goals" 
      },
      { 
        id: 2, name: "1 Year", price: "854000", oldPrice: "1798000", 
        voucher: "Save 45k", color: "from-orange-400 to-yellow-500", 
        popular: true, description: "Best value for serious learners" 
      },
      { 
        id: 3, name: "Lifetime", price: "1424000", oldPrice: "2998000", 
        voucher: "Save 75k", color: "from-cyan-400 to-blue-500", 
        description: "Ultimate access forever" 
      },
    ]);
  };

  const handleCheckout = async (plan) => {
    if (isProcessing) return;
    setSelectedPlan(plan);
    try {
      setIsProcessing(true);
      const order = await orderService.createOrder({
        items: [{
          itemType: "subscription",
          itemId: Number(plan.id),
          itemTitle: plan.name,
          price: plan.price
        }],
        paymentMethod: "bank_transfer",
        couponCode: ""
      });

      if (order && order.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }
      
      setOrderInfo(order);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      alert("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };


  const comparisonData = [
    { feature: "Unlock all premium lessons", free: false, pro: true },
    { feature: "Daily updated mock tests", free: false, pro: true },
    { feature: "Offline mode access", free: false, pro: true },
    { feature: "Remove all advertisements", free: false, pro: true },
    { feature: "Vocabulary & Grammar practice", free: true, pro: true },
    { feature: "Full mock exam simulations", free: "10 tests", pro: "60+ tests" },
    { feature: "Total question bank", free: "2,000", pro: "10,000+" },
    { feature: "Multi-device synchronization", free: false, pro: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      {/* --- HEADER --- */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Upgrade to <span style={{ color: COLORS.primary }}>KoreanLab Premium</span>
        </h2>
        <p className="text-lg text-slate-500 font-medium">
          Master TOPIK faster with exclusive features and unlimited practice.
        </p>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3 mb-20">
        {loading ? (
          <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-20 text-slate-400">
             <Loader2 size={40} className="animate-spin mb-4" />
             <p className="font-medium text-lg">Đang tải danh sách gói VIP...</p>
          </div>
        ) : plans.map((plan, idx) => (
          <div 
            key={idx} 
            className={`relative flex flex-col p-8 bg-white rounded-2xl border transition-all duration-300 ${
              plan.popular ? 'ring-2 ring-orange-400 border-orange-400' : 'border-slate-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm font-medium">{plan.description}</p>
            </div>

            <div className="mb-8 bg-orange-50 inline-self-start px-3 py-1 rounded-lg">
              <span className="text-orange-600 text-xs font-bold uppercase">{plan.voucher}</span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{Number(plan.price).toLocaleString('vi-VN')}</span>
                <span className="text-slate-500 font-bold">VND</span>
              </div>
              {plan.oldPrice && <span className="text-slate-400 line-through text-sm">{Number(plan.oldPrice).toLocaleString('vi-VN')} VND</span>}
            </div>

            <button 
              onClick={() => handleCheckout(plan)}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-white font-black text-sm tracking-wider bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center`}
            >
              {isProcessing && selectedPlan?.id === plan.id ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              GET STARTED NOW
            </button>
          </div>
        ))}
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
          <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
            <h3 className="text-xl font-bold">Benefit Comparison</h3>
            <ShieldCheck className="text-green-400" size={28} />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-wider">Features</th>
                <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-wider text-center">Free</th>
                <th className="p-6 text-sm font-bold text-green-600 uppercase tracking-wider text-center bg-green-50/30">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6 text-sm font-semibold text-slate-700">{row.feature}</td>
                  <td className="p-6 text-center">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <Check className="mx-auto text-green-500" size={20}/> : <X className="mx-auto text-slate-300" size={20}/>
                    ) : (
                      <span className="text-slate-500 font-bold text-xs">{row.free}</span>
                    )}
                  </td>
                  <td className="p-6 text-center bg-green-50/10">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? <Check className="mx-auto text-green-600 shadow-sm" size={20} strokeWidth={3}/> : <X className="mx-auto text-slate-300" size={20}/>
                    ) : (
                      <span className="text-green-600 font-black text-xs">{row.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REVIEWS --- */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-12">
          <Zap className="text-orange-500 fill-orange-500" size={32} />
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">User Success Stories</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Ha Trang", score: "TOPIK II - Level 5", text: "The premium interface is so smooth and the mock tests are very close to the real exam!" },
            { name: "Tung Bach", score: "TOPIK II - Level 6", text: "Best investment for my Korean journey. The grammar explanations are super clear." },
            { name: "Quynh Anh", score: "TOPIK I - Level 2", text: "I love the offline mode. I can study anywhere, even on the bus without internet." },
          ].map((fb, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col justify-between hover:bg-slate-50/50 transition-colors">
              <div>
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 italic">"{fb.text}"</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-400">
                  {fb.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{fb.name}</p>
                  <p className="text-[11px] font-black text-green-600 uppercase tracking-tighter">{fb.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PAYMENT MODAL (QR CODE) --- */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 relative border border-slate-200 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Thanh toán Quét mã QR</h3>
              <p className="text-slate-500 text-sm">Gói: <span className="font-bold text-green-600">{selectedPlan.name}</span></p>
              <p className="text-slate-500 text-sm">Số tiền: <span className="font-bold text-red-500">{Number(selectedPlan.price).toLocaleString('vi-VN')} VND</span></p>
            </div>

            {/* Cố gắng lấy QR và Nội dung từ Backend, nếu chưa có thì Fallback FE sinh */}
            <div className="bg-slate-50 p-4 rounded-xl mb-6 flex justify-center border border-slate-100">
              <img 
                src={orderInfo?.qrUrl || `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${selectedPlan.price}&addInfo=PAY_V${selectedPlan.id}_U${user?.id || "X"}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`} 
                alt="Payment QR Code"
                className="w-48 h-48 object-contain rounded-xl border border-slate-200"
              />
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
              <p className="text-xs text-orange-800 leading-relaxed text-center font-medium">
                Vui lòng chuyển khoản đúng số tiền với nội dung <strong>{orderInfo?.transferContent || `PAY V${selectedPlan.id} U${user?.id || "X"}`}</strong>.<br/>
                Hệ thống sẽ tự động kích hoạt tài khoản VIP của bạn sau khi nhận được thanh toán.
              </p>
            </div>

            <button 
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}