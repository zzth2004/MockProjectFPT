import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, RefreshCw, KeyRound } from "lucide-react"; // Thêm icon KeyRound

import verifyImage from "../../assets/login.png";
import InputComponent from "../../components/InputComponent";
import ButtonComponent from "../../components/ButtonComp";
import { useVerifyCodeForm } from "../../hooks/useVerifyCodeForm";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const emailFromState = location.state?.email;
  // 👇 Lấy type từ state, mặc định là REGISTER nếu không có
  const type = location.state?.type || "REGISTER"; 

  const isForgotPassword = type === "FORGOT_PASSWORD";

  useEffect(() => {
    if (!emailFromState) navigate("/404");
  }, [emailFromState, navigate]);

  const {
    values,
    errors,
    setField,
    handleSubmit,
    resendMessage,
    resendCode,
    countdown,
    resendLoading,
    apiState,
  } = useVerifyCodeForm(emailFromState, type); // 👈 Truyền type vào hook

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">
        
        {/* Image */}
        <div className="flex justify-center items-center">
          <img
            src={verifyImage}
            alt="Verification illustration"
            className="w-52 md:w-full h-auto object-contain"
          />
        </div>

        {/* Verify Form */}
        <div className="flex flex-col justify-center">
          
          {/* 👇 Đổi Tiêu đề dựa trên Type */}
          <h2 className="text-3xl font-bold mb-2 text-center md:text-left text-gray-800">
            {isForgotPassword ? "Khôi phục mật khẩu" : "Xác thực tài khoản"}
          </h2>

          <p className="mb-6 text-gray-600 text-sm text-center md:text-left">
            {isForgotPassword 
              ? `Chúng tôi đã gửi mã khôi phục đến ` 
              : `Mã xác nhận kích hoạt đã được gửi đến `}
            <strong>{emailFromState}</strong>. <br/>
            Vui lòng nhập mã OTP để tiếp tục.
          </p>

          {/* Hiển thị lỗi API */}
          {apiState.error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                {apiState.error.message || "Mã xác thực không đúng"}
             </div>
          )}

          {/* Hiển thị thông báo gửi lại */}
          {resendMessage && (
            <div className={`mb-4 p-2 text-sm rounded text-center ${resendMessage.includes("thất bại") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputComponent
              labelText="Mã xác nhận"
              hintText="Nhập mã 5 chữ số"
              value={values.otp}
              onChange={(e) => setField("otp", e.target.value)}
              errorText={errors.otp}
              prefixIcon={isForgotPassword ? <KeyRound size={16} className="text-gray-500" /> : <Lock size={16} className="text-gray-500" />}
              type="number"
            />

            <ButtonComponent
              type="submit"
              text={apiState.loading ? "Đang xử lý..." : "Tiếp tục"}
              disabled={apiState.loading}
              fullWidth
              variant="primary"
              size="md"
              color={isForgotPassword ? "bg-blue-700 hover:bg-blue-600 text-white" : "bg-green-700 hover:bg-green-600 text-white"}
            />

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={resendCode}
                disabled={countdown > 0 || resendLoading}
                className={`text-sm flex items-center justify-center mx-auto gap-2
                  ${countdown > 0 || resendLoading 
                    ? "text-gray-400 cursor-not-allowed" 
                    : isForgotPassword ? "text-blue-700 hover:underline" : "text-green-700 hover:underline"
                  }`}
              >
                {resendLoading ? (
                    "Đang gửi..."
                ) : countdown > 0 ? (
                    `Gửi lại mã sau ${countdown}s`
                ) : (
                    <>
                        <RefreshCw size={14} /> Gửi lại mã OTP
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}