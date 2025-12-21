import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CreditCard, QrCode, Wallet } from "lucide-react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // ✅ LẤY COURSE ID
  const [method, setMethod] = useState("card");

  // 👉 Sau này bạn có thể fetch theo courseId
  const orderData = {
    courseId,
    price: 49.99,
    discount: 0.0,
    total: 49.99,
  };

  const paymentMethods = [
    {
      id: "card",
      title: "Credit or Debit Card",
      desc: "Visa, Mastercard, JCB",
      icon: <CreditCard size={24} />,
    },
    {
      id: "qr",
      title: "QR Code Payment",
      desc: "Scan to pay via Banking App",
      icon: <QrCode size={24} />,
    },
    {
      id: "wallet",
      title: "E-Wallet",
      desc: "PayPal, Momo, Apple Pay",
      icon: <Wallet size={24} />,
    },
  ];

  const handlePayment = () => {
    console.log("Pay course:", courseId, "Method:", method);

    // 👉 Giả lập thanh toán thành công
    setTimeout(() => {
      navigate("/user/mycourses"); // sau payment quay về My Courses
    }, 800);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* === BACK TO COURSE DETAIL === */}
        <button
          onClick={() =>
            navigate(`/user/mycourses/detail/${courseId}`)
          }
          className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={24} />
          Back to Course
        </button>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* === LEFT: PAYMENT METHOD === */}
          <div className="flex-[1.5] bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-50">
            <h1 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">
              Payment Method
            </h1>

            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-6 p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all
                    ${
                      method === pm.id
                        ? "border-[#377437] bg-[#F0F7F0]"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={method === pm.id}
                    onChange={() => setMethod(pm.id)}
                    className="w-5 h-5 accent-[#377437]"
                  />

                  <div
                    className={`p-3 rounded-xl ${
                      method === pm.id
                        ? "bg-[#377437] text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {pm.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900">
                      {pm.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mt-1">
                      {pm.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* === RIGHT: ORDER SUMMARY === */}
          <div className="lg:w-[420px] shrink-0">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50 sticky top-10">
              <h2 className="text-2xl font-black text-gray-900 mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-bold text-gray-500">
                  <span>Course Price</span>
                  <span className="text-gray-900">
                    ${orderData.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-gray-500">
                  <span>Discount</span>
                  <span className="text-gray-900">
                    -${orderData.discount.toFixed(2)}
                  </span>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between">
                  <span className="text-2xl font-black text-[#377437]">
                    Total
                  </span>
                  <span className="text-2xl font-black text-[#377437]">
                    ${orderData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-[#377437] hover:bg-green-800 text-white font-black text-xl py-5 rounded-[1.2rem] shadow-xl shadow-green-900/20 transform transition-all hover:scale-[1.02] active:scale-95"
              >
                Complete Payment
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
