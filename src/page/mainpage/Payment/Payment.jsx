import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, CreditCard, QrCode, Wallet, Loader2, 
  AlertCircle, PartyPopper, CheckCircle2, ShieldCheck, 
  Building2, Hash, Image as ImageIcon
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";
import userEnrollmentService from "../../../AdminControl/Service/API/courseServiceAPI/user-enrollment.service";
import orderService from "../../../AdminControl/Service/API/orderAPI/order.service";
import { useAuth } from "../../../context/authContext";

// --- SUB-COMPONENT: THÔNG BÁO THÀNH CÔNG ---
const SuccessOverlay = ({ courseTitle, className, onNavigate }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 border border-gray-205 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <PartyPopper size={40} />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Waiting for Approval!
        </h2>
        <p className="text-gray-600 font-medium mb-8 leading-relaxed">
          Order created successfully for <br />
          <span className="text-emerald-600 font-bold">"{courseTitle}"</span> <br />
          Please complete your payment and wait for admin approval.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate("/user/active-courses")}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
          >
            Go to My Courses
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();

  // --- 1. STATES ---
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState("bank_transfer");
  const [enrolledInfo, setEnrolledInfo] = useState(null); 
  const [isEnrolling, setIsEnrolling] = useState(false);

  // --- 2. FETCH COURSE DETAILS ---
  useEffect(() => {
    const fetchCoursePrice = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseDetails(courseId);
        setCourseData(data);
      } catch (err) {
        console.error("Error fetching price:", err);
        setError("Không thể tải thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCoursePrice();
  }, [courseId]);

  // --- 3. LOGIC TÍNH TOÁN GIÁ ---
  const calculateOrder = () => {
    if (!courseData) return { price: 0, discount: 0, total: 0 };
    const originalPrice = parseFloat(courseData.price) || 0;
    const salePrice = parseFloat(courseData.salePrice) || 0;
    const hasDiscount = salePrice > 0 && salePrice < originalPrice;
    const finalTotal = hasDiscount ? salePrice : originalPrice;
    const discountAmount = hasDiscount ? originalPrice - salePrice : 0;
    return { price: originalPrice, discount: discountAmount, total: finalTotal };
  };

  const { price, discount, total } = calculateOrder();

  const paymentMethods = [
    { id: "bank_transfer", title: "Bank Transfer", desc: "Direct transfer to our bank account", icon: <Building2 size={24} /> },
    { id: "vnpay", title: "VNPay / QR Code", desc: "Scan QR via Banking App", icon: <QrCode size={24} /> },
    { id: "momo", title: "E-Wallet", desc: "Momo, ZaloPay", icon: <Wallet size={24} /> },
  ];

  // --- 4. XỬ LÝ THANH TOÁN ---
  const handlePayment = async () => {
    if (isEnrolling) return;
    try {
      setIsEnrolling(true);
      
      const order = await orderService.createOrder({
        items: [{
          itemType: "course",
          itemId: Number(courseId),
          itemTitle: courseData?.title,
          price: total
        }],
        paymentMethod: method,
        couponCode: ""
      });

      // Nếu BE trả về URL thanh toán (VNPay, Momo) thì redirect user
      if (order && order.paymentUrl) {
        window.location.href = order.paymentUrl;
        return;
      }

      // Nếu thanh toán chuyển khoản, hiển thị popup chờ phê duyệt (hoặc cập nhật state để hiển thị QR từ BE)
      setEnrolledInfo({
        orderId: order?.id,
        class: { name: "Tự động phân lớp" },
        qrUrl: order?.qrUrl,
        transferContent: order?.transferContent
      }); 
      
    } catch (error) {
      console.error("Enrollment error:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  // --- 5. RENDER LOGIC ---
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-emerald-400 opacity-20"></div>
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Preparing your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <p className="text-gray-800 font-bold text-xl mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left relative overflow-x-hidden">
      
      {/* HIỂN THỊ OVERLAY KHI THANH TOÁN THÀNH CÔNG */}
      {enrolledInfo && (
        <SuccessOverlay 
          courseTitle={courseData?.title} 
          className={enrolledInfo?.class?.name} 
          onNavigate={navigate} 
        />
      )}

      <div className="max-w-6xl mx-auto pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-50 transition-all">
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Course Detail
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* === LEFT: PAYMENT METHOD === */}
          <div className="flex-[1.5] space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                  <CreditCard className="text-emerald-500" size={28} />
                  Payment Method
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Select how you want to pay for this course.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex flex-col gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all
                      ${method === pm.id
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md"
                        : "border-gray-100 hover:border-gray-300 bg-white"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-3 rounded-xl ${method === pm.id ? "bg-emerald-500 text-white shadow-sm" : "bg-gray-100 text-gray-500"}`}>
                        {pm.icon}
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        checked={method === pm.id}
                        onChange={() => setMethod(pm.id)}
                        className="w-5 h-5 accent-emerald-500"
                      />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${method === pm.id ? "text-emerald-900" : "text-gray-900"}`}>{pm.title}</h3>
                      <p className="text-sm font-medium text-gray-500 mt-1">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* HIỂN THỊ THÔNG TIN THANH TOÁN DỰA TRÊN PHƯƠNG THỨC */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {method === "bank_transfer" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Bank Transfer Details</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Bank Name</span>
                        <span className="font-bold text-gray-900">MB</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Account Name</span>
                        <span className="font-bold text-gray-900">NGUYEN VAN A</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="text-gray-500 font-medium">Account Number</span>
                        <span className="font-bold text-emerald-600 text-lg tracking-widest">0123456789</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500 font-medium">Transfer Content</span>
                        <span className="font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md tracking-wider">
                          {enrolledInfo?.transferContent || `PAY C${courseId} U${user?.id || "X"}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-center">
                    <img 
                      src={enrolledInfo?.qrUrl || `https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=${total}&addInfo=PAY_C${courseId}_U${user?.id || "X"}&accountName=NGUYEN_VAN_A`} 
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain rounded-xl shadow-sm"
                    />
                  </div>

                  <p className="text-sm text-gray-500 font-medium flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Please transfer the exact amount with the transfer content above. Your order will be approved within 24 hours.
                  </p>
                </div>
              )}

              {method === "vnpay" && (
                <div className="space-y-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900">Scan QR Code</h3>
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Code" className="w-40 h-40 object-cover opacity-80 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Open your banking app or VNPay and scan this QR code to complete the payment.
                  </p>
                </div>
              )}

              {method === "momo" && (
                <div className="space-y-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900">Momo E-Wallet</h3>
                  <div className="w-48 h-48 mx-auto bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-center">
                    <QrCode size={80} className="text-pink-500" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Please use Momo App to scan this QR code.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT: ORDER SUMMARY === */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 sticky top-10">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Order Summary
              </h2>

              {/* COURSE INFO COMPONENT INSIDE SUMMARY */}
              <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  {courseData?.thumbnail ? (
                    <img src={courseData.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug">{courseData?.title}</h3>
                  <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">{courseData?.level || "All Levels"}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Original Price</span>
                  <span className="text-gray-900">{Number(price).toLocaleString('vi-VN')} đ</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between font-semibold text-gray-500">
                    <span>Discount</span>
                    <span className="text-rose-500">-{Number(discount).toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="pt-6 mt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl lg:text-4xl font-black text-emerald-600 tracking-tight break-all text-right">
                    {Number(total).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isEnrolling}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:hover:bg-emerald-600 text-white font-bold text-lg py-5 rounded-xl transition-all active:scale-95 mb-6 flex items-center justify-center gap-3"
              >
                {isEnrolling ? <Loader2 className="animate-spin" /> : "Complete Payment"}
              </button>

              <div className="flex items-center gap-2 justify-center text-gray-400">
                <ShieldCheck size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                  Secure Encrypted Payment
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;