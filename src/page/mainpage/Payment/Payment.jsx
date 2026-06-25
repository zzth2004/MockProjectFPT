import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, CreditCard, QrCode, Wallet, Loader2, 
  AlertCircle, PartyPopper, Play, CheckCircle2, Copy 
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";
import subscriptionService from "../../../AdminControl/Service/API/subscriptonAPI/subscription.service";
import orderService from "../../../AdminControl/Service/API/orderAPI/order.service";
import { useAuth } from "../../../context/authContext";

// --- SUB-COMPONENT: THÔNG BÁO THÀNH CÔNG KHÓA HỌC ---
const CourseSuccessOverlay = ({ courseTitle, onNavigate }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 text-[#377437] rounded-full flex items-center justify-center mx-auto mb-6">
          <PartyPopper size={48} />
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tighter uppercase">
          Thành công!
        </h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          Bạn đã thanh toán thành công và được ghi danh vào khóa học <br />
          <span className="text-[#377437] font-bold">"{courseTitle}"</span> <br />
          tại lớp <span className="font-black text-gray-800 uppercase italic tracking-widest">Tự động phân lớp</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate("/courses/mycourses")}
            className="w-full py-5 bg-[#377437] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-100 active:scale-95"
          >
            Bắt đầu học ngay <Play size={18} fill="currentColor" />
          </button>

          <button
            onClick={() => onNavigate("/user/active-courses")}
            className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-bold text-sm hover:text-gray-600 transition-all"
          >
            Về danh sách khóa học
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: THÔNG BÁO THÀNH CÔNG GÓI CƯỚC SUBSCRIPTION ---
const SubscriptionSuccessOverlay = ({ planTitle, onNavigate }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 text-[#377437] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tighter uppercase animate-bounce">
          Nâng cấp VIP!
        </h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          Tài khoản của bạn đã được kích hoạt VIP thành công với gói <br />
          <span className="text-[#377437] font-bold">"{planTitle}"</span>. <br />
          Bây giờ bạn đã có quyền truy cập toàn bộ các đặc quyền của KoreanLab.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate("/user/dashboard")}
            className="w-full py-5 bg-[#377437] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-100 active:scale-95"
          >
            Khám phá đặc quyền VIP ngay
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId, itemType: routeItemType, itemId: routeItemId } = useParams();
  const { user } = useAuth();

  const itemType = routeItemType || 'course';
  const itemId = routeItemId || courseId;

  // --- 1. STATES ---
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState("qr"); // Default to QR payment (bank transfer)
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- 2. FETCH DETAILS ---
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        if (itemType === 'subscription') {
          const plans = await subscriptionService.getPlans();
          const matchedPlan = plans.find(p => p.id === Number(itemId));
          if (!matchedPlan) {
            setError("Không tìm thấy gói cước tương ứng.");
            return;
          }
          setItemData({
            title: matchedPlan.name,
            priceVal: parseFloat(matchedPlan.price) || 0,
            salePriceVal: 0,
            description: matchedPlan.description,
          });
        } else {
          // Default: course
          const data = await courseService.getCourseDetails(itemId);
          setItemData({
            title: data.title,
            priceVal: parseFloat(data.price) || 0,
            salePriceVal: parseFloat(data.salePrice) || 0,
            description: data.description,
          });
        }
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("Không thể tải thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItemDetails();
  }, [itemType, itemId]);

  // --- 3. PRICE CALCULATION ---
  const calculateOrder = () => {
    if (!itemData) return { price: 0, discount: 0, total: 0 };
    if (itemType === 'subscription') {
      return { price: itemData.priceVal, discount: 0, total: itemData.priceVal };
    }
    const originalPrice = itemData.priceVal || 0;
    const salePrice = itemData.salePriceVal || 0;
    const hasDiscount = salePrice > 0 && salePrice < originalPrice;
    const finalTotal = hasDiscount ? salePrice : originalPrice;
    const discountAmount = hasDiscount ? originalPrice - salePrice : 0;
    return { price: originalPrice, discount: discountAmount, total: finalTotal };
  };

  const { price, discount, total } = calculateOrder();

  const paymentMethods = [
    { id: "qr", title: "Chuyển khoản QR Ngân hàng", desc: "Quét mã để thanh toán tức thì", icon: <QrCode size={24} /> },
    { id: "card", title: "Thẻ Tín dụng / Ghi nợ", desc: "Visa, Mastercard, JCB", icon: <CreditCard size={24} /> },
    { id: "wallet", title: "Ví điện tử", desc: "Momo, ZaloPay, PayPal", icon: <Wallet size={24} /> },
  ];

  // --- 4. CREATE PENDING ORDER ---
  const handleCheckout = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      
      const payload = {
        items: [
          {
            itemType: itemType === 'subscription' ? 'subscription' : 'course',
            itemId: Number(itemId),
            itemTitle: itemData.title,
            price: total
          }
        ],
        paymentMethod: 'bank_transfer'
      };

      const res = await orderService.checkout(payload);
      setCheckoutResult(res);
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 5. SIMULATE PAYMENT SUCCESS ---
  const handleSimulatePayment = async () => {
    if (!checkoutResult || isProcessing) return;
    try {
      setIsProcessing(true);
      await orderService.simulatePayment(checkoutResult.orderCode, checkoutResult.finalAmount);
      setPaymentSuccess(true);
    } catch (err) {
      console.error("Simulation error:", err);
      alert("Không thể giả lập thanh toán. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 6. RENDER LOGIC ---
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-10 h-10 text-[#377437] animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Đang chuẩn bị đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F8F9FC]">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-rose-500 font-bold mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-4 md:p-12 font-sans text-left relative overflow-x-hidden">
      
      {/* HIỂN THỊ OVERLAY KHI THANH TOÁN THÀNH CÔNG */}
      {paymentSuccess && itemType === 'course' && (
        <CourseSuccessOverlay 
          courseTitle={itemData?.title} 
          onNavigate={navigate} 
        />
      )}

      {paymentSuccess && itemType === 'subscription' && (
        <SubscriptionSuccessOverlay 
          planTitle={itemData?.title} 
          onNavigate={navigate} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-[#377437] transition-colors group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          Quay lại trang trước
        </button>

        {!checkoutResult ? (
          // === STEP 1: CHOOSE METHOD & CONFIRM ORDER ===
          <div className="flex flex-col lg:flex-row gap-10">

            {/* === LEFT: PAYMENT METHOD === */}
            <div className="flex-[1.5] bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-50">
              <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">
                  Phương thức thanh toán
                </h1>
                <p className="text-gray-400 font-medium italic">
                  {itemType === 'subscription' ? 'Đăng ký gói:' : 'Mua khóa học:'} {itemData?.title}
                </p>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-6 p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all
                      ${method === pm.id
                        ? "border-[#377437] bg-[#F0F7F0] shadow-lg shadow-green-900/5"
                        : "border-gray-50 hover:border-gray-200 bg-white"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={method === pm.id}
                      onChange={() => setMethod(pm.id)}
                      className="w-5 h-5 accent-[#377437]"
                    />

                    <div className={`p-4 rounded-2xl ${method === pm.id ? "bg-[#377437] text-white" : "bg-gray-50 text-gray-400"}`}>
                      {pm.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900">{pm.title}</h3>
                      <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tighter opacity-70">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* === RIGHT: ORDER SUMMARY === */}
            <div className="lg:w-[420px] shrink-0">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50 sticky top-10">
                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between font-bold text-gray-500">
                    <span className="text-sm uppercase tracking-widest opacity-60">Tạm tính</span>
                    <span className="text-gray-900">{price.toLocaleString('vi-VN')} VND</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between font-bold text-gray-500">
                      <span className="text-sm uppercase tracking-widest opacity-60">Giảm giá</span>
                      <span className="text-rose-500">-{discount.toLocaleString('vi-VN')} VND</span>
                    </div>
                  )}

                  <div className="pt-8 mt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <span className="text-xl font-black text-gray-900 uppercase italic">Tổng cộng</span>
                    <span className="text-3xl font-black text-[#377437] tracking-tighter">
                      {total.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-[#377437] hover:bg-green-800 text-white font-black text-xl py-6 rounded-[1.5rem] shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95 mb-6 uppercase italic tracking-widest flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Xác nhận Thanh toán"}
                </button>

                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest px-4">
                  Bằng việc hoàn tất thanh toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
                </p>
              </div>
            </div>

          </div>
        ) : (
          // === STEP 2: SHOW TRANSFER INSTRUCTIONS & QR CODE ===
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* INSTRUCTIONS & QR CODE */}
            <div className="flex-[1.5] bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-50">
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-black text-[#377437] mb-2 tracking-tight uppercase italic">
                  Quét Mã QR Chuyển Khoản
                </h1>
                <p className="text-gray-500 font-medium">
                  Hệ thống đã gửi email chi tiết đơn hàng đến địa chỉ đăng ký của bạn. Vui lòng hoàn tất chuyển khoản theo thông tin dưới đây.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* QR Code */}
                <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-[2rem] shadow-inner text-center shrink-0">
                  <img 
                    src={checkoutResult.qrCodeUrl} 
                    alt="Mã QR VietQR" 
                    className="w-64 h-64 md:w-72 md:h-72 object-contain"
                  />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-3">Quét mã bằng app Ngân hàng</p>
                </div>

                {/* Bank account details */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100">
                    <span className="text-[10px] font-black text-[#377437] uppercase tracking-wider">Ngân hàng thụ hưởng</span>
                    <p className="text-base font-black text-gray-900 mt-1">{checkoutResult.bankName}</p>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Số tài khoản</span>
                      <p className="text-lg font-black text-gray-900 mt-1">{checkoutResult.accountNumber}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(checkoutResult.accountNumber)}
                      className="p-3 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      <Copy size={18} />
                    </button>
                  </div>

                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tên tài khoản</span>
                    <p className="text-base font-black text-gray-900 mt-1">{checkoutResult.accountName}</p>
                  </div>

                  <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Nội dung chuyển khoản (Bắt buộc)</span>
                      <p className="text-lg font-black text-red-600 mt-1">{checkoutResult.orderCode}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(checkoutResult.orderCode)}
                      className="p-3 bg-white hover:bg-red-100 rounded-xl border border-red-200 text-red-500 hover:text-red-900 transition-colors"
                      title="Sao chép nội dung chuyển khoản"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {copied && (
                <div className="mt-4 p-3 bg-[#E4FBE1] text-[#377437] font-bold text-center rounded-xl text-sm transition-all animate-bounce">
                  ✓ Đã sao chép vào bộ nhớ tạm!
                </div>
              )}
            </div>

            {/* SIMULATOR CARD */}
            <div className="lg:w-[400px] shrink-0 w-full">
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-wider text-orange-400">Trình giả lập thanh toán</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                    Đây là môi trường thử nghiệm. Bạn có thể nhấn nút dưới đây để kích hoạt giả lập casso/webhook ngân hàng nhằm duyệt ngay đơn hàng của bạn.
                  </p>
                </div>

                <div className="border-t border-dashed border-slate-800 pt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Đơn hàng:</span>
                    <span className="font-bold text-white">{checkoutResult.orderCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="font-black text-green-400">{checkoutResult.finalAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-base rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Xác nhận đã chuyển khoản (Giả lập)"}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;