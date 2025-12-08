import React, { useEffect, useRef } from 'react';
import { Lock, KeyRound } from 'lucide-react';
import resetImage from '../../assets/login.png';
import InputComponent from '../../components/InputComponent';
import ButtonComponent from '../../components/ButtonComp';
import { Validator } from '../../utils/Validator';
import { resendCodeApi } from '../../services/authService';
import useCallApiHandler from '../../hooks/HookHander/useCallApiHandler';
import { useResetPassForm } from '../../hooks/useResetPassForm';

export default function ResetPassword() {
  // 1. QUAN TRỌNG: Gọi Hook để lấy toàn bộ logic Form & State
  // Hook này đã tự lấy email từ location.state rồi
  const {
    values,         // Chứa: code, password, confirmPassword
    errors,         // Chứa lỗi validation
    setField,       // Hàm update giá trị input
    handleSubmit,   // Hàm xử lý submit form
    email,          // Email lấy từ trang trước
    apiState,       // Trạng thái loading/error của nút Submit
  } = useResetPassForm();

  // 2. Logic Gửi OTP tự động (Auto Send) khi vào trang
  const hasSentOtp = useRef(false);
  const { call: sendOtpCall } = useCallApiHandler(resendCodeApi);
  
  // Ẩn email để hiển thị (vd: n***@gmail.com)
  const emailHidden = email ? Validator.validateEmailHidden(email) : '...';

  useEffect(() => {
    // Chỉ gửi nếu có email và chưa gửi lần nào
    if (email && !hasSentOtp.current) {
        hasSentOtp.current = true; // Đánh dấu đã gửi
        
        const sendMail = async () => {
            try {
                const res = await sendOtpCall(email);
                if (res) alert(`Mã xác thực đã được gửi tới ${email}`);
            } catch (err) {
                console.error("Gửi mail tự động thất bại:", err);
            }
        };
        sendMail();
    }
  }, [email, sendOtpCall]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white shadow-md rounded-xl p-6 md:p-12">
        
        {/* Hình minh hoạ */}
        <div className="flex justify-center items-center">
          <img
            src={resetImage}
            alt="Reset illustration"
            className="w-52 md:w-full h-auto object-contain"
          />
        </div>

        {/* Form Reset Password */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-center md:text-left text-gray-800">
            Đặt lại mật khẩu
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
            Mã xác thực đã được gửi đến: <span className="font-semibold text-gray-800">{emailHidden}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input CODE */}
            <InputComponent
              labelText="Mã xác thực"
              hintText="Nhập mã OTP trong email"
              type="number" 
              value={values.code} // 👈 Lấy từ Hook
              onChange={(e) => setField("code", e.target.value)} // 👈 Update vào Hook
              errorText={errors.code}
              prefixIcon={<KeyRound size={16} className="text-gray-500" />}
            />

            {/* Input Password Mới */}
            <InputComponent
              labelText="Mật khẩu mới"
              hintText="Nhập mật khẩu mới"
              type="password"
              value={values.password} // 👈 Lấy từ Hook
              onChange={(e) => setField("password", e.target.value)} // 👈 Update vào Hook
              errorText={errors.password}
              prefixIcon={<Lock size={16} className="text-gray-500" />}
            />

            {/* Input Xác nhận Password */}
            <InputComponent
              labelText="Xác nhận mật khẩu"
              hintText="Nhập lại mật khẩu mới"
              type="password"
              value={values.confirmPassword} // 👈 Lấy từ Hook
              onChange={(e) => setField("confirmPassword", e.target.value)} // 👈 Update vào Hook
              errorText={errors.confirmPassword}
              prefixIcon={<Lock size={16} className="text-gray-500" />}
            />

            {/* Hiển thị lỗi API chung (nếu có) */}
            {apiState.error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                    {apiState.error.message || "Đã có lỗi xảy ra"}
                </div>
            )}

            <ButtonComponent
              type="submit"
              text={apiState.loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              disabled={apiState.loading}
              fullWidth
              variant="primary"
              size="md"
              color="bg-green-700 hover:bg-green-600 text-white mt-4"
            />
          </form>
        </div>
      </div>
    </div>
  );
}