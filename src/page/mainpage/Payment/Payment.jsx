import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, CreditCard, QrCode, Wallet, Loader2, 
  AlertCircle, PartyPopper, Play, CheckCircle2 
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";
import userEnrollmentService from "../../../AdminControl/Service/API/courseServiceAPI/user-enrollment.service";
import { useAuth } from "../../../context/authContext";

// --- SUB-COMPONENT: THÔNG BÁO THÀNH CÔNG ---
const SuccessOverlay = ({ courseTitle, className, onNavigate }) => {
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
          Bạn đã ghi danh thành công vào khóa học <br />
          <span className="text-[#377437] font-bold">"{courseTitle}"</span> <br />
          tại lớp <span className="font-black text-gray-800 uppercase italic tracking-widest">{className || "Tự động phân lớp"}</span>
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

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();

  // --- 1. STATES ---
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [method, setMethod] = useState("card");
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
    { id: "card", title: "Credit or Debit Card", desc: "Visa, Mastercard, JCB", icon: <CreditCard size={24} /> },
    { id: "qr", title: "QR Code Payment", desc: "Scan to pay via Banking App", icon: <QrCode size={24} /> },
    { id: "wallet", title: "E-Wallet", desc: "PayPal, Momo, Apple Pay", icon: <Wallet size={24} /> },
  ];

  // --- 4. XỬ LÝ THANH TOÁN ---
  const handlePayment = async () => {
    if (isEnrolling) return;
    try {
      setIsEnrolling(true);
      // Gọi API: Kết quả trả về là { status: 'success', data: { ... } }
      const response = await userEnrollmentService.enroll({
        userId: user.id,
        courseId: Number(courseId)
      });

      // ✅ QUAN TRỌNG: Lưu thông tin để hiện SuccessOverlay, KHÔNG navigate ở đây
      setEnrolledInfo(response.data); 
      
    } catch (error) {
      console.error("Enrollment error:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi đăng ký khóa học.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsEnrolling(false);
    }
  };

  // --- 5. RENDER LOGIC ---
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
      {enrolledInfo && (
        <SuccessOverlay 
          courseTitle={courseData?.title} 
          className={enrolledInfo?.class?.name} 
          onNavigate={navigate} 
        />
      )}

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-[#377437] transition-colors group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          Back to Course Detail
        </button>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* === LEFT: PAYMENT METHOD === */}
          <div className="flex-[1.5] bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-50">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">
                Payment Method
              </h1>
              <p className="text-gray-400 font-medium italic">Khóa học: {courseData?.title}</p>
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
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-bold text-gray-500">
                  <span className="text-sm uppercase tracking-widest opacity-60">Price</span>
                  <span className="text-gray-900">${price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-gray-500">
                  <span className="text-sm uppercase tracking-widest opacity-60">Discount</span>
                  <span className="text-rose-500">-${discount.toFixed(2)}</span>
                </div>

                <div className="pt-8 mt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                  <span className="text-xl font-black text-gray-900 uppercase italic">Total</span>
                  <span className="text-4xl font-black text-[#377437] tracking-tighter">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isEnrolling}
                className="w-full bg-[#377437] hover:bg-green-800 text-white font-black text-xl py-6 rounded-[1.5rem] shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95 mb-6 uppercase italic tracking-widest flex items-center justify-center gap-3"
              >
                {isEnrolling ? <Loader2 className="animate-spin" /> : "Complete Payment"}
              </button>

              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest px-4">
                Bằng việc hoàn tất thanh toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;