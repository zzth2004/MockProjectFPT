import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Sparkles, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import subscriptionService from '../../../AdminControl/Service/API/subscriptonAPI/subscription.service';

const COLORS = {
  primary: "#377437",
  secondary: "#E4FBE1",
};

export default function UpgradePage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionService.getPlans()
      .then(data => {
        const styles = [
          { color: "from-emerald-400 to-cyan-500", voucher: "Giảm 30k", oldPricePercent: 1.5, desc: "Phù hợp mục tiêu ngắn hạn" },
          { color: "from-orange-400 to-yellow-500", voucher: "Giảm 45k", oldPricePercent: 1.6, desc: "Lựa chọn tốt nhất cho học viên lâu dài", popular: true },
          { color: "from-cyan-400 to-blue-500", voucher: "Giảm 75k", oldPricePercent: 1.8, desc: "Học tập không giới hạn" },
        ];
        const mapped = data.map((plan, idx) => {
          const style = styles[idx % styles.length];
          const priceNum = parseFloat(plan.price) || 0;
          const oldPriceVal = Math.round(priceNum * (style.oldPricePercent || 1.5));
          return {
            id: plan.id,
            name: plan.name,
            price: priceNum.toLocaleString('vi-VN'),
            priceVal: priceNum,
            oldPrice: oldPriceVal.toLocaleString('vi-VN'),
            voucher: style.voucher,
            color: style.color,
            popular: style.popular || false,
            description: plan.description || style.desc,
          };
        });
        setPlans(mapped);
      })
      .catch(err => {
        console.error("Failed to load plans:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const comparisonData = [
    { feature: "Mở khóa toàn bộ bài học Premium", free: false, pro: true },
    { feature: "Đề thi thử TOPIK cập nhật hàng ngày", free: false, pro: true },
    { feature: "Học offline tiện lợi", free: false, pro: true },
    { feature: "Loại bỏ hoàn toàn quảng cáo", free: false, pro: true },
    { feature: "Luyện tập Từ vựng & Ngữ pháp", free: true, pro: true },
    { feature: "Simulate thi thử TOPIK", free: "10 bài test", pro: "60+ bài test" },
    { feature: "Ngân hàng câu hỏi đồ sộ", free: "2,000 câu", pro: "10,000+ câu" },
    { feature: "Đồng bộ hóa nhiều thiết bị", free: false, pro: true },
  ];

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-10 h-10 text-[#377437] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Đang tải danh sách gói...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      {/* --- HEADER --- */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Nâng cấp tài khoản <span style={{ color: COLORS.primary }}>KoreanLab Premium</span>
        </h2>
        <p className="text-lg text-slate-500 font-medium">
          Chinh phục điểm số TOPIK cao hơn với các đặc quyền VIP không giới hạn.
        </p>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3 mb-20">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className={`relative flex flex-col p-8 bg-white rounded-[32px] shadow-xl transition-all duration-300 hover:-translate-y-2 ${
              plan.popular ? 'ring-4 ring-orange-400/20 border-2 border-orange-400' : 'border border-slate-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                Phổ biến nhất
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
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-bold">VND</span>
              </div>
              <span className="text-slate-400 line-through text-sm">{plan.oldPrice} VND</span>
            </div>

            <button 
              onClick={() => navigate(`/user/payment/subscription/${plan.id}`)}
              className={`w-full py-4 rounded-2xl text-white font-black text-sm tracking-wider bg-gradient-to-r ${plan.color} shadow-lg hover:brightness-110 active:scale-95 transition-all`}
            >
              MUA NGAY BÂY GIỜ
            </button>
          </div>
        ))}
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
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
            <div key={i} className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
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
    </div>
  );
}