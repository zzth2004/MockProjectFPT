import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, QrCode, Loader2, 
  AlertCircle, ShieldCheck, Image as ImageIcon, Banknote
} from "lucide-react";
import courseService from "../../../AdminControl/Service/API/courseServiceAPI/course.service";
import orderService from "../../../AdminControl/Service/API/orderAPI/order.service";
import { useAuth } from "../../../context/authContext";

import couponService from "../../../AdminControl/Service/API/courseServiceAPI/coupon.service";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { itemType, itemId } = useParams();
  const { user } = useAuth();

  // --- STATES ---
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Voucher
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  // Order
  const [order, setOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FETCH DETAILS ---
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        if (itemType === "course") {
          const data = await courseService.getCourseDetails(itemId);
          setItemData(data);
        } else if (itemType === "subscription") {
          // Temporarily fetch all plans and find the one. Ideally we should have a getPlanDetails endpoint.
          // In user.service/support.service, there isn't a direct one imported here, so we use axiosClient
          // Wait, we need to import axiosClient!
          const { default: axiosClient } = await import("../../../api/axiosAPI");
          const plansRes = await axiosClient.get("/subscriptions/plans");
          const plansList = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data.data || []);
          const plan = plansList.find(p => p.id === Number(itemId));
          if (plan) {
            setItemData({
              id: plan.id,
              title: plan.name, // normalize title
              price: plan.price,
              salePrice: plan.price, // assuming no system discount for VIP right now
              thumbnail: null,
              level: `${plan.durationDays} ngày`
            });
          } else {
            setError("Gói VIP không tồn tại.");
          }
        }
      } catch (err) {
        console.error("Error fetching price:", err);
        setError("Không thể tải thông tin thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    if (itemId && itemType) fetchItemDetails();
  }, [itemType, itemId]);

  // --- POLLING LOGIC ---
  useEffect(() => {
    let intervalId;
    if (order && order.status !== "PAID") {
      intervalId = setInterval(async () => {
        try {
           const myOrders = await orderService.getMyOrders();
           const currentOrder = myOrders.find(o => o.orderCode === order.orderCode);
           if (currentOrder && currentOrder.status === "PAID") {
             clearInterval(intervalId);
             navigate(`/user/payment-success/${currentOrder.id}`, {
                state: {
                    itemTitle: itemData?.title,
                    totalAmount: currentOrder.finalAmount,
                    orderCode: currentOrder.orderCode,
                    date: new Date().toLocaleString()
                }
             });
           }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [order, navigate, itemData]);

  // --- LOGIC TÍNH TOÁN GIÁ ---
  const calculateOrder = () => {
    if (!itemData) return { originalPrice: 0, systemDiscount: 0, basePrice: 0, total: 0 };
    const originalPrice = parseFloat(itemData.price) || 0;
    const salePrice = parseFloat(itemData.salePrice) || 0;
    
    // Nếu có salePrice (giá ưu đãi hệ thống) và salePrice < originalPrice
    const hasSystemDiscount = salePrice > 0 && salePrice < originalPrice;
    const basePrice = hasSystemDiscount ? salePrice : originalPrice;
    const systemDiscount = hasSystemDiscount ? originalPrice - salePrice : 0;
    
    // Giảm tiếp bằng voucher từ giá basePrice
    const finalTotal = Math.max(0, basePrice - discountAmount);
    return { originalPrice, systemDiscount, basePrice, total: finalTotal };
  };

  const { originalPrice, systemDiscount, basePrice, total } = calculateOrder();

  const applyVoucher = async () => {
     if (!couponCode.trim()) {
        setCouponMsg("Vui lòng nhập mã giảm giá.");
        setDiscountAmount(0);
        return;
     }

     setIsCheckingVoucher(true);
     setCouponMsg("Đang kiểm tra mã...");
     
     const result = await couponService.checkCoupon(couponCode, Number(basePrice));
     
     setIsCheckingVoucher(false);

     if (result.valid) {
         setDiscountAmount(result.discountAmount);
         setCouponMsg(`Áp dụng thành công! Đã giảm ${Number(result.discountAmount).toLocaleString('vi-VN')} đ`);
     } else {
         setDiscountAmount(0);
         setCouponMsg(result.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.");
     }
  };

  // --- XỬ LÝ TẠO ĐƠN HÀNG ---
  const handleCreateOrder = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const newOrder = await orderService.createOrder({
        items: [{
          itemType: itemType,
          itemId: Number(itemId),
          itemTitle: itemData?.title,
          price: basePrice // Backend sẽ xử lý tổng tiền dựa trên giá gốc/đã giảm của hệ thống và couponCode
        }],
        paymentMethod: "bank_transfer",
        couponCode: couponCode
      });
      setOrder(newOrder);
    } catch (error) {
      console.error("Create order error:", error);
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.";
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Nút giả lập (Dev Only) để tự động duyệt đơn cho nhanh
  const mockWebhookApproval = async () => {
     if (!order) return;
     try {
       await orderService.simulatePayment(order.orderCode, order.finalAmount);
       alert("Đã gửi request webhook giả lập thành công!");
     } catch (err) {
       alert("Lỗi khi mock webhook");
     }
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-emerald-400 opacity-20"></div>
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md w-full shadow-lg">
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <p className="text-gray-800 font-bold text-xl mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl font-bold">Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left relative overflow-x-hidden">
      
      <div className="max-w-4xl mx-auto pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-emerald-50 transition-all">
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Trở lại {itemType === 'subscription' ? 'chọn gói' : 'khóa học'}
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
           
           {/* CỘT TRÁI: THÔNG TIN KHÓA HỌC & VOUCHER */}
           <div className="flex-1 p-8 bg-gray-50/50 border-r border-gray-100 flex flex-col justify-between">
              <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">
                    Đăng Ký {itemType === 'subscription' ? 'Gói VIP' : 'Khóa Học'}
                  </h1>
                  
                  <div className="flex gap-4 items-center bg-white p-4 rounded-2xl mb-8 border border-gray-100 shadow-sm">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                      {itemData?.thumbnail ? (
                        <img src={itemData.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-emerald-50">
                          {itemType === 'subscription' ? <ShieldCheck size={32} className="text-emerald-500" /> : <ImageIcon size={32} />}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug text-lg">{itemData?.title}</h3>
                      <p className="text-sm font-semibold text-emerald-600 mt-1 uppercase tracking-wider">{itemData?.level || "Tất cả cấp độ"}</p>
                    </div>
                  </div>

                  {!order && (
                      <div className="space-y-4 mb-8">
                        <label className="block text-sm font-bold text-gray-700">Mã giảm giá (Voucher)</label>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Nhập mã giảm giá..." 
                              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase" 
                           />
                           <button 
                               onClick={applyVoucher} 
                               disabled={isCheckingVoucher}
                               className="bg-gray-900 text-white font-bold px-6 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px]"
                           >
                               {isCheckingVoucher ? <Loader2 size={20} className="animate-spin" /> : "Áp dụng"}
                           </button>
                        </div>
                        {couponMsg && <p className={`text-sm font-semibold ${discountAmount > 0 ? "text-emerald-600" : "text-rose-500"}`}>{couponMsg}</p>}
                      </div>
                  )}

                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-gray-500">
                      <span>Giá {itemType === 'subscription' ? 'gói VIP' : 'khóa học'}</span>
                      <span className={systemDiscount > 0 ? "line-through text-gray-400" : "text-gray-900"}>{Number(originalPrice).toLocaleString('vi-VN')} đ</span>
                    </div>

                    {systemDiscount > 0 && (
                      <div className="flex justify-between font-bold text-emerald-600">
                        <span>Khuyến mãi hệ thống</span>
                        <span>-{Number(systemDiscount).toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}
                    
                    {systemDiscount > 0 && (
                       <div className="flex justify-between font-bold text-gray-500">
                        <span>Giá sau khuyến mãi</span>
                        <span className="text-gray-900">{Number(basePrice).toLocaleString('vi-VN')} đ</span>
                       </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between font-bold text-emerald-600">
                        <span>Voucher giảm giá</span>
                        <span>-{Number(discountAmount).toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-between items-end">
                      <span className="text-lg font-bold text-gray-900">Tổng Thanh Toán</span>
                      <span className="text-4xl font-black text-emerald-600 tracking-tight">
                        {Number(total).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
              </div>

              {!order && (
                  <button
                    onClick={handleCreateOrder}
                    disabled={isProcessing}
                    className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-xl py-5 rounded-2xl shadow-lg shadow-emerald-600/30 transform transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "Tiến hành Thanh toán"}
                  </button>
              )}
           </div>

           {/* CỘT PHẢI: HIỂN THỊ MÃ QR */}
           <div className="flex-1 p-8 flex flex-col items-center justify-center bg-white relative">
               {!order ? (
                   <div className="text-center space-y-4 opacity-50">
                       <div className="w-32 h-32 bg-gray-100 rounded-3xl mx-auto flex items-center justify-center border-2 border-dashed border-gray-300">
                          <QrCode size={48} className="text-gray-400" />
                       </div>
                       <p className="font-bold text-gray-500">Mã QR sẽ hiển thị sau khi bạn xác nhận tạo đơn.</p>
                   </div>
               ) : (
                   <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
                       <div className="text-center mb-6">
                           <h2 className="text-2xl font-black text-gray-900">Quét mã QR</h2>
                           <p className="text-gray-500 font-medium">Sử dụng ứng dụng ngân hàng để thanh toán.</p>
                       </div>
                       
                       <div className="bg-white p-4 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 mb-6">
                          <img 
                              src={order.qrCodeUrl || `https://img.vietqr.io/image/MB-123456789999-compact2.png?amount=${order.finalAmount}&addInfo=${order.orderCode}&accountName=KOREANLAB`}
                              alt="QR Code"
                              className="w-full h-auto rounded-xl object-contain"
                          />
                       </div>

                       <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3">
                           <div className="flex justify-between items-center pb-3 border-b border-emerald-100">
                               <span className="text-emerald-700 font-semibold text-sm">Số tiền</span>
                               <span className="font-black text-emerald-900 text-lg">{Number(order.finalAmount).toLocaleString('vi-VN')} đ</span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-emerald-700 font-semibold text-sm">Nội dung CK</span>
                               <span className="font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg uppercase tracking-wider">{order.orderCode}</span>
                           </div>
                       </div>

                       <div className="mt-8 flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                          <p className="text-sm font-bold text-gray-500 text-center">
                            Hệ thống đang chờ xác nhận thanh toán...<br/>
                            <span className="text-xs font-normal">Vui lòng không đóng trang này. Đơn sẽ duyệt tự động.</span>
                          </p>

                          {/* DEV ONLY BUTTON */}
                          <button onClick={mockWebhookApproval} className="mt-4 text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">
                             Giả lập chuyển khoản xong (Dev Only)
                          </button>
                       </div>
                   </div>
               )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;